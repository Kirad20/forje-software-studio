export type Block =
  | { type: "text"; text: string; cache_control?: { type: "ephemeral" } }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "thinking"; thinking: string; signature: string }
  | { type: "redacted_thinking"; data: string };

export interface Message {
  role: "user" | "assistant";
  content: string | Block[];
}
export interface Usage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}
export interface ExecutionModel {
  id: string;
  model: string;
  vision: boolean;
  context?: number;
}
export interface ExecutionContext {
  projectId: string;
  account: { id: string };
  actor?: string;
  wrote?: boolean;
  written?: Set<string>;
  reads?: Map<string, string>;
}
export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}
export interface ExecutionTool<C extends ExecutionContext> extends ToolDefinition {
  run(input: Record<string, unknown>, context: C): Promise<string | { text: string; images: { media_type: string; data: string }[] }>;
}
export type AgentEvent =
  | { type: "route"; fastPath: boolean; features: unknown; mode?: string }
  | { type: "plan"; summary: string; tasks: { id: string; role: string; goal: string; files: string[]; dependsOn: string[]; doneWhen?: string[] }[] }
  | { type: "task_start"; taskId: string; role: string; model: string; reason: string }
  | { type: "task_end"; taskId: string; ok: boolean; summary: string; usd: number; tokens: number }
  | { type: "review"; ok: boolean; summary: string; issues: { role: string; problem: string }[] }
  | { type: "text"; text: string; taskId?: string }
  | { type: "tool_start"; id: string; name: string; summary: string; taskId?: string }
  | { type: "tool_end"; id: string; ok: boolean; output: string; taskId?: string }
  | { type: "done"; credits: number; usd: number; baselineUsd: number; cachedTokens: number }
  | { type: "error"; message: string };

export interface AgentExecutionSpec<M extends ExecutionModel, C extends ExecutionContext> {
  role: string;
  system?: string;
  messages: Message[];
  tools: ExecutionTool<C>[];
  ctx: C;
  maxSteps: number;
  signal: { readonly aborted: boolean };
  emit(event: AgentEvent): void;
  taskId?: string;
  turnId: string;
  persist?: { projectId: string };
  requiredTool?: string;
  onModel?(model: M, reason: string): void | Promise<void>;
  finishGate?: { check(): Promise<string | null> };
}
export interface AgentExecutionResult<M extends ExecutionModel = ExecutionModel> {
  text: string;
  model: M | null;
  usage: Usage;
  usd: number;
  credits: number;
  steps: { tool: string; summary: string; ok: boolean; output?: string }[];
  buildOk: boolean | null;
  testsOk: boolean | null;
  toolErrors: number;
  hitStepLimit: boolean;
  written: string[];
  gate: "passed" | "failed" | null;
  gateFixes: number;
}
export const emptyUsage = (): Usage => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
export const addUsage = (a: Usage, b: Usage): Usage => ({
  input: a.input + b.input, output: a.output + b.output,
  cacheRead: a.cacheRead + b.cacheRead, cacheWrite: a.cacheWrite + b.cacheWrite,
});
