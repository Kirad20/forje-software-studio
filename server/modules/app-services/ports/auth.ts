import type { EmailInput } from "../domain/contracts.js";
import type { AppEnv } from "../domain/contracts.js";
import type { AuthRepository } from "./repositories.js";
export interface AuthPorts {
  projectDb(projectId: string, env: AppEnv): AuthRepository;
  sendEmail(projectId: string, input: EmailInput): Promise<unknown>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  newId(): string;
  newToken(): string;
  numericCode(length: number): string;
  sha256(value: string): string;
}
