// A scripted OpenAI-compatible model server for tests: answers as planner, specialists,
// reviewer, summarizer or fast agent depending on the request, with tool calls, delays
// (so parallel lanes overlap) and a model that always fails (to test fallback).
import http from "node:http";

let n = 0;
const call = (name, args) => ({ id: `call_${++n}`, type: "function", function: { name, arguments: JSON.stringify(args) } });
const reply = (content, toolCalls) => ({
  choices: [{ message: { role: "assistant", content: content ?? null, tool_calls: toolCalls }, finish_reason: toolCalls ? "tool_calls" : "stop" }],
  usage: { prompt_tokens: 3000, completion_tokens: 400, prompt_tokens_details: { cached_tokens: 2000 } },
});

export const log = [];

function script(body) {
  const sys = body.messages.find((m) => m.role === "system")?.content ?? "";
  const firstUser = body.messages.find((m) => m.role === "user");
  const userText = typeof firstUser?.content === "string" ? firstUser.content : (firstUser?.content ?? []).map((p) => p.text ?? "").join("\n");
  const step = body.messages.filter((m) => m.role === "assistant").length;
  const lastTool = [...body.messages].reverse().find((m) => m.role === "tool")?.content ?? "";

  if (sys.startsWith("Classify an app-builder request")) return { role: "router", res: reply('{"intent":"feature","complexity":2,"domains":["ui"]}') };
  if (sys.startsWith("Eres un revisor de diseño de producto"))
    return { role: "judge", res: reply('{"scores":{"hierarchy":4,"spacing":3,"color":4,"typography":3.5,"states":3,"responsive":4,"copy":4,"fidelity":3},"issues":["El botón principal no destaca"]}') };
  if (sys.startsWith("Mantienes el resumen")) return { role: "summary", res: reply("El dueño pidió una app de notas.") };
  if (sys.startsWith("Extraes la memoria")) return { role: "memory", res: reply('Esto es lo que vale la pena recordar:\n[{"kind": "preference", "text": "Al dueño le gusta el verde como color principal"}]') };
  if (sys.startsWith("Eres Forja. Escribe la respuesta final")) return { role: "final", res: reply("- Hice la app de notas.\n- Prueba /notes en la vista previa.") };

  if (sys.includes("# Your role: planner")) {
    if (step === 0)
      return {
        role: "planner",
        res: reply(null, [
          call("submit_plan", {
            summary: "Haré una app de notas con su tabla, su API y su página.",
            contract: "GET notes/list → { notes: {id:number, body:string}[] }. Tabla notes(id serial, body text).",
            tasks: [
              { id: "db", role: "data", goal: "Crea la tabla notes", files: ["helpers/types.ts"], depends_on: [] },
              { id: "api", role: "backend", goal: "Endpoint GET notes/list", files: ["endpoints/notes/"], depends_on: ["db"] },
              { id: "page", role: "ui", goal: "Página /notes que lista las notas", files: ["pages/notes.tsx"], depends_on: ["db"] },
            ],
          }),
        ]),
      };
    return { role: "planner", res: reply("Plan entregado.") };
  }
  if (sys.includes("# Your role: security reviewer")) {
    if (step === 0) return { role: "security", res: reply(null, [call("security_scan", {})]) };
    if (step === 1)
      return {
        role: "security",
        res: reply(null, [
          call("report_security", {
            summary: "Revisé los endpoints: uno lista notas de todos sin pedir sesión.",
            findings: [{ severity: "high", title: "notes/list devuelve las notas de todos", file: "endpoints/notes/list_GET.ts", detail: "Cualquiera sin cuenta puede leer todas las notas.", fix: "Pide ctx.requireUser() y filtra por user_id." }],
          }),
        ]),
      };
    return { role: "security", res: reply("Revisión entregada.") };
  }
  if (sys.includes("# Your role: reviewer")) {
    if (step === 0) return { role: "qa", res: reply(null, [call("check_build", {}), call("browser_test", { steps: [{ action: "goto", path: "/notes" }, { action: "screenshot" }] })]) };
    if (step === 1) {
      const built = body.messages.some((m) => m.role === "tool" && m.content.startsWith("Compila"));
      return { role: "qa", res: reply(null, [call("report_review", { ok: built, summary: "Compila y el endpoint responde.", issues: [] })]) };
    }
    return { role: "qa", res: reply("Revisión terminada.") };
  }
  const task = /# Tu tarea \((\w+)/.exec(userText)?.[1];
  if (task === "data") {
    if (step === 0)
      return {
        role: "data",
        res: reply(null, [
          call("execute_sql", { sql: "create table if not exists notes (id serial primary key, body text not null); insert into notes (body) values ('hola');" }),
          call("write_file", { path: "helpers/types.ts", content: "export type Note = { id: number; body: string };\n" }),
        ]),
      };
    return { role: "data", res: reply("Tabla notes creada y tipo Note en helpers/types.ts.") };
  }
  if (task === "backend") {
    if (step === 0)
      return {
        role: "backend",
        res: reply(null, [
          call("write_file", { path: "endpoints/notes/list_GET.ts", content: 'export default async (ctx: any) => ({ notes: await ctx.db.query("select * from notes order by id") });\n' }),
          // Not this agent's file: must be refused.
          call("write_file", { path: "pages/hack.tsx", content: "export default () => null;\n" }),
        ]),
      };
    return { role: "backend", res: reply("Endpoint notes/list listo.") };
  }
  if (task === "ui") {
    if (step === 0)
      return {
        role: "ui",
        res: reply(null, [
          call("write_file", {
            path: "pages/notes.tsx",
            content: 'import { useApi } from "@forja/client";\nexport default function Notes() { const { data } = useApi<any>("notes/list"); return <ul>{data?.notes.map((n: any) => <li key={n.id}>{n.body}</li>)}</ul>; }\n',
          }),
        ]),
      };
    return { role: "ui", res: reply("Página /notes lista.") };
  }
  // Asked to remember something: saves it to memory.
  if (sys.includes("# Chat mode") && userText.includes("Recuerda que")) {
    if (step === 0) return { role: "chat", res: reply(null, [call("remember", { text: "Los pedidos se cierran a las 20:00", kind: "business" })]) };
    return { role: "chat", res: reply("Lo guardé en la memoria del proyecto.") };
  }
  // Chat mode: reads, never writes.
  if (sys.includes("# Chat mode")) {
    if (step === 0) return { role: "chat", res: reply(null, [call("get_problems", {})]) };
    return { role: "chat", res: reply(`Respuesta de chat. ${lastTool.startsWith("Sin problemas") ? "No hay errores ahora." : "Hay errores."}`) };
  }
  // Fix pass after a change that broke the build.
  if (userText.includes("## La app ya no compila")) {
    if (step === 0) return { role: "fix", res: reply(null, [call("write_file", { path: "pages/_index.tsx", content: "export default function Home() { return <h1>Portada</h1>; }\n" })]) };
    return { role: "fix", res: reply("Arreglé la portada.") };
  }
  // Type error that compiles: the finish gate reports it, the agent fixes it once told.
  if (userText.includes("## Petición") && userText.includes("Tipo roto")) {
    const last = body.messages.at(-1);
    const lastUser = last?.role === "user" ? last : null;
    const lastUserText = typeof lastUser?.content === "string" ? lastUser.content : (lastUser?.content ?? []).map((p) => p.text ?? "").join("\n");
    const page = (field) => `import { useApi } from "@forja/client";\nexport default function Home() { const { data } = useApi<{ title: string }>("x"); return <h1>{data?.${field}}</h1>; }\n`;
    if (step === 0) return { role: "fast", res: reply(null, [call("write_file", { path: "pages/_index.tsx", content: page("titel") })]) };
    if (lastUserText.includes("Comprobación automática") && lastUserText.includes("titel"))
      return { role: "fast", res: reply(null, [call("write_file", { path: "pages/_index.tsx", content: page("title") })]) };
    return { role: "fast", res: reply("Cambié el título.") };
  }
  // Fast agent: the full manual, a single opening message with "## Petición".
  if (userText.includes("## Petición") && userText.includes("Rompe la portada")) {
    if (step === 0) return { role: "fast", res: reply(null, [call("write_file", { path: "pages/_index.tsx", content: "export default function Home() { return <h1>Portada</h1>\n" })]) };
    return { role: "fast", res: reply("Cambié la portada.") };
  }
  if (userText.includes("## Petición")) {
    if (step === 0) return { role: "fast", res: reply(null, [call("write_file", { path: "base.css", content: ":root { --primary: #16a34a; }\n" })]) };
    return { role: "fast", res: reply("Cambié el color principal a verde.") };
  }
  return { role: "unknown", res: reply("…") };
}

