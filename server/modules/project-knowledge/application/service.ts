import type { KnowledgeAnswer, KnowledgeGraph } from "../domain/graph.js";

export interface KnowledgeEngine {
  fingerprint(files: Record<string, string>): string;
  read(projectId: string): Promise<KnowledgeGraph | undefined>;
  build(projectId: string, files: Record<string, string>, revision: string, limitations: string[]): Promise<KnowledgeGraph>;
  query(projectId: string, query: string): Promise<string>;
}
export interface KnowledgeFiles {
  readAllFiles(projectId: string): Promise<Record<string, string>>;
}

export function prepareCorpus(files: Record<string, string>, findSecret: (text: string) => string | null = () => null) {
  const corpus: Record<string, string> = Object.create(null);
  const limitations: string[] = [];
  let bytes = 0;
  for (const [original, content] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    const path = original.replaceAll("\\", "/");
    const segments = path.split("/");
    if (segments.some((part) => !part || part === "." || part === ".." || part.includes(":")) || /[\0\r\n]/.test(path)) {
      throw new Error(`Ruta no válida para indexación: ${original}`);
    }
    if (segments.some((part) => /^(node_modules|\.git|graphify-out)$/i.test(part)) ||
        segments.some((part) => /^\.env($|\.)/i.test(part)) ||
        /(^|\/)(credentials|secrets)(\.|\/|$)/i.test(path) ||
        /\.(pem|key|p12|pfx|png|jpe?g|gif|webp|ico|pdf|zip|woff2?|mp[34])$/i.test(path)) {
      limitations.push(`Excluido: ${path} (secreto, generado o formato no textual).`);
      continue;
    }
    if (findSecret(content)) {
      limitations.push(`Excluido: ${path} (contiene un posible secreto).`);
      continue;
    }
    if (Object.hasOwn(corpus, path)) throw new Error(`Ruta de indexación duplicada: ${path}`);
    const size = new TextEncoder().encode(content).length;
    bytes += size;
    if (size > 1_000_000 || bytes > 50_000_000 || Object.keys(corpus).length >= 5000) {
      throw new Error("El proyecto supera el límite de indexación (5000 archivos, 1 MB por archivo, 50 MB total).");
    }
    corpus[path] = content;
  }
  return { files: corpus, limitations };
}

export function createKnowledgeService(repository: KnowledgeFiles, engine: KnowledgeEngine, findSecret: (text: string) => string | null = () => null) {
  const pending = new Map<string, Promise<void>>();
  async function exclusive<T>(projectId: string, work: () => Promise<T>): Promise<T> {
    const previous = pending.get(projectId) ?? Promise.resolve();
    const run = previous.then(work);
    const settled = run.then(() => undefined, () => undefined);
    pending.set(projectId, settled);
    try { return await run; }
    finally { if (pending.get(projectId) === settled) pending.delete(projectId); }
  }
  async function index(projectId: string, corpus: ReturnType<typeof prepareCorpus>, force = false) {
    const revision = engine.fingerprint(corpus.files);
    const cached = await engine.read(projectId);
    if (!force && cached?.revision === revision) return { ...cached, limitations: corpus.limitations };
    return engine.build(projectId, corpus.files, revision, corpus.limitations);
  }
  return {
    graph: (projectId: string, force = false) => exclusive(projectId, async () => index(projectId, prepareCorpus(await repository.readAllFiles(projectId), findSecret), force)),
    async question(projectId: string, query: string): Promise<KnowledgeAnswer> {
      if (typeof query !== "string") throw new Error('El campo "query" es obligatorio y debe ser un texto de entre 1 y 1000 caracteres.');
      const text = query.trim();
      if (!text || text.length > 1000) throw new Error('El campo "query" debe tener entre 1 y 1000 caracteres.');
      return exclusive(projectId, async () => {
        const corpus = prepareCorpus(await repository.readAllFiles(projectId), findSecret);
        const current = await index(projectId, corpus);
        const evidence = await engine.query(projectId, text);
        const words = text.toLocaleLowerCase().split(/[^\p{L}\p{N}_]+/u).filter((word) => word.length > 2);
        const documents = current.nodes.filter((node) => node.kind === "document" && words.some((word) => corpus.files[node.path].toLocaleLowerCase().includes(word)));
        const cited = [...current.nodes.filter((node) => evidence.includes(`NODE ${node.label} [src=${node.path} `)), ...documents].slice(0, 12);
        const sources = cited.map((node) => {
          const lines = corpus.files[node.path].split("\n");
          const match = node.kind === "document" ? lines.findIndex((line) => words.some((word) => line.toLocaleLowerCase().includes(word))) : -1;
          const startLine = Math.min(match >= 0 ? match + 1 : node.line, Math.max(1, lines.length));
          const endLine = Math.min(lines.length, startLine + 19);
          return { path: node.path, startLine, endLine, text: lines.slice(startLine - 1, endLine).join("\n") };
        });
        return { query: text, evidence, sources, indexedRevision: current.revision, limitations: corpus.limitations };
      });
    },
    async source(projectId: string, path: string) {
      const corpus = prepareCorpus(await repository.readAllFiles(projectId), findSecret);
      if (!Object.hasOwn(corpus.files, path)) throw new Error("Archivo no disponible en el índice de conocimiento.");
      return { path, text: corpus.files[path] };
    },
  };
}
