export interface GraphNode {
  id: string;
  label: string;
  path: string;
  line: number;
  kind: "file" | "symbol" | "document";
  group: string;
}
export interface GraphEdge { source: string; target: string; relation: string; inferred: boolean }
export interface ProjectGraph {
  revision: string;
  indexedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  fileCount: number;
  limitations: string[];
}
export interface GraphQuestion {
  query: string;
  evidence: string;
  sources: { path: string; startLine: number; endLine: number; text: string }[];
  indexedRevision: string;
  limitations: string[];
}

export interface GraphCard {
  id: string;
  label: string;
  group: string;
  path?: string;
  kind: "module" | GraphNode["kind"];
  count: number;
  x: number;
  y: number;
}
export interface GraphConnection { source: string; target: string; relations: string[]; count: number; inferred: boolean }

export function buildGraphView(graph: ProjectGraph, mode: "modules" | "files", filter: string, focus?: string) {
  const query = filter.trim().toLocaleLowerCase();
  const matches = graph.nodes.filter((node) => (!query || `${node.label} ${node.path}`.toLocaleLowerCase().includes(query)) && (!focus || node.group === focus));
  const groups = new Map<string, GraphNode[]>();
  const owners = new Map<string, string>();
  for (const node of matches) {
    const id = mode === "modules" ? node.group : node.path;
    const members = groups.get(id) ?? [];
    members.push(node);
    groups.set(id, members);
    owners.set(node.id, id);
  }
  const sorted = [...groups].sort(([a], [b]) => a.localeCompare(b));
  const columns = Math.max(1, Math.ceil(Math.sqrt(sorted.length * 1.5)));
  const cards: GraphCard[] = sorted.map(([id, nodes], i) => ({
    id, label: mode === "modules" ? id : id.split("/").at(-1)!,
    group: nodes[0].group, path: mode === "files" ? id : undefined,
    kind: mode === "modules" ? "module" : nodes.some((node) => node.kind === "file") ? "file" : "document",
    count: nodes.length, x: 60 + (i % columns) * 280, y: 60 + Math.floor(i / columns) * 160,
  }));
  const connections = new Map<string, GraphConnection>();
  for (const edge of graph.edges) {
    const source = owners.get(edge.source);
    const target = owners.get(edge.target);
    if (!source || !target || source === target) continue;
    const key = JSON.stringify([source, target]);
    const existing = connections.get(key);
    if (existing) {
      existing.count++;
      if (!existing.relations.includes(edge.relation)) existing.relations.push(edge.relation);
      existing.inferred &&= edge.inferred;
    } else connections.set(key, { source, target, count: 1, relations: [edge.relation], inferred: edge.inferred });
  }
  return {
    cards, connections: [...connections.values()],
    width: Math.max(720, columns * 280 + 80),
    height: Math.max(440, Math.ceil(cards.length / columns) * 160 + 80),
  };
}
