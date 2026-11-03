export interface Finding {
  id: string; rule: string; severity: "critical" | "high" | "medium" | "low"; title: string;
  detail: string; fix: string; file?: string; line?: number; source: "quick" | "deep";
}
export interface ScanView { status: "running" | "done" | "failed"; findings: (Finding & { ignored: boolean })[]; summary: string; scannedAt: string }
export interface SecurityView { quick: ScanView | null; deep: ScanView | null }
export interface ScanRow { kind: "quick" | "deep"; status: ScanView["status"]; findings: Finding[]; summary: string; scanned_at: Date | string }
export interface SecurityRepository {
  scans(projectId: string): Promise<ScanRow[]>;
  ignored(projectId: string): Promise<string[]>;
  save(projectId: string, kind: "quick" | "deep", status: ScanView["status"], findings: Finding[], summary: string): Promise<void>;
  startDeep(projectId: string): Promise<boolean>;
  setIgnored(projectId: string, findingId: string, ignored: boolean): Promise<void>;
}
export interface SecurityPorts {
  readAllFiles(projectId: string): Promise<Record<string, string>>;
  quickScan(files: Record<string, string>): Finding[];
}
export function createSecurityService(repository: SecurityRepository, ports: SecurityPorts) {
  const mark = (findings: Finding[], ignored: string[]) => findings.map((f) => ({ ...f, ignored: ignored.includes(f.id) }));
  return {
    async getSecurity(projectId: string): Promise<SecurityView> {
      const [rows, ignored] = await Promise.all([repository.scans(projectId), repository.ignored(projectId)]);
      const view = (row?: ScanRow): ScanView | null => row ? { status: row.status, summary: row.summary, scannedAt: new Date(row.scanned_at).toISOString(), findings: mark(row.findings, ignored) } : null;
      return { quick: view(rows.find((r) => r.kind === "quick")), deep: view(rows.find((r) => r.kind === "deep")) };
    },
    saveScan: (p: string, k: "quick" | "deep", s: ScanView["status"], f: Finding[], summary = "") => repository.save(p, k, s, f, summary),
    startDeepScan: (p: string) => repository.startDeep(p),
    setIgnored: (p: string, f: string, ignored: boolean) => repository.setIgnored(p, f, ignored),
    async runQuickScan(projectId: string, files?: Record<string, string>) {
      const findings = ports.quickScan(files ?? await ports.readAllFiles(projectId));
      await repository.save(projectId, "quick", "done", findings, "");
      return mark(findings, await repository.ignored(projectId));
    },
  };
}
