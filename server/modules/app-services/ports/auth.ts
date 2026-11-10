import type { EmailInput } from "../domain/contracts.js";
import type { AppEnv } from "../domain/contracts.js";
import type { AuthRepository } from "./repositories.js";
import type { ObserverPorts } from "./observer.js";
export interface AuthPorts extends ObserverPorts {
  projectDb(projectId: string, env: AppEnv): AuthRepository;
  projectOwnerEmail(projectId: string): Promise<string>;
  sendEmail(projectId: string, input: EmailInput, env?: AppEnv): Promise<unknown>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  newId(): string;
  newToken(): string;
  numericCode(length: number): string;
  sha256(value: string): string;
}
