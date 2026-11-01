import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import type { StepRecord, ToolCallRecord } from "./metrics.js";

/**
 * Optional export of agent runs to Langfuse, fed by the same records as metrics.ts:
 * one trace per agent run (id = runId), one generation per model call, one span per tool call.
 * Traces of the same turn share a Langfuse session (turnId), so a team turn reads as one unit.
 *
 * It only sends what metrics.ts already measures (model, tokens, cost, timing, sizes, ok):
 * no prompts, code or tool output leave the server.
 *
 * Uses the public ingestion API directly (no SDK): events are queued and sent in batches,
 * off the agent's path. Like metrics, it never throws and drops events rather than block.
 */

export interface LangfuseOptions {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
  /** How often queued events are sent. */
  flushMs?: number;
  /** Events kept while Langfuse is unreachable; older ones are dropped beyond this. */
  maxQueue?: number;
  fetch?: typeof fetch;
}

type Event = { id: string; timestamp: string; type: "trace-create" | "generation-create" | "span-create"; body: Record<string, unknown> };

const BATCH = 100;

export function createLangfuse(o: LangfuseOptions) {
  const doFetch = o.fetch ?? fetch;
  const maxQueue = o.maxQueue ?? 5000;
  const auth = "Basic " + Buffer.from(`${o.publicKey}:${o.secretKey}`).toString("base64");
  let queue: Event[] = [];
  let timer: NodeJS.Timeout | null = null;
  let warned = false;

  const push = (type: Event["type"], body: Record<string, unknown>) => {
    queue.push({ id: randomUUID(), timestamp: new Date().toISOString(), type, body });
    if (queue.length > maxQueue) queue = queue.slice(-maxQueue);
    if (queue.length >= BATCH) void flush();
    else if (!timer) {
      timer = setTimeout(() => void flush(), o.flushMs ?? 2000);
      timer.unref();
    }
  };

  async function flush() {
    if (timer) clearTimeout(timer);
    timer = null;
    while (queue.length) {
      const batch = queue.splice(0, BATCH);
      try {
        const res = await doFetch(`${o.baseUrl}/api/public/ingestion`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: auth },
          body: JSON.stringify({ batch }),
          signal: AbortSignal.timeout(10_000),
        });
        // 207: per-event results; a rejected event is a bug on our side, not worth a retry.
        if (!res.ok && res.status !== 207) throw new Error(`HTTP ${res.status}`);
      } catch (e) {
        if (!warned) console.warn(`[forja] Langfuse no acepta trazas (${(e as Error).message}); se descartan.`);
        warned = true;
        return;
      }
    }
  }

  const span = (endMs: number, ms: number | undefined) => ({
    startTime: new Date(endMs - (ms ?? 0)).toISOString(),
    endTime: new Date(endMs).toISOString(),
  });

  return {
    step(r: StepRecord) {
      if (r.step === 0) {
        push("trace-create", {
          id: r.runId,
          name: `agent:${r.role}`,
          sessionId: r.turnId,
          tags: [r.role],
          metadata: { projectId: r.projectId, turnId: r.turnId, taskId: r.taskId },
        });
      }
      push("generation-create", {
        id: randomUUID(),
        traceId: r.runId,
        name: `step ${r.step}`,
        ...span(Date.now(), r.ms),
        model: r.modelId,
        usageDetails: {
          input: r.usage.input,
          output: r.usage.output,
          cache_read_input_tokens: r.usage.cacheRead,
          cache_creation_input_tokens: r.usage.cacheWrite,
        },
        // Forja's own price (it knows OpenRouter and custom models; Langfuse may not).
        ...(r.usd !== undefined ? { costDetails: { total: r.usd } } : {}),
        metadata: { step: r.step, role: r.role },
      });
    },

    toolCall(r: ToolCallRecord) {
      // MCP calls come from an external client's run, which we don't trace.
      if (r.source !== "builder" || !r.runId) return;
      push("span-create", {
        id: randomUUID(),
        traceId: r.runId,
        name: r.tool,
        ...span(Date.now(), r.ms),
        level: r.ok ? "DEFAULT" : "ERROR",
        metadata: { step: r.step, role: r.role, inputChars: r.inputChars, resultChars: r.resultChars },
      });
    },

    flush,
  };
}

export type Langfuse = ReturnType<typeof createLangfuse>;

/** null when LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY are not set: tracing is off. */
export const langfuse: Langfuse | null =
  config.langfuse.publicKey && config.langfuse.secretKey ? createLangfuse(config.langfuse) : null;
