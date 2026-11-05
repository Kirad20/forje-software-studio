import { ModelError, type ModelInput } from "./models.js";
import { isFusionCapability, type FusionCapability } from "./fusion.js";

export interface ProviderModel {
  id: string;
  label?: string;
  context?: number;
  inPrice?: number;
  outPrice?: number;
  cacheReadPrice?: number;
  tools?: boolean;
  vision?: boolean;
  reasoningEffort?: boolean;
}

export interface ClassifiedProviderModel extends ProviderModel {
  tier: number;
  speed: number;
  capabilities?: FusionCapability;
}

export function parseModelClassifications(text: string): ClassifiedProviderModel[] {
  const invalid = () => new ModelError("La clasificación IA devolvió campos o valores inválidos. No se importó ningún modelo.");
  const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
  const number = (value: unknown, min: number, max: number, integer = false) => {
    if (value === null) return undefined;
    if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) throw invalid();
    return value;
  };
  const boolean = (value: unknown) => {
    if (value === null) return undefined;
    if (typeof value !== "boolean") throw invalid();
    return value;
  };
  let json: unknown;
  try { json = JSON.parse(text.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, "$1")); }
  catch { throw new ModelError("La clasificación IA no devolvió JSON válido. No se importó ningún modelo."); }
  if (!record(json) || !Array.isArray(json.models)) throw invalid();
  return json.models.map((value: unknown) => {
    if (!record(value) || typeof value.id !== "string" || !value.id.trim()) throw invalid();
    const tier = number(value.tier, 1, 5, true), speed = number(value.speed, 1, 5, true);
    if (tier === undefined || speed === undefined) throw invalid();
    let capabilities: FusionCapability | undefined;
    if (value.capabilities !== undefined && value.capabilities !== null) {
      if (!record(value.capabilities)) throw invalid();
      const profile = { ...value.capabilities, source: "classification" };
      if (!isFusionCapability(profile)) throw invalid();
      capabilities = profile;
    }
    return {
      id: value.id, tier, speed, context: number(value.context, 1000, 100_000_000, true),
      inPrice: number(value.inPrice, 0, 1000), outPrice: number(value.outPrice, 0, 1000),
      cacheReadPrice: number(value.cacheReadPrice, 0, 1000), tools: boolean(value.tools), vision: boolean(value.vision),
      capabilities,
    };
  });
}

export function tierFor(id: string, inPrice: number): number {
  const families: [RegExp, number][] = [
    [/claude-opus|gpt-5(?!.*mini|.*nano)|gemini-[\d.]+-pro|o\d-pro/i, 5],
    [/claude-sonnet|gemini-[\d.]+-flash(?!-lite)|deepseek|qwen.*coder|kimi|glm|gpt-.*mini/i, 4],
    [/claude-haiku|flash-lite|qwen|mistral|llama-?[34]|gpt-.*nano|gemma/i, 3],
  ];
  for (const [re, tier] of families) if (re.test(id)) return tier;
  return inPrice >= 3 ? 4 : inPrice >= 0.5 ? 3 : 2;
}

export const speedFor = (id: string) =>
  /flash|mini|nano|haiku|lite|8b|7b/i.test(id) ? 5 : /opus|pro|405b|large/i.test(id) ? 2 : 3;

export function importedModelInput(provider: string, remote: ClassifiedProviderModel): ModelInput {
  return {
    provider, model: remote.id, label: remote.label ?? remote.id,
    inPrice: remote.inPrice ?? 0, outPrice: remote.outPrice ?? 0,
    cacheReadPrice: remote.cacheReadPrice ?? 0, context: remote.context ?? 128_000,
    tools: remote.tools ?? false, vision: remote.vision ?? false,
    tier: remote.tier, speed: remote.speed,
    capabilities: remote.capabilities, reasoningEffort: remote.reasoningEffort,
    enabled: false,
  };
}
