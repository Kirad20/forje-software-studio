import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import { freshDatabase } from "../helpers/pg.mjs";
import { createTestCoreModules } from "../helpers/coreModules.js";

// Real Postgres queries: the first ones are slow while other test files start their own databases.
vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 });

const dir = mkdtempSync(path.join(process.cwd(), "test", ".tmp-orgskills-"));
process.env.DATA_DIR = dir;
const pgdb = await freshDatabase();
process.env.DATABASE_URL = pgdb.url;
const { q, closePlatformDb } = await import("../../server/shared/database/index.js");
const modules = await createTestCoreModules();
const orgSkills = modules.collaboration;
const projects = modules.projects;
const { allSkills, skillIndex, SKILLS_DIR } = await import("../../server/modules/builder/infrastructure/skills.js");
const { bindBuilderCoreModules, builderTools } = await import("../../server/modules/builder/index.js");
const unbindBuilder = bindBuilderCoreModules({
  identity: modules.identity,
  collaboration: modules.collaboration,
  projects: modules.projects,
});

afterAll(async () => {
  unbindBuilder();
  rmSync(dir, { recursive: true, force: true });
  await closePlatformDb();
  await pgdb.drop();
});

const SKILL = { name: "facturas", description: "Cómo emitimos facturas", body: "Usa siempre el RFC del cliente." };
let orgId = "";
let accountId = "";

describe("organization skills", () => {
  it("sets up an account, its organization and a project", async () => {
    await q(`insert into accounts (id, email) values ('acc', 'o@x.test') on conflict do nothing`);
    const p = await projects.createProject("acc", "Skills", "", {});
    accountId = "acc";
    orgId = p.orgId!;
    expect(orgId).toBeTruthy();
    await q(`update projects set name = 'Skills' where id = $1`, [p.id]);
    (globalThis as { __pid?: string }).__pid = p.id;
  });

  it("lets owners and admins save, list, disable and delete, and refuses members", async () => {
    expect((await orgSkills.saveOrgSkill(orgId, "owner", accountId, SKILL)).map((s) => s.name)).toEqual(["facturas"]);
    await expect(orgSkills.saveOrgSkill(orgId, "member", accountId, { ...SKILL, name: "otra" })).rejects.toThrow(/dueños y administradores/);
    await expect(orgSkills.deleteOrgSkill(orgId, "member", "facturas")).rejects.toThrow(/dueños y administradores/);
    await orgSkills.saveOrgSkill(orgId, "admin", accountId, { ...SKILL, enabled: false });
    expect((await orgSkills.listOrgSkills(orgId))[0]).toMatchObject({ name: "facturas", enabled: false });
    expect(await orgSkills.enabledOrgSkills(orgId)).toEqual([]);
    await orgSkills.saveOrgSkill(orgId, "admin", accountId, { ...SKILL, enabled: true });
    expect((await orgSkills.enabledOrgSkills(orgId)).map((s) => s.name)).toEqual(["facturas"]);
    expect(await orgSkills.enabledOrgSkills(null)).toEqual([]);
  });

  it("validates the name, the description, the size and refuses secrets", async () => {
    const bad = (over: Record<string, unknown>) => orgSkills.saveOrgSkill(orgId, "owner", accountId, { ...SKILL, ...over });
    await expect(bad({ name: "Mal Nombre!" })).rejects.toThrow(/nombre/);
    await expect(bad({ description: "" })).rejects.toThrow(/descripción/);
    await expect(bad({ description: "dos\nlíneas" })).rejects.toThrow(/una sola línea/);
    await expect(bad({ body: "" })).rejects.toThrow(/contenido/);
    await expect(bad({ body: "x".repeat(8001) })).rejects.toThrow(/demasiado largo/);
    await expect(bad({ body: "la clave es AKIAABCDEFGHIJKLMNOP" })).rejects.toThrow(/clave de AWS/);
  });

  it("merges into the index with the project's skill first, then the organization's, then the built-in", async () => {
    await orgSkills.saveOrgSkill(orgId, "owner", accountId, { name: "forms", description: "Formularios de la empresa", body: "Siempre dos columnas." });
    const org = await orgSkills.enabledOrgSkills(orgId);
    const files = { [`${SKILLS_DIR}forms.md`]: "---\ndescription: Formularios del proyecto\n---\nUna columna." };
    const merged = allSkills(files, org);
    expect(merged.find((s) => s.name === "forms")!.body).toBe("Una columna.");
    expect(allSkills({}, org).find((s) => s.name === "forms")!.body).toBe("Siempre dos columnas.");
    expect(merged.map((s) => s.name)).toContain("facturas");
    expect(skillIndex({}, org)).toContain("- facturas: Cómo emitimos facturas");
  });

  it("is what load_skill returns for the project's organization", async () => {
    const pid = (globalThis as { __pid?: string }).__pid!;
    const tool = builderTools.find((t) => t.name === "load_skill")!;
    const ctx = { account: { id: "acc", email: "o@x.test" } as never, projectId: pid, author: "builder" as const };
    expect(await tool.run({ name: "facturas" }, ctx)).toContain("Usa siempre el RFC del cliente.");
    expect(await tool.run({ name: "jobs" }, ctx)).toContain("jobs/<name>.ts");
    const withParts = await tool.run({ name: "impeccable" }, ctx);
    expect(withParts).toContain("reference/");
    expect(await tool.run({ name: "impeccable", part: "reference/craft-floor" }, ctx)).toContain("> Forja note:");
    await expect(tool.run({ name: "impeccable", part: "nada" }, ctx)).rejects.toThrow(/Sus partes:[\s\S]*craft-floor/);
    await expect(tool.run({ name: "forms", part: "x" }, ctx)).rejects.toThrow(/No tiene partes/);
    await expect(tool.run({ name: "nada" }, ctx)).rejects.toThrow(/Las que hay:.*facturas/);
  });
});
