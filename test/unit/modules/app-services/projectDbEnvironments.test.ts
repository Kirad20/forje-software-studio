import { afterEach, expect, it, vi } from "vitest";
import { rm } from "node:fs/promises";

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
import { schemaRows } from "../../../../server/modules/app-services/infrastructure/repositories.js";

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
