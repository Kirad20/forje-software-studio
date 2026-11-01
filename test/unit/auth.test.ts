import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

// A throwaway data dir and a known bootstrap token, set before anything imports the config.
process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "forja-auth-"));
process.env.FORJA_BOOTSTRAP_TOKEN = "bootstrap-token-for-tests";
process.env.SECRETS_KEY = "ab".repeat(32);
process.env.SMTP_URL = "";

const crypto = await import("../../server/lib/crypto.js");
const accounts = await import("../../server/platform/accounts.js");
const bootstrap = await import("../../server/platform/bootstrap.js");
const orgs = await import("../../server/platform/orgs.js");
const members = await import("../../server/platform/members.js");
const projects = await import("../../server/platform/projects.js");
const { platformDb, q, one } = await import("../../server/platform/db.js");

describe("password hashing", () => {
  it("round-trips, embeds its parameters and salts every hash", async () => {
    const a = await crypto.hashPassword("correct horse battery");
    const b = await crypto.hashPassword("correct horse battery");
    expect(a).toMatch(/^scrypt\$131072\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(a).not.toBe(b);
    expect(await crypto.verifyPassword("correct horse battery", a)).toBe(true);
    expect(await crypto.verifyPassword("correct horse batterz", a)).toBe(false);
    expect(crypto.passwordNeedsRehash(a)).toBe(false);
  });

  it("still verifies the legacy 3-part format and flags it for upgrade", async () => {
    const { scryptSync, randomBytes } = await import("node:crypto");
    const salt = randomBytes(16);
    const legacy = `scrypt$${salt.toString("hex")}$${scryptSync("viejo-secreto", salt, 64).toString("hex")}`;
    expect(await crypto.verifyPassword("viejo-secreto", legacy)).toBe(true);
    expect(crypto.passwordNeedsRehash(legacy)).toBe(true);
  });

  it("rejects malformed or oversized-parameter hashes instead of computing them", async () => {
    expect(await crypto.verifyPassword("x", "garbage")).toBe(false);
    expect(await crypto.verifyPassword("x", "scrypt$4294967296$8$1$aa$bb")).toBe(false);
    expect(await crypto.verifyPassword("x", "bcrypt$1$2$3$4$5")).toBe(false);
  });
});

describe("password policy", () => {
  it("enforces length and rejects the email itself", () => {
    expect(() => accounts.assertStrongPassword("corta", "a@b.co")).toThrow(/10 caracteres/);
    expect(() => accounts.assertStrongPassword("a@b.co-a@b.co", "A@B.CO-A@B.CO")).toThrow(/predecible/);
    expect(() => accounts.assertStrongPassword("x".repeat(129), "a@b.co")).toThrow(/larga/);
    expect(() => accounts.assertStrongPassword("una frase larga y rara", "a@b.co")).not.toThrow();
  });
});

describe("first-run setup", () => {
  beforeAll(async () => {
    await platformDb();
    await bootstrap.initBootstrap();
  });

  it("asks for setup while there are no accounts and blocks code signups", async () => {
    expect(await bootstrap.needsSetup()).toBe(true);
    expect(await accounts.canSignUp("intruso@example.com")).toBe(false);
  });

  it("rejects a wrong token and a weak password without creating anything", async () => {
    await expect(bootstrap.completeSetup({ token: "nope", email: "root@example.com", password: "una contraseña larga" })).rejects.toThrow(/Token/);
    await expect(bootstrap.completeSetup({ token: "bootstrap-token-for-tests", email: "root@example.com", password: "corta" })).rejects.toThrow(/10/);
    expect(await accounts.hasAccounts()).toBe(false);
    expect(await bootstrap.needsSetup()).toBe(true);
  });

  it("creates the first admin with its personal org, and the token dies with it", async () => {
    const token = await bootstrap.completeSetup({ token: "bootstrap-token-for-tests", email: "Root@Example.com", password: "una contraseña larga", name: "Root" });
    expect((await accounts.accountFromSession(token))?.platformRole).toBe("admin");
    expect((await orgs.listOrgs((await accounts.accountFromSession(token))!.id)).map((o) => o.personal)).toEqual([true]);
    expect(await bootstrap.needsSetup()).toBe(false);
    await expect(
      bootstrap.completeSetup({ token: "bootstrap-token-for-tests", email: "otro@example.com", password: "otra contraseña larga" }),
    ).rejects.toThrow(/Token/);
  });
});

describe("password login, reset and sessions", () => {
  it("logs in with the right password only, and answers the same for unknown emails", async () => {
    expect(await accounts.loginWithPassword("root@example.com", "mala contraseña")).toBeNull();
    expect(await accounts.loginWithPassword("nadie@example.com", "una contraseña larga")).toBeNull();
    const token = await accounts.loginWithPassword("ROOT@example.com", "una contraseña larga");
    expect(token).toBeTruthy();
    expect((await accounts.accountFromSession(token!))?.email).toBe("root@example.com");
  });

  it("resets with the emailed code, ends sessions, and burns the code after 5 misses", async () => {
    const logs: string[] = [];
    const orig = console.log;
    console.log = (...a: unknown[]) => void logs.push(a.join(" "));
    try {
      await accounts.requestPasswordReset("root@example.com");
      await accounts.requestPasswordReset("nadie@example.com"); // silent
    } finally {
      console.log = orig;
    }
    expect(logs.filter((l) => l.includes("nadie@example.com"))).toHaveLength(0);
    const code = /: (\d{8})/.exec(logs.join("\n"))![1]!;
    const session = (await accounts.loginWithPassword("root@example.com", "una contraseña larga"))!;

    expect(await accounts.resetPassword("root@example.com", "00000000", "nueva contraseña larga")).toBe(false);
    // A weak password is refused without spending the code.
    await expect(accounts.resetPassword("root@example.com", code, "corta")).rejects.toThrow(/10/);
    expect(await accounts.resetPassword("root@example.com", code, "nueva contraseña larga")).toBe(true);
    expect(await accounts.resetPassword("root@example.com", code, "otra contraseña larga")).toBe(false); // single use

    expect(await accounts.accountFromSession(session)).toBeNull();
    expect(await accounts.loginWithPassword("root@example.com", "una contraseña larga")).toBeNull();
    expect(await accounts.loginWithPassword("root@example.com", "nueva contraseña larga")).toBeTruthy();
  });

  it("locks a reset code after 5 wrong guesses", async () => {
    const orig = console.log;
    console.log = () => {};
    try {
      await accounts.requestPasswordReset("root@example.com");
    } finally {
      console.log = orig;
    }
    for (let i = 0; i < 6; i++) expect(await accounts.resetPassword("root@example.com", "11111111", "nueva contraseña larga")).toBe(false);
    const row = await one<{ attempts: number }>(`select attempts from password_resets`);
    expect(row?.attempts).toBe(5);
  });

  it("refuses sessions and logins for disabled accounts", async () => {
    const id = await accounts.createAccount("baja@example.com", null, "contraseña de prueba");
    const token = (await accounts.loginWithPassword("baja@example.com", "contraseña de prueba"))!;
    expect(await accounts.accountFromSession(token)).not.toBeNull();
    await q(`update accounts set disabled = true where id = $1`, [id]);
    expect(await accounts.accountFromSession(token)).toBeNull();
    expect(await accounts.loginWithPassword("baja@example.com", "contraseña de prueba")).toBeNull();
  });

  it("lets existing emails and new ones in under the default open signup", async () => {
    expect(await accounts.canSignUp("nuevo@example.com")).toBe(true);
    expect(await accounts.canSignUp("root@example.com")).toBe(true);
  });
});

describe("organizations and project access", () => {
  it("gives org members access to org projects, and outsiders none", async () => {
    const ana = await accounts.createAccount("ana@example.com", "Ana", null);
    const luis = await accounts.createAccount("luis@example.com", "Luis", null);
    const eva = await accounts.createAccount("eva@example.com", "Eva", null);
    const team = await orgs.createOrg(ana, "Equipo Ñandú");
    expect(team.slug).toBe("equipo-nandu");

    const p = await projects.createProject(ana, "App del equipo", "", undefined, team.id);
    expect(p.orgId).toBe(team.id);
    expect(await members.accessOf(ana, p)).toBe("owner");
    expect(await members.accessOf(luis, p)).toBeNull();

    await orgs.addOrgMember(team.id, "owner", "luis@example.com", "member");
    expect(await members.accessOf(luis, p)).toBe("editor");
    expect(await members.sharedProjectIds(luis)).toContain(p.id);
    expect(await members.accessOf(eva, p)).toBeNull();

    await orgs.removeOrgMember(team.id, "owner", ana, luis);
    expect(await members.accessOf(luis, p)).toBeNull();
  });

  it("defaults new projects to the owner's personal org, which takes no members", async () => {
    const id = await accounts.createAccount("solo@example.com", null, null);
    const p = await projects.createProject(id, "Mi app");
    expect(p.orgId).toBe(orgs.personalOrgId(id));
    await expect(orgs.addOrgMember(p.orgId!, "owner", "root@example.com", "member")).rejects.toThrow(/personal/);
  });

  it("keeps at least one owner and stops admins from touching owners", async () => {
    const a = await accounts.createAccount("o1@example.com", null, null);
    const b = await accounts.createAccount("o2@example.com", null, null);
    const team = await orgs.createOrg(a, "Gestión");
    await orgs.addOrgMember(team.id, "owner", "o2@example.com", "admin");
    await expect(orgs.setOrgMemberRole(team.id, "owner", a, "member")).rejects.toThrow(/propietario/);
    await expect(orgs.removeOrgMember(team.id, "owner", a, a)).rejects.toThrow(/propietario/);
    await expect(orgs.setOrgMemberRole(team.id, "admin", b, "owner")).rejects.toThrow(/propietarios/);
    await expect(orgs.removeOrgMember(team.id, "admin", b, a)).rejects.toThrow(/propietarios/);
    await orgs.setOrgMemberRole(team.id, "owner", b, "owner");
    await orgs.setOrgMemberRole(team.id, "owner", a, "member");
  });

  it("scopes an API token to one organization", async () => {
    const id = await accounts.createAccount("tok@example.com", null, null);
    const team = await orgs.createOrg(id, "Cliente");
    const scoped = await accounts.createApiToken(id, "mcp-cliente", team.id);
    const free = await accounts.createApiToken(id, "mcp-libre");
    expect((await accounts.accountFromApiToken(scoped))?.tokenOrgId).toBe(team.id);
    expect((await accounts.accountFromApiToken(free))?.tokenOrgId).toBeNull();
  });
});
