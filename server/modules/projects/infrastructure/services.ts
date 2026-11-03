import { randomBytes } from "node:crypto";
import { newId } from "../../../lib/crypto.js";
import { starterFiles } from "../../../templates/starter.js";
import { emitProject } from "../../../platform/events.js";
import { ensurePersonalOrg, personalOrgId } from "../../collaboration/index.js";
import type { ProjectServices } from "../ports/projects.js";
import type { ProjectOrganizations } from "../ports/collaboration.js";

export const projectOrganizations: ProjectOrganizations = { ensurePersonalOrg, personalOrgId };

export const projectServices: ProjectServices = {
  projectId: () => randomBytes(8).toString("hex"),
  id: newId,
  templates: starterFiles,
  emit: emitProject,
  warmup: async (id) => (await import("../../../baas/projectDb.js")).projectDb(id).one("select 1"),
  clone: async (sourceId, targetId) => (await import("../../../baas/projectDb.js")).cloneDatabase(sourceId, targetId),
};
