// Runs one project's endpoints and jobs inside a locked-down Node process (see sandbox.ts).
// It can read only node_modules (where compiled bundles live), cannot write files or spawn
// processes, and has no platform environment variables. Every service call — database,
// storage, email, AI, jobs, realtime, payments — is a message to the platform process,
// which scopes it to this project.
import { pathToFileURL } from "node:url";

let nextCall = 0;
const calls = new Map();
let currentEnv = "preview";

function rpc(run, method, ...args) {
  const call = ++nextCall;
  return new Promise((resolve, reject) => {
    calls.set(call, { resolve, reject });
    process.send({ t: "rpc", run, call, method, args });
  });
}

const fmt = (args) => args.map((a) => (typeof a === "string" ? a : a instanceof Error ? a.stack : safeJson(a))).join(" ");
function safeJson(v) {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

// console output from project code lands in the project's logs.
for (const level of ["log", "info", "warn", "error"]) {
  console[level] = (...args) => process.send({ t: "log", env: currentEnv, level: level === "error" ? "error" : "info", message: fmt(args).slice(0, 4000) });
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

function services(run, input) {
  const db = {
    query: (sql, params = []) => rpc(run, "db.query", sql, params),
    one: (sql, params = []) => rpc(run, "db.one", sql, params),
    exec: (sql) => rpc(run, "db.exec", sql),
    async transaction(fn) {
      const tx = await rpc(run, "db.begin");
      const handle = {
        query: (sql, params = []) => rpc(run, "db.txQuery", tx, sql, params),
        one: async (sql, params = []) => (await rpc(run, "db.txQuery", tx, sql, params))[0],
      };
      try {
        const result = await fn(handle);
        await rpc(run, "db.commit", tx);
        return result;
      } catch (e) {
        await rpc(run, "db.rollback", tx).catch(() => {});
        throw e;
      }
    },
  };
  return {
    db,
    storage: {
      put: (data, opts) => rpc(run, "storage.put", typeof data === "string" ? new TextEncoder().encode(data) : data, opts),
      get: (key) => rpc(run, "storage.get", key),
      delete: (key) => rpc(run, "storage.delete", key),
      list: () => rpc(run, "storage.list"),
      url: (key) => `${input.base}/_baas/storage/files/${encodeURIComponent(key)}`,
    },
    email: { send: (msg) => rpc(run, "email.send", msg) },
    ai: { chat: (req) => rpc(run, "ai.chat", req) },
    jobs: {
      run: (name, payload) => rpc(run, "jobs.run", name, payload ?? null),
      runAt: (name, payload, when) => rpc(run, "jobs.runAt", name, payload ?? null, when instanceof Date ? when.toISOString() : when),
    },
    realtime: { publish: (channel, data) => rpc(run, "realtime.publish", channel, data) },
    payments: {
      checkout: (req) => rpc(run, "payments.checkout", req),
      getCheckout: (id) => rpc(run, "payments.getCheckout", id),
      refund: (id) => rpc(run, "payments.refund", id),
    },
    env: input.env ?? {},
    log: (...args) => process.send({ t: "log", env: input.env_name, level: "info", message: fmt(args).slice(0, 4000) }),
    fail: (status, message) => {
      throw new HttpError(status, message);
    },
  };
}

const modules = new Map();
const load = (file) => {
  if (!modules.has(file)) modules.set(file, import(pathToFileURL(file).href));
  return modules.get(file);
};

function serializeError(e) {
  return {
    name: e?.name ?? "Error",
    message: String(e?.message ?? e),
    stack: e?.stack,
    status: e instanceof HttpError ? e.status : undefined,
    issues: Array.isArray(e?.issues) ? e.issues.map((i) => ({ path: i.path, message: i.message })) : undefined,
  };
}

async function runEndpoint(run, input) {
  const mod = await load(input.file);
  if (typeof mod.default !== "function") throw new Error("El endpoint no exporta una función por defecto");
  const req = new Request(input.url, { method: input.method, headers: input.headers, body: input.method === "GET" || input.method === "HEAD" ? undefined : input.rawBody });
  let body;
  if (input.method === "POST") {
    const type = req.headers.get("content-type") ?? "";
    if (type.includes("application/json")) body = await req.clone().json().catch(() => ({}));
    else if (type.includes("form")) body = await req.clone().formData();
    else body = await req.clone().text();
  }
  const setCookies = [];
  const user = input.user;
  const ctx = {
    ...services(run, input),
    req,
    method: input.method,
    query: input.query,
    body,
    user,
    requireUser(role) {
      if (!user) throw new HttpError(401, "Inicia sesión para continuar.");
      if (role && user.role !== role && user.role !== "admin") throw new HttpError(403, "No tienes permiso.");
      return user;
    },
    setCookie(name, value, opts) {
      setCookies.push({ name: String(name), value: String(value), maxAge: opts?.maxAge });
    },
  };
  const result = await mod.default(ctx);
  if (result instanceof Response) {
    return {
      kind: "response",
      status: result.status,
      headers: [...result.headers.entries()],
      body: new Uint8Array(await result.arrayBuffer()),
      setCookies,
    };
  }
  return { kind: "json", data: result === undefined ? null : JSON.parse(JSON.stringify(result)), setCookies };
}

async function runJob(run, input) {
  const mod = await load(input.file);
  if (typeof mod.default !== "function") throw new Error("La tarea no exporta una función por defecto");
  await mod.default({ ...services(run, input), payload: input.payload, job: input.job });
  return { kind: "done" };
}

// --- Spec tests: a small Jasmine-style runner for helpers/*.spec.ts -----------------------

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => deepEqual(a[k], b[k]));
}

