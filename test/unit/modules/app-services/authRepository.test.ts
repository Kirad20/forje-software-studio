import { PGlite } from "@electric-sql/pglite";
import { expect, it, vi } from "vitest";
import { createAuth } from "../../../../server/modules/app-services/application/auth.js";
import { createAuthRepository, createQueryRepository } from "../../../../server/modules/app-services/infrastructure/repositories.js";
import { createEmail } from "../../../../server/modules/app-services/application/email.js";
import type { ProjectDb } from "../../../../server/modules/app-services/ports/database.js";
import { hashPassword, verifyPassword, sha256, newId, newToken } from "../../../../server/shared/crypto.js";

it("uses the production PGlite repository for signup, sessions, lockout and transactional reset", async () => {
  const pg = await PGlite.create();
  try {
    await pg.exec(`
      create table _forja_users (
        id text primary key, email text unique, name text, role text default 'user',
        password_hash text, failed_logins int default 0, locked_until timestamptz
      );
      create table _forja_sessions (token_hash text primary key, user_id text, expires_at timestamptz);
      create table _forja_reset_codes (
        id serial primary key, user_id text, code_hash text, attempts int default 0,
        used boolean default false, expires_at timestamptz, created_at timestamptz default now()
      );
      create table accounts (id text primary key, email text);
      create table projects (id text primary key, owner_id text, name text, email_domain text, email_domain_verified boolean);
      insert into accounts values ('owner', 'user@example.com');
      insert into projects values ('p', 'owner', 'App', null, false);
      create table emails (
        id serial primary key, project_id text, env text, direction text default 'out',
        to_address text, intended_to text, from_address text, subject text, html text, status text,
        created_at timestamptz default now()
      );
    `);
    const db: ProjectDb = {
      query: async (sql, params = []) => (await pg.query(sql, params)).rows as never,
      one: async (sql, params = []) => (await pg.query(sql, params)).rows[0] as never,
      exec: async (sql) => { await pg.exec(sql); },
      transaction: (fn) => pg.transaction((tx) => fn({
        query: async (sql, params = []) => (await tx.query(sql, params)).rows as never,
        one: async (sql, params = []) => (await tx.query(sql, params)).rows[0] as never,
      })),
    };
    const email = createEmail({
      ...createQueryRepository({
        q: async (sql, params = []) => (await pg.query(sql, params)).rows as never,
        one: async (sql, params = []) => (await pg.query(sql, params)).rows[0] as never,
      }),
      getTransport: () => null, emailFrom: () => "platform@example.test", log: vi.fn(),
    });
    const sendEmail = vi.fn(email.sendEmail);
    const api = createAuth({
      projectDb: () => createAuthRepository(db), sendEmail,
      hashPassword, verifyPassword, sha256, newId, newToken, numericCode: () => "12345678",
    });
    const signed = await api.signUp("p", { email: " User@Example.com ", password: "initial-password", name: "User" });
    expect(signed.user.email).toBe("user@example.com");
    expect(await api.userFromSession("p", signed.token)).toEqual(signed.user);
    await expect(api.signUp("p", { email: "user@example.com", password: "initial-password" })).rejects.toMatchObject({ status: 409 });
    const login = await api.signIn("p", { email: "user@example.com", password: "initial-password" });
    await api.signOut("p", login.token);
    expect(await api.userFromSession("p", login.token)).toBeNull();
    for (let i = 0; i < 5; i++) {
      await expect(api.signIn("p", { email: "user@example.com", password: "wrong" })).rejects.toMatchObject({ status: 401 });
    }
    await expect(api.signIn("p", { email: "user@example.com", password: "initial-password" })).rejects.toMatchObject({ status: 429 });
    await api.requestPasswordReset("p", "user@example.com", "App");
    expect(sendEmail).toHaveBeenCalledWith("p", expect.objectContaining({ to: "user@example.com" }), "published");
    const [resetEmail] = await email.listEmails("p", "published");
    expect(resetEmail).toMatchObject({ env: "published", status: "logged", to: "user@example.com" });
    expect(resetEmail.html).toContain("12345678");
    expect(await email.listEmails("p", "preview")).toEqual([]);
    await expect(api.confirmPasswordReset("p", { email: "user@example.com", code: "wrong", password: "new-password" })).rejects.toThrow("código");
    await api.confirmPasswordReset("p", { email: "user@example.com", code: "12345678", password: "new-password" });
    expect(await api.userFromSession("p", signed.token)).toBeNull();
    await expect(api.confirmPasswordReset("p", { email: "user@example.com", code: "12345678", password: "new-password" })).rejects.toThrow("código");
    await expect(api.signIn("p", { email: "user@example.com", password: "new-password" })).resolves.toHaveProperty("token");
    const preview = await api.testSession("p", "user@example.com");
    expect(await api.userFromSession("p", preview.token)).toEqual(signed.user);
    await api.endSession("p", preview.token);
    expect(await api.userFromSession("p", preview.token)).toBeNull();
  } finally {
    await pg.close();
  }
}, 30_000);
