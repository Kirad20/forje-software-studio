export interface BootstrapAccounts {
  hasAccounts(): Promise<boolean>;
  createAccount(email: string, name: string | null, password: string | null, role: "admin" | "user"): Promise<string>;
  createSession(id: string): Promise<string>;
}

export interface BootstrapCrypto {
  generate(): string;
  hash(token: string): string;
  matches(givenHash: string, storedHash: string): boolean;
}

export interface BootstrapPolicy {
  bootstrapToken: string;
  publicUrl: string;
}
