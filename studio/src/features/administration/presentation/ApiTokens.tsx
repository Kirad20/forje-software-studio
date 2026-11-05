import { useEffect, useState } from "react";
import { api } from "../application/controller.js";
import { browser } from "../../../shared/infrastructure/browser.js";
import { timeAgo } from "../../../shared/presentation/format.js";
import { useConfirmation } from "../../../shared/ConfirmDialog.js";

interface AdminToken {
  id: string;
  name: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export function ApiTokens() {
  const { confirm, dialog } = useConfirmation();
  const [tokens, setTokens] = useState<AdminToken[] | null>(null);
  const [name, setName] = useState("");
  const [days, setDays] = useState(30);
  const [fresh, setFresh] = useState<{ token: string; id: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const endpoint = `${browser.location.protocol}//${browser.location.host}/admin/mcp`;
  const configuration = JSON.stringify({
    mcpServers: { "forja-admin": { url: endpoint, headers: { Authorization: "Bearer <ADMIN_API_TOKEN>" } } },
  }, null, 2);
  const load = () => api<{ tokens: AdminToken[] }>("/admin/tokens").then((result) => setTokens(result.tokens));
  useEffect(() => { void load().catch((e) => setError((e as Error).message)); }, []);

  const copy = async (text: string) => {
    try {
      await browser.writeClipboard(text);
      setNotice("Copiado.");
    } catch {
      setError("No se pudo copiar. Selecciona y copia el texto manualmente.");
    }
  };
  const revoke = async (token: AdminToken) => {
    if (!(await confirm(`¿Revocar el token «${token.name}»? Sus clientes perderán el acceso al momento.`))) return;
    setBusy(true);
    setError("");
    try {
      await api(`/admin/tokens/${encodeURIComponent(token.id)}`, { method: "DELETE" });
      if (fresh?.id === token.id) setFresh(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 16 }}>
      {dialog}
      <section className="card stack" style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>API tokens de administración</h2>
        <p className="small muted" style={{ margin: 0 }}>
          Tokens personales para depurar y configurar la plataforma mediante MCP. No permiten construir proyectos
          ni acceder a /mcp o a las API de proyectos. Solo funcionan mientras tu cuenta sea administradora y esté activa.
        </p>
        <div className="kv">
          <span className="muted">Endpoint</span><code>{endpoint}</code>
          <span className="muted">Autenticación</span><code>Authorization: Bearer &lt;ADMIN_API_TOKEN&gt;</code>
          <span className="muted">Transporte</span><span>Streamable HTTP</span>
        </div>
        <pre style={{ margin: 0, overflow: "auto" }}>{configuration}</pre>
        <div><button onClick={() => void copy(configuration)}>Copiar configuración</button></div>
        <div className="small muted">Sustituye &lt;ADMIN_API_TOKEN&gt; en tu cliente MCP. No compartas ni guardes el token en el repositorio.</div>
      </section>
      {error && <div className="error-box" role="alert">{error}</div>}
      {notice && <div className="small muted" role="status">{notice}</div>}
      <form className="card stack" style={{ padding: 18 }} onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setNotice("");
        setFresh(null);
        try {
          const result = await api<{ token: string; id: string }>("/admin/tokens", {
            method: "POST", body: { name, expiresAt: new Date(Date.now() + days * 86_400_000).toISOString() },
          });
          setFresh(result);
          setName("");
          await load();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}>
        <label>Nombre del cliente
          <input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="p. ej. Diagnóstico local" />
        </label>
        <label>Caduca en (días, máximo 90)
          <input type="number" required min={1} max={90} value={days} onChange={(e) => setDays(Number(e.target.value))} />
        </label>
        <div><button className="primary" disabled={busy || !name.trim()}>Crear token de administración</button></div>
      </form>
      {fresh && <section className="pill ok stack" style={{ padding: 14, borderRadius: 8 }} aria-label="Token recién creado">
        <strong>Copia el token ahora: no volverá a mostrarse.</strong>
        <code style={{ userSelect: "all", wordBreak: "break-all" }}>{fresh.token}</code>
        <div className="row">
          <button onClick={() => void copy(fresh.token)}>Copiar token</button>
          <button onClick={() => setFresh(null)}>Ocultar token</button>
        </div>
      </section>}
      <section className="card" style={{ padding: 0, overflow: "auto" }}>
        <table className="grid">
          <thead><tr><th>Nombre</th><th>Creado</th><th>Caducidad</th><th>Último uso</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {tokens?.map((token) => {
              const expired = new Date(token.expiresAt).getTime() <= Date.now();
              return <tr key={token.id}>
                <td>{token.name}</td>
                <td>{timeAgo(token.createdAt)}</td>
                <td>{new Date(token.expiresAt).toLocaleString()}</td>
                <td>{token.lastUsedAt ? timeAgo(token.lastUsedAt) : "Sin usar"}</td>
                <td>{token.revokedAt ? "Revocado" : expired ? "Caducado" : "Activo"}</td>
                <td><button className="sm danger" disabled={busy || !!token.revokedAt} onClick={() => void revoke(token)}>Revocar</button></td>
              </tr>;
            })}
            {!tokens?.length && <tr><td colSpan={6} className="empty">{tokens ? "No tienes tokens de administración." : error ? "No se pudieron cargar los tokens." : "Cargando…"}</td></tr>}
          </tbody>
        </table>
        <div style={{ padding: 12 }}><button disabled={busy} onClick={() => { setError(""); void load().catch((e) => setError((e as Error).message)); }}>Actualizar</button></div>
      </section>
    </div>
  );
}
