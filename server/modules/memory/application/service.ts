export type MemoryScope = "project" | "personal";
export type MemoryKind = "preference" | "decision" | "rejected" | "business";
export type MemorySource = "agent" | "owner" | "summary";
export interface Memory {
  id: string; scope: MemoryScope; kind: MemoryKind; text: string; source: MemorySource; createdAt: string; updatedAt: string;
}
export interface MemoryView { project: Memory[]; personal: Memory[]; projectEnabled: boolean; personalEnabled: boolean }
export const MEMORY_KINDS: MemoryKind[] = ["preference", "decision", "rejected", "business"];
export const MAX_MEMORY_CHARS = 300;
const labels: Record<MemoryKind, string> = { preference: "Preferencia", decision: "Decisión", rejected: "Descartado", business: "Negocio" };
const limits: Record<MemoryScope, number> = { project: 80, personal: 40 };
const normal = (t: string) => t.toLowerCase().replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim();
export interface MemoryRepository {
  settings(projectId: string, accountId: string): Promise<{ projectEnabled: boolean; personalEnabled: boolean }>;
  setEnabled(projectId: string, accountId: string, patch: { project?: boolean; personal?: boolean }): Promise<void>;
  list(projectId: string, accountId: string, scope: MemoryScope): Promise<Memory[]>;
  refresh(id: string, kind: MemoryKind): Promise<Memory>;
  insert(memory: { id: string; scope: MemoryScope; projectId: string | null; accountId: string; kind: MemoryKind; text: string; source: MemorySource }): Promise<Memory>;
  update(projectId: string, accountId: string, id: string, patch: { kind?: MemoryKind; text?: string }): Promise<Memory | null | undefined>;
  delete(projectId: string, accountId: string, id: string): Promise<boolean>;
}
export function createMemoryService(repository: MemoryRepository, newId: () => string, findSecret: (text: string) => string | null) {
  function assertKind(kind: string): asserts kind is MemoryKind {
    if (!MEMORY_KINDS.includes(kind as MemoryKind)) throw new Error(`Tipo no válido: ${kind}. Usa ${MEMORY_KINDS.join(", ")}.`);
  }
  function cleanText(text: string) {
    const t = String(text ?? "").replace(/\s+/g, " ").trim();
    if (!t) throw new Error("La memoria está vacía.");
    if (t.length > MAX_MEMORY_CHARS) throw new Error(`Demasiado larga (${t.length} caracteres, máximo ${MAX_MEMORY_CHARS}). Guarda un solo hecho, corto.`);
    const secret = findSecret(t);
    if (secret) throw new Error(`Parece una ${secret}: los secretos van en Secretos, nunca en la memoria.`);
    return t;
  }
  async function listMemories(projectId: string, accountId: string): Promise<MemoryView> {
    const [project, personal, settings] = await Promise.all([repository.list(projectId, accountId, "project"), repository.list(projectId, accountId, "personal"), repository.settings(projectId, accountId)]);
    return { project, personal, ...settings };
  }
  return {
    memorySettings: (p: string, a: string) => repository.settings(p, a),
    setMemoryEnabled: (p: string, a: string, patch: { project?: boolean; personal?: boolean }) => repository.setEnabled(p, a, patch),
    listMemories,
    async addMemory(projectId: string, accountId: string, m: { scope: MemoryScope; kind: string; text: string; source: MemorySource }): Promise<{ memory: Memory; created: boolean }> {
      if (m.scope !== "project" && m.scope !== "personal") throw new Error("Ámbito de memoria no válido.");
      assertKind(m.kind);
      if (!["agent", "owner", "summary"].includes(m.source)) throw new Error("Origen de memoria no válido.");
      const text = cleanText(m.text);
      const existing = await repository.list(projectId, accountId, m.scope);
      const same = existing.find((e) => normal(e.text) === normal(text));
      if (same) return { memory: await repository.refresh(same.id, m.kind), created: false };
      if (existing.length >= limits[m.scope]) throw new Error(`La memoria ${m.scope === "project" ? "del proyecto" : "personal"} está llena (${limits[m.scope]}). Borra o fusiona las que ya no sirvan.`);
      return { memory: await repository.insert({ id: newId(), scope: m.scope, projectId: m.scope === "project" ? projectId : null, accountId, kind: m.kind, text, source: m.source }), created: true };
    },
    updateMemory(projectId: string, accountId: string, id: string, patch: { kind?: string; text?: string }) {
      if (patch.kind !== undefined) assertKind(patch.kind);
      return repository.update(projectId, accountId, id, { kind: patch.kind as MemoryKind | undefined, text: patch.text === undefined ? undefined : cleanText(patch.text) });
    },
    deleteMemory: (p: string, a: string, id: string) => repository.delete(p, a, id),
    async memorySection(p: string, a: string) {
      const v = await listMemories(p, a);
      const line = (m: Memory) => `- [${m.id}] ${labels[m.kind]}: ${m.text}`;
      const parts: string[] = [];
      if (v.projectEnabled && v.project.length) parts.push(`## Del proyecto (compartida con quien lo edita)\n${v.project.map(line).join("\n")}`);
      if (v.personalEnabled && v.personal.length) parts.push(`## Personal (de quien escribe ahora, en todos sus proyectos)\n${v.personal.map(line).join("\n")}`);
      return parts.length ? `# Memoria\nLo que se guardó en conversaciones anteriores. Tenlo en cuenta sin que te lo repitan; si algo cambió, corrígelo con remember (replaces) o forget.\n${parts.join("\n\n")}` : "";
    },
  };
}
