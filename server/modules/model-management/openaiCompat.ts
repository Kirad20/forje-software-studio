import { compatChat as executeChat } from "./infrastructure/openaiCompat.js";
import type { LlmRequest, LlmResponse } from "./domain/messages.js";
import type { CompatEndpoint } from "./domain/models.js";
export type { CompatEndpoint } from "./domain/models.js";
export function compatChat(endpoint: CompatEndpoint, model: string, request: LlmRequest): Promise<LlmResponse> {
  return executeChat(endpoint, model, request);
}
