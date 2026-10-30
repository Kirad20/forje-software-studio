import { appAiChat, type AppAiInput } from "./ai.js";
import type { AppUser } from "./auth.js";
import { sendEmail, type EmailInput } from "./email.js";
import { paymentsFor } from "./payments.js";
import { projectDb, type ProjectDb } from "./projectDb.js";
import { publish } from "./realtime.js";
import { secretEnv } from "./secrets.js";
import { deleteObject, getObject, listObjects, putObject } from "./storage.js";
import { log } from "../platform/events.js";

export type AppEnv = "preview" | "published";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** What every endpoint and job receives. Documented for the builder in builder/prompt.ts. */
export interface ServiceContext {
  db: ProjectDb;
  storage: {
    put(data: Uint8Array | string, opts: { filename: string; contentType?: string; key?: string }): ReturnType<typeof putObject>;
    get(key: string): ReturnType<typeof getObject>;
    delete(key: string): Promise<void>;
    list(): ReturnType<typeof listObjects>;
    url(key: string): string;
  };
  email: { send(input: EmailInput): ReturnType<typeof sendEmail> };
  ai: { chat(input: AppAiInput): ReturnType<typeof appAiChat> };
  jobs: {
    run(name: string, payload?: unknown): Promise<void>;
    runAt(name: string, payload: unknown, when: Date | number): Promise<string>;
  };
  realtime: { publish(channel: string, data: unknown): number };
  payments: ReturnType<typeof paymentsFor>;
  env: Record<string, string>;
  log(...args: unknown[]): void;
  fail(status: number, message: string): never;
}

export interface EndpointContext extends ServiceContext {
  req: Request;
  method: string;
  query: Record<string, string>;
  body: any;
  user: AppUser | null;
  requireUser(role?: string): AppUser;
  setCookie(name: string, value: string, opts?: { maxAge?: number }): void;
}

export interface JobContext extends ServiceContext {
  payload: any;
  job: string;
}

// The jobs module imports this file; break the cycle with late binding.
let jobsApi: {
  runNow(projectId: string, env: AppEnv, name: string, payload: unknown, trigger: string): Promise<void>;
  addTimer(projectId: string, env: AppEnv, name: string, payload: unknown, runAt: Date): Promise<string>;
};
export const bindJobs = (api: typeof jobsApi) => (jobsApi = api);

export async function serviceContext(projectId: string, env: AppEnv, base: string, source: "endpoint" | "job"): Promise<ServiceContext> {
  const secrets = await secretEnv(projectId);
  const write = (level: "info" | "error", args: unknown[]) =>
    log(projectId, {
      env,
      level,
      source,
      message: args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "),
    });
  return {
    db: projectDb(projectId),
    storage: {
      put: (data, opts) => putObject(projectId, typeof data === "string" ? new TextEncoder().encode(data) : data, opts),
      get: (key) => getObject(projectId, key),
      delete: (key) => deleteObject(projectId, key),
      list: () => listObjects(projectId),
      url: (key) => `${base}/_baas/storage/files/${encodeURIComponent(key)}`,
    },
    email: { send: (input) => sendEmail(projectId, input) },
    ai: { chat: (input) => appAiChat(projectId, input) },
    jobs: {
      run: (name, payload) => {
        // Fire and forget: the request does not wait for the task.
        void jobsApi.runNow(projectId, env, name, payload ?? null, "background").catch(() => {});
        return Promise.resolve();
      },
      runAt: (name, payload, when) =>
        jobsApi.addTimer(projectId, env, name, payload, typeof when === "number" ? new Date(Date.now() + when) : when),
    },
    realtime: { publish: (channel, data) => publish(projectId, channel, data) },
    payments: paymentsFor(secrets),
    env: secrets,
    log: (...args) => write("info", args),
    fail: (status, message) => {
      throw new HttpError(status, message);
    },
  };
}
