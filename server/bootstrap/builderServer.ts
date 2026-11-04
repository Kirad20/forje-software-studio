import { serve } from "@hono/node-server";
import { config } from "../shared/config.js";
import { closePlatformDb, platformDb } from "../shared/database/index.js";
import { createBuilderService } from "../modules/builder/index.js";
import { builderTools, toolByName, isBuilding, stopBuilding, runBuilderTurn, startSecurityReview, stopBuilder, metricsIdle, langfuse, reloadLangfuse } from "../modules/builder/index.js";
import { reloadProviders } from "../modules/model-management/providers.js";
import { createMonolith } from "./composition.js";
import { ApplicationLifecycle } from "./ApplicationLifecycle.js";
import { startAppRuntimeEventRelay } from "./appRuntimeEventRelay.js";

const monolith = createMonolith();
const app = createBuilderService({
  isBuilding,
  stopBuilding,
  reloadSettings: async () => {
    await monolith.settings.loadSettings();
    await reloadProviders();
    reloadLangfuse();
  },
  startSecurityReview,
  runTurn: (input, emit) => runBuilderTurn(
    input.account,
    input.projectId,
    input.userText,
    emit,
    input.attachments,
    input.mode,
    input.implementPlan,
  ),
  async runTool(name, input, context, structured) {
    const tool = toolByName.get(name);
    if (!tool) throw new Error(`Unknown builder tool: ${name}`);
    if (structured && tool.call) {
      const { data, output } = await tool.call(input, context);
      return { data, output };
    }
    return { output: await tool.run(input, context) };
  },
}, config.builderServiceToken);

let server: ReturnType<typeof serve>;
let stopRuntimeEventRelay = () => {};
async function startHttp() {
  await new Promise<void>((resolve, reject) => {
    server = serve({ fetch: app.fetch, hostname: "0.0.0.0", port: config.port }, () => resolve());
    server.once("error", reject);
  });
}
async function stopHttp() {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    if ("closeAllConnections" in server) server.closeAllConnections();
  });
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
  { name: "builder module bindings", start: monolith.startBindings, stop: monolith.stopBindings },
  { name: "builder settings", start: async () => {
    await monolith.settings.start();
    reloadLangfuse();
  }, stop: async () => { monolith.settings.stop(); } },
  { name: "builder model management", start: monolith.models.start, stop: monolith.models.stop },
  { name: "builder providers", start: async () => { await reloadProviders(); }, stop: async () => {} },
  { name: "builder runtime event relay", start: async () => {
    stopRuntimeEventRelay = startAppRuntimeEventRelay(config.appRuntimeInternalUrl, config.appDataServiceToken);
  }, stop: async () => { stopRuntimeEventRelay(); } },
  { name: "builder HTTP", start: startHttp, stop: stopHttp },
  { name: "builder shutdown", start: async () => {}, stop: async () => {
    await stopBuilder();
    await metricsIdle();
    await langfuse?.flush();
  } },
]);

await lifecycle.start();
console.log(`[forja] builder worker en el puerto ${config.port} (${builderTools.length} tools)`);

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  try {
    await lifecycle.stop();
    process.exit(0);
  } catch (error) {
    console.error("[forja] builder shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => { void shutdown(); });
process.on("SIGTERM", () => { void shutdown(); });
