import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { WebSocketServer } from "ws";
import { config } from "../shared/config.js";
import { closePlatformDb, platformDb } from "../shared/database/index.js";
import { createAppDataService } from "../modules/app-services/appDataService.js";
import { applyProjectMigrations, closeAll, closeProject, cloneDatabase, dumpDatabase, execSql, isAwake, projectDb, projectDbMetrics } from "../modules/app-services/projectDb.js";
import { attachSocket, stopRealtime } from "../modules/app-services/realtime.js";
import { stopEmailTransport } from "../modules/app-services/email.js";
import { parseAppHost, checkShareToken, cookie, serveApp, stopAppRuntime, localMemoryReport } from "../modules/app-runtime/index.js";
import { reloadProviders } from "../modules/model-management/providers.js";
import { ApplicationLifecycle } from "./ApplicationLifecycle.js";
import { createMonolith } from "./composition.js";
import { createAppRuntimeHttpApp, resolveApp } from "./appRuntimeHttp.js";
import { emitProject } from "../modules/project-observability/events.js";

const monolith = createMonolith();
const projects = monolith.projects;
const runtimePorts = {
  getProject: projects.getProject,
  getProjectBySlug: projects.getProjectBySlug,
  parseAppHost,
  checkShareToken,
  cookie,
  serveApp,
  internalToken: config.appDataServiceToken,
  emitProject,
  memoryReport: () => localMemoryReport("app-runtime"),
  reloadSettings: async () => {
    await monolith.settings.loadSettings();
    await reloadProviders();
  },
};
const app = new Hono();
app.route("/", createAppDataService({
  projectDb,
  execSql,
  applyProjectMigrations,
  dumpDatabase,
  closeProject,
  cloneDatabase,
  closeAll,
  isAwake,
  dbMetrics: projectDbMetrics,
}, config.appDataServiceToken));
app.route("/", createAppRuntimeHttpApp(runtimePorts));

const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
let server: ReturnType<typeof serve>;

async function startHttp() {
  await new Promise<void>((resolve, reject) => {
    server = serve({ fetch: app.fetch, hostname: "0.0.0.0", port: config.port }, () => resolve());
    server.once("error", reject);
  });
  server.on("upgrade", async (req, socket, head) => {
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
      const resolved = await resolveApp(req.headers.host, url, req.headers.cookie ?? null, runtimePorts);
      if (!resolved?.project || !resolved.allowed || url.pathname !== "/_baas/realtime") throw new Error("rejected");
      wss.handleUpgrade(req, socket, head, (ws) => attachSocket(resolved.project!.id, ws));
    } catch {
      socket.destroy();
    }
  });
}

async function stopHttp() {
  for (const socket of wss.clients) socket.terminate();
  await Promise.all([
    new Promise<void>((resolve, reject) => wss.close((error) => error ? reject(error) : resolve())),
    new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      if ("closeAllConnections" in server) server.closeAllConnections();
    }),
  ]);
}

const lifecycle = new ApplicationLifecycle([
  {
    name: "platform database",
    start: async () => {
      try { await platformDb(); } catch (error) {
        await closePlatformDb();
        throw error;
      }
    },
    stop: closePlatformDb,
  },
  { name: "runtime module bindings", start: monolith.startBindings, stop: monolith.stopBindings },
  { name: "runtime settings", start: monolith.settings.start, stop: async () => { monolith.settings.stop(); } },
  { name: "runtime model management", start: monolith.models.start, stop: monolith.models.stop },
  { name: "runtime providers", start: async () => { await reloadProviders(); }, stop: async () => {} },
  { name: "runtime HTTP and WebSocket", start: startHttp, stop: stopHttp },
  { name: "runtime shutdown", start: async () => {}, stop: async () => {
    await stopAppRuntime();
    stopRealtime();
    stopEmailTransport();
    await closeAll();
  } },
]);

await lifecycle.start();
console.log(`[forja] app runtime en el puerto ${config.port}`);

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  try {
    await lifecycle.stop();
    process.exit(0);
  } catch (error) {
    console.error("[forja] app runtime shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => { void shutdown(); });
process.on("SIGTERM", () => { void shutdown(); });
