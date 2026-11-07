import { describe, expect, it, vi } from "vitest";
import { createGithubImportService } from "../../../../server/modules/integrations/application/imports.js";
import { blobSha } from "../../../../server/modules/integrations/infrastructure/github.js";

function setup(files = { "pages/_index.tsx": "export default function Home(){return <div/>}", "base.css": "body{}", "migrations/001_notes.sql": "create table notes(id integer);", "README.md": "# Preserve", ".github/workflows/ci.yml": "name: CI" } as Record<string, string>) {
  let truncated = false;
  const tree = Object.entries(files).map(([path, content]) => ({ path, sha: blobSha(content), type: "blob", size: content.length, mode: "100644" }));
  const request = vi.fn(async (_token: string, method: string, path: string): Promise<any> => {
    if (method !== "GET") throw Error("No remote writes allowed");
    if (path.includes("/git/ref/")) return { object: { sha: "head" } };
    if (path.includes("/git/commits/")) return { tree: { sha: "tree" } };
    if (path.includes("/git/trees/")) return { tree, truncated };
    if (path.includes("/git/blobs/")) {
      const entry = tree.find((entry) => path.endsWith(entry.sha))!;
      return { content: files[entry.path], encoding: "utf8" };
    }
  });
  const gateway = { request, blobSha, decodeBlob: (_p: string, c: string) => c, encodeText: (c: string) => c, webUrl: () => "", pollMs: () => 1, schedule: () => () => {}, warn: vi.fn() };
  const select = vi.fn(async () => ({ token: "scoped", owner: "org", repo: "existing", branch: "feature/import", installationId: 42 }));
  const saveLink = vi.fn();
  const project = { assertValidPath(path: string) { if (!/^(pages|helpers|migrations)\/|^base.css$|^package.json$/.test(path)) throw Error("invalid"); } };
  return { service: createGithubImportService(gateway, project, select, saveLink), request, tree, saveLink, truncate: () => { truncated = true; } };
}
describe("native GitHub import preparation", () => {
  it("fetches a complete snapshot before local writes, attaches a pull-only baseline, preserves unmanaged paths", async () => {
    const s = setup();
    const prepared = await s.service.prepare("a", { repo: "org/existing", installationId: 42 });
    expect(prepared.files).not.toHaveProperty("README.md");
    expect(prepared.files).toHaveProperty("migrations/001_notes.sql");
    expect(prepared.warnings.join(" ")).toContain("no se han aplicado");
    expect(s.saveLink).not.toHaveBeenCalled();
    const result = await s.service.attach("p", "a", prepared);
    expect(result.pushed).toBeNull();
    expect(s.saveLink).toHaveBeenCalledWith("p", "a", "org", "existing", "feature/import", 42, { last_sha: "head", last_tree: "tree", synced: prepared.synced });
    expect(s.request.mock.calls.every(([, method]) => method === "GET")).toBe(true);
    expect(s.request.mock.calls.some(([, , path]) => path.includes("feature%2Fimport"))).toBe(true);
  });
  it("rejects incompatible projects, secrets, oversized files and truncated trees before local allocation", async () => {
    const cases: Record<string, string>[] = [
      { "src/App.tsx": "export default function App() {}" },
      { "pages/_index.tsx": "export default function Home(){}", ".env": "SECRET=value" },
      { "pages/_index.tsx": "export default function Home(){}", "package.json": '{"dependencies":{"next":"15.0.0"}}' },
      { "pages/_index.tsx": "-----BEGIN PRIVATE KEY-----" },
      { "pages/_index.tsx": "x".repeat(1024 * 1024 + 1) },
    ];
    for (const files of cases) {
      const s = setup(files);
      await expect(s.service.prepare("a", { repo: "org/existing" })).rejects.toMatchObject({ status: 422 });
      expect(s.saveLink).not.toHaveBeenCalled();
    }
    const s = setup(); s.truncate();
    await expect(s.service.prepare("a", { repo: "org/existing" })).rejects.toThrow("truncó");
    expect(s.saveLink).not.toHaveBeenCalled();
  });
  it("rejects corrupted blob data rather than pretending the import succeeded", async () => {
    const s = setup();
    s.tree[0]!.sha = "incorrect";
    await expect(s.service.prepare("a", { repo: "org/existing" })).rejects.toThrow("incompleto");
    expect(s.saveLink).not.toHaveBeenCalled();
  });
});
