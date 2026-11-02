import type { Email } from "./Email.js";

export type PlatformRole = "admin" | "user";

export interface AccountProps {
  id: string;
  email: Email;
  name: string | null;
  credits: number;
  platformRole: PlatformRole;
  disabled: boolean;
  passwordHash?: string | null;
  tokenOrgId?: string | null;
}

export class Account {
  readonly id: string;
  readonly email: Email;
  name: string | null;
  credits: number;
  readonly platformRole: PlatformRole;
  readonly disabled: boolean;
  readonly passwordHash?: string | null;
  readonly tokenOrgId?: string | null;

  constructor(props: AccountProps) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.credits = props.credits;
    this.platformRole = props.platformRole;
    this.disabled = props.disabled;
    this.passwordHash = props.passwordHash;
    this.tokenOrgId = props.tokenOrgId;
  }

  isAdmin(): boolean {
    return this.platformRole === "admin";
  }

  canLogin(): boolean {
    return !this.disabled;
  }

  hasPassword(): boolean {
    return !!this.passwordHash;
  }

  updateName(newName: string): void {
    this.name = newName.trim().slice(0, 80) || null;
  }
}
