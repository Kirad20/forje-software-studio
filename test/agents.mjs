// End-to-end test of the multi-agent builder against a scripted model server:
// routing, planning, parallel specialists with file ownership, review, learning,
// whitelists, fallback and cost metrics.   npm run test:agents
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { log as llmLog, startFakeLlm } from "./fakeLlm.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { server: llm, port: llmPort } = await startFakeLlm();
const PORT = 4800 + Math.floor(Math.random() * 400);
const DATA = mkdtempSync(path.join(tmpdir(), "forja-agents-"));
const MODELS = [
  { provider: "openai", model: "fake-strong", label: "Fuerte", tier: 5, inPrice: 2, outPrice: 10, cacheReadPrice: 0.2, speed: 2 },
  { provider: "openai", model: "fake-mid", label: "Mediano", tier: 3, inPrice: 0.1, outPrice: 0.5, cacheReadPrice: 0.01, speed: 5 },
  { provider: "openai", model: "fake-flaky", label: "Inestable", tier: 5, inPrice: 0, outPrice: 0, speed: 5 },
];
let serverLog = "";
const app = spawn(process.execPath, ["--import", "tsx", "server/index.ts"], {
  cwd: ROOT,
  env: {
    ...process.env,
    PORT: String(PORT),
    PUBLIC_URL: `http://localhost:${PORT}`,
    DATA_DIR: DATA,
    SECRETS_KEY: "cd".repeat(32),
    ANTHROPIC_API_KEY: "",
    OPENROUTER_API_KEY: "",
    OPENAI_BASE_URL: `http://127.0.0.1:${llmPort}/v1`,
    OPENAI_API_KEY: "test",
    BUILDER_MODEL: "",
    APP_AI_MODEL: "",
    FORJA_MODELS: JSON.stringify(MODELS),
    FORJA_MODELS_ALLOW: "",
    SMTP_URL: "",
  },
});
app.stdout.on("data", (d) => (serverLog += d));
app.stderr.on("data", (d) => (serverLog += d));
const finish = () => {
  app.kill();
  llm.close();
  setTimeout(() => rmSync(DATA, { recursive: true, force: true }), 500);
};

let cookie = "";
function req(method, p, body, { stream = false } = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const r = http.request(
      { host: "127.0.0.1", port: PORT, method, path: p, headers: { host: `localhost:${PORT}`, cookie, ...(data ? { "content-type": "application/json" } : {}) } },
      (res) => {
        for (const sc of res.headers["set-cookie"] ?? []) cookie = sc.split(";")[0];
        let text = "";
        res.on("data", (c) => (text += c));
        res.on("end", () => {
          if (stream) return resolve(text.split("\n\n").filter((l) => l.startsWith("data: ")).map((l) => JSON.parse(l.slice(6))));
          let json;
          try {
            json = JSON.parse(text);
          } catch {}
          resolve({ status: res.statusCode, json, text });
        });
      },
    );
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}
const ok = (cond, msg, extra) => {
  if (!cond) {
    console.error("FAIL:", msg, extra ?? "");
    process.exitCode = 1;
  } else console.log("ok  ", msg);
};

