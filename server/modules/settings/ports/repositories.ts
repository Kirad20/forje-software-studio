import type { SettingDefinition } from "../domain/SettingDefinition.js";

export interface ISettingsRegistry {
  getDefinition(key: string): SettingDefinition | undefined;
  listDefinitions(): SettingDefinition[];
}

export interface ISettingsStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  setMany(patch: Record<string, unknown>): Promise<void>;
  reset(key: string): Promise<void>;
  getAll(): Promise<Record<string, unknown>>;
}

export interface ISecretCipher {
  encrypt(text: string): string;
  decrypt(ciphertext: string): string;
}
