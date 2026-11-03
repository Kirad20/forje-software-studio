import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { paths } from "../../../shared/config.js";
import { newId } from "../../../shared/crypto.js";
import { platformRepository } from "./repositories.js";
import type { StoragePorts } from "../ports/storage.js";
const filePath = (projectId: string, key: string) => path.join(paths.projectStorage(projectId), key);
export const storagePorts: StoragePorts = {
  ...platformRepository, newId, files: {
    extension: path.extname,
    async write(projectId, key, data) {
      const full = filePath(projectId, key);
      await mkdir(path.dirname(full), { recursive: true });
      await writeFile(full, data);
    },
    async read(projectId, key) {
      try { return await readFile(filePath(projectId, key)); }
      catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
    },
    async delete(projectId, key) { await rm(filePath(projectId, key), { force: true }); },
  },
};
