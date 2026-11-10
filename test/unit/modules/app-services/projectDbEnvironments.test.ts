import { afterEach, expect, it, vi } from "vitest";
import { rm } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const pathsMock = vi.hoisted(() => ({ root: `${process.cwd()}\\node_modules\\.cache\\.test-project-db-${process.pid}` }));

vi.mock("../../../../server/shared/config.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../../server/shared/config.js")>();
  return {
    ...actual,
    config: { ...actual.config, appDataServiceUrl: "", dbIdleMs: 60_000 },
    paths: {
      ...actual.paths,
      projectDb: (projectId: string, env: "preview" | "published" = "published") =>
        `${pathsMock.root}\\${projectId}\\${env === "preview" ? "preview-db" : "db"}`,
    },
  };
});

import {
  applyProjectMigrations,
  closeAll,
  projectDb,
} from "../../../../server/modules/app-services/infrastructure/projectDb.js";
import { createProjectRows } from "../../../../server/modules/app-services/application/projectData.js";
import { createProjectRowsRepository } from "../../../../server/modules/app-services/infrastructure/projectRows.js";
import { createAuthRepository, createQueryRepository, schemaRows } from "../../../../server/modules/app-services/infrastructure/repositories.js";
import { createAuth } from "../../../../server/modules/app-services/application/auth.js";
import { createEmail } from "../../../../server/modules/app-services/application/email.js";
import { hashPassword, verifyPassword, sha256, newId, newToken } from "../../../../server/shared/crypto.js";

afterEach(async () => {
  await closeAll();
  await rm(pathsMock.root, { recursive: true, force: true });
});

it("preserves the legacy production database and lazily creates an isolated preview copy", async () => {
  const id = "isolation";
  await applyProjectMigrations(id, {
    "migrations/001_notes.sql": "create table notes (id int primary key, value text not null);",
  }, "published");
  await projectDb(id, "published").query("insert into notes values (1, 'production')");

  const preview = projectDb(id, "preview");
  await expect(preview.one("select value from notes where id = 1")).resolves.toEqual({ value: "production" });
  await preview.query("update notes set value = 'preview' where id = 1");

  await expect(preview.one("select value from notes where id = 1")).resolves.toEqual({ value: "preview" });
  await expect(projectDb(id, "published").one("select value from notes where id = 1")).resolves.toEqual({ value: "production" });
  await preview.exec("truncate notes");
  await expect(projectDb(id, "published").one("select value from notes where id = 1")).resolves.toEqual({ value: "production" });
}, 120_000);

it("publishes only unapplied migrations without copying preview rows", async () => {
  const id = "publish-pending";
  const initial = {
    "migrations/20260101000000001_create_notes.sql":
      "create table notes (id int primary key, value text not null);",
  };
  await applyProjectMigrations(id, initial, "published");
  await projectDb(id, "published").query("insert into notes values (1, 'production')");

  const migrations = {
    ...initial,
    "migrations/20260101000000002_add_archived.sql":
      "alter table notes add column archived boolean not null default false;",
  };
  await projectDb(id, "preview").query("insert into notes values (2, 'preview')");
  await applyProjectMigrations(id, migrations, "preview");

  await expect(applyProjectMigrations(id, migrations, "published")).resolves.toEqual({
    applied: ["migrations/20260101000000002_add_archived.sql"],
  });

  await expect(projectDb(id, "published").query("select id, value, archived from notes order by id")).resolves.toEqual([
    { id: 1, value: "production", archived: false },
  ]);
  await expect(projectDb(id, "preview").query("select id, value from notes order by id")).resolves.toEqual([
    { id: 1, value: "production" },
    { id: 2, value: "preview" },
  ]);
});

it("applies migrations in numeric order once and rejects changed, deleted, or out-of-order applied files", async () => {
  const id = "ordering";
  const migrations = {
    "migrations/10_add_label.sql": "alter table notes add column label text;",
    "migrations/2_create_notes.sql": "create table notes (id int primary key);",
  };
  await expect(applyProjectMigrations(id, migrations, "published")).resolves.toEqual({
    applied: ["migrations/2_create_notes.sql", "migrations/10_add_label.sql"],
  });
  await expect(applyProjectMigrations(id, migrations, "published")).resolves.toEqual({ applied: [] });
  await expect(applyProjectMigrations(id, {
    ...migrations,
    "migrations/11_late.sql": "alter table notes add column late boolean;",
  }, "published")).resolves.toEqual({ applied: ["migrations/11_late.sql"] });
  await expect(applyProjectMigrations(id, {
    ...migrations,
    "migrations/11_late.sql": "alter table notes add column edited boolean;",
  }, "published")).rejects.toThrow(/modificada/);
  const { ["migrations/10_add_label.sql"]: _removed, ...deleted } = migrations;
  await expect(applyProjectMigrations(id, deleted, "published")).rejects.toThrow(/eliminada o renombrada/);
  await expect(applyProjectMigrations(id, {
    ...migrations,
    "migrations/11_late.sql": "alter table notes add column late boolean;",
    "migrations/1_before.sql": "select 1;",
  }, "published")).rejects.toThrow(/orden debe ser posterior/);
});

