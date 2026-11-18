import { COMPONENTS_MANIFEST, isNativeProjectPath, isProjectPath, NATIVE_LAYOUT, type ProjectLayout } from "../../../../contracts/projectLayout.js";

export class ProjectPath {
  readonly value: string;

  constructor(path: string, layout: ProjectLayout = NATIVE_LAYOUT) {
    ProjectPath.assertValid(path, layout);
    this.value = path;
  }

  /**
   * Native paths are valid in every project. With forja.json, any path inside a declared
   * component root is valid too; forja.json itself is always valid so it can be created.
   */
  static isValid(path: string, layout: ProjectLayout = NATIVE_LAYOUT): boolean {
    return isProjectPath(path, layout);
  }

  /** True when the path is valid without reading the project's manifest. */
  static isValidWithoutManifest(path: string): boolean {
    return isNativeProjectPath(path) || path === COMPONENTS_MANIFEST;
  }

  static assertValid(path: string, layout: ProjectLayout = NATIVE_LAYOUT): void {
    if (!ProjectPath.isValid(path, layout)) {
      const roots = layout.components.filter((c) => c.root).map((c) => c.root);
      const components = roots.length ? `, las carpetas de los componentes de forja.json (${roots.join(", ")})` : " o declara componentes en forja.json para usar otras carpetas";
      throw new Error(`Ruta no válida: "${path}". Usa pages/, components/, helpers/, endpoints/, jobs/, migrations/, static/, base.css, package.json, forja.services.json, forja.json, forja.auth.json, archivos JVM (pom.xml, build.gradle[.kts], settings.gradle[.kts], gradle.properties, src/main/, src/test/)${components}.`);
    }
  }

  isDevFile(): boolean {
    return ProjectPath.isDevPath(this.value);
  }

  static isDevPath(path: string): boolean {
    return path.startsWith("static/__dev/");
  }

  toString(): string {
    return this.value;
  }
}
