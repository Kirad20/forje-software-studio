import pg from "pg";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { freshDatabase } from "../../../helpers/pg.mjs";
import { PostgresAccountLifecycleRepository } from "../../../../server/modules/identity/infrastructure/PostgresAccountLifecycleRepository.js";
import { PostgresSessionRepository } from "../../../../server/modules/identity/infrastructure/PostgresSessionRepository.js";
import { PostgresPasswordResetRepository } from "../../../../server/modules/identity/infrastructure/PostgresPasswordResetRepository.js";
import { PostgresApiTokenRepository } from "../../../../server/modules/identity/infrastructure/PostgresApiTokenRepository.js";
import { sha256 } from "../../../../server/shared/crypto.js";

const state = vi.hoisted(() => ({
  db: null as unknown as pg.Client,
  isolated: null as unknown as Awaited<ReturnType<typeof freshDatabase>>,
}));
vi.mock("../../../../server/shared/database/index.js", () => ({
  platformDb: async () => ({
    query: (sql: string, params: unknown[] = []) => state.db.query(sql, params),
    async transaction<T>(fn: (tx: { query: (sql: string, params?: unknown[]) => Promise<unknown> }) => Promise<T>) {
      await state.db.query("begin");
      try {
        const result = await fn({ query: (sql, params = []) => state.db.query(sql, params) });
        await state.db.query("commit");
        return result;
      } catch (error) {
        await state.db.query("rollback");
        throw error;
      }
    },
  }),
  q: async (sql: string, params: unknown[] = []) => (await state.db.query(sql, params)).rows,
  one: async (sql: string, params: unknown[] = []) => (await state.db.query(sql, params)).rows[0],
}));

