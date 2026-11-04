import type { EvaluationAccount } from "./resources.js";

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

export interface ToolContext {
  account: EvaluationAccount;
  projectId: string;
  author: "builder" | "mcp";
  wrote?: boolean;
  owned?: string[];
  actor?: string;
  written?: Set<string>;
  reads?: Map<string, string>;
}
type ToolOutput = string | { text: string; images: { media_type: string; data: string }[] };
export interface BuilderTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  call?(input: Record<string, unknown>, ctx: ToolContext): Promise<{ data: Record<string, unknown>; output: ToolOutput }>;
  run(input: Record<string, unknown>, ctx: ToolContext): Promise<ToolOutput>;
}

type Block =
  | { type: "text"; text: string; cache_control?: { type: "ephemeral" } }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "thinking"; thinking: string; signature: string }
  | { type: "redacted_thinking"; data: string };
type Role = "router" | "planner" | "data" | "backend" | "ui" | "qa" | "fast" | "chat" | "summarizer" | "app";
type PlaygroundRole = "fast" | "data" | "backend" | "ui" | "chat";

export interface EvaluationAgentSpec {
  scope: { accountId: string; projectId?: string | null };
  billing: { payerId: string; projectId: string | null; source: "builder" | "app" | "playground" };
  role: Role;
  routing: { complexity: number; domains: string[]; needsVision: boolean };
  system: string;
  messages: { role: "user" | "assistant"; content: string | Block[] }[];
  tools: BuilderTool[];
  ctx: ToolContext;
  maxSteps: number;
  signal: AbortSignal;
  emit(event: AgentEvent): void;
  taskId?: string;
  turnId: string;
  persist?: { projectId: string };
  requiredTool?: string;
  finishGate?: { check(): Promise<string | null> };
}

export interface AgentResult {
  text: string;
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number };
  usd: number;
  credits: number;
  steps: { tool: string; summary: string; ok: boolean }[];
  buildOk: boolean | null;
  testsOk: boolean | null;
  toolErrors: number;
  hitStepLimit: boolean;
  written: string[];
  gate: "passed" | "failed" | null;
  gateFixes: number;
}

export interface EvaluationBuilderPort {
  isBuilding(projectId: string): boolean;
  runBuilderTurn(
    account: EvaluationAccount, projectId: string, userText: string, emit: (event: AgentEvent) => void,
    attachments?: string[], mode?: "build" | "chat" | "plan", implementPlan?: boolean, opts?: { synthetic?: boolean },
  ): Promise<void>;
  stopBuilding(projectId: string): void;
  runAgent(spec: EvaluationAgentSpec): Promise<AgentResult>;
  createFinishGate(projectId: string, ctx: ToolContext): Promise<{ check(): Promise<string | null> }>;
  projectMap(files: Record<string, string>, schema?: Record<string, { name: string; type: string }[]>): string;
  MAX_STEPS: Record<PlaygroundRole, number>;
  ROLE_PROMPTS: Record<PlaygroundRole, string>;
  ROLE_TOOLS: Record<PlaygroundRole, string[]>;
  builderTools: BuilderTool[];
  toolByName: Map<string, BuilderTool>;
  readonly langfuse: {
    evalCase(result: { runId: string; caseId: string; size: string; repeat: number; turnId: string | null; scores: Record<string, number | null> }): void;
    flush(): Promise<void>;
  } | null;
}
