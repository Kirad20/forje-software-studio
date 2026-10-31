import { randomBytes } from "node:crypto";
import { one, q } from "./db.js";
import { findSecret } from "../runtime/securityScan.js";

/**
 * Facts the builder keeps between conversations, instead of re-learning them from the chat:
 * preferences, design decisions, approaches the owner rejected and business data. Project
 * memories are shared by the project's editors; personal ones follow one person everywhere.
 * Both can be read, edited and switched off in the studio.
 */
export type MemoryScope = "project" | "personal";
export type MemoryKind = "preference" | "decision" | "rejected" | "business";
export type MemorySource = "agent" | "owner" | "summary";

export interface Memory {
  id: string;
  scope: MemoryScope;
  kind: MemoryKind;
  text: string;
  source: MemorySource;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryView {
  project: Memory[];
  personal: Memory[];
  projectEnabled: boolean;
  personalEnabled: boolean;
}

export const MEMORY_KINDS: MemoryKind[] = ["preference", "decision", "rejected", "business"];
const KIND_LABEL: Record<MemoryKind, string> = { preference: "Preferencia", decision: "Decisión", rejected: "Descartado", business: "Negocio" };
const LIMIT: Record<MemoryScope, number> = { project: 80, personal: 40 };
export const MAX_MEMORY_CHARS = 300;

const COLS = `id, scope, kind, text, source, created_at as "createdAt", updated_at as "updatedAt"`;
const normal = (t: string) => t.toLowerCase().replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim();

export async function memorySettings(projectId: string, accountId: string) {
  const p = await one<{ on: boolean }>(`select memory_enabled as on from projects where id = $1`, [projectId]);
  const a = await one<{ on: boolean }>(`select memory_enabled as on from accounts where id = $1`, [accountId]);
  return { projectEnabled: p?.on ?? true, personalEnabled: a?.on ?? true };
}

export async function setMemoryEnabled(projectId: string, accountId: string, patch: { project?: boolean; personal?: boolean }) {
  if (typeof patch.project === "boolean") await q(`update projects set memory_enabled = $2 where id = $1`, [projectId, patch.project]);
  if (typeof patch.personal === "boolean") await q(`update accounts set memory_enabled = $2 where id = $1`, [accountId, patch.personal]);
}

export async function listMemories(projectId: string, accountId: string): Promise<MemoryView> {
  const project = await q<Memory>(`select ${COLS} from memories where scope = 'project' and project_id = $1 order by created_at`, [projectId]);
  const personal = await q<Memory>(`select ${COLS} from memories where scope = 'personal' and account_id = $1 order by created_at`, [accountId]);
  return { project, personal, ...(await memorySettings(projectId, accountId)) };
}

/** Checks a memory's text; returns it trimmed or throws a message the agent or owner can act on. */
function cleanText(text: string) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!t) throw new Error("La memoria está vacía.");
  if (t.length > MAX_MEMORY_CHARS) throw new Error(`Demasiado larga (${t.length} caracteres, máximo ${MAX_MEMORY_CHARS}). Guarda un solo hecho, corto.`);
  const secret = findSecret(t);
  if (secret) throw new Error(`Parece una ${secret}: los secretos van en Secretos, nunca en la memoria.`);
  return t;
}

function assertKind(kind: string): asserts kind is MemoryKind {
  if (!MEMORY_KINDS.includes(kind as MemoryKind)) throw new Error(`Tipo no válido: ${kind}. Usa ${MEMORY_KINDS.join(", ")}.`);
}

/**
 * Saves one fact. The same text again only refreshes it, so repeating a preference does not
 * pile up copies. Returns the memory and whether it was new.
 */
export async function addMemory(
  projectId: string,
  accountId: string,
  m: { scope: MemoryScope; kind: string; text: string; source: MemorySource },
): Promise<{ memory: Memory; created: boolean }> {
  assertKind(m.kind);
  const text = cleanText(m.text);
  const owner = m.scope === "project" ? `project_id = $1` : `account_id = $1`;
  const key = m.scope === "project" ? projectId : accountId;
  const existing = await q<Memory>(`select ${COLS} from memories where scope = $2 and ${owner}`, [key, m.scope]);
  const same = existing.find((e) => normal(e.text) === normal(text));
  if (same) {
    const memory = (await one<Memory>(`update memories set kind = $2, updated_at = now() where id = $1 returning ${COLS}`, [same.id, m.kind]))!;
    return { memory, created: false };
  }
  if (existing.length >= LIMIT[m.scope]) {
    throw new Error(`La memoria ${m.scope === "project" ? "del proyecto" : "personal"} está llena (${LIMIT[m.scope]}). Borra o fusiona las que ya no sirvan.`);
  }
  const memory = (await one<Memory>(
    `insert into memories (id, scope, project_id, account_id, kind, text, source) values ($1, $2, $3, $4, $5, $6, $7) returning ${COLS}`,
    [randomBytes(5).toString("hex"), m.scope, m.scope === "project" ? projectId : null, accountId, m.kind, text, m.source],
  ))!;
  return { memory, created: true };
}

/** Only memories this person can see from this project: the project's, and their own personal ones. */
const visible = `id = $1 and ((scope = 'project' and project_id = $2) or (scope = 'personal' and account_id = $3))`;

export async function updateMemory(projectId: string, accountId: string, id: string, patch: { kind?: string; text?: string }) {
  if (patch.kind !== undefined) assertKind(patch.kind);
  const text = patch.text !== undefined ? cleanText(patch.text) : undefined;
  return one<Memory>(
    `update memories set kind = coalesce($4, kind), text = coalesce($5, text), updated_at = now() where ${visible} returning ${COLS}`,
    [id, projectId, accountId, patch.kind ?? null, text ?? null],
  );
}

export async function deleteMemory(projectId: string, accountId: string, id: string) {
  return (await q<{ id: string }>(`delete from memories where ${visible} returning id`, [id, projectId, accountId])).length > 0;
}

/**
 * The block added to every agent's system prompt in a turn: what to keep in mind, with ids
 * so the agent can correct or forget a memory. Empty when there is nothing or it is off.
 */
export async function memorySection(projectId: string, accountId: string) {
  const v = await listMemories(projectId, accountId);
  const line = (m: Memory) => `- [${m.id}] ${KIND_LABEL[m.kind]}: ${m.text}`;
  const parts = [];
  if (v.projectEnabled && v.project.length) parts.push(`## Del proyecto (compartida con quien lo edita)\n${v.project.map(line).join("\n")}`);
  if (v.personalEnabled && v.personal.length) parts.push(`## Personal (de quien escribe ahora, en todos sus proyectos)\n${v.personal.map(line).join("\n")}`);
  if (!parts.length) return "";
  return `# Memoria\nLo que se guardó en conversaciones anteriores. Tenlo en cuenta sin que te lo repitan; si algo cambió, corrígelo con remember (replaces) o forget.\n${parts.join("\n\n")}`;
}
