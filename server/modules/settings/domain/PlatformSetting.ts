export type SettingGroup = "accounts" | "credits" | "models" | "email" | "payments" | "github" | "observability" | "runtime" | "evals";
export type PlatformSettingType = "string" | "url" | "number" | "boolean" | "enum" | "secret" | "list";

export interface SettingDef {
  key: string;
  group: SettingGroup;
  label: string;
  help?: string;
  type: PlatformSettingType;
  options?: readonly string[];
  min?: number;
  max?: number;
  integer?: boolean;
  default: unknown;
}

export interface SettingView extends SettingDef {
  value?: unknown;
  isDefault: boolean;
  secret?: { set: boolean; hint: string | null; broken: boolean };
}

export class SettingsError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}
