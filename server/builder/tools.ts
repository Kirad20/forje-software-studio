import { endSession as endTestSession, ensureOwnerAdmin, sessionCookie, setTemporaryPassword, testSession } from "../baas/auth.js";
import { fetchPublicText } from "../lib/safeFetch.js";
import { serveApp } from "../runtime/appServer.js";
import { runJob } from "../baas/jobs.js";
import { describeSchema, execSql } from "../baas/projectDb.js";
import { listSecrets, requestSecret } from "../baas/secrets.js";
import type { Account } from "../platform/accounts.js";
import { readLogs } from "../platform/events.js";
import * as projects from "../platform/projects.js";
import { formatProblems, listProblems, recheckBuild, watchProblems } from "../platform/problems.js";
import { ensureDeps, MANIFEST, readDeps, resolvePackage, withManifestLock, writeDeps } from "../runtime/deps.js";
import { checkProject, compileServerModule, endpointRoutes, formatProblem, jobFiles, pageRoutes } from "../runtime/bundler.js";
import { runBrowserTest, type BrowserStep } from "../runtime/browser.js";
import { runQuickScan } from "../platform/security.js";
import { formatFinding } from "../runtime/securityScan.js";
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

/** A tool's answer: text, optionally with images the model gets to see (screenshots). */
export type ToolOutput = string | { text: string; images: { media_type: string; data: string }[] };

