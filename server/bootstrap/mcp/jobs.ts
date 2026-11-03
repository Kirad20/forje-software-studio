import { randomBytes } from "node:crypto";

/**
 * Long tool calls as jobs, the way Floot's MCP does it: a call answers inline when it is
 * quick, otherwise it returns a jobId and keeps running; get_job_status long-polls it.
 * MCP clients time out long requests (often around a minute), so a browser walk or a
 * publish that takes longer would otherwise be lost even though it finished.
 *
 * Jobs live in this process (the platform database is embedded, so there is one).
 * A restart forgets running jobs: the agent is told to call the tool again.
 */
export interface CallResult {
  [key: string]: unknown;
  content: ({ type: "text"; text: string } | { type: "image"; data: string; mimeType: string })[];
  isError: boolean;
}

interface Job {
  id: string;
  accountId: string;
  tool: string;
  startedAt: number;
  finishedAt?: number;
  result?: CallResult;
  settled: Promise<void>;
}

const jobs = new Map<string, Job>();
/** Finished jobs are kept this long for a late poll. */
const KEEP_MS = 60 * 60_000;
export const MAX_WAIT_SECONDS = 25;

/** structuredContent of a deferred call, so typed tools still match their outputSchema. */
export const PENDING_SCHEMA = {
  type: "object",
  properties: { status: { type: "string", enum: ["pending"] }, jobId: { type: "string" } },
  required: ["status", "jobId"],
  additionalProperties: false,
};

export const inlineMs = () => Number(process.env.FORJA_MCP_INLINE_MS ?? 20_000);

const fail = (text: string): CallResult => ({ content: [{ type: "text", text }], isError: true });

function sweep(now = Date.now()) {
  for (const [id, j] of jobs) if (j.finishedAt && now - j.finishedAt > KEEP_MS) jobs.delete(id);
}

/** Runs `work`; answers with its result if it settles within `waitMs`, else with a jobId. */
export async function runOrDefer(accountId: string, tool: string, work: () => Promise<CallResult>, waitMs = inlineMs()): Promise<CallResult> {
  sweep();
  const job: Job = { id: `job_${randomBytes(9).toString("base64url")}`, accountId, tool, startedAt: Date.now(), settled: Promise.resolve() };
  job.settled = work()
    .catch((e: unknown) => fail(`Error: ${(e as Error).message}`))
    .then((r) => {
      job.result = r;
      job.finishedAt = Date.now();
    });
  let timer: NodeJS.Timeout | undefined;
  await Promise.race([job.settled, new Promise<void>((r) => (timer = setTimeout(r, waitMs)))]);
  clearTimeout(timer);
  if (job.result) return job.result;
  jobs.set(job.id, job);
  return {
    content: [
      {
        type: "text",
        text: `PENDING jobId=${job.id}\n${tool} sigue en curso. Llama get_job_status({ jobId: "${job.id}", wait_seconds: ${MAX_WAIT_SECONDS} }) hasta tener el resultado. Mientras tanto puedes usar otras tools: este job no las bloquea.`,
      },
    ],
    structuredContent: { status: "pending", jobId: job.id },
    isError: false,
  };
}

/** The job's result, waiting up to `waitSeconds` for it; or a "still running" note. */
export async function jobStatus(accountId: string, jobId: string, waitSeconds = 0): Promise<CallResult> {
  const job = jobs.get(jobId);
  if (!job || job.accountId !== accountId) {
    return fail(`Job desconocido: ${jobId}. Puede que haya expirado o que el servidor se reiniciara; si aún necesitas el resultado, vuelve a llamar la tool original.`);
  }
  if (!job.result && waitSeconds > 0) {
    let timer: NodeJS.Timeout | undefined;
    await Promise.race([job.settled, new Promise<void>((r) => (timer = setTimeout(r, Math.min(waitSeconds, MAX_WAIT_SECONDS) * 1000)))]);
    clearTimeout(timer);
  }
  if (job.result) return job.result;
  const secs = Math.round((Date.now() - job.startedAt) / 1000);
  return { content: [{ type: "text", text: `RUNNING jobId=${job.id}: ${job.tool} lleva ${secs} s. Vuelve a llamar get_job_status.` }], isError: false };
}
