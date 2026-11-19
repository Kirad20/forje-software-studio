import type { IAccountRepository, IOAuthIdentityRepository, ISessionRepository } from "../ports/repositories.js";

export interface OAuthLogin {
  provider: string;
  subject: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  /** The provider only hands out confirmed addresses (Google, Facebook…). */
  trustEmail: boolean;
}

export type OAuthLoginResult = { token: string } | { error: string };

/**
 * Studio sign-in with a social or OAuth provider. The same provider account always reaches
 * the same Forja account; a first sign-in joins the account with that address only when the
 * provider vouches for it, and a new address follows the signup policy like the emailed code.
 */
export class LoginWithOAuthUseCase {
  constructor(
    private readonly accountRepo: IAccountRepository,
    private readonly identities: IOAuthIdentityRepository,
    private readonly sessions: ISessionRepository,
    private readonly canSignUp: (email: string) => Promise<boolean>,
    private readonly createAccount: (email: string, name: string | null) => Promise<string>,
    private readonly onAccountVerified?: (accountId: string, email: string) => Promise<void>,
  ) {}

  async execute(login: OAuthLogin): Promise<OAuthLoginResult> {
    if (!login.email) return { error: "El proveedor no compartió tu correo." };
    const email = login.email.trim().toLowerCase();
    let accountId = await this.identities.findAccountId(login.provider, login.subject);
    if (!accountId) {
      const existing = await this.accountRepo.findByEmail(email);
      if (existing) {
        if (!(login.emailVerified || login.trustEmail)) {
          return { error: "Ya existe una cuenta con ese correo. Entra con tu contraseña o con un código." };
        }
        accountId = existing.id;
      } else {
        if (!(await this.canSignUp(email))) return { error: "Ese correo no puede crear una cuenta en esta instalación." };
        accountId = await this.createAccount(email, login.name?.trim().slice(0, 200) || null);
      }
      await this.identities.link(login.provider, login.subject, accountId, email);
    }
    const account = await this.accountRepo.findById(accountId);
    if (!account || account.disabled) return { error: "Esta cuenta está desactivada." };
    if (this.onAccountVerified) await this.onAccountVerified(account.id, email);
    return { token: await this.sessions.createSession(account.id) };
  }
}
