import type { QueryRepository } from "./repositories.js";
export interface StoragePorts extends QueryRepository {
  newId(): string;
  files: {
    extension(filename: string): string;
    write(projectId: string, key: string, data: Uint8Array): Promise<void>;
    read(projectId: string, key: string): Promise<Buffer | null>;
    delete(projectId: string, key: string): Promise<void>;
  };
}
