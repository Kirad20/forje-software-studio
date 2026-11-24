import { createHash } from "node:crypto";

/**
 * Per-file concurrency token: sha256 (hex) of the file content. Writers pass the token they
 * read; the store applies the change only if the file still has it, so two agents editing
 * different files never collide and two editing the same one never lose an update.
 *
 * `null` means "the file must not exist yet". Postgres computes the same value with
 * encode(sha256(convert_to(content, 'UTF8')), 'hex').
 */
export type FileExpectation = string | null;

export const contentEtag = (content: string): string => createHash("sha256").update(content, "utf8").digest("hex");

/** Short form shown to agents; accepted back as expected_sha (see resolveExpectation). */
export const shortEtag = (etag: string): string => etag.slice(0, 12);

export class FileConflictError extends Error {
  readonly code = "FILE_CONFLICT";
  constructor(readonly path: string, readonly expected: FileExpectation, readonly current: string | null) {
    super(
      `FILE_CONFLICT: ${path} cambió desde que lo leíste (esperabas ${expected === null ? "que no existiera" : shortEtag(expected)}, ahora ${current === null ? "no existe" : shortEtag(current)}). No se escribió nada. ` +
        `Vuelve a leerlo con read_files y reaplica tu cambio${current === null ? "" : ` con expected_sha ${shortEtag(current)}`}. El resto de archivos del proyecto no se ven afectados.`,
    );
  }
}

/**
 * Turns the `expected_sha` an agent sent into a full expectation, checked against the content
 * it is about to change. "absent" = must not exist; otherwise a hex prefix (12+ chars) or the
 * full sha. A mismatch is a conflict right away; the store then enforces it atomically.
 */
export function resolveExpectation(path: string, raw: unknown, current: string | undefined): FileExpectation | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const value = String(raw).trim().toLowerCase();
  if (value === "absent" || value === "none") {
    if (current !== undefined) throw new FileConflictError(path, null, contentEtag(current));
    return null;
  }
  if (!/^[0-9a-f]{12,64}$/.test(value)) throw new Error('expected_sha no es válido: usa el sha de read_files (12+ caracteres hex) o "absent" para crear un archivo nuevo.');
  const currentEtag = current === undefined ? null : contentEtag(current);
  if (currentEtag === null || !currentEtag.startsWith(value)) throw new FileConflictError(path, value.length === 64 ? value : value.padEnd(64, "0"), currentEtag);
  return currentEtag;
}
