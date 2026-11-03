import { PGlite } from "@electric-sql/pglite";
import { expect, it, vi } from "vitest";
import { createAuth } from "../../../../server/modules/app-services/application/auth.js";
import { createAuthRepository } from "../../../../server/modules/app-services/infrastructure/repositories.js";
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
    const sendEmail = vi.fn();
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
    expect(sendEmail).toHaveBeenCalledWith("p", expect.objectContaining({ to: "user@example.com" }));
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
