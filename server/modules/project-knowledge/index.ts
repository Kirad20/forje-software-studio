import { join, resolve } from "node:path";
import { config } from "../../shared/config.js";
import { createKnowledgeService, type KnowledgeFiles } from "./application/service.js";
import { GraphifyEngine } from "./infrastructure/GraphifyEngine.js";

export function createProjectKnowledgeModule(files: KnowledgeFiles, findSecret: (text: string) => string | null) {
  return createKnowledgeService(files, new GraphifyEngine(process.env.GRAPHIFY_DATA_DIR ? resolve(process.env.GRAPHIFY_DATA_DIR) : join(config.dataDir, "project-knowledge")), findSecret);
}
export type ProjectKnowledgeModule = ReturnType<typeof createProjectKnowledgeModule>;
export type { KnowledgeGraph, KnowledgeNode, KnowledgeAnswer, KnowledgeSource } from "./domain/graph.js";