it("rolls a failed migration back without retaining its schema or ledger entry", async () => {
  const id = "rollback";
  await expect(applyProjectMigrations(id, {
    "migrations/001_failure.sql": "create table transient (id int); insert into transient values (1); select 1 / 0;",
  }, "published")).rejects.toThrow();
  await expect(projectDb(id, "published").one<{ exists: boolean }>(
    "select exists(select 1 from information_schema.tables where table_name = 'transient') as exists",
  )).resolves.toEqual({ exists: false });
  await expect(projectDb(id, "published").one<{ count: number }>(
    "select count(*)::int as count from _forja_migrations",
  )).resolves.toEqual({ count: 0 });
});

it("rejects schema changes through ordinary runtime database SQL", async () => {
  const db = projectDb("guarded", "preview");
  expect(() => db.exec("/* bypass */ create table app_table (id int)")).toThrow(/execute_sql/);
  expect(() => db.query("select 1; drop table _forja_users")).toThrow(/execute_sql/);
  expect(() => db.exec("select '\\'; create table untracked (id int); --'")).toThrow(/execute_sql/);
  await expect(db.one("select E'it\\'s valid' as value")).resolves.toEqual({ value: "it's valid" });
});

it("routes service schema, users and all row operations to the selected isolated database", async () => {
  const id = "service-panel";
  await applyProjectMigrations(id, {
    "migrations/001_items.sql": "create table items (id int primary key, name text);",
  }, "published");
  await projectDb(id, "published").query("insert into items values (1, 'production')");
  await projectDb(id, "published").query("insert into _forja_users (id, email) values ('prod', 'prod@example.test')");
  await projectDb(id, "preview").query("update items set name='preview'");
  await projectDb(id, "preview").query("delete from _forja_users");
  await projectDb(id, "preview").query("insert into _forja_users (id, email) values ('prev', 'prev@example.test')");
  await applyProjectMigrations(id, {
    "migrations/001_items.sql": "create table items (id int primary key, name text);",
    "migrations/002_draft.sql": "create table draft_only (id int);",
  }, "preview");
  const api = createProjectRows(schemaRows, createProjectRowsRepository(projectDb, vi.fn()));
  expect((await api.listProjectRows(id, { table: "items" }, "published")).rows).toEqual([{ id: 1, name: "production" }]);
  expect((await api.listProjectRows(id, { table: "items" }, "preview")).rows).toEqual([{ id: 1, name: "preview" }]);
  expect(await api.listAppUsers(id, "published")).toEqual([expect.objectContaining({ id: "prod" })]);
  expect(await api.listAppUsers(id, "preview")).toEqual([expect.objectContaining({ id: "prev" })]);
  await expect(api.listProjectRows(id, { table: "draft_only" }, "published")).rejects.toMatchObject({ status: 404 });
  await api.createProjectRow(id, "items", { id: 2, name: "live" }, "published");
  await api.deleteProjectRows(id, "items", [1], "published");
  expect((await api.listProjectRows(id, { table: "items" }, "published")).rows).toEqual([{ id: 2, name: "live" }]);
  expect((await api.listProjectRows(id, { table: "items" }, "preview")).rows).toEqual([{ id: 1, name: "preview" }]);
}, 120_000);

