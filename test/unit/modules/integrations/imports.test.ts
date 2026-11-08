import { describe, expect, it, vi } from "vitest";
import { createGithubImportService } from "../../../../server/modules/integrations/application/imports.js";
import { blobSha } from "../../../../server/modules/integrations/infrastructure/github.js";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assertSafeRepositoryPath, assertSafeRepositoryContent, repositoryPathExclusion } from "../../../../contracts/repository.js";

function setup(files = { "pages/_index.tsx": "export default function Home(){return <div/>}", "base.css": "body{}", "migrations/001_notes.sql": "create table notes(id integer);", "README.md": "# Preserve", ".github/workflows/ci.yml": "name: CI" } as Record<string, string>) {
  let truncated = false;
  const tree = Object.entries(files).map(([path, content]) => ({ path, sha: blobSha(content), type: "blob", size: content.length, mode: "100644" }));
  const directories = new Set(Object.keys(files).flatMap((path) => {
    const parts = path.split("/");
    return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join("/"));
  }));
  for (const path of directories) tree.push({ path, sha: `tree:${path}`, type: "tree", size: 0, mode: "040000" });
  const request = vi.fn(async (_token: string, method: string, path: string): Promise<any> => {
    if (method !== "GET") throw Error("No remote writes allowed");
    if (path.includes("/git/ref/")) return { object: { sha: "head" } };
    if (path.includes("/git/commits/")) return { tree: { sha: "tree" } };
    if (path.includes("/git/trees/")) return { tree, truncated };
    if (path.includes("/git/blobs/")) {
      const entry = tree.find((entry) => path.endsWith(entry.sha))!;
      const content = files[entry.path]!;
      const bytes = content.startsWith("base64:") ? Buffer.from(content.slice(7), "base64") : Buffer.from(content);
      return { content: bytes.toString("base64"), encoding: "base64" };
    }
  });
  const gateway = { request, blobSha, repositoryPolicy: { assertPath: assertSafeRepositoryPath, assertContent: assertSafeRepositoryContent, exclusion: repositoryPathExclusion }, decodeBlob: (path: string) => files[path]!, encodeText: (c: string) => c, webUrl: () => "", pollMs: () => 1, schedule: () => () => {}, warn: vi.fn() };
  const select = vi.fn(async () => ({ token: "scoped", owner: "org", repo: "existing", branch: "feature/import", installationId: 42 }));
  const saveLink = vi.fn();
  const project = { assertValidPath(path: string) { if (!/^(pages|helpers|migrations)\/|^base.css$|^package.json$/.test(path)) throw Error("invalid"); } };
  return { service: createGithubImportService(gateway, project, select, saveLink), request, tree, saveLink, truncate: () => { truncated = true; } };
}
describe("native GitHub import preparation", () => {
  it("ignores ordinary GitHub directory entries in native and repository imports", async () => {
    const native = setup({ "pages/nested/_index.tsx": "export default function Home(){}" });
    const original = setup({ Dockerfile: "FROM node:22", "server/modules/main.ts": "export {}" });
    expect(native.tree).toContainEqual(expect.objectContaining({ path: "pages/nested", type: "tree", mode: "040000" }));
    expect((await native.service.prepare("a", { repo: "o/r" })).files).toEqual({ "pages/nested/_index.tsx": "export default function Home(){}" });
    expect((await original.service.prepare("a", { repo: "o/r", runtime: "repository" })).files).toEqual({ Dockerfile: "FROM node:22", "server/modules/main.ts": "export {}" });
  });
  it("prepares the actual tracked Forja source tree without rewriting files", async () => {
    const paths = [...new Set(execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean))];
    const files = Object.fromEntries(paths.map((path) => {
      if (repositoryPathExclusion(path)) return [path, "(excluded generated/environment file)"];
      const bytes = readFileSync(join(...path.split("/")));
      const text = bytes.toString("utf8");
      return [path, text.includes("\uFFFD") || text.includes("\0") ? `base64:${bytes.toString("base64")}` : text];
    }));
    const s = setup(files);
    const prepared = await s.service.prepare("a", { repo: "forje/forja", runtime: "repository" });
    for (const path of ["Dockerfile", "package-lock.json", "server/bootstrap/server.ts", "test/unit/modules/integrations/imports.test.ts"]) {
      expect(prepared.files[path]).toBe(files[path]);
      expect(prepared.synced[path]).toBe(blobSha(files[path]!));
    }
    expect(Object.keys(prepared.files).some((path) => path.startsWith("graphify-out/"))).toBe(false);
    expect(prepared.files).not.toHaveProperty(".env.example");
    expect(prepared.warnings.join(" ")).toContain(".env.example");
  });
  it("preserves non-static binary assets and decodes extensionless build files as text", async () => {
    const image = `base64:${Buffer.from([137, 80, 78, 71, 0, 255]).toString("base64")}`;
    const s = setup({ Dockerfile: "FROM node:22\n", "studio/public/logo.png": image, "scripts/start": "#!/bin/sh\nnode server.js\n" });
    const prepared = await s.service.prepare("a", { repo: "o/r", runtime: "repository" });
    expect(prepared.files).toEqual({ Dockerfile: "FROM node:22\n", "studio/public/logo.png": image, "scripts/start": "#!/bin/sh\nnode server.js\n" });
    expect(prepared.synced["studio/public/logo.png"]).toBe(blobSha(image));
  });
  it("rejects realistic credential values even inside tests and escaped private keys", async () => {
    for (const content of ["const token = 'ghp_" + "Q2tX8bN9".repeat(5) + "';", "const key = '-----BEGIN PRIVATE KEY-----\\n" + "M".repeat(80) + "\\n-----END PRIVATE KEY-----';"]) {
      const s = setup({ "test/source.test.ts": content });
      await expect(s.service.prepare("a", { repo: "o/r", runtime: "repository" })).rejects.toMatchObject({ status: 422 });
    }
  });
  it("keeps test literals but rejects real private key material in ordinary source files", async () => {
    const literal = setup({ "src/test.ts": 'expect(value).toContain("-----BEGIN PRIVATE KEY-----")' });
    await expect(literal.service.prepare("a", { repo: "o/r", runtime: "repository" })).resolves.toBeDefined();
    const key = "-----BEGIN PRIVATE KEY-----\n" + "M".repeat(80) + "\n-----END PRIVATE KEY-----";
    const actual = setup({ "src/test.ts": key });
    await expect(actual.service.prepare("a", { repo: "o/r", runtime: "repository" })).rejects.toMatchObject({ status: 422 });
  });
  it("imports the original Forja layout with lockfile but excludes generated artifacts and env examples", async () => {
    const s = setup({
      "Dockerfile": "FROM node:22",
      "package.json": '{"scripts":{"build":"vite build"},"dependencies":{"vite":"8"}}',
      "package-lock.json": '{"lockfileVersion":3}',
      "studio/src/App.tsx": "export default function App() {}",
      "server/bootstrap/server.ts": "export {}",
      "sdk/index.ts": "export {}",
      "graphify-out/graph.json": "x".repeat(2 * 1024 * 1024),
      "node_modules/vite/index.js": "generated",
      ".ms-playwright/chromium/chrome": "generated browser",
      ".env.example": "TOKEN=replace_me",
    });
    const prepared = await s.service.prepare("a", { repo: "org/existing", runtime: "repository" });
    expect(prepared.runtime).toBe("repository");
    expect(Object.keys(prepared.files)).toEqual(["Dockerfile", "package.json", "package-lock.json", "studio/src/App.tsx", "server/bootstrap/server.ts", "sdk/index.ts"]);
    expect(prepared.synced["package-lock.json"]).toBe(blobSha('{"lockfileVersion":3}'));
    expect(prepared.warnings.join(" ")).toContain(".env.example");
    expect(prepared.warnings.join(" ")).toContain("graphify-out/graph.json");
    await s.service.attach("p", "a", prepared);
    expect(s.request.mock.calls.every(([, method]) => method === "GET")).toBe(true);
  });
  it("rejects unsafe repository paths, symlinks and credentials before attachment", async () => {
    for (const path of ["../escape.ts", "/absolute.ts", "src\\escape.ts", "src/\0bad.ts", ".git/config", "private.key"]) {
      const s = setup({ "Dockerfile": "FROM node:22", [path]: "unsafe" });
      await expect(s.service.prepare("a", { repo: "org/existing", runtime: "repository" })).rejects.toMatchObject({ status: 422 });
    }
    const s = setup({ "Dockerfile": "FROM node:22", "src/link": "target" });
    s.tree[1]!.mode = "120000";
    await expect(s.service.prepare("a", { repo: "org/existing", runtime: "repository" })).rejects.toMatchObject({ status: 422 });
    const submodule = setup({ Dockerfile: "FROM node:22", "vendor/module": "commit" });
    submodule.tree[1]!.type = "commit";
    submodule.tree[1]!.mode = "160000";
    await expect(submodule.service.prepare("a", { repo: "org/existing", runtime: "repository" })).rejects.toMatchObject({ status: 422 });
  });
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
