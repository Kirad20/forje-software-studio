export interface KnowledgeNode {
  id: string;
  label: string;
  path: string;
  line: number;
  kind: "file" | "symbol" | "document";
  group: string;
}
export interface KnowledgeEdge { source: string; target: string; relation: string; inferred: boolean }
export interface KnowledgeGraph {
  revision: string;
  indexedAt: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  fileCount: number;
  limitations: string[];
}
export interface KnowledgeSource { path: string; startLine: number; endLine: number; text: string }
export interface KnowledgeAnswer {
  query: string;
  evidence: string;
  sources: KnowledgeSource[];
  indexedRevision: string;
  limitations: string[];
}
