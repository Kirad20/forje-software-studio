const ALLOWED_PATTERN = /^(pages|components|helpers|endpoints|jobs|static|src\/(?:main|test))\/[A-Za-z0-9_.$\-/[\]]+$|^migrations\/\d+_[A-Za-z0-9_.$-]+\.sql$|^base\.css$|^package\.json$|^forja\.services\.json$|^pom\.xml$|^(?:build|settings)\.gradle(?:\.kts)?$|^gradle\.properties$/;

export class ProjectPath {
  readonly value: string;

  constructor(path: string) {
    ProjectPath.assertValid(path);
    this.value = path;
  }

  static isValid(path: string): boolean {
    if (!ALLOWED_PATTERN.test(path) || path.includes("..") || path.includes("//") || path.endsWith("/")) {
      return false;
    }
    return true;
  }

  static assertValid(path: string): void {
    if (!ProjectPath.isValid(path)) {
      throw new Error(`Ruta no válida: "${path}". Usa pages/, components/, helpers/, endpoints/, jobs/, migrations/, static/, base.css, package.json, forja.services.json o archivos JVM (pom.xml, build.gradle[.kts], settings.gradle[.kts], gradle.properties, src/main/, src/test/).`);
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
