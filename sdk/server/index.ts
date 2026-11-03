/**
 * @forja/server — dependency-free, type-only contracts for generated endpoints and jobs.
 * Import Ctx for endpoint handlers and JobCtx for jobs. Capability contracts live
 * beside this entry and resolve without importing the Forja backend.
 */
export type { AppUser } from "./contracts/identity.js";
export type { Db } from "./contracts/database.js";
export type { StoredFile, Storage } from "./contracts/storage.js";
export type { AiMessage, CheckoutInput, Ai, Email, Jobs, Payments, Realtime } from "./contracts/services.js";
export type { ServiceCtx, Ctx, JobCtx } from "./contracts/context.js";
