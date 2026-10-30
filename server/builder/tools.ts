import { ensureOwnerAdmin, setTemporaryPassword } from "../baas/auth.js";
import { runJob } from "../baas/jobs.js";
import { describeSchema, execSql } from "../baas/projectDb.js";
import { listSecrets, requestSecret } from "../baas/secrets.js";
import type { Account } from "../platform/accounts.js";
import { readLogs } from "../platform/events.js";
import * as projects from "../platform/projects.js";
import { checkProject, endpointRoutes, formatProblem, jobFiles, pageRoutes } from "../runtime/bundler.js";
import { publishProject } from "../runtime/publish.js";
import { previewUrl } from "../runtime/urls.js";

export { previewUrl };

export interface ToolContext {
  account: Account;
  projectId: string;
  /** Set when a tool changed project files, so the caller can checkpoint. */
  wrote?: boolean;
}

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
    name: "read_files",
    description: "Lee uno o varios archivos (hasta 20) con números de línea.",
    input_schema: obj({ paths: { type: "array", items: { type: "string" }, description: "Rutas a leer" } }, ["paths"]),
    async run(i: { paths: string[] }, ctx) {
      const out: string[] = [];
      for (const p of i.paths.slice(0, 20)) {
        const c = await projects.readFile(ctx.projectId, p);
        out.push(c === undefined ? `### ${p}\n(no existe)` : `### ${p}\n${numbered(c)}`);
      }
      return clip(out.join("\n\n"));
    },
  },
  {
    name: "write_file",
    description: "Crea o reemplaza un archivo completo. La vista previa se actualiza sola.",
    input_schema: obj({ path: str("Ruta, p. ej. pages/_index.tsx"), content: str("Contenido completo") }, ["path", "content"]),
    async run(i: { path: string; content: string }, ctx) {
      await projects.writeFile(ctx.projectId, i.path, i.content);
      ctx.wrote = true;
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
      const c = await projects.readFile(ctx.projectId, i.path);
      if (c === undefined) throw new Error(`No existe ${i.path}`);
      const count = c.split(i.old_text).length - 1;
      if (count === 0) throw new Error("old_text no aparece en el archivo. Lee el archivo y vuelve a intentarlo con el texto exacto.");
      if (count > 1 && !i.replace_all) throw new Error(`old_text aparece ${count} veces; añade contexto o usa replace_all.`);
      await projects.writeFile(ctx.projectId, i.path, i.replace_all ? c.split(i.old_text).join(i.new_text) : c.replace(i.old_text, () => i.new_text));
      ctx.wrote = true;
      return `Editado ${i.path} (${count} reemplazo${count > 1 ? "s" : ""})`;
    },
  },
  {
    name: "delete_file",
    description: "Borra un archivo.",
    input_schema: obj({ path: str("Ruta") }, ["path"]),
    async run(i: { path: string }, ctx) {
      await projects.deleteFile(ctx.projectId, i.path);
      ctx.wrote = true;
      return `Borrado ${i.path}`;
    },
  },
  {
    name: "rename_file",
    description: "Mueve o renombra un archivo.",
    input_schema: obj({ from: str("Ruta actual"), to: str("Ruta nueva") }, ["from", "to"]),
    async run(i: { from: string; to: string }, ctx) {
      await projects.renameFile(ctx.projectId, i.from, i.to);
      ctx.wrote = true;
      return `Movido ${i.from} → ${i.to}`;
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
      await projects.createCheckpoint(ctx.projectId, i.label);
      return `Checkpoint «${i.label}» creado.`;
    },
  },
  {
    name: "publish_app",
    description:
      "Publica la app en <slug>.localhost. Compila todo antes; si hay errores no publica. Solo publica cuando el dueño lo pida.",
    input_schema: obj({ slug: str("Dirección deseada (opcional)") }),
    async run(i: { slug?: string }, ctx) {
      const r = await publishProject(ctx.projectId, i.slug);
      return `Publicada en ${r.url}`;
    },
  },
  {
    name: "get_preview_url",
    description: "Devuelve el enlace de la vista previa en vivo.",
    input_schema: obj({}),
    async run(_i, ctx) {
      return previewUrl(ctx.projectId);
    },
  },
];

export const toolByName = new Map(builderTools.map((t) => [t.name, t]));