export interface BuilderTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  run(input: any, ctx: ToolContext): Promise<ToolOutput>;
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
      'Reemplaza fragmentos exactos de un archivo existente. Un cambio: old_text + new_text. Varios cambios en el mismo archivo: "edits", en una sola llamada; se aplican en orden y, si uno falla, no se guarda ninguno. Cada old_text debe aparecer una sola vez (o usa replace_all).',
    input_schema: obj(
      {
        path: str("Ruta"),
        old_text: str("Texto exacto a reemplazar (para un solo cambio)"),
        new_text: str("Texto nuevo (para un solo cambio)"),
        replace_all: { type: "boolean", description: "Reemplazar todas las apariciones de old_text, no solo una" },
        edits: {
          type: "array",
          description: "Varios cambios en orden, en lugar de old_text/new_text",
          items: obj({ old_text: str("Texto exacto a reemplazar"), new_text: str("Texto nuevo"), replace_all: { type: "boolean", description: "Reemplazar todas las apariciones" } }, ["old_text", "new_text"]),
        },
      },
      ["path"],
    ),
    async run(i: { path: string; old_text?: string; new_text?: string; replace_all?: boolean; edits?: { old_text: string; new_text: string; replace_all?: boolean }[] }, ctx) {
      assertOwned(ctx, i.path);
      const edits = i.edits?.length ? i.edits : i.old_text !== undefined && i.new_text !== undefined ? [{ old_text: i.old_text, new_text: i.new_text, replace_all: i.replace_all }] : [];
      if (!edits.length) throw new Error("Hace falta old_text y new_text, o una lista edits.");
      let c = await projects.readFile(ctx.projectId, i.path);
      if (c === undefined) throw new Error(`No existe ${i.path}`);
      let total = 0;
      for (const [n, e] of edits.entries()) {
        const which = edits.length > 1 ? ` (cambio ${n + 1})` : "";
        const count = e.old_text ? c.split(e.old_text).length - 1 : 0;
        if (count === 0) throw new Error(`old_text${which} no aparece en el archivo. Lee el archivo y vuelve a intentarlo con el texto exacto. No se guardó nada.`);
        if (count > 1 && !e.replace_all) throw new Error(`old_text${which} aparece ${count} veces; añade contexto o usa replace_all. No se guardó nada.`);
        c = e.replace_all ? c.split(e.old_text).join(e.new_text) : c.replace(e.old_text, () => e.new_text);
        total += e.replace_all ? count : 1;
      }
      await projects.writeFile(ctx.projectId, i.path, c, ctx.author, ctx.actor);
      noteWrite(ctx, i.path);
      return `Editado ${i.path} (${total} reemplazo${total > 1 ? "s" : ""})`;
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
    name: "add_dependency",
    description:
      "Instala un paquete de npm para la app (navegador o endpoints): fija la versión exacta en package.json y lo instala sin ejecutar scripts. Hazlo antes de importarlo. react, react-dom, zod y @forja/client ya vienen incluidos. Elige paquetes pequeños y conocidos; no instales nada que se resuelva con unas pocas líneas.",
    input_schema: obj(
      {
        name: str("Nombre en npm, p. ej. date-fns o @tanstack/react-table"),
        version: str("Versión exacta (3.6.0) o etiqueta (latest). Por defecto, la última."),
      },
      ["name"],
    ),
    async run(i: { name: string; version?: string }, ctx) {
      const pkg = await resolvePackage(i.name.trim(), i.version?.trim() || undefined);
      // package.json is shared by every agent of the turn: this tool may edit it whoever owns it.
      const before = await withManifestLock(ctx.projectId, async () => {
        const files = await projects.readAllFiles(ctx.projectId);
        const deps = readDeps(files);
        const prev = deps[pkg.name];
        const next = { ...deps, [pkg.name]: pkg.version };
        await ensureDeps(next);
        await projects.writeFile(ctx.projectId, MANIFEST, writeDeps(files, next), ctx.author, ctx.actor);
        noteWrite(ctx, MANIFEST);
        return prev;
      });
      return [
        `${before ? `Actualizado ${pkg.name} ${before} → ${pkg.version}` : `Instalado ${pkg.name}@${pkg.version}`}${pkg.description ? ` — ${pkg.description}` : ""}.`,
        `Impórtalo con import … from "${pkg.name}".`,
        ...pkg.warnings.map((w) => `Aviso: ${w}`),
      ].join("\n");
    },
  },
  {
    name: "remove_dependency",
    description: "Quita un paquete de npm de package.json. Antes elimina sus imports, o la compilación fallará.",
    input_schema: obj({ name: str("Nombre del paquete") }, ["name"]),
    async run(i: { name: string }, ctx) {
      return withManifestLock(ctx.projectId, async () => {
        const files = await projects.readAllFiles(ctx.projectId);
        const deps = readDeps(files);
        if (!(i.name in deps)) return `${i.name} no estaba instalado. Paquetes: ${Object.keys(deps).join(", ") || "ninguno"}.`;
        delete deps[i.name];
        await projects.writeFile(ctx.projectId, MANIFEST, writeDeps(files, deps), ctx.author, ctx.actor);
        noteWrite(ctx, MANIFEST);
        return `Quitado ${i.name}.`;
      });
    },
  },
  {
    name: "search_code",
    description: "Busca un texto o expresión regular en todos los archivos del proyecto y devuelve las líneas que coinciden (archivo:línea).",
    input_schema: obj(
      { pattern: str("Texto o regex (sin barras)"), path_prefix: str("Limitar a rutas que empiecen así, p. ej. endpoints/"), ignore_case: { type: "boolean", description: "Sin distinguir mayúsculas" } },
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
        method: { type: "string", enum: ["GET", "POST"], description: "GET para lecturas, POST para escrituras" },
        route: str("Ruta del endpoint sin /_api/, p. ej. todos/list"),
        query: { type: "object", additionalProperties: true, description: 'Parámetros de la URL para GET, p. ej. {"q": "pan"}' },
        body: { type: "object", additionalProperties: true, description: 'Cuerpo JSON para POST, p. ej. {"title": "Prueba"}' },
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
    name: "browser_test",
    description:
      "Abre la vista previa en un navegador real (Chromium sin interfaz) y la usa como un visitante: navega, hace clic, escribe y comprueba textos. Devuelve el resultado de cada paso, los errores de consola, las peticiones fallidas, el texto visible y capturas de pantalla que puedes ver. Úsalo para probar flujos de interfaz (formularios, navegación, estados vacíos y de error) y el diseño en móvil; para la API sola, call_endpoint es más rápido. Se para en el primer paso que falla y adjunta una captura. Usa datos de prueba claramente marcados: la base de datos es real.",
    input_schema: obj(
      {
        steps: {
          type: "array",
          description:
            'Pasos en orden (máx. 25). Selectores: CSS o de Playwright, p. ej. "button:has-text(Guardar)", "text=Entrar", "input[name=email]". Ejemplo: [{"action":"goto","path":"/login"},{"action":"fill","selector":"input[type=email]","text":"ana@ejemplo.com"},{"action":"click","selector":"button[type=submit]"},{"action":"expect_text","text":"Hola"},{"action":"screenshot"}]',
          items: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["goto", "click", "fill", "press", "select", "wait_for", "expect_text", "screenshot"] },
              path: str("goto: ruta de la app, p. ej. /notes?filtro=hoy"),
              selector: str("click, fill, press, select, wait_for: el elemento"),
              text: str("fill: lo que se escribe; wait_for y expect_text: el texto que debe aparecer"),
              key: str("press: tecla, p. ej. Enter o Escape"),
              value: str("select: valor de la opción"),
              full_page: { type: "boolean", description: "screenshot: la página entera en vez de la pantalla visible" },
            },
            required: ["action"],
          },
        },
        viewport: { type: "string", enum: ["desktop", "tablet", "mobile"], description: "Tamaño de pantalla (por defecto desktop)" },
        as_user_email: str("Correo de un usuario de la app para navegar con su sesión iniciada"),
      },
      ["steps"],
    ),
    async run(i: { steps: BrowserStep[]; viewport?: "desktop" | "tablet" | "mobile"; as_user_email?: string }, ctx) {
      const project = (await projects.getProject(ctx.projectId))!;
      const session = i.as_user_email ? await testSession(ctx.projectId, i.as_user_email) : null;
      try {
        return await runBrowserTest(project, {
          steps: i.steps,
          viewport: i.viewport,
          session: session ? { name: sessionCookie(ctx.projectId), token: session.token } : undefined,
        });
      } finally {
        if (session) await endTestSession(ctx.projectId, session.token);
      }
    },
  },
  {
    name: "security_scan",
    description:
      "Pasa el escaneo rápido de seguridad al código actual: secretos en páginas o escritos en el código, SQL construido con texto, endpoints que cambian datos sin sesión, endpoints de admin sin rol, POST sin validar, importes que vienen del navegador, HTML sin escapar. Es el mismo que bloquea la publicación (solo los críticos bloquean). Úsalo tras tocar endpoints o antes de publicar, y arregla lo que encuentre.",
    input_schema: obj({}),
    async run(_i, ctx) {
      const open = (await runQuickScan(ctx.projectId)).filter((f) => !f.ignored);
      return open.length ? `${open.length} hallazgo(s):\n${open.map(formatFinding).join("\n")}` : "Sin hallazgos en el escaneo rápido.";
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
    input_schema: obj({
      errors_only: { type: "boolean", description: "Solo errores" },
      limit: { type: "integer", description: "Cuántas entradas, las más recientes (por defecto 60)" },
    }),
    async run(i: { errors_only?: boolean; limit?: number }, ctx) {
      const logs = readLogs(ctx.projectId, { level: i.errors_only ? "error" : undefined, limit: i.limit ?? 60 });
      return clip(logs.map((l) => `${l.at} [${l.env}/${l.source}/${l.level}] ${l.message}`).join("\n") || "Sin registros.");
    },
  },
  {
    name: "get_problems",
    description:
      "Lo que está roto AHORA en la vista previa, sin duplicados: errores de compilación, errores no capturados del navegador (con su pila), llamadas a la API que fallaron (método, ruta, código HTTP y respuesta) y fallos de endpoints o tareas. Úsala primero ante un error, una pantalla en blanco o un 4xx/5xx, y otra vez al terminar para confirmar que no queda nada.",
    input_schema: obj({ recheck: { type: "boolean", description: "Vuelve a compilar antes de responder (por defecto sí)." } }),
    async run(i: { recheck?: boolean }, ctx) {
      watchProblems(ctx.projectId);
      if (i.recheck !== false) await recheckBuild(ctx.projectId);
      return clip(formatProblems(listProblems(ctx.projectId), 20));
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
    input_schema: obj({ name: str("Nombre de la tarea"), payload: { type: "object", additionalProperties: true, description: "Datos para ctx.payload (opcional)" } }, ["name"]),
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
