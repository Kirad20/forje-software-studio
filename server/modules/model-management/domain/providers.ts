export const OPENROUTER_URL = "https://openrouter.ai/api/v1";
export interface ProviderRecord {
  id: string;
  kind: "anthropic" | "openai" | "ollama";
  label: string;
  baseUrl: string | null;
  headers: Record<string, string>;
  enabled: boolean;
  builtin: boolean;
  apiKey: string;
  keyBroken: boolean;
}
export type ProviderView = Omit<ProviderRecord, "apiKey" | "headers"> & {
  headerNames: string[]; keySet: boolean; keyHint: string | null; available: boolean; missing: string | null;
};
export interface ProviderInput {
  id: string;
  kind?: "anthropic" | "openai" | "ollama";
  label?: string;
  baseUrl?: string | null;
  apiKey?: string | null;
  headers?: Record<string, string>;
  enabled?: boolean;
}
export class ProviderError extends Error {}
export function missingProvider(p: ProviderRecord): string | null {
  if (!p.enabled) return "Desactivado";
  if (p.keyBroken) return "La clave guardada no se puede descifrar: vuelve a introducirla";
  if ((p.id === "anthropic" || p.id === "openrouter") && !p.apiKey) return "Falta la clave de API";
  if (p.kind !== "anthropic" && p.id !== "openrouter" && !p.baseUrl) return "Falta la URL base";
  return null;
}
