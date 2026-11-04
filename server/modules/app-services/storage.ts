export { createStorage, MAX_FILE_BYTES, MAX_PROJECT_STORAGE_BYTES, StorageLimitError } from "./application/storage.js";
export type { StoredObject } from "./application/storage.js";
import { createStorage } from "./application/storage.js";
import { storagePorts } from "./infrastructure/storage.js";
export const { putObject, getObject, deleteObject, listObjects, storageUsage } = createStorage(storagePorts);
