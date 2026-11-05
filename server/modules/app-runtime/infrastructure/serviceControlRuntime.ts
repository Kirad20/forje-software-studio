import { z } from "zod";
import { config } from "../../../shared/config.js";
import type { ServiceRuntimeSnapshot } from "../domain/serviceControl.js";
import { getSandboxServices, restartSandboxService } from "./sandbox.js";

const runtimeSnapshot = z.object({
  available: z.literal(true),
  scope: z.literal("app-runtime"),
  services: z.array(z.object({
    env: z.enum(["preview", "published"]),
    service: z.string(),
    replicas: z.array(z.object({
      pid: z.number().int().positive().nullable(),
      active: z.number().int().nonnegative(),
      ready: z.boolean(),
    })),
  })),
});
async function call(path: string, body: unknown, baseUrl: string, token: string) {
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/internal/runtime/service-control/${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`App runtime no disponible (${response.status})`);
  return response.json();
}
export async function readServiceRuntime(
  projectId: string, baseUrl = config.appRuntimeInternalUrl, token = config.appDataServiceToken,
): Promise<ServiceRuntimeSnapshot> {
  if (!baseUrl) return { available: true, scope: "app-runtime", services: getSandboxServices(projectId) };
  return runtimeSnapshot.parse(await call("snapshot", { projectId }, baseUrl, token));
}
export async function restartServiceRuntime(
  projectId: string, service: string, env?: "preview" | "published",
  baseUrl = config.appRuntimeInternalUrl, token = config.appDataServiceToken,
) {
  if (!baseUrl) return restartSandboxService(projectId, service, env);
  z.object({ ok: z.literal(true) }).parse(await call("restart", { projectId, service, env }, baseUrl, token));
}
