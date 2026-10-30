import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { paths } from "../config.js";
import { newId } from "../lib/crypto.js";
import { one, q } from "../platform/db.js";

/** Per-file cap and per-account free quota, matching the product limits. */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;

const safeKey = (key: string) => {
  if (!/^[A-Za-z0-9._\-/]+$/.test(key) || key.includes("..")) throw new Error("Clave de archivo no válida");
  return key;
};

const filePath = (projectId: string, key: string) => path.join(paths.projectStorage(projectId), safeKey(key));

export interface StoredObject {
  key: string;
  filename: string;
  contentType: string;
  size: number;
}

export async function putObject(
  projectId: string,
  data: Uint8Array,
  opts: { filename: string; contentType?: string; key?: string },
): Promise<StoredObject> {
  if (data.byteLength > MAX_FILE_BYTES) throw new Error("El archivo supera 100 MB");
  const ext = path.extname(opts.filename).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const key = safeKey(opts.key ?? `${newId()}${ext}`);
  const full = filePath(projectId, key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
  const obj = { key, filename: opts.filename, contentType: opts.contentType || "application/octet-stream", size: data.byteLength };
  await q(
    `insert into storage_objects (project_id, key, filename, content_type, size) values ($1, $2, $3, $4, $5)
     on conflict (project_id, key) do update set filename = excluded.filename, content_type = excluded.content_type, size = excluded.size, created_at = now()`,
    [projectId, key, obj.filename, obj.contentType, obj.size],
  );
  return obj;
}

export async function getObject(projectId: string, key: string) {
  const meta = await one<{ filename: string; content_type: string }>(
    `select filename, content_type from storage_objects where project_id = $1 and key = $2`,
    [projectId, key],
  );
  if (!meta) return null;
  try {
    const full = filePath(projectId, key);
    await stat(full);
    return { data: await readFile(full), contentType: meta.content_type, filename: meta.filename };
  } catch {
    return null;
  }
}

export async function deleteObject(projectId: string, key: string) {
  await rm(filePath(projectId, key), { force: true });
  await q(`delete from storage_objects where project_id = $1 and key = $2`, [projectId, key]);
}

export async function listObjects(projectId: string) {
  return q<StoredObject & { createdAt: string }>(
    `select key, filename, content_type as "contentType", size, created_at as "createdAt" from storage_objects where project_id = $1 order by created_at desc`,
    [projectId],
  );
}

export async function storageUsage(projectId: string) {
  return (await one<{ bytes: number }>(`select coalesce(sum(size), 0)::int as bytes from storage_objects where project_id = $1`, [projectId]))!
    .bytes;
}
