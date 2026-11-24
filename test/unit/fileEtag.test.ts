import { describe, expect, it } from "vitest";
import { contentEtag, FileConflictError, resolveExpectation, shortEtag } from "../../contracts/fileEtag.js";

describe("per-file etag (expected_sha)", () => {
  const body = "export const a = 1;\n";
  const sha = contentEtag(body);

  it("is a stable sha256 of the content", () => {
    expect(sha).toMatch(/^[0-9a-f]{64}$/);
    expect(contentEtag(body)).toBe(sha);
    expect(contentEtag(body + " ")).not.toBe(sha);
  });

  it("returns undefined when the agent sent nothing (last-writer-wins)", () => {
    for (const raw of [undefined, null, ""]) expect(resolveExpectation("a.ts", raw, body)).toBeUndefined();
  });

  it("expands a 12-char prefix to the full sha of the current content", () => {
    expect(resolveExpectation("a.ts", shortEtag(sha), body)).toBe(sha);
    expect(resolveExpectation("a.ts", sha.toUpperCase(), body)).toBe(sha);
  });

  it("raises FILE_CONFLICT for a stale sha, naming the current one", () => {
    const stale = contentEtag("old").slice(0, 12);
    try {
      resolveExpectation("a.ts", stale, body);
      throw new Error("should have conflicted");
    } catch (e) {
      expect(e).toBeInstanceOf(FileConflictError);
      expect((e as FileConflictError).message).toContain(`expected_sha ${shortEtag(sha)}`);
      expect((e as FileConflictError).current).toBe(sha);
    }
    expect(() => resolveExpectation("a.ts", stale, undefined)).toThrow("FILE_CONFLICT");
  });

  it('"absent" means create-only', () => {
    expect(resolveExpectation("a.ts", "absent", undefined)).toBeNull();
    expect(() => resolveExpectation("a.ts", "absent", body)).toThrow("FILE_CONFLICT");
  });

  it("rejects malformed values instead of guessing", () => {
    for (const raw of ["xyz", "123", "not-a-sha-at-all"]) expect(() => resolveExpectation("a.ts", raw, body)).toThrow("expected_sha no es válido");
  });
});
