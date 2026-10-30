import { endSession as endTestSession, ensureOwnerAdmin, sessionCookie, setTemporaryPassword, testSession } from "../baas/auth.js";
import { fetchPublicText } from "../lib/safeFetch.js";
import { serveApp } from "../runtime/appServer.js";
import { runJob } from "../baas/jobs.js";
import { describeSchema, execSql } from "../baas/projectDb.js";
import { listSecrets, requestSecret } from "../baas/secrets.js";
import type { Account } from "../platform/accounts.js";
import { readLogs } from "../platform/events.js";
import * as projects from "../platform/projects.js";
import { checkProject, compileServerModule, endpointRoutes, formatProblem, jobFiles, pageRoutes } from "../runtime/bundler.js";
import { runInSandbox } from "../runtime/sandbox.js";
import { publishProject } from "../runtime/publish.js";
import { previewOrigin, previewUrl } from "../runtime/urls.js";
import { findSymbol, projectMap, relatedFiles } from "./index.js";

export { previewUrl };

export interface ToolContext {
  account: Account;
  projectId: string;
  /** Recorded on every change: the studio's builder or an external MCP client. */
  author: "builder" | "mcp";
  /** Set when a tool changed project files, so the caller can checkpoint. */
  wrote?: boolean;
  /**
   * Paths (or folder prefixes ending in "/") this agent may write. Set for specialists
   * running in parallel so two agents never edit the same file; unset means anything.
   */
  owned?: string[];
  /** Shown in the change timeline, e.g. "ui@claude-sonnet-5-5". */
  actor?: string;
  /** Files written in this task (for the QA hand-off). */
  written?: Set<string>;
}

/** Refuses writes outside the files the planner gave this agent. */
function assertOwned(ctx: ToolContext, p: string) {
  if (!ctx.owned) return;
  const ok = ctx.owned.some((o) => p === o || (o.endsWith("/") && p.startsWith(o)));
  if (!ok) {
    throw new Error(
      `Este archivo no es tuyo en esta tarea: ${p}. Tus archivos: ${ctx.owned.join(", ")}. Si de verdad hace falta cambiarlo, dilo en tu resumen final y el planificador lo asignará.`,
    );
  }
}

const noteWrite = (ctx: ToolContext, ...paths: string[]) => {
  ctx.wrote = true;
  for (const p of paths) (ctx.written ??= new Set()).add(p);
};

export interface BuilderTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  run(input: any, ctx: ToolContext): Promise<string>;
}

const obj = (properties: Record<string, unknown>, required: string[] = []) => ({ type: "object", properties, required });
const str = (description: string) => ({ type: "string", description });

const MAX_RESULT = 30_000;
const clip = (s: string) => (s.length > MAX_RESULT ? `${s.slice(0, MAX_RESULT)}\n… (recortado, ${s.length} caracteres)` : s);
const numbered = (content: string) =>
  content
    .split("\n")
    .map((l, i) => `${String(i + 1).padStart(4)}\t${l}`)
    .join("\n");

