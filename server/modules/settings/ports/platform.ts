import type { SettingDef } from "../domain/PlatformSetting.js";
import type { ISecretCipher } from "./repositories.js";

export type AuditAction = "set" | "reset" | "create" | "delete";
export interface StoredSetting { key: string; value: unknown; value_enc: string | null }
export interface SettingWrite { key: string; value: unknown; encrypted: string | null; reset: boolean }

export interface SettingsDependencies {
  registry: {
    list(): SettingDef[];
    find(key: string): SettingDef | undefined;
    validate(def: SettingDef, value: unknown): unknown;
  };
  repository: {
    read(): Promise<StoredSetting[]>;
    save(writes: SettingWrite[], actorId: string | null): Promise<void>;
    reset(key: string, actorId: string | null): Promise<void>;
    audit(key: string, actorId: string | null, action: AuditAction): Promise<void>;
  };
  cipher: ISecretCipher;
  runtime: {
    get(key: string): unknown;
    apply(values: Map<string, unknown>): void;
  };
  warn(message: string): void;
}
