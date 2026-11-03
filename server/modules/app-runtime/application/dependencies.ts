import { catalogVersion, packageInfo, type RegistryPackage } from "../domain/dependencies.js";
export interface PackageRegistryPort {
  isNodeBuiltin(specifier: string): boolean;
  lookup(name: string, version: string): Promise<RegistryPackage>;
}
export function createDependencyResolution(registry: PackageRegistryPort) {
  return async (name: string, version = "latest") => {
    if (registry.isNodeBuiltin(name)) throw new Error(`${name} es un módulo de Node, no un paquete de npm.`);
    const pinned = catalogVersion(name);
    return packageInfo(name, version, pinned, await registry.lookup(name, pinned));
  };
}
