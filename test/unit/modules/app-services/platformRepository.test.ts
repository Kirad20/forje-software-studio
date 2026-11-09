import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { createQueryRepository } from "../../../../server/modules/app-services/infrastructure/repositories.js";
import { createEmail } from "../../../../server/modules/app-services/application/email.js";
import { createStorage } from "../../../../server/modules/app-services/application/storage.js";
import { createSecrets } from "../../../../server/modules/app-services/application/secrets.js";
import { createAnalytics } from "../../../../server/modules/app-services/application/analytics.js";
import { createJobs } from "../../../../server/modules/app-services/application/jobs.js";

it("runs production email, secrets, storage, analytics and jobs SQL through injected repositories", async () => {
  const pg = await PGlite.create();
  try {
    await pg.exec(`
      create table accounts (id text primary key, email text);
      create table projects (id text primary key, owner_id text, name text, email_domain text, email_domain_verified boolean, slug text, published_version_id text);
      insert into accounts values ('a', 'owner@example.com');
      insert into projects values ('p', 'a', 'App', null, false, 'app', null);
      create table emails (id serial primary key, project_id text, direction text default 'out', to_address text, intended_to text, from_address text, subject text, html text, status text, created_at timestamptz default now());
      create table project_secrets (project_id text, name text, description text, value_enc text, primary key(project_id, name));
      create table storage_objects (project_id text, key text, filename text, content_type text, size int, created_at timestamptz default now(), primary key(project_id, key));
      create table page_views (project_id text, visitor text, path text, referrer text, browser text, device text, created_at timestamptz default now());
      create table job_runs (id serial primary key, project_id text, job text, trigger text, status text, error text, started_at timestamptz default now(), finished_at timestamptz);
      create table job_timers (id text primary key, project_id text, env text, job text, payload jsonb, run_at timestamptz, status text default 'pending');
      create table job_settings (project_id text, job text, enabled boolean, primary key(project_id, job));
    `);
    await pg.exec(readFileSync(new URL("../../../../server/shared/database/migrations/007_job_queue.sql", import.meta.url), "utf8"));
    await pg.exec(readFileSync(new URL("../../../../server/shared/database/migrations/015_service_environments.sql", import.meta.url), "utf8"));
    const repository = createQueryRepository({
      q: async (sql, params = []) => (await pg.query(sql, params)).rows as never,
      one: async (sql, params = []) => (await pg.query(sql, params)).rows[0] as never,
    });
    const log = vi.fn();
    const email = createEmail({ ...repository, log, getTransport: () => null, emailFrom: () => "platform@example.com" });
    await email.sendEmail("p", { to: "user@example.com", subject: "Subject", html: "Message" });
    expect(await email.listEmails("p")).toEqual([expect.objectContaining({ to: "owner@example.com", intendedTo: "user@example.com", status: "logged" })]);
    await email.receiveEmail("p", { from: "user@example.com", to: "owner@example.com", subject: "Reply", html: "Reply" });
    expect(await email.listEmails("p")).toHaveLength(2);
    await email.sendEmail("p", { to: "owner@example.com", subject: "Preview", html: "Preview only" }, "preview");
    await pg.query("insert into emails (project_id, subject) values ('p', 'Legacy')");
    expect((await email.listEmails("p", "published")).map((row) => row.subject)).toEqual(["Legacy", "Reply", "[para: user@example.com] Subject"]);
    expect((await email.listEmails("p", "preview")).map((row) => row.subject)).toEqual(["Legacy", "Preview"]);
    expect(log).toHaveBeenCalledWith("p", expect.objectContaining({ env: "published", source: "email" }));
    expect(log).toHaveBeenCalledWith("p", expect.objectContaining({ env: "preview", source: "email" }));

    const secrets = createSecrets({ ...repository, encrypt: (value) => `enc:${value}`, decrypt: (value) => value.slice(4),
      integrationEnv: async () => ({ KEY: "integration" }), onDecryptError: vi.fn() });
    await secrets.requestSecret("p", "KEY", "Description");
    await secrets.setSecret("p", "KEY", "project");
    expect(await secrets.secretEnv("p")).toEqual({ KEY: "project" });
    expect(await secrets.listSecrets("p")).toEqual([{ name: "KEY", description: "Description", isSet: true }]);
    await secrets.deleteSecret("p", "KEY");
    expect(await secrets.secretEnv("p")).toEqual({ KEY: "integration" });

    const data = new Map<string, Buffer>();
    const storage = createStorage({ ...repository, newId: () => "file", files: {
      extension: () => ".txt",
      write: async (_project, key, bytes) => { data.set(key, Buffer.from(bytes)); },
      read: async (_project, key) => data.get(key) ?? null,
      delete: async (_project, key) => { data.delete(key); },
    } });
    await storage.putObject("p", new Uint8Array([1, 2]), { filename: "test.txt" });
    expect(await storage.storageUsage("p")).toBe(2);
    expect(await storage.getObject("p", "file.txt")).toMatchObject({ filename: "test.txt", contentType: "application/octet-stream" });
    expect(await storage.listObjects("p")).toHaveLength(1);
    await storage.deleteObject("p", "file.txt");
    expect(await storage.storageUsage("p")).toBe(0);

    const analytics = createAnalytics({ ...repository, now: () => new Date(), salt: () => "salt", hash: () => "visitor" });
    await analytics.recordPageView("p", { ip: "ip", userAgent: "Chrome/100", path: "/page", referrer: "https://ref.example/path" });
    const summary = await analytics.analyticsSummary("p", 2);
    expect(summary).toMatchObject({ visitors: 1, views: 1, currentVisitors: 1, topPages: [{ label: "/page", count: 1 }] });
    expect(summary.trend).toHaveLength(2);

    const jobs = createJobs({ ...repository, newId: () => "timer", log, bindJobs: vi.fn(), cron: vi.fn(),
      runtime: () => ({
        readAllFiles: async () => ({}), publishedFiles: async () => null,
        jobFiles: () => [{ name: "task", file: "jobs/task.ts" }], readJobSettings: () => ({}),
        compileServerModule: async () => ({ file: "compiled" }), runInSandbox: async () => {},
        appUrl: () => "https://app", previewOrigin: () => "https://preview",
      }) });
    const timer = await jobs.addTimer("p", "preview", "task", { x: 1 }, new Date(Date.now() + 120_000));
    expect((await jobs.listJobs("p")).timers).toHaveLength(1);
    await jobs.cancelTimer("p", timer);
    expect((await jobs.listJobs("p")).timers).toHaveLength(0);
    await jobs.runJob("p", "preview", "task", null, "background");
    expect((await jobs.listJobs("p")).runs).toEqual([expect.objectContaining({ status: "ok", job: "task" })]);
    await jobs.runJob("p", "published", "task", null, "manual");
    expect((await jobs.listJobs("p", "published")).runs).toEqual([expect.objectContaining({ status: "ok", env: "published" })]);
    expect((await jobs.listJobs("p", "preview")).runs).toEqual([expect.objectContaining({ status: "ok", env: "preview" })]);
    await jobs.stopJobRunner();
  } finally {
    await pg.close();
  }
}, 30_000);
