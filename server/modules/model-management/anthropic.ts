import { anthropicChat as executeChat } from "./infrastructure/anthropic.js";
import type { LlmRequest, LlmResponse } from "./domain/messages.js";
export { resetAnthropicClient } from "./infrastructure/anthropic.js";
export function anthropicChat(model: string, request: LlmRequest): Promise<LlmResponse> {
  return executeChat(model, request);
}
