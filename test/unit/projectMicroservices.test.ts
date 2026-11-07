import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { chromium } from "playwright-core";
import { freshDatabase } from "../helpers/pg.mjs";

async function freePort() {
  const server = net.createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No TCP port assigned");
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return address.port;
}

it("runs one project's extracted API and filtered durable worker in separate processes", async () => {
  const database = await freshDatabase();
  const directory = mkdtempSync(path.join(os.tmpdir(), "forja-microservices-"));
  const children: { child: ChildProcess; output: string }[] = [];
  const token = "microservices-internal-test-token";
  const studioPort = await freePort();
  const runtimePort = await freePort();
  const runtimeUrl = `http://127.0.0.1:${runtimePort}`;
  const studioUrl = `http://127.0.0.1:${studioPort}`;
  const env = {
    ...process.env, DATABASE_URL: database.url, DATA_DIR: directory, SECRETS_KEY: "ab".repeat(32),
    PUBLIC_URL: `http://localhost:${studioPort}`, FORJA_SEED_FILE: "", FORJA_JOB_WORKER_MODE: "external",
    APP_DATA_SERVICE_TOKEN: token, BUILDER_SERVICE_URL: "", APP_RUNTIME_PUBLIC_PORT: String(runtimePort),
    FORJA_BOOTSTRAP_TOKEN: "microservices-bootstrap-test-token",
  };
  function start(entry: string, extra: Record<string, string>) {
    const item = { child: spawn(process.execPath, ["--import", "tsx", entry], {
      env: { ...env, ...extra }, stdio: ["ignore", "pipe", "pipe"],
    }), output: "" };
    item.child.stdout?.on("data", (chunk) => { item.output += String(chunk); });
    item.child.stderr?.on("data", (chunk) => { item.output += String(chunk); });
    children.push(item);
    return item;
  }
  async function ready(url: string, item: typeof children[number]) {
    await expect.poll(async () => {
      if (item.child.exitCode !== null) throw new Error(`Service exited: ${item.output}`);
      try { return (await fetch(`${url}/healthz`, { signal: AbortSignal.timeout(1000) })).status; }
      catch { return 0; }
    }, { timeout: 30_000, interval: 100 }).toBe(200);
  }
  let cookie = "";
  async function studio(method: string, route: string, body?: unknown) {
    const response = await fetch(`${studioUrl}${route}`, {
      method, headers: { "content-type": "application/json", cookie },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const cookies = response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
    if (cookies) cookie = cookies;
    const data = await response.json();
    expect(response.status, JSON.stringify(data)).toBe(200);
    return data;
  }
  try {
    const main = start(path.join("server", "bootstrap", "server.ts"), {
      PORT: String(studioPort), APP_DATA_SERVICE_URL: runtimeUrl, APP_RUNTIME_INTERNAL_URL: runtimeUrl,
    });
    await ready(studioUrl, main);
    const runtime = start(path.join("server", "bootstrap", "appRuntimeServer.ts"), {
      PORT: String(runtimePort), APP_DATA_SERVICE_URL: "", APP_RUNTIME_INTERNAL_URL: "",
    });
    await ready(runtimeUrl, runtime);
    await studio("POST", "/api/auth/setup", {
      token: env.FORJA_BOOTSTRAP_TOKEN, email: "owner@example.test", password: "microservices-password-123",
    });
    const created = await studio("POST", "/api/projects", { prompt: "Orders with independent invoice processing" });
    const projectId = created.project.id as string;
    const schema = "create table orders (id text primary key, status text not null default 'queued', worker_pid integer);";
    const migrationPath = "migrations/20261106000000000_orders.sql";
    await studio("PUT", `/api/projects/${projectId}/file`, { path: migrationPath, content: schema });
    const files = {
      "endpoints/orders/create_POST.ts": `export default async (ctx) => {
        await ctx.db.query("insert into orders (id) values ($1)", [ctx.body.id]);
        const queued = await ctx.jobs.enqueue("invoice", { id: ctx.body.id });
        return { queued, pid: process.pid };
      };`,
      "endpoints/orders/status_GET.ts": `export default async (ctx) => ctx.db.one("select * from orders where id = $1", [ctx.query.id]);`,
      "jobs/invoice.ts": `export default async (ctx) => {
        await ctx.db.query("update orders set status = 'invoiced', worker_pid = $2 where id = $1 and status = 'queued'", [ctx.payload.id, process.pid]);
      };`,
      "forja.services.json": JSON.stringify({
        version: 1, services: {
          orders: { kind: "service", endpoints: ["endpoints/orders/create_POST.ts", "endpoints/orders/status_GET.ts"], replicas: 2 },
          invoices: { kind: "worker", jobs: ["jobs/invoice.ts"], replicas: 2, maxConcurrency: 1 },
        },
      }),
    };
    for (const [file, content] of Object.entries(files)) {
      await studio("PUT", `/api/projects/${projectId}/file`, { path: file, content });
    }
    async function endpoint(method: "GET" | "POST", route: string, body?: unknown) {
      const response = await fetch(`${runtimeUrl}/internal/runtime/call-endpoint`, {
        method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ projectId, method, route, body: JSON.stringify(body), query: { id: "order-1" } }),
      });
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.status, result.body).toBe(200);
      return JSON.parse(result.body);
    }
    const order = await endpoint("POST", "orders/create", { id: "order-1" });
    expect(order.queued).toEqual(expect.any(String));
    expect((await endpoint("GET", "orders/status")).status).toBe("queued");
    const controlPath = `/api/projects/${projectId}/service-control`;
    const control = await studio("GET", controlPath);
    expect(control.runtime.available).toBe(true);
    expect(control.services).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "orders", desired: { replicas: 2, maxConcurrency: 8 } }),
      expect.objectContaining({ name: "invoices", queueCounts: expect.objectContaining({ queued: 1 }) }),
    ]));
    await studio("PATCH", `${controlPath}/orders`, { replicas: 1, maxConcurrency: 2 });
    expect((await studio("GET", controlPath)).services.find((service: { name: string }) => service.name === "orders").desired)
      .toEqual({ replicas: 1, maxConcurrency: 2 });
    await studio("POST", `${controlPath}/orders/restart`, { env: "preview" });
    expect((await studio("GET", controlPath)).runtime.services.some((service: { service: string }) => service.service === "orders")).toBe(false);
    expect((await endpoint("GET", "orders/status")).status).toBe("queued");
    const browser = await chromium.launch();
    try {
      const context = await browser.newContext();
      await context.addCookies(cookie.split("; ").map((part) => {
        const index = part.indexOf("=");
        return { name: part.slice(0, index), value: part.slice(index + 1), url: studioUrl };
      }));
      const page = await context.newPage();
      await page.goto(`${studioUrl}/p/${projectId}`);
      await page.getByRole("button", { name: "Servicios", exact: true }).click();
      await page.getByRole("button", { name: "Centro de control", exact: true }).click();
      await page.getByRole("region", { name: "Servicio orders", exact: true }).waitFor();
      expect(await page.getByRole("spinbutton", { name: "Réplicas orders" }).inputValue()).toBe("1");
      await page.getByRole("spinbutton", { name: "Réplicas orders" }).fill("2");
      await page.getByRole("region", { name: "Servicio orders", exact: true }).getByRole("button", { name: "Guardar escala" }).click();
      await expect.poll(async () => (await studio("GET", controlPath)).services.find((service: { name: string }) => service.name === "orders").desired.replicas).toBe(2);
    } finally {
      await browser.close();
    }
    const unrelatedPort = await freePort();
    const unrelated = start(path.join("server", "bootstrap", "jobWorkerServer.ts"), {
      PORT: String(unrelatedPort), APP_DATA_SERVICE_URL: runtimeUrl, APP_RUNTIME_INTERNAL_URL: "",
      FORJA_JOB_WORKER_SERVICES: "notifications", FORJA_JOB_WORKER_PROJECT_ID: projectId,
    });
    await ready(`http://127.0.0.1:${unrelatedPort}`, unrelated);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect((await endpoint("GET", "orders/status")).status).toBe("queued");
    const workerPort = await freePort();
    const worker = start(path.join("server", "bootstrap", "jobWorkerServer.ts"), {
      PORT: String(workerPort), APP_DATA_SERVICE_URL: runtimeUrl, APP_RUNTIME_INTERNAL_URL: "",
      FORJA_JOB_WORKER_SERVICES: "invoices", FORJA_JOB_WORKER_PROJECT_ID: projectId,
    });
    await ready(`http://127.0.0.1:${workerPort}`, worker);
    await expect.poll(async () => (await endpoint("GET", "orders/status")).status, {
      timeout: 15_000, interval: 100,
    }).toBe("invoiced");
    const invoice = await endpoint("GET", "orders/status");
    expect(invoice.worker_pid).not.toBe(order.pid);
  } finally {
    for (const { child } of children.reverse()) {
      if (child.exitCode !== null || child.signalCode !== null) continue;
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
    await database.drop();
    rmSync(directory, { recursive: true, force: true });
  }
}, 90_000);