const show = (v) => {
  try {
    return typeof v === "string" ? JSON.stringify(v) : (JSON.stringify(v) ?? String(v));
  } catch {
    return String(v);
  }
};

function expect(actual) {
  const make = (negate) => {
    const check = (pass, message) => {
      if (pass === negate) throw new Error(negate ? `No se esperaba: ${message}` : message);
    };
    return {
      toBe: (e) => check(Object.is(actual, e), `se esperaba ${show(e)} y llegó ${show(actual)}`),
      toEqual: (e) => check(deepEqual(actual, e), `se esperaba ${show(e)} y llegó ${show(actual)}`),
      toBeTruthy: () => check(!!actual, `se esperaba un valor verdadero y llegó ${show(actual)}`),
      toBeFalsy: () => check(!actual, `se esperaba un valor falso y llegó ${show(actual)}`),
      toBeNull: () => check(actual === null, `se esperaba null y llegó ${show(actual)}`),
      toBeUndefined: () => check(actual === undefined, `se esperaba undefined y llegó ${show(actual)}`),
      toBeDefined: () => check(actual !== undefined, "se esperaba un valor definido"),
      toContain: (e) => check(actual?.includes?.(e), `se esperaba que ${show(actual)} contuviera ${show(e)}`),
      toMatch: (re) => check(new RegExp(re).test(actual), `${show(actual)} no coincide con ${re}`),
      toBeGreaterThan: (n) => check(actual > n, `se esperaba > ${n} y llegó ${show(actual)}`),
      toBeLessThan: (n) => check(actual < n, `se esperaba < ${n} y llegó ${show(actual)}`),
      toBeCloseTo: (n, digits = 2) => check(Math.abs(actual - n) < 10 ** -digits / 2, `se esperaba ≈ ${n} y llegó ${show(actual)}`),
      toHaveLength: (n) => check(actual?.length === n, `se esperaba longitud ${n} y llegó ${actual?.length}`),
      toThrow: (match) => {
        let threw = false;
        let error;
        try {
          actual();
        } catch (e) {
          threw = true;
          error = e;
        }
        const ok = threw && (!match || String(error?.message).includes(match));
        check(ok, threw ? `el error «${error?.message}» no contiene «${match}»` : "se esperaba que lanzara un error");
      },
    };
  };
  return Object.assign(make(false), { not: make(true) });
}

async function runTests(input) {
  const suites = [];
  const stack = [];
  const tests = [];
  const g = globalThis;
  g.describe = (name, fn) => {
    const suite = { name, before: [] };
    stack.push(suite);
    try {
      fn();
    } finally {
      stack.pop();
    }
    suites.push(suite);
  };
  g.it = g.test = (name, fn) => tests.push({ name: [...stack.map((s) => s.name), name].join(" › "), fn, before: stack.flatMap((s) => s.before) });
  g.beforeEach = (fn) => stack.at(-1)?.before.push(fn);
  g.expect = expect;
  await import(pathToFileURL(input.file).href + `?t=${Date.now()}`);
  const results = [];
  for (const t of tests) {
    const started = Date.now();
    try {
      for (const b of t.before) await b();
      await Promise.race([t.fn(), new Promise((_, rej) => setTimeout(() => rej(new Error("Tiempo agotado (5 s)")), 5000))]);
      results.push({ name: t.name, ok: true, ms: Date.now() - started });
    } catch (e) {
      results.push({ name: t.name, ok: false, ms: Date.now() - started, error: String(e?.message ?? e) });
    }
  }
  return { kind: "tests", results };
}

process.on("message", async (msg) => {
  if (msg.t === "rpcResult") {
    const c = calls.get(msg.call);
    if (!c) return;
    calls.delete(msg.call);
    if (msg.ok) c.resolve(msg.value);
    else c.reject(Object.assign(new Error(msg.error.message), msg.error));
    return;
  }
  if (msg.t === "run") {
    currentEnv = msg.input.env_name;
    try {
      const value =
        msg.kind === "job" ? await runJob(msg.run, msg.input) : msg.kind === "test" ? await runTests(msg.input) : await runEndpoint(msg.run, msg.input);
      process.send({ t: "done", run: msg.run, ok: true, value });
    } catch (e) {
      process.send({ t: "done", run: msg.run, ok: false, error: serializeError(e) });
    }
  }
});

process.on("unhandledRejection", (e) => process.send({ t: "log", env: currentEnv, level: "error", message: `Promesa sin manejar: ${e?.stack ?? e}` }));
process.send({ t: "ready" });
