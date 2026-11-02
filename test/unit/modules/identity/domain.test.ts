import { describe, it, expect } from "vitest";
import { Email } from "../../../../server/modules/identity/domain/Email.js";
import { Password } from "../../../../server/modules/identity/domain/Password.js";
import { Account } from "../../../../server/modules/identity/domain/Account.js";

describe("Identity Domain (DDD)", () => {
  describe("Email Value Object", () => {
    it("validates and normalizes valid email", () => {
      const email = new Email(" User@Example.COM ");
      expect(email.value).toBe("user@example.com");
      expect(email.username).toBe("user");
    });

    it("throws on invalid email", () => {
      expect(() => new Email("not-an-email")).toThrow("Correo no válido");
    });
  });

  describe("Password Value Object", () => {
    it("validates strong password", () => {
      const pwd = new Password("unaclavemuysegura123");
      expect(pwd.value).toBe("unaclavemuysegura123");
    });

    it("rejects short or common password", () => {
      expect(() => Password.assertStrong("corta", "user@test.com")).toThrow("al menos 10 caracteres");
      expect(() => Password.assertStrong("password123", "user@test.com")).toThrow("menos predecible");
      expect(() => Password.assertStrong("user@test.com", "user@test.com")).toThrow("menos predecible");
    });
  });

  describe("Account Entity", () => {
    it("instantiates an account aggregate with domain invariants", () => {
      const account = new Account({
        id: "acc_123",
        email: new Email("admin@forja.test"),
        name: "Admin",
        credits: 100,
        platformRole: "admin",
        disabled: false,
      });

      expect(account.id).toBe("acc_123");
      expect(account.email.value).toBe("admin@forja.test");
      expect(account.isAdmin()).toBe(true);
      expect(account.canLogin()).toBe(true);
    });

    it("prevents disabled account from logging in", () => {
      const account = new Account({
        id: "acc_456",
        email: new Email("disabled@forja.test"),
        name: null,
        credits: 0,
        platformRole: "user",
        disabled: true,
      });

      expect(account.canLogin()).toBe(false);
      expect(account.isAdmin()).toBe(false);
    });
  });
});
