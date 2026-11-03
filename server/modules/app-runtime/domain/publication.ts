export type FileMap = Record<string, string>;
export type Author = "owner" | "builder" | "mcp" | "github" | "system";
export interface BuildProblem { file: string; line?: number; column?: number; text: string }
export interface PublicationFinding { severity: string; ignored?: boolean; title: string; file?: string; line?: number; fix: string; id?: string; detail?: string }

export function suggestSlug(name: string) {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "app";
}

export const reservedSlug = (slug: string) => slug.startsWith("pv-") || ["www", "api", "app", "studio", "mcp"].includes(slug);
export function validateSlug(slug: string) {
  if (!/^[a-z0-9][a-z0-9-]{1,39}$/.test(slug)) throw new Error("Dirección no válida: usa minúsculas, números y guiones.");
  if (reservedSlug(slug)) throw new Error(`La dirección "${slug}" está reservada. Prueba otra.`);
}

export const formatProblem = (p: BuildProblem) => `${p.file}${p.line ? `:${p.line}:${p.column ?? 0}` : ""} — ${p.text}`;
export function assertPublishable(problems: BuildProblem[], findings: PublicationFinding[] = []) {
  if (problems.length) throw new Error(`No se publicó: la app tiene errores.\n${problems.map(formatProblem).join("\n")}`);
  const critical = findings.filter((f) => f.severity === "critical" && !f.ignored);
  if (critical.length) throw new Error(`No se publicó: hay problemas de seguridad críticos.\n${critical.map((f) => `[CRÍTICO] ${f.title}${f.file ? ` (${f.file}${f.line ? `:${f.line}` : ""})` : ""} — ${f.detail ?? ""} Arreglo: ${f.fix} [id ${f.id ?? ""}]`).join("\n")}`);
}
