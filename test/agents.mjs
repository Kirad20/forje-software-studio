// End-to-end test of the multi-agent builder against a scripted model server:
// routing, planning, parallel specialists with file ownership, review, learning,
// whitelists, fallback and cost metrics.   npm run test:agents
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { log as llmLog, startFakeLlm } from "./fakeLlm.mjs";
import { freshDatabase } from "./helpers/pg.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { server: llm, port: llmPort } = await startFakeLlm();
const PORT = 4800 + Math.floor(Math.random() * 400);
const DATA = mkdtempSync(path.join(tmpdir(), "forja-agents-"));
const pgdb = await freshDatabase();
const MODELS = [
  { provider: "openai", model: "fake-strong", label: "Fuerte", tier: 5, inPrice: 2, outPrice: 10, cacheReadPrice: 0.2, speed: 2, vision: true },
  { provider: "openai", model: "fake-mid", label: "Mediano", tier: 3, inPrice: 0.1, outPrice: 0.5, cacheReadPrice: 0.01, speed: 5, vision: true },
  { provider: "openai", model: "fake-flaky", label: "Inestable", tier: 5, inPrice: 0, outPrice: 0, speed: 5, vision: true },
];
// Platform settings, providers and models live in the database: the server applies this seed file at start-up.
const SEED = path.join(DATA, "seed.json");
writeFileSync(
  SEED,
  JSON.stringify({
    settings: { "evals.enabled": true, "evals.maxRunUsd": 1, "evals.maxDailyUsd": 5, "evals.concurrency": 1 },
    providers: [{ id: "openai", baseUrl: `http://127.0.0.1:${llmPort}/v1`, apiKey: "test", enabled: true }],
    models: MODELS,
  }),
);
let serverLog = "";
const app = spawn(process.execPath, ["--import", "tsx", "server/bootstrap/server.ts"], {
  cwd: ROOT,
  env: {
    ...process.env,
    PORT: String(PORT),
    PUBLIC_URL: `http://localhost:${PORT}`,
    DATA_DIR: DATA,
    DATABASE_URL: pgdb.url,
    FORJA_SEED_FILE: SEED,
    SECRETS_KEY: "cd".repeat(32),
    FORJA_BOOTSTRAP_TOKEN: "e2e-bootstrap-token-0123456789",
  },
});
app.stdout.on("data", (d) => (serverLog += d));
app.stderr.on("data", (d) => (serverLog += d));
const finish = () => {
  app.kill();
  llm.close();
  setTimeout(() => {
    rmSync(DATA, { recursive: true, force: true });
    pgdb.drop().catch(() => {});
  }, 500);
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
  await req("POST", "/api/auth/setup", { token: "e2e-bootstrap-token-0123456789", email: "owner@example.com", password: "una contraseña larga" });
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
  const teamCalls = llmLog.filter((l) => ["planner", "data", "backend", "ui"].includes(l.role));
  ok(teamCalls.some((l) => l.role === "planner" && l.firstBuild) && teamCalls.some((l) => l.role === "ui" && l.firstBuild), "a new app gets the first-version guidance", JSON.stringify(teamCalls.map((l) => [l.role, l.firstBuild])));
  ok(!teamCalls.some((l) => l.role === "backend" && l.firstBuild), "the backend does not get the design-only first-version guidance");
  ok(llmLog.some((l) => l.role === "qa" && l.sawImage), "QA sees the browser_test screenshot", JSON.stringify(llmLog.filter((l) => l.role === "qa")));

  // Deep security review: a read-only agent in the background; its findings land in the Security view.
  const deep = await req("POST", `/api/projects/${project.id}/security/deep`, {});
  ok(deep.status === 202 && deep.json.deep?.status === "running", "deep security review starts in the background", JSON.stringify(deep.json).slice(0, 300));
  ok((await req("POST", `/api/projects/${project.id}/security/deep`, {})).status === 409, "only one deep review at a time");
  let sec = deep.json;
  for (let i = 0; i < 50 && sec.deep?.status === "running"; i++) {
    await new Promise((r) => setTimeout(r, 200));
    sec = (await req("GET", `/api/projects/${project.id}/security`)).json;
  }
  const deepFinding = sec.deep?.findings?.[0];
  ok(sec.deep?.status === "done" && deepFinding?.source === "deep" && deepFinding.severity === "high" && /^[0-9a-f]{12}$/.test(deepFinding.id), "deep review reports its findings", JSON.stringify(sec.deep).slice(0, 400));
  ok(sec.deep.summary.includes("Revisé"), "deep review keeps the reviewer's summary");
  ok(sec.quick?.status === "done", "the reviewer ran the quick scan as a tool");

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

  // The turn's change card: each file it touched, before and after.
  const turnId = chat.messages.find((m) => m.role === "user")?.turnId;
  const turn = (await req("GET", `/api/projects/${project.id}/turns/${turnId}/changes`)).json;
  const notesPage = turn.files?.find((f) => f.path === "pages/notes.tsx");
  ok(notesPage?.kind === "create" && notesPage.before === null && typeof notesPage.after === "string" && notesPage.after.length > 0, "a turn lists the files it created with their content", JSON.stringify(turn).slice(0, 300));
  ok(turn.files.every((f) => f.before !== f.after || f.omitted) && typeof turn.firstChange === "number", "a turn's change list has real diffs only");

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
  const fastCall = llmLog.slice(before).find((l) => l.role === "fast");
  ok(fastCall?.hasMap && fastCall.preloaded && !fastCall.firstBuild, "the fast agent gets the project map and the relevant files up front", JSON.stringify(fastCall));
  const fastRouter = (await req("GET", `/api/projects/${project.id}/router`)).json;
  ok(fastRouter.decisions.slice(0, 3).some((d) => d.modelId === "openai:fake-mid"), "fallback decision is logged");

  // 2b. Modes and the automatic fix pass.
  await req("PUT", `/api/projects/${project.id}/models`, { enabled: ["openai:fake-strong", "openai:fake-mid"] });
  const filesBefore = JSON.stringify((await req("GET", `/api/projects/${project.id}/files`)).json.files.map((f) => f.path));
  const chatTurn = await req("POST", `/api/projects/${project.id}/chat`, { message: "¿Hay algún error en mi app?", mode: "chat" }, { stream: true });
  ok(chatTurn.some((e) => e.type === "route" && e.mode === "chat") && chatTurn.some((e) => e.type === "tool_start" && e.name === "get_problems"), "chat mode answers with read-only tools", JSON.stringify(chatTurn.filter((e) => e.type !== "text")));
  ok(chatTurn.some((e) => e.type === "text" && /Respuesta de chat/.test(e.text)), "chat mode replies");
  ok(JSON.stringify((await req("GET", `/api/projects/${project.id}/files`)).json.files.map((f) => f.path)) === filesBefore, "chat mode changes no files");

  // Memory: asked to remember, the chat agent saves the fact; later turns get it in their prompt.
  const remember = await req("POST", `/api/projects/${project.id}/chat`, { message: "Recuerda que los pedidos se cierran a las 20:00", mode: "chat" }, { stream: true });
  ok(remember.some((e) => e.type === "tool_start" && e.name === "remember") && !remember.some((e) => e.type === "error"), "the chat agent saves what it is asked to remember", JSON.stringify(remember.filter((e) => e.type !== "text")));
  const saved = (await req("GET", `/api/projects/${project.id}/memory`)).json;
  ok(saved.project.some((m) => m.text === "Los pedidos se cierran a las 20:00" && m.kind === "business" && m.source === "agent"), "the fact is in project memory", JSON.stringify(saved));

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
  const withMemory = llmLog.slice(callsBefore).filter((l) => ["planner", "data", "backend", "ui", "qa"].includes(l.role));
  ok(withMemory.length > 0 && withMemory.every((l) => l.memory), "every agent of later turns gets the memory in its prompt", JSON.stringify(withMemory.map((l) => [l.role, l.memory])));

  const broken = await req("POST", `/api/projects/${project.id}/chat`, { message: "Rompe la portada", mode: "build" }, { stream: true });
  ok(broken.some((e) => e.type === "task_start" && e.taskId === "fix1"), "a change that breaks the build gets an automatic fix pass", JSON.stringify(broken.filter((e) => e.type === "task_start")));
  ok(broken.some((e) => e.type === "text" && /Arreglé la portada/.test(e.text)), "the fix is reported to the owner");
  const after = (await req("GET", `/api/projects/${project.id}/problems`)).json.problems;
  ok(!after.some((p) => p.kind === "build"), "and the app compiles again", JSON.stringify(after));
  ok(broken.some((e) => e.type === "tool_end" && e.id.startsWith("gate-") && !e.ok), "the finish gate checks the build before the agent stops", JSON.stringify(broken.filter((e) => e.type === "tool_end")));

  // A type error compiles with esbuild; the finish gate catches it and the agent fixes it in the same run.
  const typed = await req("POST", `/api/projects/${project.id}/chat`, { message: "Tipo roto en la portada", mode: "build" }, { stream: true });
  const gates = typed.filter((e) => e.type === "tool_end" && e.id.startsWith("gate-"));
  ok(gates.length === 2 && !gates[0].ok && /Tipo:.*titel/.test(gates[0].output) && gates[1].ok, "the finish gate reports a type error and passes once it is fixed", JSON.stringify(gates));
  const home = (await req("GET", `/api/projects/${project.id}/file?path=pages/_index.tsx`)).json;
  ok(home.content?.includes("data?.title"), "the type error was fixed in the same run", JSON.stringify(home));

  // 3. Account whitelist: nothing allowed → a clear error, no model call.
  await req("PUT", "/api/models/account", { enabled: [] });
  const none = await req("POST", `/api/projects/${project.id}/chat`, { message: "Otra cosa pequeña" }, { stream: true });
  ok(none.some((e) => e.type === "error" && /modelo permitido/.test(e.message)), "empty whitelist gives a clear error", JSON.stringify(none));
  await req("PUT", "/api/models/account", { enabled: null });

  // 4. Older turns are folded into the summary, and the facts in them into project memory.
  let extracted;
  for (let i = 0; i < 50 && !extracted; i++) {
    await new Promise((r) => setTimeout(r, 200));
    extracted = (await req("GET", `/api/projects/${project.id}/memory`)).json.project.find((m) => m.source === "summary");
  }
  ok(extracted?.kind === "preference" && /verde/.test(extracted.text), "facts from older turns are extracted into project memory", JSON.stringify(extracted));

  // The next turn starts from a compact context, not the replayed transcript.
  const lastFast = llmLog.filter((l) => l.role === "fast").length;
  ok(lastFast > 0, "fast turns were served");

  // 5. Quality evals: a real run end to end against the scripted model, in a throwaway project.
  const evalCfg = (await req("GET", "/api/admin/evals/config")).json;
  ok(evalCfg.enabled && evalCfg.cases.length >= 6 && evalCfg.models.length === 3 && evalCfg.limits.maxRunUsd === 1, "evals: config lists the cases, the models and the limits", JSON.stringify(evalCfg.limits));
  const me0 = (await req("GET", "/api/me")).json.account;
  const dirs0 = new Set(readdirSync(path.join(DATA, "projects")));
  ok((await req("POST", "/api/admin/evals/runs", { cases: ["no-existe"] })).status === 400, "evals: unknown cases are refused");
  const started = await req("POST", "/api/admin/evals/runs", { cases: ["small-cafe-landing"], repeats: 1, models: ["openai:fake-mid"], judge: true, budgetUsd: 99 });
  ok(started.status === 202 && started.json.budgetUsd === 1, "evals: a run starts, with the budget capped by the server", JSON.stringify(started.json));
  ok((await req("POST", "/api/admin/evals/runs", { cases: ["small-cafe-landing"] })).status === 409, "evals: only one run at a time");
  let run;
  for (let i = 0; i < 300; i++) {
    run = (await req("GET", `/api/admin/evals/runs/${started.json.runId}`)).json;
    if (run.status !== "running") break;
    await new Promise((r) => setTimeout(r, 500));
  }
  const res = run.results?.[0];
  ok(run.status === "done" && run.results.length === 1, "evals: the run finishes with one result", JSON.stringify({ status: run.status, error: run.error, n: run.results?.length }));
  ok(res?.checks.compile.ok && res.checks.types?.ok && res.checks.preview.some((c) => c.ok), "evals: it measures compile, types and the preview", JSON.stringify(res?.checks));
  ok(res?.design.judge?.scores?.hierarchy === 4 && res.score.judge > 0.5 && res.score.total > 50, "evals: the design judge scores the screenshots", JSON.stringify(res?.design.judge));
  ok(res?.turn.models.every((m) => m === "Mediano") && res.usd > 0 && run.spentUsd > 0 && run.spentUsd <= 1, "evals: the builder was pinned to the chosen model and its spend is recorded", JSON.stringify({ turn: res?.turn, spent: run.spentUsd }));
  ok(run.summary.overall.runs === 1 && run.summary.bySize.small, "evals: the run has a summary");
  const dirs1 = readdirSync(path.join(DATA, "projects"));
  ok(dirs1.every((d) => dirs0.has(d)), "evals: the throwaway project and its data are gone", JSON.stringify(dirs1.filter((d) => !dirs0.has(d))));
  const me1 = (await req("GET", "/api/me")).json.account;
  ok(me1.credits === me0.credits, "evals: real accounts are not charged");
  const users = (await req("GET", "/api/admin/users")).json.users;
  ok(!users.some((u) => u.email === "evals@forja.internal"), "evals: the eval account is hidden from the user list");
  const md = await req("GET", `/api/admin/evals/runs/${started.json.runId}/export?format=md`);
  ok(md.status === 200 && md.text.includes("# Informe de evals") && md.text.includes("small-cafe-landing"), "evals: the report exports as Markdown");
  const js = await req("GET", `/api/admin/evals/runs/${started.json.runId}/export`);
  ok(js.json?.run?.id === started.json.runId && js.json.run.results.length === 1 && js.json.evalSetVersion >= 1, "evals: the run exports as JSON");
  ok((await req("GET", "/api/admin/evals/runs")).json.runs.some((r) => r.id === started.json.runId && r.done === 1), "evals: past runs are listed");

  // 6. Admin panel: connection tests against the scripted model server.
  const provTest = await req("POST", "/api/admin/providers/openai/test");
  ok(provTest.json?.ok === true && provTest.json.models === 3, "admin: testing a provider lists its models", provTest.text);
  const modelTest = await req("POST", "/api/admin/models/test/openai%3Afake-mid");
  ok(modelTest.json?.ok === true && modelTest.json.text === "OK" && modelTest.json.toolsOk === true && modelTest.json.usd > 0, "admin: testing a model answers text and calls a tool", modelTest.text);
  const flakyTest = await req("POST", "/api/admin/models/test/openai%3Afake-flaky");
  ok(flakyTest.status === 200 && flakyTest.json.ok === false && /503|overloaded/.test(flakyTest.json.error), "admin: a failing model reports its error", flakyTest.text);
  ok((await req("GET", "/api/me")).json.account.credits === me1.credits, "admin: connection tests charge nobody");

  // 7. Admin panel: one agent on one model in a throwaway project, and what the router learned.
  const playRoles = (await req("GET", "/api/admin/agents/roles")).json.roles;
  ok(playRoles.some((r) => r.role === "backend" && r.tools.includes("write_file")), "playground: lists the roles with their tools", JSON.stringify(playRoles?.map((r) => r.role)));
  const dirs2 = new Set(readdirSync(path.join(DATA, "projects")));
  const spent0 = (await req("GET", "/api/admin/evals/config")).json.spentLast24hUsd;
  const play = await req("POST", "/api/admin/agents/runs", { role: "backend", modelId: "openai:fake-mid", prompt: "Endpoint GET notes/list" });
  ok(play.status === 202 && play.json.runId, "playground: a run starts", play.text);
  ok((await req("POST", "/api/admin/agents/runs", { role: "ui", modelId: "openai:fake-mid", prompt: "otra" })).status === 409, "playground: one run at a time");
  ok((await req("POST", "/api/admin/agents/runs", { role: "planner", modelId: "openai:fake-mid", prompt: "x" })).status === 400, "playground: roles that need the orchestrator are refused");
  let pr;
  for (let i = 0; i < 120; i++) {
    pr = (await req("GET", `/api/admin/agents/runs/${play.json.runId}`)).json;
    if (pr.status !== "running") break;
    await new Promise((r) => setTimeout(r, 500));
  }
  ok(pr.status === "done" && pr.result.files["endpoints/notes/list_GET.ts"]?.includes("select * from notes"), "playground: the agent's files come back", JSON.stringify({ status: pr.status, error: pr.error, files: Object.keys(pr.result?.files ?? {}) }));
  ok(pr.events.some((e) => e.type === "tool_start" && e.name === "write_file") && pr.result.usd > 0, "playground: steps and cost are reported", JSON.stringify(pr.events.map((e) => e.type)));
  ok(llmLog.filter((l) => l.role === "backend").at(-1)?.model === "fake-mid", "playground: the chosen model answered");
  const dirs3 = readdirSync(path.join(DATA, "projects"));
  ok(dirs3.every((d) => dirs2.has(d)), "playground: the throwaway project is gone", JSON.stringify(dirs3.filter((d) => !dirs2.has(d))));
  ok((await req("GET", "/api/me")).json.account.credits === me1.credits, "playground: real accounts are not charged");
  const spent1 = (await req("GET", "/api/admin/evals/config")).json.spentLast24hUsd;
  ok(spent1 > spent0, "playground: its spend still counts against the daily cap once the project is gone", JSON.stringify({ spent0, spent1 }));
  const stats = (await req("GET", "/api/admin/router/stats")).json;
  ok(stats.classes.length > 0 && stats.classes[0].models[0].mean > 0 && stats.decisions.length > 0, "router: the panel shows what it learned and its decisions", JSON.stringify(stats.classes[0]));
  const reset = await req("POST", "/api/admin/router/reset", {});
  ok(reset.json.removed > 0 && (await req("GET", "/api/admin/router/stats")).json.classes.length === 0, "router: what it learned can be forgotten", reset.text);
} finally {
  console.log(process.exitCode ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
  if (process.exitCode) console.log("\n--- server log ---\n" + serverLog.slice(-5000));
  finish();
}
