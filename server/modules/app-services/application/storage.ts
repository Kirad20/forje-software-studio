import type { StoragePorts } from "../ports/storage.js";
import { MAX_FILE_BYTES, safeStorageKey as safeKey } from "../domain/policies.js";
export { MAX_FILE_BYTES } from "../domain/policies.js";

/** Per-file cap and per-account free quota, matching the product limits. */
export interface StoredObject {
  key: string;
  filename: string;
  contentType: string;
  size: number;
}

export function createStorage({ one, q, newId, files }: StoragePorts) {
async function putObject(
  projectId: string,
  data: Uint8Array,
  opts: { filename: string; contentType?: string; key?: string },
): Promise<StoredObject> {
  if (data.byteLength > MAX_FILE_BYTES) throw new Error("El archivo supera 100 MB");
  const ext = files.extension(opts.filename).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const key = safeKey(opts.key ?? `${newId()}${ext}`);
  await files.write(projectId, key, data);
  const obj = { key, filename: opts.filename, contentType: opts.contentType || "application/octet-stream", size: data.byteLength };
  await q(
    "storagePut",
    [projectId, key, obj.filename, obj.contentType, obj.size],
  );
  return obj;
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
