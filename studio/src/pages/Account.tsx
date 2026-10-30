import { useEffect, useState, type ReactNode } from "react";
import { api, timeAgo } from "../api";
import type { Me } from "../App";
import { AccountModels } from "../components/Models";
import { Modal } from "../components/ui";
import { applyTheme, savedTheme, type Theme } from "../theme";

interface Token {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
}

const Row = ({ title, hint, children }: { title: string; hint?: ReactNode; children?: ReactNode }) => (
  <div className="row-setting" style={{ padding: "12px 0", borderTop: "1px solid var(--border)" }}>
    <div>
      <div style={{ fontWeight: 500 }}>{title}</div>
      {hint && <div className="small muted">{hint}</div>}
    </div>
    {children}
  </div>
);

export function Account({ me, onChange }: { me: Me; onChange: () => void }) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fresh, setFresh] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [name, setName] = useState(me.name ?? "");
  const [theme, setTheme] = useState<Theme>(savedTheme());
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState(false);
  const load = () => api<{ tokens: Token[] }>("/tokens").then((r) => setTokens(r.tokens));
  useEffect(() => {
    void load();
  }, []);

  // Under `vite` dev the studio is on 5173 while the platform (and /mcp) stays on 4100.
  const mcpUrl = `${location.protocol}//${location.port === "5173" ? `${location.hostname}:4100` : location.host}/mcp`;

  return (
    <div className="page stack" style={{ maxWidth: 760, gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 24 }}>Cuenta</h1>
        <div className="muted">Tu perfil, agentes conectados y preferencias.</div>
      </div>

      <section className="card" style={{ padding: "6px 18px 6px" }}>
        <div className="section-title" style={{ margin: "10px 0 4px" }}>Perfil</div>
        <Row title="Nombre visible" hint="Aparece en los correos y en el historial de cambios.">
          <div className="row">
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: 200 }} />
            <button
              disabled={name === (me.name ?? "")}
              onClick={async () => {
                await api("/me", { method: "PATCH", body: { name } });
                onChange();
              }}
            >
              Guardar
            </button>
          </div>
        </Row>
        <Row title="Correo">
          <span>{me.email}</span>
        </Row>
      </section>

      <section className="card stack" style={{ padding: 18 }}>
        <div>
          <div className="section-title" style={{ margin: 0 }}>Agentes conectados</div>
          <div className="small muted">
            Claude, ChatGPT, Cursor o cualquier cliente MCP pueden construir con tu cuenta usando las mismas herramientas que el constructor integrado. El
            modelo lo pone tu asistente.
          </div>
        </div>
        <div className="kv">
          <span className="muted">Servidor MCP</span>
          <code>{mcpUrl}</code>
          <span className="muted">Transporte</span>
          <span>Streamable HTTP · Authorization: Bearer &lt;token&gt;</span>
        </div>
        <pre className="card" style={{ padding: 12, margin: 0, overflow: "auto", boxShadow: "none" }}>
          {`claude mcp add --transport http forja ${mcpUrl} --header "Authorization: Bearer <token>"`}
        </pre>
        {tokens.map((t) => (
          <div key={t.id} className="row" style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
            <div className="grow">
              <strong>{t.name}</strong>
              <div className="small muted">
                Conectado {timeAgo(t.createdAt)} · {t.lastUsedAt ? `último uso ${timeAgo(t.lastUsedAt)}` : "sin usar"}
              </div>
            </div>
            <button className="sm danger" onClick={() => api(`/tokens/${t.id}`, { method: "DELETE" }).then(load)}>
              Desconectar
            </button>
          </div>
        ))}
        <div className="row">
          <input placeholder="Nombre del agente (p. ej. Claude Code)" value={tokenName} onChange={(e) => setTokenName(e.target.value)} />
          <button
            className="primary"
            onClick={async () => {
              const r = await api<{ token: string }>("/tokens", { body: { name: tokenName } });
              setFresh(r.token);
              setTokenName("");
              void load();
            }}
          >
            Conectar agente
          </button>
        </div>
        {fresh && (
          <div className="pill ok" style={{ padding: 10, borderRadius: 8, display: "grid", gap: 4 }}>
            <span>Copia el token ahora; no volverá a mostrarse:</span>
            <code style={{ userSelect: "all", wordBreak: "break-all" }}>{fresh}</code>
          </div>
        )}
      </section>

      <AccountModels />

      <section className="card" style={{ padding: "6px 18px" }}>
        <div className="section-title" style={{ margin: "10px 0 4px" }}>Preferencias</div>
        <Row title="Tema" hint="Solo en este navegador.">
          <div className="segmented">
            {(["light", "dark", "system"] as const).map((t) => (
              <button key={t} className={theme === t ? "on" : ""} onClick={() => (applyTheme(t), setTheme(t))}>
                {t === "light" ? "Claro" : t === "dark" ? "Oscuro" : "Sistema"}
              </button>
            ))}
          </div>
        </Row>
      </section>

      <section className="card" style={{ padding: "6px 18px" }}>
        <div className="section-title" style={{ margin: "10px 0 4px" }}>Seguridad</div>
        <Row title="Sesiones" hint={me.sessions > 1 ? `Tienes ${me.sessions - 1} sesión(es) más abiertas. Esta se queda abierta.` : "Solo tienes esta sesión abierta."}>
          <button
            disabled={me.sessions <= 1}
            onClick={async () => {
              const r = await api<{ ended: number }>("/me/sign-out-others", { body: {} });
              setNotice(`Se cerraron ${r.ended} sesión(es).`);
              onChange();
            }}
          >
            Cerrar las demás
          </button>
        </Row>
        {notice && <div className="small" style={{ paddingBottom: 10 }}>{notice}</div>}
      </section>

      <section className="card" style={{ padding: "6px 18px", borderColor: "color-mix(in srgb, var(--err) 35%, var(--border))" }}>
        <Row title="Borrar tu cuenta" hint="Borra para siempre tu cuenta, tus proyectos, sus bases de datos y sus archivos. Las apps publicadas dejan de estar en línea.">
          <button className="danger" onClick={() => setDeleting(true)}>
            Borrar cuenta
          </button>
        </Row>
      </section>
      {deleting && <DeleteAccount email={me.email} onClose={() => setDeleting(false)} />}
    </div>
  );
}

function DeleteAccount({ email, onClose }: { email: string; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  return (
    <Modal onClose={onClose}>
      <h3>¿Borrar tu cuenta?</h3>
      <p className="small muted" style={{ margin: 0 }}>
        No se puede deshacer. Escribe tu correo para confirmar.
      </p>
      <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={email} />
      {error && <div className="error-box">{error}</div>}
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button onClick={onClose}>Cancelar</button>
        <button
          className="primary"
          style={{ background: "var(--err)", borderColor: "var(--err)" }}
          disabled={typed.trim().toLowerCase() !== email}
          onClick={async () => {
            try {
              await api("/me", { method: "DELETE", body: { confirmEmail: typed } });
              location.href = "/";
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Borrar para siempre
        </button>
      </div>
    </Modal>
  );
}
