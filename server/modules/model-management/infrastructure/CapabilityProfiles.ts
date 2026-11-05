import { q } from "../../../shared/database/index.js";
import type { FusionCapability } from "../domain/fusion.js";
import { ModelError } from "../domain/models.js";

/** Capability scores use the catalog's 1–5 quality scale; confidence is 0–1. */
export function validateCapabilityProfile(value: unknown): FusionCapability {
  if (!value || typeof value !== "object") throw new ModelError("Perfil de capacidades no válido");
  const profile = value as Record<string, unknown>;
  for (const dimension of ["reasoning", "coding", "debugging", "toolUse"]) {
    const score = profile[dimension];
    if (typeof score !== "number" || !Number.isFinite(score) || score < 1 || score > 5) {
      throw new ModelError(`Capacidad ${dimension}: entre 1 y 5`);
    }
  }
  if (typeof profile.confidence !== "number" || !Number.isFinite(profile.confidence) || profile.confidence < 0 || profile.confidence > 1) {
    throw new ModelError("Confianza de capacidades: entre 0 y 1");
  }
  if (!["declared", "evaluation", "classification"].includes(String(profile.source))) {
    throw new ModelError("Fuente de capacidades no válida");
  }
  return {
    reasoning: profile.reasoning as number, coding: profile.coding as number, debugging: profile.debugging as number,
    toolUse: profile.toolUse as number, confidence: profile.confidence, source: profile.source as FusionCapability["source"],
  };
}

export function validateReasoningEffort(value: unknown): boolean {
  if (typeof value !== "boolean") throw new ModelError("Soporte de esfuerzo de razonamiento no válido");
  return value;
}

export async function persistCapabilityProfile(modelId: string, profile: FusionCapability, reasoningEffort?: boolean) {
  const capabilities = validateCapabilityProfile(profile);
  const rows = await q(
    `update model_catalog set capabilities = $2${reasoningEffort === undefined ? "" : ", reasoning_effort = $3"} where id = $1 returning id`,
    [modelId, JSON.stringify(capabilities), ...(reasoningEffort === undefined ? [] : [validateReasoningEffort(reasoningEffort)])],
  );
  if (!rows.length) throw new ModelError(`No existe el modelo ${modelId}.`);
}
