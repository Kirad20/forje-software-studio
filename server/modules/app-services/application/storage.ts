import type { StoragePorts } from "../ports/storage.js";
import { MAX_FILE_BYTES, safeStorageKey as safeKey } from "../domain/policies.js";
export { MAX_FILE_BYTES } from "../domain/policies.js";
export const MAX_PROJECT_STORAGE_BYTES = 1024 * 1024 * 1024;

export class StorageLimitError extends Error {
  status = 413;
}

/** Per-file cap and per-account free quota, matching the product limits. */
export interface StoredObject {
  key: string;
  filename: string;
  contentType: string;
  size: number;
}

export function createStorage({ one, q, newId, files }: StoragePorts) {
const writes = new Map<string, Promise<void>>();

async function putObject(
  projectId: string,
  data: Uint8Array,
  opts: { filename: string; contentType?: string; key?: string },
): Promise<StoredObject> {
  if (data.byteLength > MAX_FILE_BYTES) throw new StorageLimitError("El archivo supera 100 MB");
  const ext = files.extension(opts.filename).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const key = safeKey(opts.key ?? `${newId()}${ext}`);
  const previous = writes.get(projectId) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  writes.set(projectId, current);
  await previous;
  try {
    const existing = await one<{ size: number }>("storageGet", [projectId, key]);
    const usage = await one<{ bytes: number }>("storageUsage", [projectId]);
    if (!usage) throw new Error("No se pudo consultar el uso de almacenamiento");
    const nextUsage = Number(usage.bytes) - Number(existing?.size ?? 0) + data.byteLength;
    if (nextUsage > MAX_PROJECT_STORAGE_BYTES) {
      throw new StorageLimitError("El proyecto superó su cuota de almacenamiento de 1 GB");
    }
    await files.write(projectId, key, data);
    const obj = { key, filename: opts.filename, contentType: opts.contentType || "application/octet-stream", size: data.byteLength };
    await q("storagePut", [projectId, key, obj.filename, obj.contentType, obj.size]);
    return obj;
  } finally {
    release();
    if (writes.get(projectId) === current) writes.delete(projectId);
  }
}

async function getObject(projectId: string, key: string) {
  safeKey(key);
  const meta = await one<{ filename: string; content_type: string }>(
    "storageGet",
    [projectId, key],
  );
  if (!meta) return null;
  const data = await files.read(projectId, key);
  return data === null ? null : { data, contentType: meta.content_type, filename: meta.filename };
}

async function deleteObject(projectId: string, key: string) {
  await files.delete(projectId, safeKey(key));
  await q("storageDelete", [projectId, key]);
}

async function listObjects(projectId: string) {
  return q<StoredObject & { createdAt: string }>(
    "storageList",
    [projectId],
  );
}

async function storageUsage(projectId: string) {
  return (await one<{ bytes: number }>("storageUsage", [projectId]))!
    .bytes;
}
return { putObject, getObject, deleteObject, listObjects, storageUsage };
}