export function startFakeLlm() {
  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const body = JSON.parse(raw || "{}");
      if (body.model === "fake-flaky") {
        log.push({ model: body.model, role: "flaky", at: Date.now() });
        res.writeHead(503, { "content-type": "application/json" });
        return res.end(JSON.stringify({ error: { message: "overloaded" } }));
      }
      const { role, res: out } = script(body);
      const first = body.messages?.find((m) => m.role === "user");
      const text = typeof first?.content === "string" ? first.content : (first?.content ?? []).map((p) => p.text ?? "").join("\n");
      // What the agent was handed up front, so tests can check the context it got.
      // Screenshots from browser_test come back as an image part after the tool results.
      const sawImage = body.messages.some((m) => m.role === "user" && Array.isArray(m.content) && m.content.some((p) => p.type === "image_url"));
      const system = body.messages.find((m) => m.role === "system")?.content ?? "";
      log.push({ model: body.model, role, at: Date.now(), sawImage, memory: system.includes("# Memoria") && system.includes("pedidos se cierran"), hasMap: text.includes("# Mapa del proyecto"), firstBuild: text.includes("# First version of the app"), preloaded: text.includes("# Archivos relevantes") });
      // Specialists take a while, so parallel lanes visibly overlap.
      const delay = ["data", "backend", "ui"].includes(role) ? 400 : 30;
      setTimeout(() => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ...out, model: body.model }));
      }, delay);
    });
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port })));
}
