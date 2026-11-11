import { describe, expect, it, vi } from "vitest";
import { createKnowledgeService, prepareCorpus, type KnowledgeEngine } from "../../../../server/modules/project-knowledge/application/service.js";
import type { KnowledgeGraph } from "../../../../server/modules/project-knowledge/domain/graph.js";

describe("project knowledge", () => {
  it("excludes secrets, generated files and binary files from the corpus", () => {
    const result = prepareCorpus({
      ".env": "DB_PASSWORD=hidden",
      "node_modules/pkg/index.js": "generated",
      "secrets/token.txt": "hidden",
      "assets/logo.png": "binary",
      "src/private.ts": "detected secret",
      "src/main.ts": "export const app = true;",
    }, (text) => text.includes("secret") ? "secret" : null);

    expect(result.files).toEqual({ "src/main.ts": "export const app = true;" });
    expect(result.limitations).toHaveLength(5);
  });

  it("rejects unsafe paths and oversized projects", () => {
    expect(() => prepareCorpus({ "../outside.ts": "source" })).toThrow("Ruta no válida");
    expect(() => prepareCorpus({ "large.ts": "x".repeat(1_000_001) })).toThrow("supera el límite");
  });

  it.each([undefined, null, 42, {}, "", "   ", "x".repeat(1001)])("rejects invalid questions before reading or indexing the project (%#)", async (query) => {
    const repository = { readAllFiles: vi.fn() };
    const engine: KnowledgeEngine = {
      fingerprint: vi.fn(),
      read: vi.fn(),
      build: vi.fn(),
      query: vi.fn(),
    };
    const knowledge = createKnowledgeService(repository, engine);

    await expect(Reflect.apply(knowledge.question, knowledge, ["project-a", query]))
      .rejects.toThrow(/query.*1 y 1000 caracteres/);
    expect(repository.readAllFiles).not.toHaveBeenCalled();
    expect(engine.query).not.toHaveBeenCalled();
  });

  it("rebuilds only when project files change and returns cited source excerpts", async () => {
    let files = { "src/main.ts": "first line\nexport const app = true;" };
    let cached: KnowledgeGraph | undefined;
    const graph = (revision: string, currentFiles: Record<string, string>, limitations: string[]): KnowledgeGraph => ({
      revision,
      indexedAt: "2026-01-01T00:00:00.000Z",
      nodes: [{ id: "main", label: "main.ts", path: "src/main.ts", line: 2, kind: "file", group: "src" }],
      edges: [],
      fileCount: Object.keys(currentFiles).length,
      limitations,
    });
    const engine: KnowledgeEngine = {
      fingerprint: vi.fn((currentFiles) => JSON.stringify(currentFiles)),
      read: vi.fn(async () => cached),
      build: vi.fn(async (_projectId, currentFiles, revision, limitations) => {
        cached = graph(revision, currentFiles, limitations);
        return cached;
      }),
      query: vi.fn(async () => "NODE main.ts [src=src/main.ts loc=L2]"),
    };
    const repository = { readAllFiles: vi.fn(async () => files) };
    const knowledge = createKnowledgeService(repository, engine);

    const first = await knowledge.question("project-a", "  app architecture  ");
    expect(first.query).toBe("app architecture");
    expect(first.sources).toEqual([{
      path: "src/main.ts",
      startLine: 2,
      endLine: 2,
      text: "export const app = true;",
    }]);

    await knowledge.question("project-a", "app architecture");
    expect(engine.build).toHaveBeenCalledTimes(1);

    files = { "src/main.ts": "first line\nexport const app = false;" };
    const changed = await knowledge.question("project-a", "app architecture");
    expect(engine.build).toHaveBeenCalledTimes(2);
    expect(changed.sources[0].text).toBe("export const app = false;");
  });
});
