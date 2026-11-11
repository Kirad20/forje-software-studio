import { rm } from "node:fs/promises";
import path from "node:path";
import { config } from "../../../shared/config.js";

/** Removes a deleted project's database and uploaded files from disk, and stops what is still running for it. */
export async function removeProjectData(projectId: string) {
  const { closeProject } = await import("../../app-services/projectDb.js");
  const { stopSandbox } = await import("./sandbox.js");
  stopSandbox(projectId);
  const { springRuntime } = await import("./languages.js");
  await springRuntime.removeProject(projectId);
  await closeProject(projectId);
  await rm(path.join(config.dataDir, "projects", projectId), { recursive: true, force: true }).catch(() => {});
}
