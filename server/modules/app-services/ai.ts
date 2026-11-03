export { createAi, AiUnavailableError } from "./application/ai.js";
export type { AppAiInput } from "./application/ai.js";
import { createAi } from "./application/ai.js";
import { aiPorts } from "./infrastructure/ai.js";
export const { appAiChat, aiUsage } = createAi(aiPorts);
