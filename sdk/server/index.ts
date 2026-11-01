/**
 * @forja/server — types only. What every endpoint and job of a generated app receives as `ctx`.
 *
 *   import type { Ctx } from "@forja/server";
 *   export default async function handler(ctx: Ctx) { ... }
 *
 * It exists so the builder's type check (runtime/typecheck.ts) can catch wrong calls on the
 * server side too. Self-contained on purpose: the app's program loads it without Forja's
 * server code. test/unit/serverTypes.test.ts checks it stays in sync with baas/context.ts.
 * Query results are `any` by default so untyped rows do not flood the model with errors.
 */

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface Db {
  query<T = any>(sql: string, params?: unknown[]): Promise<T[]>;
  one<T = any>(sql: string, params?: unknown[]): Promise<T | undefined>;
  /** Runs several statements (no parameters). */
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: Pick<Db, "query" | "one">) => Promise<T>): Promise<T>;
}

export interface StoredFile {
  key: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface AiMessage {
  role: "user" | "assistant";
  content: string | any[];
}

export interface CheckoutInput {
  mode?: "payment" | "subscription";
  lineItems: { name: string; amountCents: number; currency?: string; quantity?: number; interval?: "month" | "year" }[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface ServiceCtx {
  db: Db;
  storage: {
    put(data: Uint8Array | string, opts: { filename: string; contentType?: string; key?: string }): Promise<StoredFile>;
    get(key: string): Promise<{ data: Uint8Array; contentType: string; filename: string } | null>;
    delete(key: string): Promise<void>;
    list(): Promise<(StoredFile & { createdAt: string })[]>;
    url(key: string): string;
  };
  email: { send(input: { to: string | string[]; subject: string; html: string; from?: string }): Promise<unknown> };
  ai: {
    chat(input: { messages: AiMessage[]; system?: string; model?: string; tools?: any[]; maxTokens?: number }): Promise<{ text: string; content: any[]; credits: number }>;
  };
  jobs: {
    run(name: string, payload?: unknown): Promise<void>;
    runAt(name: string, payload: unknown, when: Date | number): Promise<string>;
  };
  realtime: { publish(channel: string, data: unknown): number };
  payments: {
    checkout(input: CheckoutInput): Promise<{ id: string; url: string }>;
    getCheckout(id: string): Promise<{ id: string; status: string; paymentStatus: string; amountTotal: number }>;
    refund(paymentIntentId: string): Promise<unknown>;
  };
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
