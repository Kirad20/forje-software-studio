import { createBuildVerification } from "./application/build.js";
import { createDependencyResolution, type PackageRegistryPort } from "./application/dependencies.js";
import { createPublication } from "./application/publication.js";
import { createShareAccess } from "./application/share.js";
import type { BuildPorts, PublicationPorts, SharePorts } from "./application/ports.js";

export interface AppRuntimePorts {
  publication: Omit<PublicationPorts, "appUrl">;
  build: BuildPorts;
  share: SharePorts;
  registry: PackageRegistryPort;
}
export function createAppRuntime(ports: AppRuntimePorts) {
  const share = createShareAccess(ports.share);
  return {
    ...share,
    ...createPublication({ ...ports.publication, appUrl: share.appUrl }),
    verifyBuild: createBuildVerification(ports.build),
    resolvePackage: createDependencyResolution(ports.registry),
  };
}
