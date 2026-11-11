import { config } from "../shared/config.js";
import { localMemoryReport } from "../modules/app-runtime/index.js";

const TIMEOUT_MS = 3000;

async function remote(baseUrl: string, path: string, token: string): Promise<unknown> {
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return { error: `HTTP ${response.status}` };
    return await response.json();
  } catch (error) {
    return { error: (error as Error).message };
  }
}

/**
 * Memory of every Forja service this process can reach, for system_status. A service that is
 * not configured (monolith or local development) is left out; one that does not answer reports
 * the error instead of failing the whole status.
 */
export async function platformMemoryReport() {
  const [forja, appRuntime, builder, jobWorker] = await Promise.all([
    localMemoryReport("forja"),
    config.appRuntimeInternalUrl ? remote(config.appRuntimeInternalUrl, "/internal/runtime/memory", config.appDataServiceToken) : undefined,
    config.builderServiceUrl ? remote(config.builderServiceUrl, "/internal/builder/memory", config.builderServiceToken) : undefined,
    config.jobWorkerInternalUrl ? remote(config.jobWorkerInternalUrl, "/internal/memory", config.appDataServiceToken) : undefined,
  ]);
  return Object.fromEntries(Object.entries({ forja, appRuntime, builder, jobWorker }).filter(([, report]) => report !== undefined));
}
