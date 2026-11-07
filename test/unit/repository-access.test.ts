import { afterEach, describe, expect, it, vi } from "vitest";
import { repositoryShareToken, checkRepositoryShareToken } from "../../server/modules/repository-runtime/index.js";

afterEach(() => vi.useRealTimers());
describe("repository environment-bound share grants (TDD)", () => {
  it("does not allow preview tokens to unlock published data or vice versa", () => {
    const project = { id: "project", shareEpoch: 1 };
    const preview = repositoryShareToken(project, "preview");
    const published = repositoryShareToken(project, "published");
    expect(checkRepositoryShareToken(project, preview, "preview")).toBe(true);
    expect(checkRepositoryShareToken(project, preview, "published")).toBe(false);
    expect(checkRepositoryShareToken(project, published, "preview")).toBe(false);
    expect(checkRepositoryShareToken(project, published, "published")).toBe(true);
  });
  it("expires and honors project-specific revocation epochs", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-07T00:00:00Z"));
    const project = { id: "project", shareEpoch: 1 };
    const token = repositoryShareToken(project, "preview", 1);
    expect(checkRepositoryShareToken({ ...project, shareEpoch: 2 }, token, "preview")).toBe(false);
    expect(checkRepositoryShareToken({ ...project, id: "another" }, token, "preview")).toBe(false);
    vi.setSystemTime(new Date("2026-11-09T00:00:00Z"));
    expect(checkRepositoryShareToken(project, token, "preview")).toBe(false);
  });
});
