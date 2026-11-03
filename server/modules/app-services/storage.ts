export { createStorage, MAX_FILE_BYTES } from "./application/storage.js";
export type { StoredObject } from "./application/storage.js";
import { createStorage } from "./application/storage.js";
import { storagePorts } from "./infrastructure/storage.js";
export const { putObject, getObject, deleteObject, listObjects, storageUsage } = createStorage(storagePorts);