it("repairs owner accounts, records recovery emails and safely administers credentials in both isolated environments", async () => {
  const id = "auth-panel";
  const platform = await PGlite.create();
  try {
    await platform.exec(`
      create table accounts (id text primary key, email text);
      create table projects (id text primary key, owner_id text, name text, email_domain text, email_domain_verified boolean);
      insert into accounts values ('owner', 'owner@example.test');
      insert into projects values ('auth-panel', 'owner', 'App', 'mail.example.test', true);
      create table emails (
        id serial primary key, project_id text, env text, direction text default 'out',
        to_address text, intended_to text, from_address text, subject text, html text, status text,
        created_at timestamptz default now()
      );
    `);
    const repository = createQueryRepository({
      q: async (sql, params = []) => (await platform.query(sql, params)).rows as never,
      one: async (sql, params = []) => (await platform.query(sql, params)).rows[0] as never,
    });
    const log = vi.fn();
    const sendMail = vi.fn(async () => {});
    let smtp = false;
    let code = 12345670;
    const email = createEmail({ ...repository, log, getTransport: () => smtp ? { sendMail } : null, emailFrom: () => "platform@example.test" });
    const api = createAuth({
      projectDb: (projectId, env) => createAuthRepository(projectDb(projectId, env)),
      projectOwnerEmail: async (projectId) => (await repository.one<{ email: string }>("authProjectOwner", [projectId]))!.email,
      sendEmail: email.sendEmail, log, hashPassword, verifyPassword, sha256, newId, newToken, numericCode: () => String(++code),
    });
    const rows = createProjectRows(schemaRows, createProjectRowsRepository(projectDb, vi.fn()));
    // Reproduce an existing preview cloned before production had any default user.
    await projectDb(id, "preview").one("select 1");
    const users: Record<string, string> = {};
    for (const env of ["preview", "published"] as const) {
      smtp = false;
      await api.requestPasswordReset(id, "owner@example.test", "App", env);
      const owner = (await rows.listAppUsers(id, env))[0];
      expect(owner).toMatchObject({ email: "owner@example.test", role: "admin", hasPassword: false });
      const [simulated] = await email.listEmails(id, env);
      expect(simulated).toMatchObject({ env, status: "logged", to: "owner@example.test" });
      expect(simulated.html).toContain(`<b>${code}</b>`);
      await api.confirmPasswordReset(id, { email: "owner@example.test", code: String(code), password: `${env}-owner-password` }, env);
      expect(await Promise.all([api.ensureProjectOwner(id, env), api.ensureProjectOwner(id, env)])).toEqual([false, false]);
      await expect(api.signIn(id, { email: "owner@example.test", password: `${env}-owner-password` }, env)).resolves.toHaveProperty("token");

      const user = await api.createAppUser(id, { email: " Member@Example.test ", password: `${env}-initial-password`, name: "Member" }, env);
      users[env] = user.id;
      expect(user).toEqual({ id: user.id, email: "member@example.test", name: "Member", role: "user" });
      expect(await projectDb(id, env).one("select count(*)::int as n from _forja_sessions where user_id = $1", [user.id])).toEqual({ n: 0 });
      await expect(api.createAppUser(id, { email: user.email, password: "duplicate-password" }, env)).rejects.toMatchObject({ status: 409 });
      const session = await api.signIn(id, { email: user.email, password: `${env}-initial-password` }, env);
      smtp = true;
      await api.requestPasswordReset(id, user.email, "App", env);
      const pendingCode = String(code);
      expect(sendMail).toHaveBeenLastCalledWith(expect.objectContaining({ to: user.email, html: expect.stringContaining(pendingCode) }));
      expect((await email.listEmails(id, env))[0]).toMatchObject({ env, status: "sent", to: user.email });
      await projectDb(id, env).query("update _forja_users set failed_logins = 5, locked_until = now() + interval '15 minutes' where id = $1", [user.id]);
      await api.updateAppUserPassword(id, user.id, `${env}-managed-password`, env);
      expect(await api.userFromSession(id, session.token, env)).toBeNull();
      await expect(api.confirmPasswordReset(id, { email: user.email, code: pendingCode, password: "stale-reset-password" }, env)).rejects.toThrow("código");
      await expect(api.signIn(id, { email: user.email, password: `${env}-initial-password` }, env)).rejects.toMatchObject({ status: 401 });
      await expect(api.signIn(id, { email: user.email, password: `${env}-managed-password` }, env)).resolves.toHaveProperty("token");
      await expect(api.updateAppUserPassword(id, user.id, "short", env)).rejects.toThrow("8 caracteres");
      const before = await email.listEmails(id, env);
      await api.requestPasswordReset(id, "missing@example.test", "App", env);
      expect(await email.listEmails(id, env)).toEqual(before);
      expect(log).toHaveBeenCalledWith(id, expect.objectContaining({ env, source: "email", message: expect.stringContaining("no tiene una cuenta") }));
    }
    expect(users.preview).not.toBe(users.published);
    await expect(api.updateAppUserPassword(id, users.preview, "cross-env-password", "published")).rejects.toMatchObject({ status: 404 });
    for (const env of ["preview", "published"] as const) {
      await expect(api.signIn(id, { email: "member@example.test", password: `${env}-managed-password` }, env)).resolves.toHaveProperty("token");
      await expect(api.signIn(id, { email: "member@example.test", password: `${env === "preview" ? "published" : "preview"}-managed-password` }, env)).rejects.toMatchObject({ status: 401 });
    }
    const created = await Promise.all([
      api.ensureOwnerAdmin(id, "concurrent@example.test", "published"),
      api.ensureOwnerAdmin(id, "concurrent@example.test", "published"),
    ]);
    expect(created.sort()).toEqual([false, true]);
    expect((await rows.listAppUsers(id, "published")).filter((user) => user.email === "concurrent@example.test")).toHaveLength(1);
  } finally {
    await platform.close();
  }
}, 120_000);
