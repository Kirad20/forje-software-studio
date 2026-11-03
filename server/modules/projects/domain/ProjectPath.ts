const ALLOWED_PATTERN = /^(pages|components|helpers|endpoints|jobs|static)\/[A-Za-z0-9_.$\-/[\]]+$|^base\.css$|^package\.json$/;

export class ProjectPath {
  readonly value: string;

  constructor(path: string) {
    if (!ProjectPath.isValid(path)) {
      throw new Error(`Ruta no válida: "${path}". Usa pages/, components/, helpers/, endpoints/, jobs/, static/, base.css o package.json.`);
    }
    this.value = path;
  }

  static isValid(path: string): boolean {
    if (!ALLOWED_PATTERN.test(path) || path.includes("..") || path.includes("//")) {
      return false;
    }
    return true;
  }

  static assertValid(path: string): void {
    if (!ProjectPath.isValid(path)) {
      throw new Error(`Ruta no válida: "${path}". Usa pages/, components/, helpers/, endpoints/, jobs/, static/, base.css o package.json.`);
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
