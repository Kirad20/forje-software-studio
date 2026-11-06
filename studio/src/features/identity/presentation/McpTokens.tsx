import { useEffect, useState } from "react";
import { identityController } from "../application/controller.js";
import { browser } from "../../../shared/infrastructure/browser.js";
import { timeAgo } from "../../../shared/presentation/format.js";

type Token = {
  id: string;
  name: string;
  projectId: string | null;
  orgId: string | null;
  orgName: string | null;
  lastUsedAt: string | null;
  createdAt: string;
};

type Project = { id: string; name: string };

export function McpTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tokenName, setTokenName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [fresh, setFresh] = useState<{ token: string; name: string; projectName: string | null } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const mcpUrl = `${browser.location.protocol}//${browser.location.port === "5173" ? `${browser.location.hostname}:4100` : browser.location.host}/mcp`;
  const load = async () => {
    const tokenResult = await identityController.listTokens();
    setTokens(tokenResult.tokens);
    try {
      const projectResult = await identityController.listProjects();
      const accessible = [...projectResult.projects, ...projectResult.shared];
      setProjects([...new Map(accessible.map((project) => [project.id, project])).values()]);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void load().catch((e) => setError((e as Error).message));
  }, []);
  const projectName = (id: string | null) => projects.find((project) => project.id === id)?.name ?? "Proyecto eliminado";
  const commandFor = (token: string) => `claude mcp add --transport http forja ${mcpUrl} --header "Authorization: Bearer ${token}"`;
  const configFor = (token: string) => JSON.stringify({
    mcpServers: { forja: { type: "http", url: mcpUrl, headers: { Authorization: `Bearer ${token}` } } },
  }, null, 2);

  return (
    <section className="card stack" style={{ padding: 18 }}>
      <div>
        <div className="section-title" style={{ margin: 0 }}>Agentes conectados · MCP</div>
        <div className="small muted">
          Claude Code/Desktop, ChatGPT, Cursor y otros clientes MCP usan su propio modelo para construir con tus herramientas y proyectos autorizados. No pasan por el chat interno de Forja.
        </div>
      </div>
      <div className="kv">
        <span className="muted">Servidor MCP</span><code>{mcpUrl}</code>
        <span className="muted">Transporte</span><span>Streamable HTTP · Authorization: Bearer</span>
      </div>
      <form className="stack" onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        setFresh(null);
        try {
          const result = await identityController.createToken(tokenName, projectId || null);
          setFresh({
            token: result.token,
            name: tokenName.trim() || "Cliente MCP",
            projectName: projectId ? projectName(projectId) : null,
          });
          setTokenName("");
          await load();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}>
        <div className="row">
          <input aria-label="Nombre del agente" placeholder="Nombre (p. ej. Claude Code)" maxLength={100} value={tokenName} onChange={(e) => setTokenName(e.target.value)} />
          <select aria-label="Alcance del token" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Todos los proyectos accesibles</option>
            {projects.map((project) => <option key={project.id} value={project.id}>Solo: {project.name}</option>)}
          </select>
          <button className="primary" disabled={busy}>{busy ? "Creando…" : "Crear token MCP"}</button>
        </div>
        <div className="small muted">Recomendado: limita cada token a un solo proyecto. Los tokens de proyecto no pueden listar ni modificar otros proyectos ni crear proyectos nuevos.</div>
      </form>
      {error && <div className="error-box" role="alert">{error}</div>}
      {fresh && (
        <div className="pill ok stack" style={{ padding: 12, borderRadius: 8 }}>
          <strong>Copia ahora; el secreto no se volverá a mostrar.</strong>
          <span>{fresh.name} · {fresh.projectName ? `Solo ${fresh.projectName}` : "Todos los proyectos accesibles"}</span>
          <code style={{ userSelect: "all", wordBreak: "break-all" }}>{fresh.token}</code>
          <div className="small">Para Claude Code</div>
          <code style={{ overflowWrap: "anywhere" }}>{commandFor(fresh.token)}</code>
          <button type="button" onClick={() => void browser.writeClipboard(commandFor(fresh.token)).catch(() => setError("No se pudo copiar. Selecciona el comando manualmente."))}>Copiar comando de Claude Code</button>
          <div className="small">Configuración JSON para Claude Desktop y otros clientes</div>
          <pre style={{ margin: 0, overflow: "auto", whiteSpace: "pre-wrap" }}>{configFor(fresh.token)}</pre>
          <button type="button" onClick={() => void browser.writeClipboard(configFor(fresh.token)).catch(() => setError("No se pudo copiar. Selecciona la configuración manualmente."))}>Copiar configuración MCP</button>
        </div>
      )}
      {tokens.map((token) => (
        <div key={token.id} className="row" style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
          <div className="grow">
            <strong>{token.name}</strong>
            <div className="small muted">
              {token.projectId ? `Solo ${projectName(token.projectId)}` : token.orgId ? `Organización: ${token.orgName ?? "sin nombre"}` : "Todos los proyectos accesibles"}
              {" · "}creado {timeAgo(token.createdAt)} · {token.lastUsedAt ? `último uso ${timeAgo(token.lastUsedAt)}` : "sin usar"}
            </div>
          </div>
          <button className="sm danger" disabled={busy} onClick={async () => {
            if (!window.confirm(`¿Revocar el token «${token.name}»? El agente perderá el acceso al momento.`)) return;
            setBusy(true);
            setError("");
            try {
              await identityController.deleteToken(token.id);
              setFresh(null);
              await load();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}>Revocar</button>
        </div>
      ))}
      {!tokens.length && <div className="small muted">Aún no tienes tokens MCP.</div>}
    </section>
  );
}
