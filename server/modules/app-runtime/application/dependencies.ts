import { packageInfo, validatePackageName, type RegistryPackage } from "../domain/dependencies.js";
export interface PackageRegistryPort {
  isNodeBuiltin(specifier: string): boolean;
  lookup(name: string, version: string): Promise<RegistryPackage>;
}
export function createDependencyResolution(registry: PackageRegistryPort) {
  return async (name: string, version = "latest") => {
    if (registry.isNodeBuiltin(name)) throw new Error(`${name} es un módulo de Node, no un paquete de npm.`);
    validatePackageName(name);
    return packageInfo(name, await registry.lookup(name, version));
  };
}
