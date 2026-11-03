import { Password } from "../domain/Password.js";
import type { BootstrapAccounts, BootstrapCrypto, BootstrapPolicy } from "../ports/bootstrap.js";

export class SetupError extends Error {}

/** The token is held in-process and consumed only after the first administrator is persisted. */
export class BootstrapService {
  private tokenHash: string | null = null;

  constructor(
    private readonly accounts: BootstrapAccounts,
    private readonly crypto: BootstrapCrypto,
    private readonly policy: BootstrapPolicy,
    private readonly log: (message: string) => void = console.log,
  ) {}

  async init(): Promise<void> {
    if (await this.accounts.hasAccounts()) {
      this.tokenHash = null;
      return;
    }
    let token = this.policy.bootstrapToken;
    if (token) {
      if (token.length < 16) throw new Error("FORJA_BOOTSTRAP_TOKEN debe tener al menos 16 caracteres.");
      this.log("[forja] Instalación nueva: crea la primera cuenta de administrador con el token de FORJA_BOOTSTRAP_TOKEN.");
    } else {
      token = this.crypto.generate();
      this.log(`[forja] Instalación nueva: no hay usuarios. Crea el administrador en ${this.policy.publicUrl} con este token de un solo uso:`);
      this.log(`[forja]   ${token}`);
    }
    this.tokenHash = this.crypto.hash(token);
  }

  async needsSetup(): Promise<boolean> {
    return this.tokenHash !== null && !(await this.accounts.hasAccounts());
  }

  async complete(input: { token: string; email: string; password: string; name?: string }): Promise<string> {
    const email = (input.email ?? "").trim().toLowerCase();
    if (!(await this.needsSetup()) || !this.tokenMatches(String(input.token ?? ""))) {
      throw new SetupError("Token de instalación incorrecto o ya usado.");
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Correo no válido");
    Password.assertStrong(input.password, email);
    const id = await this.accounts.createAccount(email, input.name?.trim().slice(0, 80) || null, input.password, "admin");
    this.tokenHash = null;
    return this.accounts.createSession(id);
  }

  private tokenMatches(token: string): boolean {
    return this.tokenHash !== null && this.crypto.matches(this.crypto.hash(token.trim()), this.tokenHash);
  }
}
