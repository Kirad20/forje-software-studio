export type ChatStreamEvent =
  | { type: "route"; fastPath?: boolean }
  | {
      type: "plan";
      tasks: { id: string; role: string; goal: string; dependsOn: string[]; doneWhen?: string[] }[];
    }
  | { type: "task_start"; taskId: string; role: string; model?: string | null }
  | { type: "task_end"; taskId: string; ok: boolean; usd?: number; tokens?: number; summary?: string }
  | { type: "review"; ok: boolean; summary: string; issues: { role: string; problem: string }[] }
  | { type: "done"; usd: number; baselineUsd: number; cachedTokens: number }
  | { type: "text"; taskId?: string; text: string }
  | { type: "tool_start"; taskId?: string; id: string; name: string; summary: string }
  | { type: "tool_end"; taskId?: string; id: string; ok: boolean; output?: string }
  | { type: "error"; message: string };
