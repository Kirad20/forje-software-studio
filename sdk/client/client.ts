import { createAi } from "./internal/ai.js";
import { createApiWorkflow } from "./internal/api.js";
import { createAuth } from "./internal/auth.js";
import { createRealtime, type RealtimeTransport } from "./internal/realtime.js";
import { createStorage } from "./internal/storage.js";
import { createHttp, type HttpTransport } from "./internal/transport.js";

/**
 * Creates independent API, authentication, storage and AI workflows.
 * Supply a realtime transport to enable subscriptions/publications. No transport is
 * opened until a workflow is called. The official singleton uses window.__FORJA__
 * for preview/published base paths; injected clients require no browser globals.
 */
export function createClient(transport: HttpTransport, realtimeTransport?: RealtimeTransport) {
  const http = createHttp(transport);
  return {
    api: createApiWorkflow(http),
    auth: createAuth(http),
    storage: createStorage(http),
    ai: createAi(http),
    realtime: realtimeTransport ? createRealtime(realtimeTransport) : undefined,
  };
}

export type { HttpTransport } from "./internal/transport.js";
export type { RealtimeTransport } from "./internal/realtime.js";
