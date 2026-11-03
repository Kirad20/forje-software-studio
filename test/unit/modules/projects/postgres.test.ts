import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { freshDatabase } from "../../../helpers/pg.mjs";
import { migrate } from "../../../../server/shared/database/migrate.js";
import type { PlatformDb, Tx } from "../../../../server/shared/database/index.js";
import { PostgresProjectsStore } from "../../../../server/modules/projects/infrastructure/PostgresProjectsStore.js";
import { PostgresPersonalOrganizationRepository } from "../../../../server/modules/collaboration/infrastructure/PostgresPersonalOrganizationRepository.js";
import { Organization } from "../../../../server/modules/collaboration/domain/Organization.js";
import { ProjectsApplication } from "../../../../server/modules/projects/application/ProjectsApplication.js";
import { WriteFileUseCase } from "../../../../server/modules/projects/application/WriteFileUseCase.js";
import { RenameFileUseCase } from "../../../../server/modules/projects/application/RenameFileUseCase.js";
import { DeleteFileUseCase } from "../../../../server/modules/projects/application/DeleteFileUseCase.js";

const fresh = await freshDatabase();
const pool = new pg.Pool({ connectionString: fresh.url });
const wrap = (client: pg.Pool | pg.PoolClient): Tx => ({
  query: async <T,>(sql: string, params: unknown[] = []) => ({ rows: (await client.query(sql, params)).rows as T[] }),
});
const database: PlatformDb = {
  ...wrap(pool),
  exec: async (sql) => { await pool.query(sql); },
  transaction: async (fn) => {
    const client = await pool.connect();
    try {
      await client.query("begin");
      const result = await fn(wrap(client));
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  },
};
let sequence = 0;
const services = {
  projectId: () => `project${++sequence}`,
  id: () => `version${++sequence}`,
  templates: () => ({ "pages/home.tsx": "starter" }),
  warmup: vi.fn().mockResolvedValue(undefined),
  clone: vi.fn().mockResolvedValue(undefined),
  emit: vi.fn(),
};
const projectOrganizations = {
  personalOrgId: Organization.personalId,
  ensurePersonalOrg: async (tx: Tx, accountId: string) =>
    new PostgresPersonalOrganizationRepository(tx).ensure(Organization.personalId(accountId), accountId),
};
const store = new PostgresProjectsStore(async () => database, projectOrganizations, services);
const app = new ProjectsApplication(store, services);
const write = new WriteFileUseCase(store);
const rename = new RenameFileUseCase(store);
const remove = new DeleteFileUseCase(store);

beforeAll(async () => {
  await migrate(pool);
  await pool.query(`insert into accounts (id, email, name) values ('owner', 'projects@example.test', 'Owner'), ('other', 'other@example.test', 'Other')`);
});
afterAll(async () => {
  await pool.end();
  await fresh.drop();
});

describe("Projects Postgres adapter regression", () => {
  it("persists the complete read model and patch allowlist, ownership IDs, folders, open time and share revocation", async () => {
    const project = await app.createProject("owner", "App", "Description");
    expect(project).toMatchObject({ ownerId: "owner", name: "App", description: "Description", orgId: projectOrganizations.personalOrgId("owner"), favorite: false, archived: false, shareEpoch: 0, seo: {}, profile: null });
    const folder = await app.createFolder("owner", "  Folder  ");
    const profile = { purpose: "Reservar citas", audience: "Pacientes", appType: "Agenda", coreFeatures: ["Ver horarios"] };
    await store.updateProject(project.id, { name: "Renamed", description: undefined, favorite: true, folderId: folder, aiEnabled: false, seo: { robots: false }, profile, slug: "forbidden" } as never);
    expect(await store.getProject(project.id)).toMatchObject({ name: "Renamed", description: "Description", favorite: true, aiEnabled: false, folderId: folder, seo: { robots: false }, profile, slug: null });
    expect(await store.listAccountOwnedProjectIds("owner")).toContain(project.id);
    expect(await store.listAccountOwnedProjectIds("other")).toEqual([]);
    expect((await store.listProjects("owner")).map((p) => p.id)).toContain(project.id);
    expect(await store.listFolders("owner")).toContainEqual({ id: folder, name: "Folder" });
    await store.deleteFolder("other", folder);
    expect(await store.listFolders("owner")).toContainEqual({ id: folder, name: "Folder" });
    await store.deleteFolder("owner", folder);
    expect((await store.getProject(project.id))!.folderId).toBeNull();
    await store.revokeShareLinks(project.id);
    await store.markOpened(project.id);
    expect((await store.getProject(project.id))!.shareEpoch).toBe(1);
  });

  it("rolls back project, seed files and personal organization together on creation failure", async () => {
    await expect(app.createProject("other", "Broken", "", { "pages/ok.tsx": "ok", "pages/bad.tsx": null } as never)).rejects.toThrow();
    expect((await pool.query(`select id from projects where owner_id = 'other'`)).rows).toEqual([]);
    expect((await pool.query(`select id from organizations where id = $1`, [projectOrganizations.personalOrgId("other")])).rows).toEqual([]);
  });

  it("keeps file before-images, overwrite rename, no-op writes/deletes, checkpoint versions and reversible restores", async () => {
    const { id } = await app.createProject("owner", "Files", "", { "pages/a.tsx": "A", "pages/b.tsx": "B" });
    const checkpoint = await app.createCheckpoint(id, "Original", "owner", "details", "actor");
    expect(await store.projectVersion(id)).toBe(0);
    await write.execute(id, "pages/a.tsx", "A2", "builder", "builder@example.test");
    const editVersion = await store.projectVersion(id);
    await write.execute(id, "pages/a.tsx", "A2");
    expect(await store.projectVersion(id)).toBe(editVersion);
    await rename.execute(id, "pages/a.tsx", "pages/b.tsx");
    expect(await store.readAllFiles(id)).toEqual({ "pages/b.tsx": "A2" });
    await remove.execute(id, "pages/missing.tsx");
    expect((await store.listChanges(id, 300)).filter((c) => c.kind === "delete")).toEqual([]);
    await app.restoreToChange(id, checkpoint, "mcp", "restorer@example.test");
    expect(await store.readAllFiles(id)).toEqual({ "pages/a.tsx": "A", "pages/b.tsx": "B" });
    const restore = (await store.listChanges(id, 300))[0]!;
    expect(restore).toMatchObject({ kind: "restore", label: "Restaurado a Original", actor: "restorer@example.test" });
    await app.restoreToChange(id, restore.id - 1);
    expect(await store.readAllFiles(id)).toEqual({ "pages/b.tsx": "A2" });
    expect(await store.listFiles(id)).toMatchObject([{ path: "pages/b.tsx", size: 2 }]);
    await remove.execute(id, "pages/b.tsx");
    expect(await store.readFile(id, "pages/b.tsx")).toBeUndefined();
  });

  it("rolls back all restored paths if a later replacement fails", async () => {
    const { id } = await app.createProject("owner", "Atomic restore");
    await expect(store.restoreFiles(id, new Map([["pages/home.tsx", "changed"], [null as never, "bad"]]))).rejects.toThrow();
    expect(await store.readFile(id, "pages/home.tsx")).toBe("starter");
  });

  it("publishes snapshots without notes, excludes publishes from code version, finds slugs and unpublishes", async () => {
    const { id } = await app.createProject("owner", "Live");
    await write.execute(id, "static/__dev/note.txt", "not shipped");
    const version = await store.projectVersion(id);
    await app.recordPublish(id, "live-slug", await store.readAllFiles(id));
    expect(await store.publishedFiles(id)).toEqual({ "pages/home.tsx": "starter" });
    expect(await store.projectVersion(id)).toBe(version);
    expect((await store.getProjectBySlug("live-slug"))!.id).toBe(id);
    expect(await store.isSlugTaken("live-slug", id)).toBe(false);
    expect(await store.isSlugTaken("live-slug", "different")).toBe(true);
    expect(await app.hasUnpublishedChanges(id)).toBe(false);
    await write.execute(id, "pages/home.tsx", "changed");
    expect(await app.hasUnpublishedChanges(id)).toBe(true);
    await store.unpublish(id);
    expect(await store.publishedFiles(id)).toBeUndefined();
    expect(await app.hasUnpublishedChanges(id)).toBe(false);
    await store.deleteProject(id);
    expect(await store.getProject(id)).toBeUndefined();
    expect(await store.listFiles(id)).toEqual([]);
  });

  it("uses turn timestamps and next before-images rather than later working code", async () => {
    const { id } = await app.createProject("owner", "Turns", "", { "pages/home.tsx": "current" });
    const anchor = (await store.listChanges(id, 1))[0]!.id;
    await pool.query(`insert into chat_messages (project_id, role, content, turn_id, created_at) values
      ($1, 'user', '[]', 'turn', '2026-01-01T00:00:00Z'),
      ($1, 'assistant', '[]', 'turn', '2026-01-01T00:00:01Z'),
      ($1, 'user', '[]', 'next', '2026-01-01T00:00:10Z')`, [id]);
    const first = await store.logChange(id, { kind: "edit", paths: ["pages/home.tsx"], author: "builder", before: { "pages/home.tsx": "before" } });
    await pool.query(`update project_changes set created_at = '2026-01-01T00:00:02Z' where id = $1`, [first]);
    const later = await store.logChange(id, { kind: "edit", paths: ["pages/home.tsx"], author: "owner", before: { "pages/home.tsx": "turn result" } });
    await pool.query(`update project_changes set created_at = '2026-01-01T00:00:11Z' where id = $1`, [later]);
    expect(await app.turnChanges(id, "turn")).toEqual({
      files: [{ path: "pages/home.tsx", kind: "edit", before: "before", after: "turn result" }],
      restoreTo: anchor, firstChange: first,
    });
    expect(await app.turnChanges(id, "missing")).toBeNull();
    expect(await app.turnChanges(id, "next")).toEqual({ files: [], restoreTo: null, firstChange: null });
  });
});
