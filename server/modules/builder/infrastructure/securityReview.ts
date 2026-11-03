import { createHash } from "node:crypto";
import { newId } from "../../../shared/crypto.js";
import { describeSchema } from "../../app-services/projectDb.js";
import type { Account } from "../../identity/contracts.js";
import { getProject, readAllFiles } from "./CoreModulesAdapter.js";
import { saveScan, startDeepScan } from "../../project-observability/security.js";
import type { Finding, Severity } from "../../app-runtime/index.js";
import { runAgent } from "./AgentExecutionAdapter.js";
import { projectMap } from "./projectIndex.js";
import { ROLE_PROMPTS, ROLE_TOOLS } from "./roles.js";
import { toolByName, type BuilderTool } from "./BuilderToolsAdapter.js";

/**
 * The deep security review: a read-only agent reads the whole app the way an attacker
 * would and reports concrete findings, which land next to the quick scan's in the
 * project's Security view. It runs in the background and spends the owner's credits.
 */

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];
const running = new Set<string>();

type Reported = { severity: Severity; title: string; file?: string; line?: number; detail: string; fix: string };

/** Starts a review unless one is already running. Resolves when it has been started, not finished. */
export async function startSecurityReview(account: Account, projectId: string): Promise<boolean> {
  if (running.has(projectId) || !(await startDeepScan(projectId))) return false;
  running.add(projectId);
  void runSecurityReview(account, projectId)
    .catch(async (e) => saveScan(projectId, "deep", "failed", [], `No se pudo terminar la revisión: ${(e as Error).message}`))
    .finally(() => running.delete(projectId));
  return true;
}

async function runSecurityReview(account: Account, projectId: string) {
  const project = (await getProject(projectId))!;
  const files = await readAllFiles(projectId);
  let report: { summary: string; findings: Reported[] } | null = null;

  const reportTool: BuilderTool = {
    name: "report_security",
    description: "Entrega el resultado de la revisión de seguridad, una sola vez y al terminar. Una lista vacía es válida si no hay problemas reales.",
    input_schema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Qué revisaste y la conclusión, en 1–3 frases para el dueño (en su idioma, sin jerga)." },
        findings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string", enum: SEVERITIES, description: "critical: cualquiera puede leer o cambiar datos de otros o robar secretos; high: con una cuenta normal; medium: abuso o fuga limitada; low: endurecimiento." },
              title: { type: "string", description: "El problema en una frase." },
              file: { type: "string", description: "Archivo donde está." },
              line: { type: "number" },
              detail: { type: "string", description: "Qué haría un atacante y qué conseguiría." },
              fix: { type: "string", description: "El arreglo concreto." },
            },
            required: ["severity", "title", "detail", "fix"],
          },
        },
      },
      required: ["summary", "findings"],
    },
    async run(input) {
      const i = input as { summary?: string; findings?: Reported[] };
      report = {
        summary: String(i.summary ?? ""),
        findings: (Array.isArray(i.findings) ? i.findings : []).filter((f) => SEVERITIES.includes(f.severity) && f.title),
      };
      return "Resultado recibido. Termina ahora.";
    },
  };

  const map = projectMap(files, await describeSchema(projectId, true));
  const r = await runAgent({
    scope: { accountId: project.ownerId, projectId },
    billing: { payerId: project.ownerId, projectId, source: "builder" },
    // Reviewing is QA's job class: the router picks a model as it does for the reviewer.
    role: "qa",
    routing: { complexity: 4, domains: ["backend", "security"], needsVision: false },
    system: ROLE_PROMPTS.security,
    messages: [{ role: "user", content: `${map}\n\nRevisa la seguridad de esta app y llama a report_security.` }],
    tools: [...ROLE_TOOLS.security.map((n) => toolByName.get(n)!), reportTool],
    ctx: { account, projectId, author: "builder", owned: [] },
    requiredTool: "report_security",
    maxSteps: 24,
    signal: new AbortController().signal,
    emit: () => {},
    turnId: `security-${newId()}`,
  });

  const got = report as { summary: string; findings: Reported[] } | null;
  if (!got) throw new Error(r.text.slice(0, 300) || "el agente no entregó el resultado");
  const findings: Finding[] = got.findings.map((f) => ({
    id: createHash("sha1").update(["deep", f.file ?? "", f.title].join("\0")).digest("hex").slice(0, 12),
    rule: "deep-review",
    severity: f.severity,
    title: String(f.title),
    detail: String(f.detail ?? ""),
    fix: String(f.fix ?? ""),
    file: f.file ? String(f.file) : undefined,
    line: typeof f.line === "number" ? f.line : undefined,
    source: "deep",
  }));
  await saveScan(projectId, "deep", "done", findings, got.summary);
}
