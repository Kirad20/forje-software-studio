import type { ModelChanges, ModelInfo } from "../domain/models.js";
export interface CatalogRepository {
  policy(): { allow: string[]; creditsPerUsd: number };
  available(): Promise<ModelInfo[]>;
  list(): Promise<(ModelInfo & { enabled: boolean })[]>;
  usableProviderIds(): Promise<string[]>;
  find(id: string): Promise<{ source: string } | undefined>;
  hasProvider(id: string): Promise<boolean>;
  create(id: string, provider: string, model: string, changes: ModelChanges): Promise<void>;
  update(id: string, changes: ModelChanges): Promise<void>;
  remove(id: string): Promise<void>;
  audit(id: string, actorId: string | null, action: "create" | "set" | "delete"): Promise<void>;
  accountCustomized(accountId: string): Promise<boolean>;
  accountModels(accountId: string): Promise<string[]>;
  projectModels(projectId: string): Promise<string[]>;
  replaceAccountModels(accountId: string, ids: string[] | null): Promise<void>;
  replaceProjectModels(projectId: string, ids: string[]): Promise<void>;
}
