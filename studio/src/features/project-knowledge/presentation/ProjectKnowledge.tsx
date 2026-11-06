import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrainCircuit, ChevronRight, FileCode2, FolderTree, Maximize2, Minus, Plus, RefreshCw, Search, Sparkles } from "lucide-react";
import { api } from "../../projects/application/controller.js";
import { buildGraphView, type GraphCard, type GraphQuestion, type ProjectGraph } from "../application/graph.js";
import "./ProjectKnowledge.css";

export function ProjectKnowledge({ projectId, reloadKey }: { projectId: string; reloadKey: number }) {
  const [graph, setGraph] = useState<ProjectGraph>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"modules" | "files">("modules");
  const [search, setSearch] = useState("");
  const [focus, setFocus] = useState<string>();
  const [selected, setSelected] = useState<string>();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<GraphQuestion>();
  const [asking, setAsking] = useState(false);
  const [source, setSource] = useState<{ path: string; text: string }>();
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const viewport = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | undefined>(undefined);
  const requestId = useRef(0);
  const sourceRequestId = useRef(0);

  const load = useCallback(async (force = false) => {
    const current = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const result = await api<ProjectGraph>(`/projects/${projectId}/knowledge${force ? "/rebuild" : ""}`, force ? { method: "POST" } : {});
      if (requestId.current === current) setGraph(result);
    } catch (e) {
      if (requestId.current === current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (requestId.current === current) setLoading(false);
    }
  }, [projectId]);
  useEffect(() => {
    setGraph(undefined);
    setAnswer(undefined);
    setSelected(undefined);
    setSource(undefined);
    setFocus(undefined);
    setSearch("");
  }, [projectId]);
  useEffect(() => {
    void load();
    return () => { requestId.current++; sourceRequestId.current++; };
  }, [load, reloadKey]);
  const view = useMemo(() => graph ? buildGraphView(graph, mode, search, focus) : { cards: [], connections: [], width: 720, height: 440 }, [graph, mode, search, focus]);
  const card = view.cards.find((node) => node.id === selected);
  const neighbors = useMemo(() => new Set(view.connections.filter((edge) => edge.source === selected || edge.target === selected).flatMap((edge) => [edge.source, edge.target])), [view, selected]);
  const symbols = graph?.nodes.filter((node) => card && (card.path ? node.path === card.path : node.group === card.id)) ?? [];
  const fit = useCallback(() => {
    const bounds = viewport.current?.getBoundingClientRect();
    if (!bounds) return;
    const zoom = Math.min(bounds.width / view.width, bounds.height / view.height, 1);
    setCamera({ x: (bounds.width - view.width * zoom) / 2, y: (bounds.height - view.height * zoom) / 2, zoom });
  }, [view.width, view.height]);
  useEffect(() => {
    fit();
    const observer = new ResizeObserver(fit);
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [fit]);
  const zoom = (factor: number) => {
    const bounds = viewport.current?.getBoundingClientRect();
    if (!bounds) return;
    setCamera((previous) => {
      const next = Math.min(2, Math.max(.12, previous.zoom * factor));
      const ratio = next / previous.zoom;
      return { zoom: next, x: bounds.width / 2 - (bounds.width / 2 - previous.x) * ratio, y: bounds.height / 2 - (bounds.height / 2 - previous.y) * ratio };
    });
  };
  const select = (node: GraphCard) => {
    setSelected(node.id);
    setSource(undefined);
    sourceRequestId.current++;
  };
  const openSource = async (path: string) => {
    const current = ++sourceRequestId.current;
    try {
      const result = await api<{ path: string; text: string }>(`/projects/${projectId}/knowledge/source?path=${encodeURIComponent(path)}`);
      if (current === sourceRequestId.current) setSource(result);
    } catch (e) {
      if (current === sourceRequestId.current) setError(e instanceof Error ? e.message : String(e));
    }
  };
  const ask = async () => {
    setAsking(true);
    setError("");
    setAnswer(undefined);
    const current = requestId.current;
    try {
      const result = await api<GraphQuestion>(`/projects/${projectId}/knowledge/question`, { method: "POST", body: { query: question } });
      if (current === requestId.current) setAnswer(result);
    } catch (e) {
      if (current === requestId.current) setError(e instanceof Error ? e.message : String(e));
    } finally { setAsking(false); }
  };

  return <div className="knowledge">
    <header className="knowledge-heading">
      <div className="knowledge-title"><BrainCircuit /><div><h2>Cerebro del proyecto</h2><p>La arquitectura que estás construyendo, conectada a sus fuentes.</p></div></div>
      <div><button onClick={() => void load(true)} disabled={loading}><RefreshCw size={14} />{loading ? "Indexando…" : "Actualizar índice"}</button>{graph && <p><small>Revisión {graph.revision.slice(0, 8)} · {new Date(graph.indexedAt).toLocaleString()}</small></p>}</div>
    </header>
    {error && <div className="knowledge-error" role="alert">{error}</div>}
    {!graph && loading ? <div className="knowledge-empty" role="status"><BrainCircuit size={36} /><h3>Construyendo el mapa del proyecto</h3><p>Graphify procesa el código localmente. La primera indexación puede tardar.</p></div> : !graph ? <div className="knowledge-empty"><h3>No se pudo construir el índice</h3><button onClick={() => void load()}>Reintentar</button></div> : <>
      <div className="knowledge-stats">
        <div className="knowledge-stat"><strong>{graph.fileCount}</strong><span>Archivos procesados</span></div>
        <div className="knowledge-stat"><strong>{new Set(graph.nodes.map((node) => node.group)).size}</strong><span>Módulos / carpetas</span></div>
        <div className="knowledge-stat"><strong>{graph.nodes.filter((node) => node.kind === "symbol").length}</strong><span>Símbolos</span></div>
        <div className="knowledge-stat"><strong>{graph.edges.length}</strong><span>Relaciones extraídas</span></div>
      </div>
      <div className="knowledge-toolbar">
        <label className="knowledge-search"><Search size={16} /><input aria-label="Buscar en el grafo" placeholder="Buscar módulos, archivos o símbolos…" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
        <div className="knowledge-segments"><button aria-pressed={mode === "modules"} onClick={() => { setMode("modules"); setFocus(undefined); setSelected(undefined); }}><FolderTree size={14} />Módulos</button><button aria-pressed={mode === "files"} onClick={() => { setMode("files"); setSelected(undefined); }}><FileCode2 size={14} />Archivos</button></div>
      </div>
      {focus && <div className="knowledge-breadcrumb"><button onClick={() => { setFocus(undefined); setMode("modules"); setSelected(undefined); }}>Todo el proyecto</button><ChevronRight size={12} />{focus}</div>}
      <div className="knowledge-layout">
        <div className="knowledge-canvas">
          <svg ref={viewport} className="knowledge-viewport" aria-label="Mapa interactivo de la arquitectura" onWheel={(e) => { zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1); }} onPointerDown={(e) => {
            if (e.target !== e.currentTarget) return;
            drag.current = { x: e.clientX, y: e.clientY, ox: camera.x, oy: camera.y };
            e.currentTarget.setPointerCapture(e.pointerId);
          }} onPointerMove={(e) => {
            const origin = drag.current;
            if (origin) setCamera((previous) => ({ ...previous, x: origin.ox + e.clientX - origin.x, y: origin.oy + e.clientY - origin.y }));
          }} onPointerUp={() => { drag.current = undefined; }} onPointerCancel={() => { drag.current = undefined; }}>
            <defs><marker id={`knowledge-arrow-${projectId}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" /></marker></defs>
            <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}>
              {view.connections.map((edge) => {
                const from = view.cards.find((node) => node.id === edge.source)!;
                const to = view.cards.find((node) => node.id === edge.target)!;
                const active = edge.source === selected || edge.target === selected;
                return <path key={JSON.stringify([edge.source, edge.target])} className={`knowledge-link ${active ? "active" : ""} ${edge.inferred ? "inferred" : ""}`} d={`M ${from.x + 110} ${from.y + 86} C ${from.x + 110} ${from.y + 130}, ${to.x + 110} ${to.y - 44}, ${to.x + 110} ${to.y}`} markerEnd={active ? `url(#knowledge-arrow-${projectId})` : undefined}><title>{edge.relations.join(", ")} · {edge.count} relaciones</title></path>;
              })}
              {view.cards.map((node) => <g key={node.id} role="button" tabIndex={0} aria-label={`${node.label}, ${node.count} elementos`} className={`knowledge-node ${selected === node.id ? "selected" : ""} ${card && selected !== node.id && !neighbors.has(node.id) ? "dim" : ""}`} transform={`translate(${node.x} ${node.y})`} onClick={() => select(node)} onDoubleClick={() => { if (mode === "modules") { setFocus(node.id); setMode("files"); setSelected(undefined); } }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(node); } }}>
                <title>{node.id}</title><rect width="220" height="86" rx="14" /><text x="16" y="27" className="knowledge-node-icon">{node.kind === "module" ? "◇" : "⌘"}</text><text x="42" y="27">{node.label.length > 23 ? `${node.label.slice(0, 21)}…` : node.label}</text><text x="16" y="52" className="knowledge-node-meta">{node.kind === "module" ? "Módulo / carpeta" : node.kind === "document" ? "Documento / configuración" : "Archivo de código"}</text><text x="16" y="70" className="knowledge-node-meta">{node.count} {node.count === 1 ? "elemento" : "elementos"} · {view.connections.filter((edge) => edge.source === node.id || edge.target === node.id).length} conexiones</text>
              </g>)}
            </g>
          </svg>
          {view.cards.length === 0 && <div className="knowledge-empty"><Search size={28} /><h3>{graph.fileCount ? "Sin resultados para este filtro" : "Este proyecto aún no tiene archivos indexables"}</h3></div>}
          <div className="knowledge-canvas-tools"><button aria-label="Alejar grafo" onClick={() => zoom(1 / 1.2)}><Minus size={16} /></button><span>{Math.round(camera.zoom * 100)}%</span><button aria-label="Acercar grafo" onClick={() => zoom(1.2)}><Plus size={16} /></button><button aria-label="Ajustar grafo a la pantalla" onClick={fit}><Maximize2 size={16} /></button></div>
          <div className="knowledge-legend"><span>Extraída</span><span>Inferida</span></div>
        </div>
        <aside className="knowledge-inspector" aria-label="Inspector del grafo">
          {card ? <><h3>{card.label}</h3><code>{card.id}</code><p>{symbols.length} elementos en las fuentes</p>
            {mode === "modules" && <button onClick={() => { setFocus(card.id); setMode("files"); setSelected(undefined); }}><FolderTree size={14} />Explorar archivos</button>}
            {card.path && <button onClick={() => void openSource(card.path!)}><FileCode2 size={14} />Ver código fuente</button>}
            <h4>Conexiones</h4>{view.connections.filter((edge) => edge.source === card.id || edge.target === card.id).map((edge) => {
              const other = view.cards.find((node) => node.id === (edge.source === card.id ? edge.target : edge.source))!;
              return <button key={JSON.stringify([edge.source, edge.target])} onClick={() => select(other)}><ChevronRight size={12} /><span>{other.label}<br /><small>{edge.source === card.id ? "→" : "←"} {edge.relations.join(", ")} · {edge.count}</small></span></button>;
            })}{!neighbors.size && <p>No hay relaciones entre archivos en esta vista. Las relaciones internas aparecen como símbolos.</p>}
            <h4>Símbolos y fuentes</h4>{symbols.slice(0, 80).map((node) => <div className="knowledge-symbol" key={node.id}><span>{node.label}</span><button onClick={() => void openSource(node.path)}><span>{node.path}:{node.line}</span></button></div>)}{symbols.length > 80 && <p>Mostrando 80 de {symbols.length}; usa la búsqueda para acotar.</p>}
          </> : <div className="knowledge-empty"><FolderTree size={28} /><h3>Explora tu arquitectura</h3><p>Selecciona una tarjeta para ver sus relaciones y fuentes. Abre un módulo para recorrer sus archivos.</p></div>}
        </aside>
      </div>
      {source && <div className="knowledge-evidence"><details open><summary>{source.path}</summary><pre>{source.text}</pre></details></div>}
      <section className="knowledge-question"><h3><Sparkles size={16} /> Consultar el cerebro</h3><p>Recupera evidencia para que el agente explique el proyecto con fuentes, sin inventar relaciones.</p><form onSubmit={(e) => { e.preventDefault(); void ask(); }}><input aria-label="Pregunta sobre el proyecto" maxLength={1000} placeholder="¿Cómo se configuran los agentes?" value={question} onChange={(e) => setQuestion(e.target.value)} /><button disabled={asking || !question.trim()}>{asking ? "Consultando…" : "Buscar evidencia"}</button></form>
        {answer && <div className="knowledge-evidence">{answer.sources.length ? answer.sources.map((item, i) => <details key={`${item.path}:${item.startLine}:${i}`}><summary>{item.path}:{item.startLine}–{item.endLine}</summary><pre>{item.text}</pre></details>) : <p>No se encontró evidencia suficiente. Prueba con el nombre de un módulo o símbolo.</p>}<details><summary>Recorrido del grafo · revisión {answer.indexedRevision.slice(0, 8)}</summary><pre>{answer.evidence}</pre></details></div>}
      </section>
      {!!graph.limitations.length && <details className="knowledge-limitations"><summary>{graph.limitations.length} archivos excluidos · cobertura del índice</summary>{graph.limitations.map((item) => <p key={item}>{item}</p>)}</details>}
    </>}
  </div>;
}
