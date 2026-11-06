import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { promisify } from "node:util";
import type { KnowledgeEngine } from "../application/service.js";
import type { KnowledgeGraph } from "../domain/graph.js";
import { knowledgeGraphSchema, normalizeGraph } from "./extraction.js";

const execute = promisify(execFile);
export type GraphifyRunner = (args: string[], cwd: string) => Promise<{ stdout: string; code: number }>;

export const runGraphify: GraphifyRunner = async (args, cwd) => {
  try {
    const result = await execute(process.env.GRAPHIFY_BIN || "graphify", args, {
      cwd, timeout: 120_000, maxBuffer: 8_000_000, windowsHide: true,
      env: { ...process.env, GRAPHIFY_NO_LLM: "1" },
    });
    return { stdout: result.stdout, code: 0 };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 4 && "stdout" in error && typeof error.stdout === "string") {
      return { stdout: error.stdout, code: 4 };
    }
    throw new Error("No se pudo ejecutar Graphify. Instala graphifyy en el servidor o configura GRAPHIFY_BIN.", { cause: error });
  }
};

export class GraphifyEngine implements KnowledgeEngine {
  constructor(private readonly root: string, private readonly runner: GraphifyRunner = runGraphify) {}

  fingerprint(files: Record<string, string>) {
    return createHash("sha256").update(JSON.stringify(files)).digest("hex");
  }

  private directory(projectId: string) {
    return join(this.root, createHash("sha256").update(projectId).digest("hex"));
  }

  async read(projectId: string): Promise<KnowledgeGraph | undefined> {
    try {
      return knowledgeGraphSchema.parse(JSON.parse(await readFile(join(this.directory(projectId), "knowledge.json"), "utf8")));
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return undefined;
      throw error;
    }
  }

  async build(projectId: string, files: Record<string, string>, revision: string, limitations: string[]) {
    const directory = this.directory(projectId);
    const workspace = join(directory, "workspace");
    await mkdir(workspace, { recursive: true });
    const previous = await this.read(projectId);
    const oldPaths = new Set(previous?.nodes.map((node) => node.path) ?? []);
    for (const path of oldPaths) {
      if (!Object.hasOwn(files, path)) await rm(this.filePath(workspace, path), { force: true });
    }
    for (const [path, content] of Object.entries(files)) {
      const target = this.filePath(workspace, path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, content);
    }
    // Extraction is local AST only. Uploaded documents are searchable text, never LLM instructions.
    await this.runner(["extract", workspace, "--code-only", "--no-cluster", "--max-workers", "2"], directory);
    const raw: unknown = JSON.parse(await readFile(join(workspace, "graphify-out", "graph.json"), "utf8"));
    const graph = normalizeGraph(raw, files, revision, limitations);
    await writeFile(join(directory, "knowledge.pending.json"), JSON.stringify(graph));
    await rename(join(directory, "knowledge.pending.json"), join(directory, "knowledge.json"));
    return graph;
  }

  async query(projectId: string, query: string) {
    const directory = this.directory(projectId);
    const result = await this.runner(["query", query.startsWith("-") ? ` ${query}` : query, "--graph", join(directory, "workspace", "graphify-out", "graph.json"), "--budget", "2000"], directory);
    return result.code === 4 ? "No se encontraron nodos para esta pregunta en el grafo de código." : result.stdout;
  }

  private filePath(workspace: string, path: string) {
    const target = resolve(workspace, path);
    if (!target.startsWith(resolve(workspace) + sep)) throw new Error(`Ruta fuera del proyecto: ${path}`);
    return target;
  }
}
