import { readdir, readFile } from "node:fs/promises";
import { getHeapStatistics } from "node:v8";

const mb = (bytes: number) => Math.round(bytes / 1048576);

/** This Node process: resident memory, V8 heap and its limit, and memory outside the heap (WASM, buffers). */
export function processMemory() {
  const m = process.memoryUsage();
  return {
    rssMb: mb(m.rss),
    heapUsedMb: mb(m.heapUsed),
    heapTotalMb: mb(m.heapTotal),
    heapLimitMb: mb(getHeapStatistics().heap_size_limit),
    externalMb: mb(m.external),
    arrayBuffersMb: mb(m.arrayBuffers),
  };
}

/**
 * Resident memory of each root pid plus all its descendants, from /proc. A sandboxed JVM runs
 * under bubblewrap, so its own pid is a child of the one we spawned. Null where /proc is missing
 * (Windows, macOS) or the process is gone.
 */
export async function processTreeRssMb(roots: number[]): Promise<Map<number, number | null>> {
  const result = new Map<number, number | null>(roots.map((pid) => [pid, null]));
  if (process.platform !== "linux" || !roots.length) return result;
  const children = new Map<number, number[]>();
  const rss = new Map<number, number>();
  const entries = await readdir("/proc").catch(() => [] as string[]);
  await Promise.all(entries.filter((e) => /^\d+$/.test(e)).map(async (e) => {
    const status = await readFile(`/proc/${e}/status`, "utf8").catch(() => "");
    const ppid = Number(/^PPid:\s+(\d+)/m.exec(status)?.[1]);
    const kb = Number(/^VmRSS:\s+(\d+)/m.exec(status)?.[1] ?? 0);
    if (!status) return;
    rss.set(Number(e), kb);
    if (ppid) (children.get(ppid) ?? children.set(ppid, []).get(ppid)!).push(Number(e));
  }));
  for (const root of roots) {
    if (!rss.has(root)) continue;
    let total = 0;
    const stack = [root];
    const seen = new Set<number>();
    while (stack.length) {
      const pid = stack.pop()!;
      if (seen.has(pid)) continue;
      seen.add(pid);
      total += rss.get(pid) ?? 0;
      stack.push(...(children.get(pid) ?? []));
    }
    result.set(root, Math.round(total / 1024));
  }
  return result;
}
