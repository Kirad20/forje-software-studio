import { createServer } from "node:http";
import { config } from "../shared/config.js";
import { closePlatformDb, platformDb } from "../shared/database/index.js";
import { startJobRunner, stopJobRunner, isJobRunnerStarted } from "../modules/app-services/jobs.js";
import { stopAppRuntime } from "../modules/app-runtime/index.js";
import { stopEmailTransport } from "../modules/app-services/email.js";
import { stopRealtime } from "../modules/app-services/realtime.js";
import { reloadProviders } from "../modules/model-management/providers.js";
import { ApplicationLifecycle } from "./ApplicationLifecycle.js";
import { createMonolith } from "./composition.js";

if (!config.appDataServiceUrl || !config.appDataServiceToken) {
  throw new Error("Jobs worker requires APP_DATA_SERVICE_URL and APP_DATA_SERVICE_TOKEN; app-runtime owns project databases");
}

const monolith = createMonolith();
const server = createServer((request, response) => {
  response.setHeader("content-type", "application/json");
  if (request.url !== "/healthz") {
    response.writeHead(404).end('{"error":"not found"}');
    return;
  }
  response.writeHead(isJobRunnerStarted() ? 200 : 503).end(JSON.stringify({ ok: isJobRunnerStarted(), role: "jobs-worker" }));
});

const lifecycle = new ApplicationLifecycle([
  {
    name: "worker platform database",
    start: async () => {
      try { await platformDb(); } catch (error) { await closePlatformDb(); throw error; }
    },
    stop: closePlatformDb,
  },
  { name: "worker module bindings", start: monolith.startBindings, stop: monolith.stopBindings },
  { name: "worker settings", start: monolith.settings.start, stop: async () => { monolith.settings.stop(); } },
  { name: "worker models", start: monolith.models.start, stop: monolith.models.stop },
  { name: "worker providers", start: async () => { await reloadProviders(); }, stop: async () => {} },
  {
    name: "worker app resources",
    start: async () => {},
    stop: async () => {
      const results = await Promise.allSettled([stopAppRuntime(), stopEmailTransport(), Promise.resolve().then(() => stopRealtime())]);
      const errors = results.filter((result): result is PromiseRejectedResult => result.status === "rejected").map((result) => result.reason);
      if (errors.length) throw new AggregateError(errors, "Jobs worker resource cleanup failed");
    },
  },
  { name: "worker queue", start: () => startJobRunner({ queueOnly: true }), stop: stopJobRunner },
  {
    name: "worker health HTTP",
    start: () => new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(config.port, "0.0.0.0", () => {
        server.off("error", reject);
        resolve();
      });
    }),
    stop: () => new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    }),
  },
]);

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  try { await lifecycle.stop(); process.exit(0); }
  catch (error) { console.error("[forja] jobs worker shutdown:", error); process.exit(1); }
}
process.on("SIGINT", () => { void shutdown(); });
process.on("SIGTERM", () => { void shutdown(); });

try {
  await lifecycle.start();
  console.log(`[forja] jobs worker on port ${(server.address() as { port: number }).port}`);
} catch (error) {
  console.error("[forja] jobs worker startup:", error);
  process.exit(1);
}
