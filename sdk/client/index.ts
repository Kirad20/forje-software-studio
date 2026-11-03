/** @forja/client — official browser SDK entry. */
export { createClient, type HttpTransport, type RealtimeTransport } from "./client.js";
export { ApiError } from "./internal/transport.js";
export { api, auth, storage, realtime, ai } from "./internal/default-client.js";
export { ForjaApp, Link, navigate, matchRoute, useRoute, useHead, type RouteMatch, type PageRoute } from "./internal/router.js";
export { createApi, useApi, useUser, useChannel, type RouteSpec, type Contract, type RouteInput, type RouteOutput } from "./internal/hooks.js";
export type { AppUser } from "./internal/auth.js";
export type { StoredFile } from "./internal/storage.js";
export type { ChatMessage } from "./internal/ai.js";
