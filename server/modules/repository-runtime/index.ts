import { randomBytes } from "node:crypto";
import { createRepositoryEngine } from "./application/runtime.js";
import { proxyRepositoryRequest, proxyRepositoryUpgrade } from "./infrastructure/proxy.js";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { RepositoryEnvironment } from "./domain/repository.js";
import type { RepositoryRuntimePorts } from "./ports/runtime.js";

export * from "./domain/repository.js";
export type { RepositoryRunner, RepositoryStore, RepositoryRuntimePorts } from "./ports/runtime.js";
export { PostgresRepositoryStore } from "./infrastructure/store.js";
export { DockerRepositoryRunner, dockerCommand, selectBuildFiles, type DockerCommand, type DockerRepositoryOptions } from "./infrastructure/docker.js";
export { proxyRepositoryRequest, proxyHeaders, proxyRepositoryUpgrade } from "./infrastructure/proxy.js";
export { repositoryShareToken, checkRepositoryShareToken, type RepositoryAccessScope } from "./infrastructure/access.js";
export function createRepositoryRuntime(ports: Omit<RepositoryRuntimePorts, "id" | "now" | "proxy"> & Partial<Pick<RepositoryRuntimePorts, "id" | "now" | "proxy">> & { previewFrameOrigins?: string[] }) {
  const engine = createRepositoryEngine({
    ...ports, id: ports.id ?? (() => randomBytes(12).toString("hex")),
    now: ports.now ?? (() => new Date().toISOString()),
    proxy: ports.proxy ?? ((request, deployment, env) => proxyRepositoryRequest(request, deployment, env === "preview" ? { frameAncestors: ports.previewFrameOrigins ?? [] } : undefined)),
  });
  const connections = new Set<() => void>();
  return {
    ...engine,
    async upgrade(request: IncomingMessage, socket: Duplex, head: Buffer, id: string, env: RepositoryEnvironment) {
      const close = proxyRepositoryUpgrade(request, socket, head, await engine.deployment(id, env), env === "preview");
      connections.add(close);
      socket.once("close", () => connections.delete(close));
    },
    closeConnections() { for (const close of connections) close(); connections.clear(); },
  };
}
export type RepositoryRuntime = ReturnType<typeof createRepositoryRuntime>;
