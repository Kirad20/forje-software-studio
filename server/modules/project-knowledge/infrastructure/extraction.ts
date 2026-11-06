import { z } from "zod";
import type { KnowledgeGraph, KnowledgeNode } from "../domain/graph.js";

export const knowledgeNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  path: z.string(),
  line: z.number().int().positive(),
  kind: z.enum(["file", "symbol", "document"]),
  group: z.string(),
});
export const knowledgeEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  relation: z.string(),
  inferred: z.boolean(),
});
export const knowledgeGraphSchema = z.object({
  revision: z.string(),
  indexedAt: z.string(),
  nodes: z.array(knowledgeNodeSchema),
  edges: z.array(knowledgeEdgeSchema),
  fileCount: z.number().int().nonnegative(),
  limitations: z.array(z.string()),
});
const extractionSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(), label: z.string(),
    source_file: z.string().optional(),
    source_location: z.string().optional(),
    file_type: z.string().optional(),
  })),
  edges: z.array(z.object({
    source: z.string(), target: z.string(), relation: z.string().optional(),
    confidence: z.union([z.string(), z.number()]).optional(),
  })),
});

export function normalizeGraph(raw: unknown, files: Record<string, string>, revision: string, limitations: string[]): KnowledgeGraph {
  const extraction = extractionSchema.parse(raw);
  const nodes: KnowledgeNode[] = [];
  const ids = new Set<string>();
  for (const node of extraction.nodes) {
    const path = node.source_file?.replaceAll("\\", "/");
    if (!path || !(path in files) || ids.has(node.id)) continue;
    ids.add(node.id);
    const line = Math.max(1, Number(node.source_location?.match(/L(\d+)/)?.[1] ?? 1));
    nodes.push({
      id: node.id, label: node.label, path, line,
      kind: node.label === path.split("/").at(-1) ? "file" : "symbol",
      group: path.includes("/") ? path.split("/").slice(0, -1).join("/") : "Raíz",
    });
  }
  const covered = new Set(nodes.map((node) => node.path));
  for (const path of Object.keys(files)) {
    if (covered.has(path)) continue;
    const id = `document:${path}`;
    if (ids.has(id)) throw new Error(`Identificador de grafo duplicado: ${id}`);
    ids.add(id);
    nodes.push({ id, label: path.split("/").at(-1)!, path, line: 1, kind: "document", group: path.includes("/") ? path.split("/").slice(0, -1).join("/") : "Raíz" });
  }
  return {
    revision, indexedAt: new Date().toISOString(), fileCount: Object.keys(files).length, limitations,
    nodes,
    edges: extraction.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)).map((edge) => ({
      source: edge.source, target: edge.target, relation: edge.relation ?? "related",
      inferred: edge.confidence !== undefined && edge.confidence !== "EXTRACTED" && edge.confidence !== 1,
    })),
  };
}
