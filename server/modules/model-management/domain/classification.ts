import type { ModelInput } from "./models.js";

export interface ProviderModel {
  id: string;
  label?: string;
  context?: number;
  inPrice?: number;
  outPrice?: number;
  cacheReadPrice?: number;
  tools?: boolean;
  vision?: boolean;
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

export function classifyProviderModel(provider: string, remote: ProviderModel): ModelInput {
  const claude = /(?:^|\/)claude-(opus|sonnet|haiku)-/i.test(remote.id);
  return {
    provider, model: remote.id, label: remote.label ?? remote.id,
    inPrice: remote.inPrice ?? 0, outPrice: remote.outPrice ?? 0,
    cacheReadPrice: remote.cacheReadPrice ?? 0, context: remote.context ?? 128_000,
    tools: remote.tools ?? claude, vision: remote.vision ?? claude,
    tier: /(?:^|\/)claude-fable-/i.test(remote.id) ? 3 : tierFor(remote.id, remote.inPrice ?? 0),
    speed: speedFor(remote.id),
    enabled: false,
  };
}
