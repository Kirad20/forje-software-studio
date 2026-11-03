import { q } from "../../../platform/db.js";
import { readFile } from "../../../platform/projects.js";
import type { Block, Message } from "../domain/AgentExecution.js";

export async function save(projectId: string, msg: Message, turnId: string) {
  const content = typeof msg.content === "string" ? [{ type: "text", text: msg.content }] : msg.content;
  await q(`insert into chat_messages (project_id, role, content, turn_id) values ($1, $2, $3, $4)`, [projectId, msg.role, JSON.stringify(content), turnId]);
}

export async function loadHistory(projectId: string): Promise<(Message & { turnId: string | null; createdAt: string })[]> {
  const rows = await q<{ role: "user" | "assistant"; content: Block[]; turn_id: string | null; created_at: string }>(
    `select role, content, turn_id, created_at from chat_messages where project_id = $1 order by id`, [projectId],
  );
  return rows.map(r => ({ role: r.role, content: r.content, turnId: r.turn_id, createdAt: r.created_at }));
}

export const UPLOADS = "static/uploads/";
const IMAGE_TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" };

export async function imageBlocks(projectId: string, text: string): Promise<Block[]> {
  const out: Block[] = [];
  for (const [, path] of text.matchAll(/\[\[adjunto:([^\]]+)\]\]/g)) {
    const type = IMAGE_TYPES[path!.split(".").pop()!.toLowerCase()];
    const content = type ? await readFile(projectId, path!) : undefined;
    if (type && content?.startsWith("base64:")) out.push({ type: "image", source: { type: "base64", media_type: type, data: content.slice(7) } });
  }
  return out;
}
