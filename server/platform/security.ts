import { one, q } from "./db.js";
import { readAllFiles } from "./projects.js";
import { quickScan, type Finding } from "../runtime/securityScan.js";

/** A project's security status: the latest quick and deep scans, with ignored findings marked. */
export interface ScanView {
  status: "running" | "done" | "failed";
  findings: (Finding & { ignored: boolean })[];
  summary: string;
  scannedAt: string;
}

export interface SecurityView {
  quick: ScanView | null;
  deep: ScanView | null;
}

type Row = { kind: "quick" | "deep"; status: ScanView["status"]; findings: Finding[]; summary: string; scanned_at: Date | string };

async function ignoredIds(projectId: string) {
  return new Set((await q<{ finding_id: string }>(`select finding_id from security_ignores where project_id = $1`, [projectId])).map((r) => r.finding_id));
}

export async function getSecurity(projectId: string): Promise<SecurityView> {
  const rows = await q<Row>(`select kind, status, findings, summary, scanned_at from security_scans where project_id = $1`, [projectId]);
  const ignored = await ignoredIds(projectId);
  const view = (r: Row | undefined): ScanView | null =>
    r ? { status: r.status, summary: r.summary, scannedAt: new Date(r.scanned_at).toISOString(), findings: r.findings.map((f) => ({ ...f, ignored: ignored.has(f.id) })) } : null;
  return { quick: view(rows.find((r) => r.kind === "quick")), deep: view(rows.find((r) => r.kind === "deep")) };
}

export async function saveScan(projectId: string, kind: "quick" | "deep", status: ScanView["status"], findings: Finding[], summary = "") {
  await q(
    `insert into security_scans (project_id, kind, status, findings, summary, scanned_at) values ($1, $2, $3, $4, $5, now())
     on conflict (project_id, kind) do update set status = excluded.status, findings = excluded.findings, summary = excluded.summary, scanned_at = now()`,
    [projectId, kind, status, JSON.stringify(findings), summary],
  );
}

/** Marks a deep review as started, unless one is already running. */
export async function startDeepScan(projectId: string): Promise<boolean> {
  const row = await one<{ status: string }>(`select status from security_scans where project_id = $1 and kind = 'deep'`, [projectId]);
  if (row?.status === "running") return false;
  const prev = await one<{ findings: Finding[] }>(`select findings from security_scans where project_id = $1 and kind = 'deep'`, [projectId]);
  await saveScan(projectId, "deep", "running", prev?.findings ?? [], "Revisando el código…");
  return true;
}

export async function setIgnored(projectId: string, findingId: string, ignored: boolean) {
  if (ignored) await q(`insert into security_ignores (project_id, finding_id) values ($1, $2) on conflict do nothing`, [projectId, findingId]);
  else await q(`delete from security_ignores where project_id = $1 and finding_id = $2`, [projectId, findingId]);
}

/** Runs the quick scan on the current files (or the given snapshot), saves it, and returns the open findings. */
export async function runQuickScan(projectId: string, files?: Record<string, string>): Promise<(Finding & { ignored: boolean })[]> {
  const findings = quickScan(files ?? (await readAllFiles(projectId)));
  await saveScan(projectId, "quick", "done", findings);
  const ignored = await ignoredIds(projectId);
  return findings.map((f) => ({ ...f, ignored: ignored.has(f.id) }));
}
