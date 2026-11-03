import type { Db } from "./database.js";
import type { AppUser } from "./identity.js";
import type { Ai, Email, Jobs, Payments, Realtime } from "./services.js";
import type { Storage } from "./storage.js";

export interface ServiceCtx {
  db: Db;
  storage: Storage;
  email: Email;
  ai: Ai;
  jobs: Jobs;
  realtime: Realtime;
  payments: Payments;
  /** Secrets and connected integrations. Server-only. */
  env: Record<string, string>;
  log(...args: unknown[]): void;
  fail(status: number, message: string): never;
}

/** An endpoint's ctx. */
export interface Ctx extends ServiceCtx {
  req: Request;
  method: string;
  query: Record<string, string>;
  body: any;
  user: AppUser | null;
  requireUser(role?: string): AppUser;
  setCookie(name: string, value: string, opts?: { maxAge?: number }): void;
}

/** A job's ctx. */
export interface JobCtx extends ServiceCtx {
  payload: any;
  job: string;
}
