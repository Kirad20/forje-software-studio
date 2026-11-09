import type { AppAiInput } from "./ai.js";
import type { AppUser } from "./auth.js";
import type { EmailInput } from "./email.js";
import type { ProjectDb } from "../ports/database.js";
import type { ContextPorts, JobsApi } from "../ports/context.js";
import { createProjectCache } from "./cache.js";

import type { AppEnv } from "../domain/contracts.js";
export type { AppEnv } from "../domain/contracts.js";

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
  cache: {
    get<T>(key: string): Promise<T | undefined>;
    set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
    delete(key: string): Promise<void>;
  };
  storage: {
    put(data: Uint8Array | string, opts: { filename: string; contentType?: string; key?: string }): ReturnType<ContextPorts["putObject"]>;
    get(key: string): ReturnType<ContextPorts["getObject"]>;
    delete(key: string): Promise<void>;
    list(): ReturnType<ContextPorts["listObjects"]>;
    url(key: string): string;
  };
  email: { send(input: EmailInput): ReturnType<ContextPorts["sendEmail"]> };
  ai: { chat(input: AppAiInput): ReturnType<ContextPorts["appAiChat"]> };
  jobs: {
    enqueue(name: string, payload?: unknown): Promise<string>;
    run(name: string, payload?: unknown): Promise<void>;
    runAt(name: string, payload: unknown, when: Date | number): Promise<string>;
  };
  realtime: { publish(channel: string, data: unknown): number };
  payments: ReturnType<ContextPorts["paymentsFor"]>;
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

export function createContext(ports: ContextPorts) {
const { secretEnv, log, projectDb, cacheRepository, putObject, getObject, deleteObject, listObjects, sendEmail, appAiChat, publish, paymentsFor } = ports;
let jobsApi: JobsApi | undefined;
const bindJobs = (api: JobsApi) => { jobsApi = api; };
const needJobs = () => {
  if (!jobsApi) throw new Error("Servicio de tareas no configurado");
  return jobsApi;
};

async function serviceContext(projectId: string, env: AppEnv, base: string, source: "endpoint" | "job"): Promise<ServiceContext> {
  const secrets = await secretEnv(projectId);
  const write = (level: "info" | "error", args: unknown[]) =>
    log(projectId, {
      env,
      level,
      source,
      message: args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "),
    });
  const db = projectDb(projectId, env);
  return {
    db,
    cache: createProjectCache(cacheRepository(db), env),
    storage: {
      put: (data, opts) => putObject(projectId, typeof data === "string" ? new TextEncoder().encode(data) : data, opts),
      get: (key) => getObject(projectId, key),
      delete: (key) => deleteObject(projectId, key),
      list: () => listObjects(projectId),
      url: (key) => `${base}/_baas/storage/files/${encodeURIComponent(key)}`,
    },
    email: { send: (input) => sendEmail(projectId, input, env) },
    ai: { chat: (input) => appAiChat(projectId, input) },
    jobs: {
      enqueue: (name, payload) => {
        const enqueue = needJobs().enqueue;
        if (!enqueue) throw new Error("Cola de tareas no configurada");
        return enqueue(projectId, env, name, payload ?? null, "background");
      },
      run: (name, payload) => {
        // Fire and forget: the request does not wait for the task.
        void needJobs().runNow(projectId, env, name, payload ?? null, "background").catch((error) => write("error", [`Tarea ${name} falló:`, String(error)]));
        return Promise.resolve();
      },
      runAt: (name, payload, when) =>
        needJobs().addTimer(projectId, env, name, payload, typeof when === "number" ? new Date(Date.now() + when) : when),
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
return { bindJobs, serviceContext };
}