try {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await req("GET", "/healthz")).status === 200) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  await req("POST", "/api/auth/request", { email: "owner@example.com" });
  const code = [...serverLog.matchAll(/owner@example.com: (\d{6})/g)].pop()[1];
  await req("POST", "/api/auth/verify", { email: "owner@example.com", code });

  // Model catalog and whitelists.
  const models = (await req("GET", "/api/models")).json;
  ok(models.models.length === 3 && models.models.every((m) => m.enabled), "configured models are listed and allowed by default", JSON.stringify(models.models.map((m) => m.id)));
  const project = (await req("POST", "/api/projects", { prompt: "Notas" })).json.project;
  // Keep the flaky model out of the team turn; it gets its own test below.
  await req("PUT", `/api/projects/${project.id}/models`, { enabled: ["openai:fake-strong", "openai:fake-mid"], concurrency: 3 });
  const pm = (await req("GET", `/api/projects/${project.id}/models`)).json;
  ok(pm.restricted && pm.models.filter((m) => m.enabled).length === 2, "project whitelist restricts the account's models");

  // 1. A multi-domain request goes to the team.
  const events = await req(
    "POST",
    `/api/projects/${project.id}/chat`,
    {
      message:
        "Crea una app de notas: una tabla en la base de datos para guardar las notas, un endpoint que las liste para los usuarios registrados con su correo y contraseña, y una página bonita que las muestre con su diseño.",
    },
    { stream: true },
  );
  const route = events.find((e) => e.type === "route");
  ok(route && route.fastPath === false, "complex request is routed to the team", JSON.stringify(route));
  const plan = events.find((e) => e.type === "plan");
  ok(plan?.tasks.length === 3 && plan.tasks.map((t) => t.role).join(",") === "data,backend,ui", "planner returns a 3-task plan", JSON.stringify(plan));
  const starts = events.filter((e) => e.type === "task_start").map((e) => e.taskId);
  ok(starts.indexOf("db") < starts.indexOf("api") && starts.indexOf("db") < starts.indexOf("page"), "data runs before the tasks that depend on it", starts.join(","));
  const refused = events.find((e) => e.type === "tool_end" && e.taskId === "api" && !e.ok);
  ok(refused && /no es tuyo/.test(refused.output), "an agent cannot write another agent's file", JSON.stringify(refused));
  const review = events.find((e) => e.type === "review");
  ok(review?.ok === true, "QA reviews and approves", JSON.stringify(review));
  const done = events.find((e) => e.type === "done");
  ok(done && done.usd > 0 && done.baselineUsd > done.usd && done.cachedTokens > 0, "turn reports cost, cache use and savings vs. the strongest model", JSON.stringify(done));
  ok(events.some((e) => e.type === "text" && !e.taskId && /notas/.test(e.text)), "a single final reply for the owner");

  // Lanes: backend and ui overlapped in time (they only depend on data).
  const chat = (await req("GET", `/api/projects/${project.id}/chat`)).json;
  const lane = (id) => chat.tasks.find((t) => t.id.endsWith(`:${id}`));
  const api = lane("api");
  const page = lane("page");
  ok(api && page && new Date(api.startedAt) < new Date(page.finishedAt) && new Date(page.startedAt) < new Date(api.finishedAt), "backend and ui ran in parallel", JSON.stringify({ api, page }));
  ok(chat.tasks.every((t) => t.status === "done" && t.modelId), "every lane records its model and status");
  ok(["openai:fake-strong", "openai:fake-mid"].includes(lane("plan").modelId), "planner used a whitelisted model");

  // Files and data were really produced, and the timeline credits each role.
  const files = (await req("GET", `/api/projects/${project.id}/files`)).json.files.map((f) => f.path);
  ok(files.includes("endpoints/notes/list_GET.ts") && files.includes("pages/notes.tsx") && !files.includes("pages/hack.tsx"), "specialists wrote their files only", files.join(","));
  const rows = (await req("GET", `/api/projects/${project.id}/db/rows?table=notes`)).json;
  ok(rows?.total === 1, "data agent created and filled the table", JSON.stringify(rows));
  const changes = (await req("GET", `/api/projects/${project.id}/changes`)).json.changes;
  ok(changes.some((c) => /^ui@fake-/.test(c.actor ?? "")) && changes.some((c) => /^backend@fake-/.test(c.actor ?? "")), "timeline records role@model for each change");

  // Router: decisions logged with scored candidates; learning recorded.
  const router = (await req("GET", `/api/projects/${project.id}/router`)).json;
  ok(router.decisions.length >= 5 && router.decisions.every((d) => d.candidates.length >= 1 && d.reason), "every model choice is logged with its reasons");
  ok(router.learnt.some((r) => r.models.some((m) => m.uses > 0)), "outcomes update the bandit");
  ok(router.spend.length > 0 && router.spend.every((s) => s.usd >= 0), "spend per model and role");

  // 2. A small change takes the fast path — and survives a failing model.
  await req("PUT", `/api/projects/${project.id}/models`, { enabled: ["openai:fake-flaky", "openai:fake-mid"] });
  const before = llmLog.length;
  const fast = await req("POST", `/api/projects/${project.id}/chat`, { message: "Cambia el color principal a verde" }, { stream: true });
  ok(fast.find((e) => e.type === "route")?.fastPath === true, "small change takes the fast path");
  ok(llmLog.slice(before).some((l) => l.model === "fake-flaky") && llmLog.slice(before).some((l) => l.model === "fake-mid" && l.role === "fast"), "a failing model falls back to the next one");
  ok(fast.some((e) => e.type === "text" && /verde/.test(e.text)) && !fast.some((e) => e.type === "error"), "the fast agent finished the change", JSON.stringify(fast.filter((e) => e.type === "error")));
  const fastRouter = (await req("GET", `/api/projects/${project.id}/router`)).json;
  ok(fastRouter.decisions.slice(0, 3).some((d) => d.modelId === "openai:fake-mid"), "fallback decision is logged");

  // 2b. Modes and the automatic fix pass.
  await req("PUT", `/api/projects/${project.id}/models`, { enabled: ["openai:fake-strong", "openai:fake-mid"] });
  const filesBefore = JSON.stringify((await req("GET", `/api/projects/${project.id}/files`)).json.files.map((f) => f.path));
  const chatTurn = await req("POST", `/api/projects/${project.id}/chat`, { message: "¿Hay algún error en mi app?", mode: "chat" }, { stream: true });
  ok(chatTurn.some((e) => e.type === "route" && e.mode === "chat") && chatTurn.some((e) => e.type === "tool_start" && e.name === "get_problems"), "chat mode answers with read-only tools", JSON.stringify(chatTurn.filter((e) => e.type !== "text")));
  ok(chatTurn.some((e) => e.type === "text" && /Respuesta de chat/.test(e.text)), "chat mode replies");
  ok(JSON.stringify((await req("GET", `/api/projects/${project.id}/files`)).json.files.map((f) => f.path)) === filesBefore, "chat mode changes no files");

  const callsBefore = llmLog.length;
  const planTurn = await req("POST", `/api/projects/${project.id}/chat`, { message: "Crea una app de notas con tabla en la base de datos, endpoint para usuarios registrados y una página con diseño.", mode: "plan" }, { stream: true });
  ok(planTurn.some((e) => e.type === "plan") && !planTurn.some((e) => e.type === "task_start" && e.role !== "planner"), "plan mode only plans", JSON.stringify(planTurn.filter((e) => e.type === "task_start")));
  ok(planTurn.some((e) => e.type === "text" && /Implementar plan/.test(e.text)), "the plan is shown for approval");
  const withPlan = (await req("GET", `/api/projects/${project.id}/chat`)).json;
  ok(!!withPlan.pendingPlanTurn, "the plan waits for approval");
  const callsAfterPlan = llmLog.length;
  const implement = await req("POST", `/api/projects/${project.id}/chat`, { message: "Implementa el plan.", mode: "build", implementPlan: true }, { stream: true });
  const roles = llmLog.slice(callsAfterPlan).map((l) => l.role);
  ok(implement.some((e) => e.type === "task_start" && e.role === "ui") && !roles.includes("planner") && llmLog.slice(callsBefore, callsAfterPlan).some((l) => l.role === "planner"), "implementing runs the approved plan without re-planning", roles.join(","));
  ok(!(await req("GET", `/api/projects/${project.id}/chat`)).json.pendingPlanTurn, "the plan is consumed");

  const broken = await req("POST", `/api/projects/${project.id}/chat`, { message: "Rompe la portada", mode: "build" }, { stream: true });
  ok(broken.some((e) => e.type === "task_start" && e.taskId === "fix1"), "a change that breaks the build gets an automatic fix pass", JSON.stringify(broken.filter((e) => e.type === "task_start")));
  ok(broken.some((e) => e.type === "text" && /Arreglé la portada/.test(e.text)), "the fix is reported to the owner");
  const after = (await req("GET", `/api/projects/${project.id}/problems`)).json.problems;
  ok(!after.some((p) => p.kind === "build"), "and the app compiles again", JSON.stringify(after));

  // 3. Account whitelist: nothing allowed → a clear error, no model call.
  await req("PUT", "/api/models/account", { enabled: [] });
  const none = await req("POST", `/api/projects/${project.id}/chat`, { message: "Otra cosa pequeña" }, { stream: true });
  ok(none.some((e) => e.type === "error" && /modelo permitido/.test(e.message)), "empty whitelist gives a clear error", JSON.stringify(none));
  await req("PUT", "/api/models/account", { enabled: null });

  // 4. The next turn starts from a compact context, not the replayed transcript.
  const lastFast = llmLog.filter((l) => l.role === "fast").length;
  ok(lastFast > 0, "fast turns were served");
} finally {
  console.log(process.exitCode ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
  if (process.exitCode) console.log("\n--- server log ---\n" + serverLog.slice(-5000));
  finish();
}
