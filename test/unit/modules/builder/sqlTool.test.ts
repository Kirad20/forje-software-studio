import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const events: string[] = [];
  const files: Record<string, string> = {};
  const projects = {
    readAllFiles: vi.fn(async () => files),
    writeFile: vi.fn(async (_id: string, path: string, content: string) => {
      files[path] = content;
      events.push("write");
    }),
    deleteFile: vi.fn(),
  };
  const builderCoreModules = vi.fn(() => ({ projects }));
  const execSql = vi.fn();
  const applyProjectMigrations = vi.fn();
  return { events, files, projects, builderCoreModules, execSql, applyProjectMigrations };
});

vi.mock("../../../../server/modules/builder/infrastructure/CoreModulesAdapter.js", () => ({
  builderCoreModules: mocks.builderCoreModules,
}));
vi.mock("../../../../server/modules/app-services/projectDb.js", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../../../server/modules/app-services/projectDb.js")>(),
  execSql: mocks.execSql,
  applyProjectMigrations: mocks.applyProjectMigrations,
}));

import { builderTools } from "../../../../server/modules/builder/infrastructure/BuilderToolsAdapter.js";

const sqlTool = builderTools.find(({ name }) => name === "execute_sql")!;
const writeTool = builderTools.find(({ name }) => name === "write_file")!;
const ctx = { projectId: "p", account: {} as never, author: "builder" as const };

describe("execute_sql migration tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.events.length = 0;
    for (const path of Object.keys(mocks.files)) delete mocks.files[path];
    mocks.projects.deleteFile.mockImplementation(async (_id: string, path: string) => {
      delete mocks.files[path];
      mocks.events.push("delete");
    });
    mocks.execSql.mockImplementation(async () => { mocks.events.push("execute"); return []; });
    mocks.applyProjectMigrations.mockImplementation(async () => { mocks.events.push("execute"); return { applied: [] }; });
  });

  it("writes a DDL migration artifact before applying schema SQL to preview", async () => {
    const output = await sqlTool.run({ sql: "CREATE TABLE notes (id bigint primary key);" }, ctx);

    expect(mocks.events).toEqual(["write", "execute"]);
    expect(output).toMatch(/Migración migrations\/\d{17}_builder\.sql aplicada en vista previa/);
    expect(mocks.projects.writeFile).toHaveBeenCalledWith(
      "p",
      expect.stringMatching(/^migrations\/\d{17}_builder\.sql$/),
      "CREATE TABLE notes (id bigint primary key);",
      "builder",
      undefined,
    );
    expect(mocks.applyProjectMigrations).toHaveBeenCalledWith("p", {
      [mocks.projects.writeFile.mock.calls[0]![1]]: "CREATE TABLE notes (id bigint primary key);",
    }, "preview");
    expect(ctx).toMatchObject({ wrote: true });
  });

  it("keeps preview-only data edits out of migration files", async () => {
    await sqlTool.run({ sql: "UPDATE notes SET title = 'preview';" }, ctx);

    expect(mocks.projects.writeFile).not.toHaveBeenCalled();
    expect(mocks.execSql).toHaveBeenCalledWith("p", "UPDATE notes SET title = 'preview';", "preview");
  });

  it("requires explicit migration intent for data mixed with schema changes", async () => {
    const sql = "CREATE TABLE notes (id bigint primary key); INSERT INTO notes VALUES (1);";
    await expect(sqlTool.run({ sql }, ctx)).rejects.toThrow(/migration=true/);
    expect(mocks.projects.writeFile).not.toHaveBeenCalled();
    expect(mocks.execSql).not.toHaveBeenCalled();
    expect(mocks.applyProjectMigrations).not.toHaveBeenCalled();
  });

  it("tracks an explicitly requested data backfill as a migration", async () => {
    const sql = "UPDATE notes SET category = 'general' WHERE category IS NULL;";
    const output = await sqlTool.run({ sql, migration: true }, ctx);

    expect(mocks.events).toEqual(["write", "execute"]);
    expect(mocks.applyProjectMigrations).toHaveBeenCalledWith("p", {
      [mocks.projects.writeFile.mock.calls[0]![1]]: sql,
    }, "preview");
    expect(output).toContain("Migración migrations/");
  });

  it("does not allow direct edits to migration files", async () => {
    await expect(writeTool.run({ path: "migrations/20261106120000000_notes.sql", content: "SELECT 1;" }, ctx))
      .rejects.toThrow(/únicamente con execute_sql/);
    expect(mocks.projects.writeFile).not.toHaveBeenCalled();
  });

  it("removes a newly recorded migration when preview application fails", async () => {
    mocks.applyProjectMigrations.mockRejectedValueOnce(new Error("preview failed"));

    await expect(sqlTool.run({ sql: "CREATE TABLE notes (id bigint primary key);" }, ctx)).rejects.toThrow("preview failed");

    const path = mocks.projects.writeFile.mock.calls[0]![1];
    expect(mocks.projects.deleteFile).toHaveBeenCalledWith("p", path, "builder");
  });
});
