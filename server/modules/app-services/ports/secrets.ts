import type { QueryRepository } from "./repositories.js";
export interface SecretPorts extends Pick<QueryRepository, "q"> {
  encrypt(value: string): string;
  decrypt(value: string): string;
  integrationEnv(projectId: string): Promise<Record<string, string>>;
  onDecryptError(projectId: string, name: string, error: unknown): void;
}
