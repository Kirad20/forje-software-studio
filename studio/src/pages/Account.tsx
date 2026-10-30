import { useEffect, useState } from "react";
import { api, timeAgo } from "../api";
import type { Me } from "../App";

interface Token {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export function Account({ me }: { me: Me }) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fresh, setFresh] = useState("");
  const [name, setName] = useState("");
  const load = () => api<{ tokens: Token[] }>("/tokens").then((r) => setTokens(r.tokens));
  useEffect(() => {
    void load();
  }, []);

  // Under `vite` dev the studio is on 5173 while the platform (and /mcp) stays on 4100.
  const mcpUrl = `${location.protocol}//${location.port === "5173" ? `${location.hostname}:4100` : location.host}/mcp`;

  return (
    <div className="page stack" style={{ maxWidth: 760, gap: 20 }}>
      <h1 style={{ fontSize: 26 }}>Cuenta</h1>
      <div className="card" style={{ padding: 18 }}>
        <div className="kv">
          <span className="muted">Correo</span>
          <span>{me.email}</span>
          <span className="muted">Créditos</span>
          <span>{me.credits.toLocaleString()} — los gastan el constructor y la IA dentro de tus apps</span>
        </div>
      </div>

      <div className="card stack" style={{ padding: 18 }}>
        <div>
          <h3>Construir desde Claude, ChatGPT, Cursor o cualquier cliente MCP</h3>
          <p className="muted small" style={{ margin: "4px 0 0" }}>
            Conecta Forja como servidor MCP remoto y tu asistente usará las mismas herramientas que el constructor: crear proyectos, escribir
            archivos, ejecutar SQL, leer registros y publicar. El modelo lo pone tu asistente.
          </p>
        </div>
        <div className="kv">
          <span className="muted">URL del servidor</span>
          <code>{mcpUrl}</code>
          <span className="muted">Transporte</span>
          <span>Streamable HTTP</span>
          <span className="muted">Autenticación</span>
          <code>Authorization: Bearer &lt;token&gt;</code>
        </div>
        <pre className="card" style={{ padding: 12, margin: 0, overflow: "auto", boxShadow: "none" }}>
          {`claude mcp add --transport http forja ${mcpUrl} --header "Authorization: Bearer <token>"`}
        </pre>
        <div className="row">
          <input placeholder="Nombre del token (p. ej. Claude Code)" value={name} onChange={(e) => setName(e.target.value)} />
          <button
            className="primary"
            onClick={async () => {
              const r = await api<{ token: string }>("/tokens", { body: { name } });
              setFresh(r.token);
              setName("");
              void load();
            }}
          >
            Crear token
          </button>
        </div>
        {fresh && (
          <div className="pill ok" style={{ padding: 10, borderRadius: 8, display: "grid", gap: 4 }}>
            <span>Cópialo ahora; no volverá a mostrarse:</span>
            <code style={{ userSelect: "all", wordBreak: "break-all" }}>{fresh}</code>
          </div>
        )}
        {tokens.length > 0 && (
          <table className="grid">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Creado</th>
                <th>Último uso</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{timeAgo(t.createdAt)}</td>
                  <td>{t.lastUsedAt ? timeAgo(t.lastUsedAt) : "nunca"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="sm danger" onClick={() => api(`/tokens/${t.id}`, { method: "DELETE" }).then(load)}>
                      Revocar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