describe("identity SQL adapter compatibility", () => {
  const accounts = new PostgresAccountLifecycleRepository(async (tx, id, name) => {
    await tx.query("insert into organizations(id, name) values ($1, $2)", [`personal_${id}`, name]);
  });
  const sessions = new PostgresSessionRepository();
  const resets = new PostgresPasswordResetRepository();
  const tokens = new PostgresApiTokenRepository(async (ids) => {
    const rows = await state.db.query<{ id: string; name: string }>("select id, name from organizations where id = any($1::text[])", [ids]);
    return Object.fromEntries(rows.rows.map((row) => [row.id, row.name]));
  });
  beforeAll(async () => {
    state.isolated = await freshDatabase();
    state.db = new pg.Client({ connectionString: state.isolated.url });
    await state.db.connect();
    await state.db.query(`
      create table accounts(id text primary key, email text unique, name text, credits int, password_hash text,
        password_changed_at timestamptz, platform_role text, disabled boolean default false, created_at timestamptz default now());
      create table organizations(id text primary key, name text);
      create table account_sessions(token_hash text primary key, account_id text references accounts on delete cascade, expires_at timestamptz);
      create table password_resets(account_id text primary key references accounts on delete cascade, code_hash text, attempts int, expires_at timestamptz);
      create table api_tokens(id text primary key, account_id text references accounts on delete cascade, name text, token_hash text,
        org_id text, last_used_at timestamptz, created_at timestamptz default now());
    `);
    await state.db.query(`insert into accounts (id, email, platform_role) values ('legacy', 'legacy@example.test', 'user');
      insert into api_tokens (id, account_id, name, token_hash) values ('legacy-token', 'legacy', 'Legacy project', 'legacy-hash');`);
    await state.db.query(readFileSync(new URL("../../../../server/shared/database/migrations/008_admin_api_tokens.sql", import.meta.url), "utf8"));
    const legacy = await state.db.query("select purpose, expires_at, revoked_at from api_tokens where id = 'legacy-token'");
    expect(legacy.rows[0]).toEqual({ purpose: "project", expires_at: null, revoked_at: null });
    await state.db.query("delete from accounts where id = 'legacy'");
  }, 30_000);
  afterAll(async () => {
    if (state.db) await state.db.end();
    if (state.isolated) await state.isolated.drop();
  });

  const input = (id: string, role: "admin" | "user", passwordHash: string | null = null) => ({
    id, email: `${id}@example.test`, name: null, credits: 75, passwordHash, role, personalOrgName: id,
  });

  it("gates the first account and atomically creates its personal organization", async () => {
    await expect(accounts.create(input("user-before-setup", "user"))).rejects.toThrow("No se puede");
    expect(await accounts.hasAnyAccounts()).toBe(false);
    await accounts.create(input("admin", "admin", "hashed"));
    expect(await accounts.getAccount("admin")).toEqual({ id: "admin", email: "admin@example.test", name: null, credits: 75, platformRole: "admin" });
    const row = await state.db.query<{ password_changed_at: Date; name: string }>(
      "select a.password_changed_at, o.name from accounts a join organizations o on o.id = 'personal_' || a.id where a.id = 'admin'",
    );
    expect(row.rows[0]!.password_changed_at).toBeInstanceOf(Date);
    expect(row.rows[0]!.name).toBe("admin");
    await expect(accounts.create(input("second-admin", "admin"))).rejects.toThrow("No se puede");
    await accounts.create(input("user", "user"));
    expect(await accounts.passwordHash("user")).toBeNull();
    expect(await accounts.getSecurity("admin")).toMatchObject({ hasPassword: true, changedAt: expect.any(Date) });
    expect(await accounts.getSecurity("user")).toEqual({ hasPassword: false, changedAt: null });
    expect(await accounts.listAccounts("admin")).toHaveLength(1);
    expect(await accounts.updateAccess("user", { disabled: true, platformRole: "admin" })).toBe(true);
    expect(await accounts.listAccounts("admin")).toMatchObject([{ id: "user", disabled: true, platformRole: "admin" }]);
    expect(await accounts.updateAccess("missing", { disabled: true })).toBe(false);
    expect(await accounts.updateAccess("user", { disabled: false, platformRole: "user" })).toBe(true);
  });

  it("hides the reserved evaluation account from the admin account listing", async () => {
    await state.db.query(
      `insert into accounts (id, email, name, credits, platform_role, disabled)
       values ('eval-system', 'evals@forja.internal', 'Forja Evals', 0, 'user', true)`,
    );

    const listed = await accounts.listAccounts();

    expect(listed.some((account) => account.email === "evals@forja.internal")).toBe(false);
  });

  it("rolls account creation back when personal organization creation fails", async () => {
    const failing = new PostgresAccountLifecycleRepository(async () => { throw new Error("organization failed"); });
    await expect(failing.create(input("rollback", "user"))).rejects.toThrow("organization failed");
    expect(await accounts.getAccount("rollback")).toBeUndefined();
  });

  it("stores session digests, respects disabled/expired accounts, and preserves session count semantics", async () => {
    const first = await sessions.createSession("user");
    const second = await sessions.createSession("user");
    expect((await state.db.query<{ token_hash: string }>("select token_hash from account_sessions")).rows.map((r) => r.token_hash)).toContain(sha256(first));
    expect((await sessions.findAccountBySessionToken(first))?.id).toBe("user");
    expect(await sessions.countActiveSessions("user")).toBe(2);
    expect(await sessions.deleteOtherSessions("user", second)).toBe(1);
    expect(await sessions.findAccountBySessionToken(first)).toBeNull();
    await state.db.query("update accounts set disabled = true where id = 'user'");
    expect(await sessions.findAccountBySessionToken(second)).toBeNull();
    await state.db.query("update accounts set disabled = false where id = 'user'");
    await state.db.query("update account_sessions set expires_at = now() - interval '1 second'");
    expect(await sessions.findAccountBySessionToken(second)).toBeNull();
    expect(await sessions.countActiveSessions("user")).toBe(0);
    // Deleting other sessions counts deleted rows, including expired sessions.
    expect(await sessions.deleteOtherSessions("user", "unrelated-token")).toBe(1);
  });

  it("overwrites reset codes with fresh attempts and marks expiration", async () => {
    await resets.save("user", "hash-one", 30);
    await resets.incrementAttempts("user");
    expect(await resets.find("user")).toEqual({ codeHash: "hash-one", attempts: 1, expired: false });
    await resets.save("user", "hash-two", 30);
    expect(await resets.find("user")).toEqual({ codeHash: "hash-two", attempts: 0, expired: false });
    await state.db.query("update password_resets set expires_at = now() - interval '1 second'");
    expect((await resets.find("user"))?.expired).toBe(true);
    await resets.delete("user");
    expect(await resets.find("user")).toBeNull();
  });

  it("resolves scoped API tokens, records usage only for active accounts, and enforces owner deletion", async () => {
    await tokens.create("token", "user", "build", sha256("fj_secret"), "personal_user");
    const account = await tokens.findAccount(sha256("fj_secret"));
    expect(account).toEqual({ id: "user", email: "user@example.test", name: null, credits: 75, platformRole: "user", tokenOrgId: "personal_user" });
    const list = await tokens.list("user");
    expect(list[0]).toMatchObject({ id: "token", orgName: "user", orgId: "personal_user", name: "build" });
    expect(list[0]!.lastUsedAt).toBeInstanceOf(Date);
    await tokens.delete("admin", "token");
    expect(await tokens.list("user")).toHaveLength(1);
    await state.db.query("update accounts set disabled = true where id = 'user'");
    expect(await tokens.findAccount(sha256("fj_secret"))).toBeNull();
    await tokens.delete("user", "token");
    expect(await tokens.list("user")).toEqual([]);
  });

  it("isolates admin purpose across promotions, demotions, disabling, expiration and revocation", async () => {
    await state.db.query("update accounts set disabled = false, platform_role = 'user' where id = 'user'");
    const expires = new Date(Date.now() + 30 * 86_400_000);
    await tokens.create("project-token", "user", "Project MCP", sha256("project-secret"), null);
    await expect(tokens.create("unauthorized", "user", "Admin MCP", sha256("not-issued"), null, "admin", expires)).rejects.toThrow("administradores");
    await state.db.query("update accounts set platform_role = 'admin' where id = 'user'");
    expect(await tokens.findAccount(sha256("project-secret"), "admin")).toBeNull();
    expect(await tokens.findAccount(sha256("project-secret"))).toMatchObject({ id: "user", platformRole: "admin" });
    await tokens.create("admin-token", "user", "Admin MCP", sha256("admin-secret"), null, "admin", expires);
    expect(await tokens.findAccount(sha256("admin-secret"))).toBeNull();
    expect(await tokens.findAccount(sha256("admin-secret"), "admin")).toMatchObject({ id: "user", platformRole: "admin", disabled: false });
    expect((await tokens.list("user")).map((token) => token.id)).toEqual(["project-token"]);
    const list = await tokens.listAdmin("user");
    expect(list).toMatchObject([{ id: "admin-token", purpose: "admin", expiresAt: expires, revokedAt: null }]);
    expect(list[0]).not.toHaveProperty("token_hash");
    const stored = await state.db.query("select token_hash from api_tokens where id = 'admin-token'");
    expect(stored.rows[0].token_hash).toBe(sha256("admin-secret"));
    expect(stored.rows[0].token_hash).not.toBe("admin-secret");
    await state.db.query("update accounts set platform_role = 'user' where id = 'user'");
    expect(await tokens.findAccount(sha256("admin-secret"), "admin")).toBeNull();
    await state.db.query("update accounts set platform_role = 'admin', disabled = true where id = 'user'");
    expect(await tokens.findAccount(sha256("admin-secret"), "admin")).toBeNull();
    await expect(tokens.create("disabled-admin", "user", "Admin MCP", sha256("not-issued"), null, "admin", expires)).rejects.toThrow("administradores");
    await state.db.query("update accounts set disabled = false where id = 'user'");
    await state.db.query("update api_tokens set expires_at = now() - interval '1 second' where id = 'admin-token'");
    expect(await tokens.findAccount(sha256("admin-secret"), "admin")).toBeNull();
    await state.db.query("update api_tokens set expires_at = $1 where id = 'admin-token'", [expires]);
    await tokens.delete("user", "admin-token");
    expect(await tokens.findAccount(sha256("admin-secret"), "admin")).not.toBeNull();
    expect(await tokens.revokeAdmin("admin", "admin-token")).toBe(false);
    expect(await tokens.revokeAdmin("user", "project-token")).toBe(false);
    expect(await tokens.revokeAdmin("user", "admin-token")).toBe(true);
    expect(await tokens.revokeAdmin("user", "admin-token")).toBe(false);
    expect(await tokens.findAccount(sha256("admin-secret"), "admin")).toBeNull();
    expect(await tokens.listAdmin("user")).toMatchObject([{ id: "admin-token", revokedAt: expect.any(Date) }]);
    await tokens.create("deleted-admin-token", "user", "Delete test", sha256("deleted-secret"), null, "admin", expires);
    expect(await tokens.findAccount(sha256("deleted-secret"), "admin")).not.toBeNull();
    await state.db.query("delete from api_tokens where id = 'deleted-admin-token'");
    expect(await tokens.findAccount(sha256("deleted-secret"), "admin")).toBeNull();
    await state.db.query("delete from api_tokens where account_id = 'user'; update accounts set platform_role = 'user' where id = 'user'");
  });
});
