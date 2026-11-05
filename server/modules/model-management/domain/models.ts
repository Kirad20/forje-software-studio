export interface CompatEndpoint {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface ModelInfo {
  id: string;
  provider: string;
  model: string;
  label: string;
  inPrice: number;
  outPrice: number;
  cacheReadPrice: number;
  longPrompt?: { threshold: number; inPrice: number; outPrice: number };
  context: number;
  tools: boolean;
  vision: boolean;
  tier: number;
  speed: number;
  source: "builtin" | "openrouter" | "custom";
}

export interface ModelScope {
  accountId: string;
  projectId?: string | null;
}

export interface Provider {
  id: string;
  kind: "anthropic" | "openai" | "ollama";
  endpoint?: CompatEndpoint;
}

export interface ModelInput {
  provider: string;
  model: string;
  label?: string;
  inPrice?: number;
  outPrice?: number;
  cacheReadPrice?: number;
  context?: number;
  tools?: boolean;
  vision?: boolean;
  tier?: number;
  speed?: number;
  enabled?: boolean;
}
export class ModelError extends Error {}
export type ModelChanges = Partial<Omit<ModelInput, "provider" | "model">>;
export function validateModelInput(input: ModelInput): { id: string; model: string; changes: ModelChanges } {
  if (!/^[a-z0-9-]{2,32}$/.test(input.provider ?? "")) throw new ModelError("Proveedor no válido");
  if (!input.model?.trim() || input.model.length > 200) throw new ModelError("Falta el nombre del modelo");
  const num = (v: unknown, min: number, max: number, what: string) => {
    if (v === undefined) return undefined;
    if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) throw new ModelError(`${what}: entre ${min} y ${max}`);
    return v;
  };
  return {
    id: `${input.provider}:${input.model.trim()}`, model: input.model.trim(),
    changes: {
      label: input.label === undefined ? undefined : String(input.label).trim().slice(0, 120) || input.model,
      inPrice: num(input.inPrice, 0, 1000, "Precio de entrada"),
      outPrice: num(input.outPrice, 0, 1000, "Precio de salida"),
      cacheReadPrice: num(input.cacheReadPrice, 0, 1000, "Precio de lectura de caché"),
      context: num(input.context, 1000, 100_000_000, "Contexto"),
      tools: input.tools === undefined ? undefined : !!input.tools,
      vision: input.vision === undefined ? undefined : !!input.vision,
      tier: num(input.tier, 1, 5, "Calidad"),
      speed: num(input.speed, 1, 5, "Velocidad"),
      enabled: input.enabled === undefined ? undefined : !!input.enabled,
    },
  };
}

export function costUsd(m: ModelInfo, u: { input: number; output: number; cacheRead: number; cacheWrite: number }) {
  const prompt = u.input + u.cacheRead + u.cacheWrite;
  const long = m.longPrompt && prompt > m.longPrompt.threshold;
  const inP = long ? m.longPrompt!.inPrice : m.inPrice;
  const outP = long ? m.longPrompt!.outPrice : m.outPrice;
  return (u.input * inP + u.cacheWrite * inP * 1.25 + u.cacheRead * m.cacheReadPrice + u.output * outP) / 1_000_000;
}

export const creditsAtRate = (usd: number, creditsPerUsd: number) =>
  usd > 0 ? Math.max(1, Math.ceil(usd * creditsPerUsd)) : 0;

const globToRegex = (glob: string) => new RegExp(`^${glob.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);

export const matchesModelPolicy = (model: ModelInfo, globs: string[]) =>
  globs.some(g => g.trim() === "custom:*" ? model.source === "custom" : globToRegex(g).test(model.id));
