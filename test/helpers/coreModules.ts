import { randomBytes } from "node:crypto";

export async function createTestCoreModules() {
  const [{ createCoreModules }, crypto, projects, security] = await Promise.all([
    import("../../server/bootstrap/coreModules.js"),
    import("../../server/shared/crypto.js"),
    import("../../server/modules/projects/index.js"),
    import("../../server/modules/app-runtime/domain/securityScan.js"),
  ]);
  return createCoreModules({
    projectServices: {
      projectId: () => randomBytes(8).toString("hex"),
      id: crypto.newId,
      templates: projects.starterFiles,
      warmup: async () => {},
      clone: async () => {},
      emit: () => {},
    },
    sendPlatformEmail: async () => false,
    findSecret: security.findSecret,
  });
}
