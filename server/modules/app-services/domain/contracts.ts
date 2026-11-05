export type AppEnv = "preview" | "published";
export interface AppUser { id: string; email: string; name: string | null; role: string }
export interface EmailInput { to: string | string[]; subject: string; html: string; from?: string }
export interface EmailResult { to: string; intendedTo: string; redirected: boolean; status: string }
export interface StoredObject { key: string; filename: string; contentType: string; size: number }
export type AiBlock =
  | { type: "text"; text: string; cache_control?: { type: "ephemeral" } }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "thinking"; thinking: string; signature: string }
  | { type: "redacted_thinking"; data: string };
export interface AppAiInput {
  messages: { role: "user" | "assistant"; content: string | AiBlock[] }[];
  system?: string; model?: string;
  tools?: { name: string; description: string; input_schema: Record<string, unknown> }[];
  maxTokens?: number;
}
export interface AiUsage { input: number; cacheRead: number; cacheWrite?: number; output: number }
export interface AiContextMetrics {
  estimatedInputTokens: number; systemTokens: number; historyTokens: number; toolSchemaTokens: number; framingTokens: number;
  systemBytes: number; historyBytes: number; toolSchemaBytes: number; messages: number; images: number;
  toolCalls: number; toolResults: number; toolResultBytes: number; fileReadCalls: number; requestedFileCount: number; fileToolResultBytes: number;
}
export interface AiFusionTrace {
  operationId: string;
  effort: "standard" | "high" | "max" | "fast";
  pattern: "single" | "cascade" | "critique";
  warnings: string[];
  steps: { id: string; phase: "draft" | "judge" | "critic" | "revision" | "escalation"; modelId: string; servedBy?: string; effort: "low" | "medium" | "high"; ms: number; usage: AiUsage; usd: number; credits: number; error?: string; context?: AiContextMetrics }[];
}
export interface AppAiResult {
  text: string; content: AiBlock[]; stopReason: "tool_use" | "end" | "max_tokens" | "refusal"; credits: number; model: string;
  usage: AiUsage; usd?: number; fusion?: AiFusionTrace;
}
export interface CheckoutInput {
  mode?: "payment" | "subscription";
  lineItems: { name: string; amountCents: number; currency?: string; quantity?: number; interval?: "month" | "year" }[];
  successUrl: string; cancelUrl: string; customerEmail?: string; metadata?: Record<string, string>;
}
