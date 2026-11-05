import type { ChatStreamEvent } from "./contracts.js";

type FusionEvent = Extract<ChatStreamEvent, { type: "fusion_step" | "fusion_done" }>;
const PHASES = { draft: "Propuesta", judge: "Validación", critic: "Revisión", revision: "Corrección", escalation: "Escalación" };

export function fusionDisplay(event: FusionEvent) {
  if (event.type === "fusion_step") {
    const s = event.step;
    const context = s.context ? ` · ~${s.context.estimatedInputTokens} tokens entrada · ${s.context.messages} mensajes · ${s.context.requestedFileCount} archivos` : "";
    return { id: `fusion-${s.id}`, name: "fusion_step", summary: `${PHASES[s.phase]} · ${s.modelId} · ${Math.round(s.ms)} ms · $${s.usd.toFixed(4)}${context}`, state: s.error ? "err" as const : "ok" as const };
  }
  return {
    id: `fusion-${event.operationId}-done`, name: "fusion_done",
    summary: `${event.pattern} · $${event.usd.toFixed(4)} · ${event.credits} créditos`,
    state: "ok" as const, ...(event.warnings.length ? { output: event.warnings.join("\n") } : {}),
  };
}
