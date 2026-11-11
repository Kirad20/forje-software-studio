import { config } from "../../../shared/config.js";
import { processMemory, processTreeRssMb } from "../../../shared/memory.js";
import { projectDbStats } from "../../app-services/projectDb.js";
import { sandboxStats } from "./sandbox.js";

/**
 * What this process holds in memory: its own heap and RSS, open project databases, Node sandbox
 * processes and JVMs, each child with its resident memory where the OS exposes it. Every service
 * answers with the same shape; resources it does not own simply count zero.
 */
export async function localMemoryReport(service: string) {
  const sandboxes = sandboxStats();
  const languages = (await import("./languages.js")).springRuntime.snapshot();
  const pids = [...sandboxes.items, ...languages].map((p) => p.pid).filter((pid): pid is number => typeof pid === "number");
  const rss = await processTreeRssMb(pids);
  const rssOf = (pid: number | null) => (pid === null ? null : rss.get(pid) ?? null);
  return {
    service,
    pid: process.pid,
    uptimeS: Math.round(process.uptime()),
    process: processMemory(),
    projectDbs: projectDbStats(),
    sandboxes: { ...sandboxes, items: sandboxes.items.map((s) => ({ ...s, rssMb: rssOf(s.pid) })) },
    jvms: {
      processes: languages.length,
      maxProcesses: config.languages.maxProcesses,
      maxHeapMb: config.languages.javaMaxHeapMb,
      items: languages.map((j) => ({ ...j, rssMb: rssOf(j.pid) })),
    },
  };
}

export type MemoryReport = Awaited<ReturnType<typeof localMemoryReport>>;
