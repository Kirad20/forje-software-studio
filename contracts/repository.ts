export type ProjectRuntime = "native" | "repository";

export function repositoryPathExclusion(path: string): "environment" | "generated" | null {
  if (path.split("/").some((part) => /^\.env(?:\..*)?$/i.test(part))) return "environment";
  if (path.split("/").some((part) => /^(?:node_modules|dist|build|coverage|cache|\.cache|\.next|\.nuxt|\.output|\.ms-playwright|graphify-out|\.graphify_python|\.graphify_root)$/i.test(part))) return "generated";
  return null;
}

export function assertSafeRepositoryPath(path: string): void {
  if (!path || path.length > 1024 || /[\\\x00-\x1f\x7f:*?"<>|]/.test(path) || path.startsWith("/") ||
      path.split("/").some((part) => !part || part === "." || part === ".." || /^\.git$/i.test(part) || /[. ]$/.test(part) ||
        /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part))) {
    throw new Error(`Ruta de repositorio no válida: "${path}"`);
  }
}

export function assertSafeRepositoryContent(path: string, content: string): void {
  const text = (content.startsWith("base64:") ? Buffer.from(content.slice(7), "base64").toString("utf8") : content)
    .replace(/\\r\\n|\\n|\\r/g, "\n")
    .replace(/\bAKIA(?:ABCDEFGHIJKLMNOP|IOSFODNN7EXAMPLE)\b/g, "");
  if (/(^|\/)(id_rsa|id_ed25519|credentials(?:\.json)?|secrets?(?:\.json)?)(\/|$)|\.(pem|p12|pfx|key)$/i.test(path) ||
      /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----[\r\n]+[A-Za-z0-9+/=\r\n]{64,}|\bgh[pousr]_[A-Za-z0-9]{36,}|\bgithub_pat_[A-Za-z0-9_]{70,}|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{40,}|\bxox[baprs]-[A-Za-z0-9-]{20,}/.test(text)) {
    throw new Error(`Posible credencial en ${path}`);
  }
}

export function assertEditableRepositoryPath(path: string): void {
  assertSafeRepositoryPath(path);
  assertSafeRepositoryContent(path, "");
  if (repositoryPathExclusion(path)) throw new Error(`Ruta de repositorio excluida: ${path}`);
}
