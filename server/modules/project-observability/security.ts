import { createSecurityService, type SecurityPorts } from "./application/security.js";
import { securityRepository } from "./infrastructure/security.js";
export * from "./application/security.js";
let bound: SecurityPorts | undefined;
let binding: symbol | undefined;
let closing = false;
const scans = new Map<symbol, Set<Promise<unknown>>>();
export function bindSecurityPorts(ports: SecurityPorts): () => Promise<void> {
  const token = Symbol();
  bound = ports;
  binding = token;
  closing = false;
  let cleanup: Promise<void> | undefined;
  return () => {
    if (binding !== token) return Promise.resolve();
    if (cleanup) return cleanup;
    closing = true;
    cleanup = Promise.allSettled([...(scans.get(token) ?? [])]).then(() => {
      scans.delete(token);
      if (binding !== token) return;
      bound = undefined;
      binding = undefined;
      closing = false;
    });
    return cleanup;
  };
}
function ports(): SecurityPorts { if (!bound || closing) throw new Error("Security ports not bound"); return bound; }
const service = createSecurityService(securityRepository, {
  readAllFiles: (p) => ports().readAllFiles(p), quickScan: (files) => ports().quickScan(files),
});
export const { getSecurity, saveScan, startDeepScan, setIgnored } = service;
export async function runQuickScan(projectId: string, files?: Record<string, string>) {
  const captured = ports(), token = binding!;
  const work = createSecurityService(securityRepository, captured).runQuickScan(projectId, files);
  let active = scans.get(token);
  if (!active) { active = new Set(); scans.set(token, active); }
  active.add(work);
  try { return await work; } finally { active.delete(work); if (!active.size) scans.delete(token); }
}
