import { config, paths } from "../../../shared/config.js";
import { serviceContext } from "../../app-services/context.js";
import { projectDb } from "../../app-services/projectDb.js";
import type { SpringBuildTool } from "../domain/spring.js";
import { bwrapUnavailable, probe, spawnSandboxed, type LanguageSandboxMode } from "./languageSandbox.js";
import { log } from "./observation.js";
import { RuntimeDataBridge } from "./runtimeDataBridge.js";
import { SpringRuntime } from "./springRuntime.js";

const toolChecks = new Map<string, Promise<string | null>>();

function toolUnavailable(command: string, args: string[], label: string) {
  let check = toolChecks.get(command);
  if (!check) {
    check = probe(command, args).then(({ code }) => (code === 0 ? null : `${label} no está instalado en este servidor.`));
    toolChecks.set(command, check);
  }
  return check;
}

async function unavailable(tool: SpringBuildTool, mode: LanguageSandboxMode): Promise<string | null> {
  if (mode === "off") return "los backends en otros lenguajes están desactivados (FORJA_LANG_SANDBOX=off).";
  if (mode === "bwrap") {
    const reason = await bwrapUnavailable();
    if (reason) return reason;
  }
  return await toolUnavailable("java", ["-version"], "Java")
    ?? (tool === "maven"
      ? await toolUnavailable("mvn", ["-v"], "Maven")
      : await toolUnavailable("gradle", ["-v"], "Gradle (usa Maven: pom.xml)"));
}

export const dataBridge = new RuntimeDataBridge({
  query: (projectId, env, sql, params) => projectDb(projectId, env).query(sql, params),
  exec: (projectId, env, sql) => projectDb(projectId, env).exec(sql),
});

export const springRuntime = new SpringRuntime({
  root: paths.languageRuntimes,
  mode: () => config.languages.sandbox,
  maxHeapMb: config.languages.javaMaxHeapMb,
  maxProcesses: config.languages.maxProcesses,
  idleMs: config.languages.idleMs,
  buildTimeoutMs: config.languages.buildTimeoutMs,
  startTimeoutMs: 120_000,
  requestTimeoutMs: config.maxRunMs,
  maxBodyBytes: 10 * 1024 * 1024,
  spawn: spawnSandboxed,
  unavailable,
  secrets: async (projectId, env) => (await serviceContext(projectId, env, "", "endpoint")).env,
  bridge: dataBridge,
  log,
});

export function stopLanguageRuntimes() {
  springRuntime.stopAll();
  dataBridge.close();
}
