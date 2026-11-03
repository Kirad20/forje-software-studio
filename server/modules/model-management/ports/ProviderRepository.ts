import type { ProviderInput, ProviderRecord } from "../domain/providers.js";
export interface ProviderRepository {
  list(): Promise<ProviderRecord[]>;
  find(id: string): Promise<{ builtin: boolean; kind: string } | undefined>;
  create(input: ProviderInput): Promise<void>;
  update(input: ProviderInput, seed: boolean): Promise<boolean>;
  remove(id: string): Promise<void>;
  audit(id: string, actorId: string | null, action: "create" | "set" | "delete"): Promise<void>;
  validate(input: ProviderInput): ProviderInput;
}