export const builderTools: BuilderTool[] = [
  {
    name: "list_files",
    description: "Lista los archivos del proyecto con su tamaño, además de las páginas, endpoints y tareas detectadas.",
    input_schema: obj({}),
    async run(_i, ctx) {
      const files = await projects.readAllFiles(ctx.projectId);
      const list = await projects.listFiles(ctx.projectId);
      return [
        "Archivos:",
        ...list.map((f) => `  ${f.path} (${f.size} B)`),
        "",
        "Páginas: " + (pageRoutes(files).map((p) => `${p.pattern} ← ${p.file}`).join(", ") || "ninguna"),
        "Endpoints: " + (endpointRoutes(files).map((e) => `${e.method} /_api/${e.route}`).join(", ") || "ninguno"),
        "Tareas: " + (jobFiles(files).map((j) => j.name).join(", ") || "ninguna"),
      ].join("\n");
    },
  },
  {
    name: "project_map",
    description:
      "Mapa compacto del proyecto: rutas, endpoints y sus tablas, componentes y quién los usa, helpers, tareas, notas y el esquema de la base de datos. Empieza por aquí en vez de leer todo.",
    input_schema: obj({}),
    async run(_i, ctx) {
      return clip(projectMap(await projects.readAllFiles(ctx.projectId), await describeSchema(ctx.projectId, true)));
    },
  },
  {
    name: "find_symbol",
    description: "Dónde se define y se usa un nombre (componente, función, tabla, ruta).",
    input_schema: obj({ name: str("Nombre exacto") }, ["name"]),
    async run(i: { name: string }, ctx) {
      return clip(findSymbol(await projects.readAllFiles(ctx.projectId), i.name));
    },
  },
  {
    name: "related_files",
    description: "Archivos conectados con uno: lo que importa, quién lo importa, y la página ↔ endpoint que se llaman.",
    input_schema: obj({ path: str("Ruta") }, ["path"]),
    async run(i: { path: string }, ctx) {
      return relatedFiles(await projects.readAllFiles(ctx.projectId), i.path).join("\n") || "Sin conexiones.";
    },
  },
  {
    name: "read_files",
    description: 'Lee hasta 20 archivos con números de línea. Para archivos grandes pide solo un rango: "pages/_index.tsx:40-120".',
    input_schema: obj({ paths: { type: "array", items: { type: "string" }, description: 'Rutas, opcionalmente con rango "ruta:inicio-fin"' } }, ["paths"]),
    async run(i: { paths: string[] }, ctx) {
      const out: string[] = [];
      for (const raw of i.paths.slice(0, 20)) {
        const m = /^(.*?):(\d+)-(\d+)$/.exec(raw);
        const p = m ? m[1]! : raw;
        const c = await projects.readFile(ctx.projectId, p);
        if (c === undefined) {
          out.push(`### ${p}\n(no existe)`);
          continue;
        }
        if (!m) {
          out.push(`### ${p}\n${numbered(c)}`);
          continue;
        }
        const lines = c.split("\n");
        const from = Math.max(1, Number(m[2]));
        const to = Math.min(lines.length, Number(m[3]));
        out.push(`### ${p} (líneas ${from}-${to} de ${lines.length})\n${lines.slice(from - 1, to).map((l, k) => `${String(from + k).padStart(4)}\t${l}`).join("\n")}`);
      }
      return clip(out.join("\n\n"));
    },
  },
  {
    name: "write_file",
    description: "Crea o reemplaza un archivo completo. Para cambios en un archivo existente usa edit_file (gasta muchos menos tokens).",
    input_schema: obj({ path: str("Ruta, p. ej. pages/_index.tsx"), content: str("Contenido completo") }, ["path", "content"]),
    async run(i: { path: string; content: string }, ctx) {
      assertOwned(ctx, i.path);
      await projects.writeFile(ctx.projectId, i.path, i.content, ctx.author, ctx.actor);
      noteWrite(ctx, i.path);
      return `Escrito ${i.path} (${i.content.length} B)`;
    },
  },
  {
    name: "edit_file",
    description:
      "Reemplaza un fragmento exacto de un archivo. old_text debe aparecer una sola vez (o usa replace_all). Úsalo para cambios pequeños en archivos grandes.",
    input_schema: obj(
      { path: str("Ruta"), old_text: str("Texto exacto a reemplazar"), new_text: str("Texto nuevo"), replace_all: { type: "boolean" } },
      ["path", "old_text", "new_text"],
    ),
    async run(i: { path: string; old_text: string; new_text: string; replace_all?: boolean }, ctx) {
      assertOwned(ctx, i.path);
      const c = await projects.readFile(ctx.projectId, i.path);
      if (c === undefined) throw new Error(`No existe ${i.path}`);
      const count = c.split(i.old_text).length - 1;
      if (count === 0) throw new Error("old_text no aparece en el archivo. Lee el archivo y vuelve a intentarlo con el texto exacto.");
      if (count > 1 && !i.replace_all) throw new Error(`old_text aparece ${count} veces; añade contexto o usa replace_all.`);
      await projects.writeFile(ctx.projectId, i.path, i.replace_all ? c.split(i.old_text).join(i.new_text) : c.replace(i.old_text, () => i.new_text), ctx.author, ctx.actor);
      noteWrite(ctx, i.path);
      return `Editado ${i.path} (${count} reemplazo${count > 1 ? "s" : ""})`;
    },
  },
  {
    name: "delete_file",
    description: "Borra un archivo.",
    input_schema: obj({ path: str("Ruta") }, ["path"]),
    async run(i: { path: string }, ctx) {
      assertOwned(ctx, i.path);
      await projects.deleteFile(ctx.projectId, i.path, ctx.author);
      noteWrite(ctx, i.path);
      return `Borrado ${i.path}`;
    },
  },
  {
    name: "rename_file",
    description: "Mueve o renombra un archivo.",
    input_schema: obj({ from: str("Ruta actual"), to: str("Ruta nueva") }, ["from", "to"]),
    async run(i: { from: string; to: string }, ctx) {
      assertOwned(ctx, i.from);
      assertOwned(ctx, i.to);
      await projects.renameFile(ctx.projectId, i.from, i.to, ctx.author);
      noteWrite(ctx, i.from, i.to);
      return `Movido ${i.from} → ${i.to}`;
    },
  },
  {
    name: "search_code",
    description: "Busca un texto o expresión regular en todos los archivos del proyecto y devuelve las líneas que coinciden (archivo:línea).",
    input_schema: obj(
      { pattern: str("Texto o regex (sin barras)"), path_prefix: str("Limitar a rutas que empiecen así, p. ej. endpoints/"), ignore_case: { type: "boolean" } },
      ["pattern"],
    ),
    async run(i: { pattern: string; path_prefix?: string; ignore_case?: boolean }, ctx) {
      let re: RegExp;
      try {
        re = new RegExp(i.pattern, i.ignore_case ? "i" : "");
      } catch {
        re = new RegExp(i.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), i.ignore_case ? "i" : "");
      }
      const hits: string[] = [];
      for (const [path, content] of Object.entries(await projects.readAllFiles(ctx.projectId))) {
        if (i.path_prefix && !path.startsWith(i.path_prefix)) continue;
        content.split("\n").forEach((line, n) => {
          if (hits.length < 200 && re.test(line)) hits.push(`${path}:${n + 1}: ${line.trim().slice(0, 200)}`);
        });
      }
      return hits.join("\n") || "Sin coincidencias.";
    },
  },
  {
    name: "call_endpoint",
    description:
      "Llama a un endpoint de la vista previa para comprobar que funciona, como visitante anónimo o como un usuario existente (as_user_email). Devuelve el estado HTTP y el cuerpo. Usa datos reales: no lo uses para borrar datos del dueño.",
    input_schema: obj(
      {
        method: { type: "string", enum: ["GET", "POST"] },
        route: str("Ruta del endpoint sin /_api/, p. ej. todos/list"),
        query: { type: "object", description: "Parámetros de la URL (GET)" },
        body: { type: "object", description: "Cuerpo JSON (POST)" },
        as_user_email: str("Correo de un usuario de la app para llamar con su sesión"),
      },
      ["method", "route"],
    ),
    async run(i: { method: "GET" | "POST"; route: string; query?: Record<string, unknown>; body?: unknown; as_user_email?: string }, ctx) {
      const project = (await projects.getProject(ctx.projectId))!;
      const qs = i.query ? "?" + new URLSearchParams(Object.entries(i.query).map(([k, v]) => [k, String(v)])) : "";
      const route = i.route.replace(/^\/?(_api\/)?/, "");
      const session = i.as_user_email ? await testSession(ctx.projectId, i.as_user_email) : null;
      try {
        const req = new Request(`${previewOrigin(ctx.projectId)}/_api/${route}${qs}`, {
          method: i.method,
          headers: {
            "content-type": "application/json",
            ...(session ? { cookie: `${sessionCookie(ctx.projectId)}=${session.token}` } : {}),
          },
          body: i.method === "POST" ? JSON.stringify(i.body ?? {}) : undefined,
        });
        const res = await serveApp(req, { project, env: "preview", base: "" }, `/_api/${route}`);
        const text = await res.text();
        return clip(`${i.method} /_api/${route}${qs}${session ? ` (como ${session.user.email})` : " (anónimo)"} → ${res.status}\n${text}`);
      } finally {
        if (session) await endTestSession(ctx.projectId, session.token);
      }
    },
  },
  {
    name: "fetch_url",
    description:
      "Lee una página pública por HTTPS (documentación de una API, un JSON de ejemplo) y devuelve su texto. Úsalo para investigar integraciones antes de escribirlas. No envía credenciales.",
    input_schema: obj({ url: str("URL https:// pública") }, ["url"]),
    async run(i: { url: string }) {
      return clip(await fetchPublicText(i.url));
    },
  },
  {
    name: "describe_database",
    description: "Muestra las tablas y columnas de la base de datos Postgres del proyecto.",
    input_schema: obj({ include_internal: { type: "boolean", description: "Incluir tablas _forja_* (usuarios, sesiones)" } }),
    async run(i: { include_internal?: boolean }, ctx) {
      const s = await describeSchema(ctx.projectId, i.include_internal);
      const lines = Object.entries(s).map(
        ([t, cols]) => `${t}(\n${cols.map((c) => `  ${c.name} ${c.type}${c.nullable ? "" : " not null"}${c.default ? ` default ${c.default}` : ""}`).join(",\n")}\n)`,
      );
      return lines.join("\n\n") || "La base de datos no tiene tablas todavía.";
    },
  },
  {
    name: "execute_sql",
    description:
      "Ejecuta SQL de Postgres 18 (puede ser varias sentencias): crea/altera tablas, índices, inserta datos. La vista previa y la app publicada comparten esta base de datos: los cambios son reales.",
    input_schema: obj({ sql: str("SQL a ejecutar") }, ["sql"]),
    async run(i: { sql: string }, ctx) {
      const results = await execSql(ctx.projectId, i.sql);
      return clip(
        results
          .map((r) => (r.fields.length ? `${r.rows.length} filas: ${JSON.stringify(r.rows.slice(0, 50))}` : `OK (${r.affectedRows} filas afectadas)`))
          .join("\n") || "OK",
      );
    },
  },
  {
    name: "query_database",
    description: "Lectura: ejecuta una consulta SELECT y devuelve hasta 100 filas.",
    input_schema: obj({ sql: str("SELECT ...") }, ["sql"]),
    async run(i: { sql: string }, ctx) {
      if (!/^\s*(select|with|explain|show)\b/i.test(i.sql)) throw new Error("query_database solo acepta lecturas; usa execute_sql para escribir.");
      const [r] = await execSql(ctx.projectId, i.sql);
      return clip(`${r?.rows.length ?? 0} filas\n${JSON.stringify(r?.rows.slice(0, 100) ?? [], null, 1)}`);
    },
  },
  {
    name: "check_build",
    description: "Compila la app completa (páginas, endpoints, tareas) y devuelve los errores. Úsalo después de cada tanda de cambios.",
    input_schema: obj({}),
    async run(_i, ctx) {
      const problems = await checkProject(await projects.readAllFiles(ctx.projectId));
      return problems.length ? `${problems.length} problema(s):\n${problems.map(formatProblem).join("\n")}` : "Compila sin errores.";
    },
  },
  {
    name: "run_tests",
    description:
      "Ejecuta las pruebas helpers/**/*.spec.ts en el entorno aislado (describe/it/beforeEach/expect, estilo Jasmine; toBe, toEqual, toContain, toThrow, toBeCloseTo, not…). Úsalo para lógica de negocio: cálculos, validaciones, formatos.",
    input_schema: obj({ path: str("Solo este archivo .spec.ts (opcional)") }),
    async run(i: { path?: string }, ctx) {
      const files = await projects.readAllFiles(ctx.projectId);
      const specs = Object.keys(files).filter((f) => /^helpers\/.+\.spec\.tsx?$/.test(f) && (!i.path || f === i.path));
      if (!specs.length) return "No hay pruebas. Crea helpers/<nombre>.spec.ts que importe el helper y use describe/it/expect.";
      const lines: string[] = [];
      let failed = 0;
      for (const spec of specs) {
        try {
          const mod = await compileServerModule(files, spec);
          const out = (await runInSandbox(ctx.projectId, "test", { env_name: "preview", file: mod.file, base: "" }, "job")) as {
            results: { name: string; ok: boolean; ms: number; error?: string }[];
          };
          for (const r of out.results) {
            if (!r.ok) failed++;
            lines.push(`${r.ok ? "✓" : "✗"} ${spec} › ${r.name}${r.ok ? "" : ` — ${r.error}`}`);
          }
          if (!out.results.length) lines.push(`? ${spec}: no define ninguna prueba con it(...)`);
        } catch (e) {
          failed++;
          lines.push(`✗ ${spec}: ${(e as Error).message}`);
        }
      }
      return `${failed ? `${failed} fallo(s)` : "Todo en verde"}\n${lines.join("\n")}`;
    },
  },
  {
    name: "get_logs",
    description:
      "Lee los registros recientes: peticiones a endpoints, errores del servidor, errores de la consola del navegador de la vista previa, correos y tareas. Primer paso ante un 500 o una pantalla en blanco.",
    input_schema: obj({ errors_only: { type: "boolean" }, limit: { type: "number" } }),
    async run(i: { errors_only?: boolean; limit?: number }, ctx) {
      const logs = readLogs(ctx.projectId, { level: i.errors_only ? "error" : undefined, limit: i.limit ?? 60 });
      return clip(logs.map((l) => `${l.at} [${l.env}/${l.source}/${l.level}] ${l.message}`).join("\n") || "Sin registros.");
    },
  },
  {
    name: "list_secrets",
    description: "Lista los secretos (variables de entorno) del proyecto: nombre, descripción y si ya tienen valor. Nunca muestra valores.",
    input_schema: obj({}),
    async run(_i, ctx) {
      const s = await listSecrets(ctx.projectId);
      return s.map((x) => `${x.name}: ${x.isSet ? "configurado" : "PENDIENTE"} — ${x.description}`).join("\n") || "Sin secretos.";
    },
  },
  {
    name: "request_secret",
    description:
      "Pide al dueño una clave de API u otro secreto. El dueño la escribe en la pestaña Secretos; tú solo conoces el nombre. Úsala como ctx.env.NOMBRE en endpoints. Nunca pidas claves en el chat.",
    input_schema: obj({ name: str("NOMBRE_EN_MAYUSCULAS"), description: str("Para qué sirve y dónde conseguirla") }, ["name", "description"]),
    async run(i: { name: string; description: string }, ctx) {
      await requestSecret(ctx.projectId, i.name, i.description);
      return `Solicitado ${i.name}. El dueño debe escribir el valor en la pestaña Secretos. Puedes seguir construyendo con ctx.env.${i.name}.`;
    },
  },
  {
    name: "setup_auth",
    description:
      "Prepara el inicio de sesión: crea la cuenta admin del dueño (sin contraseña; la fija con «¿Olvidaste tu contraseña?»). Después construye la página de login con auth de @forja/client.",
    input_schema: obj({}),
    async run(_i, ctx) {
      const created = await ensureOwnerAdmin(ctx.projectId, ctx.account.email);
      return created
        ? `Cuenta admin creada para ${ctx.account.email} sin contraseña. El dueño la fija con «¿Olvidaste tu contraseña?» en la página de login.`
        : `Ya existía una cuenta para ${ctx.account.email}; se dejó como estaba.`;
    },
  },
  {
    name: "set_user_password",
    description: "Pone una contraseña temporal a un usuario de la app (solo si el dueño lo pide).",
    input_schema: obj({ email: str("Correo del usuario"), password: str("Contraseña temporal") }, ["email", "password"]),
    async run(i: { email: string; password: string }, ctx) {
      await setTemporaryPassword(ctx.projectId, i.email, i.password);
      return `Contraseña temporal puesta para ${i.email}.`;
    },
  },
  {
    name: "run_job",
    description: "Ejecuta una tarea de jobs/<nombre>.ts una vez, ahora, con el código actual (sobre los datos reales).",
    input_schema: obj({ name: str("Nombre de la tarea"), payload: { description: "Datos para ctx.payload" } }, ["name"]),
    async run(i: { name: string; payload?: unknown }, ctx) {
      await runJob(ctx.projectId, "preview", i.name, i.payload ?? null, "manual");
      return `Tarea ${i.name} terminada. Revisa get_logs para su salida.`;
    },
  },
  {
    name: "create_checkpoint",
    description: "Guarda un punto de restauración del código con una etiqueta.",
    input_schema: obj({ label: str("Etiqueta") }, ["label"]),
    async run(i: { label: string }, ctx) {
      await projects.createCheckpoint(ctx.projectId, i.label, ctx.author);
      return `Checkpoint «${i.label}» creado.`;
    },
  },
  {
    name: "publish_app",
    description:
      "Publica la app en <slug>.localhost. Compila todo antes; si hay errores no publica. Solo publica cuando el dueño lo pida.",
    input_schema: obj({ slug: str("Dirección deseada (opcional)") }),
    async run(i: { slug?: string }, ctx) {
      const r = await publishProject(ctx.projectId, i.slug, ctx.author);
      return `Publicada en ${r.url}`;
    },
  },
  {
    name: "get_preview_url",
    description: "Devuelve el enlace de la vista previa en vivo.",
    input_schema: obj({}),
    async run(_i, ctx) {
      return previewUrl((await projects.getProject(ctx.projectId))!, 7);
    },
  },
];

export const toolByName = new Map(builderTools.map((t) => [t.name, t]));
