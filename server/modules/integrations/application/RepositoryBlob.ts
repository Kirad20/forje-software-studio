export function decodeRepositoryBlob(content: string, encoding: string): string {
  if (!["base64", "utf8", "utf-8"].includes(encoding)) throw new Error("Codificación de repositorio no compatible");
  const bytes = Buffer.from(content, encoding === "base64" ? "base64" : "utf8");
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (!text.includes("\0") && Buffer.from(text).equals(bytes)) return text;
  } catch {}
  return `base64:${bytes.toString("base64")}`;
}
