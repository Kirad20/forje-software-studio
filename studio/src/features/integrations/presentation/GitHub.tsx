import { useEffect, useState } from "react";
import { api } from "../application/controller.js";
import { timeAgo } from "../../../shared/presentation/format.js";

export interface GithubCard {
  type: "github";
  sha: string;
  message: string;
  author: string;
  url: string;
  files: string[];
  build: "ok" | "failed";
  error: string | null;
}

const Mark = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

/** A commit that arrived from GitHub, as it appears in the chat, with its build result. */
export function GithubCommitCard({ card, onFix, busy }: { card: GithubCard; onFix: (text: string) => void; busy: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`gh-card ${card.build === "failed" ? "failed" : ""}`}>
      <div className="row" style={{ gap: 8 }}>
        <Mark />
        <strong className="grow" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={card.message}>
          {card.message}
        </strong>
        <a className="small muted" href={card.url} target="_blank" rel="noreferrer">
          {card.sha.slice(0, 7)} ↗
        </a>
      </div>
      <div className="small muted">
        Desde GitHub{card.author ? ` · ${card.author}` : ""} · {card.files.length} archivo{card.files.length === 1 ? "" : "s"}
        {" · "}
        {card.build === "ok" ? <span style={{ color: "var(--ok)" }}>compila ✓</span> : <span style={{ color: "var(--err)" }}>compilación fallida</span>}
      </div>
      {card.build === "failed" && card.error && <pre className="problem-detail" style={{ margin: 0 }}>{card.error}</pre>}
      <div className="row" style={{ gap: 6 }}>
        {card.build === "failed" && (
          <button
            className="sm primary"
            disabled={busy}
            onClick={() =>
              onFix(
                `Arregla este error de compilación que llegó con el commit ${card.sha.slice(0, 7)} de GitHub («${card.message}»). Busca la causa paso a paso antes de cambiar nada.\n\n\`\`\`\n${card.error ?? ""}\n\`\`\``,
              )
            }
          >
            Intentar arreglar
          </button>
        )}
        {card.files.length > 0 && (
          <button className="sm ghost" onClick={() => setOpen((o) => !o)}>
            {open ? "Ocultar archivos" : "Ver archivos"}
          </button>
        )}
      </div>
      {open && (
        <div className="small" style={{ display: "grid", gap: 2 }}>
          {card.files.map((f) => (
            <code key={f}>{f}</code>
          ))}
        </div>
      )}
    </div>
  );
}

interface Link {
  owner: string;
  repo: string;
  branch: string;
  url: string;
  lastSha: string | null;
  status: "ok" | "error" | "lost_access";
  error: string | null;
  syncedAt: string | null;
  files: number;
}

/** Project settings → GitHub: connect the account, create or link a repo, sync, disconnect. */
export function GithubSection({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [data, setData] = useState<{ account: { connected: boolean; login: string | null; oauth: boolean }; link: Link | null; canEdit: boolean } | null>(null);
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<"create" | "link">("create");
  const [name, setName] = useState(projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mi-app");
  const [priv, setPriv] = useState(true);
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const load = () => api<NonNullable<typeof data>>(`/projects/${projectId}/github`).then(setData);
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);
  const run = async (key: string, f: () => Promise<unknown>) => {
    setBusy(key);
    setError("");
    try {
      await f();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  if (!data) return null;
  const { account, link } = data;

  return (
    <section className="card section">
      <h3>
        <Mark /> GitHub
      </h3>
      <div className="small muted">
        Sincronización en los dos sentidos: cada cambio en Forja se sube como un commit y lo que subas a GitHub vuelve al proyecto, con su resultado de compilación en el
        chat. Solo se sincronizan las carpetas del proyecto (pages, components, endpoints…).
      </div>

      {!account.connected ? (
        <div className="stack" style={{ gap: 8 }}>
          {account.oauth && (
            <a className="btn primary" href="/api/github/oauth/start" style={{ justifySelf: "start" }}>
              <Mark /> Conectar con GitHub
            </a>
          )}
          <label>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>{account.oauth ? "O con un token de acceso personal" : "Token de acceso personal"}</span>
            <span className="small">
              Créalo en GitHub → Settings → Developer settings → Personal access tokens, con permiso de escritura en el contenido de los repositorios. Se guarda cifrado y no se
              vuelve a mostrar.
            </span>
            <div className="row">
              <input type="password" autoComplete="off" placeholder="github_pat_…" value={token} onChange={(e) => setToken(e.target.value)} />
              <button className="primary" disabled={!token.trim() || busy !== ""} onClick={() => run("token", () => api("/github/token", { body: { token } }).then(() => setToken("")))}>
                {busy === "token" ? <span className="spinner" /> : "Conectar"}
              </button>
            </div>
          </label>
        </div>
      ) : !link ? (
        data.canEdit ? (
          <div className="stack" style={{ gap: 8 }}>
            <div className="small">
              Conectado como <strong>{account.login}</strong> ·{" "}
              <button className="ghost sm" onClick={() => run("disc", () => api("/github", { method: "DELETE" }))}>
                desconectar cuenta
              </button>
            </div>
            <div className="segmented" style={{ justifySelf: "start" }}>
              <button className={mode === "create" ? "on" : ""} onClick={() => setMode("create")}>
                Crear repositorio
              </button>
              <button className={mode === "link" ? "on" : ""} onClick={() => setMode("link")}>
                Usar uno existente
              </button>
            </div>
            {mode === "create" ? (
              <div className="row" style={{ flexWrap: "wrap" }}>
                <span className="small muted">{account.login}/</span>
                <input style={{ flex: 1, minWidth: 160 }} value={name} onChange={(e) => setName(e.target.value)} aria-label="Nombre del repositorio" />
                <label className="row small" style={{ gap: 4 }}>
                  <input type="checkbox" style={{ width: "auto" }} checked={priv} onChange={(e) => setPriv(e.target.checked)} /> Privado
                </label>
                <button className="primary" disabled={!name.trim() || busy !== ""} onClick={() => run("link", () => api(`/projects/${projectId}/github`, { body: { mode: "create", name, private: priv } }))}>
                  {busy === "link" ? <span className="spinner" /> : "Crear y subir"}
                </button>
              </div>
            ) : (
              <div className="row" style={{ flexWrap: "wrap" }}>
                <input style={{ flex: 2, minWidth: 180 }} placeholder="dueño/repositorio" value={repo} onChange={(e) => setRepo(e.target.value)} aria-label="Repositorio" />
                <input style={{ flex: 1, minWidth: 100 }} placeholder="rama (main)" value={branch} onChange={(e) => setBranch(e.target.value)} aria-label="Rama" />
                <button className="primary" disabled={!repo.trim() || busy !== ""} onClick={() => run("link", () => api(`/projects/${projectId}/github`, { body: { mode: "link", repo, branch } }))}>
                  {busy === "link" ? <span className="spinner" /> : "Conectar"}
                </button>
              </div>
            )}
            {mode === "link" && <div className="small muted">Lo que ya haya en el repositorio entra primero en el proyecto; luego se suben los archivos de Forja.</div>}
          </div>
        ) : (
          <div className="small muted">Solo la persona dueña puede conectar el proyecto a un repositorio.</div>
        )
      ) : (
        <div className="stack" style={{ gap: 8 }}>
          {link.status === "lost_access" && (
            <div className="error-box">
              {link.error}{" "}
              <button className="sm" onClick={() => run("disc", () => api("/github", { method: "DELETE" }))}>
                Volver a conectar
              </button>
            </div>
          )}
          {link.status === "error" && link.error && <div className="error-box">Última sincronización fallida: {link.error}</div>}
          <div className="row-setting">
            <div>
              <a href={link.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
                {link.owner}/{link.repo} ↗
              </a>
              <div className="small muted">
                Rama {link.branch} · {link.files} archivos
                {link.syncedAt ? ` · sincronizado ${timeAgo(link.syncedAt)}` : ""}
                {link.lastSha ? ` · ${link.lastSha.slice(0, 7)}` : ""}
              </div>
            </div>
            <div className="row">
              <button disabled={busy !== ""} onClick={() => run("sync", () => api(`/projects/${projectId}/github/sync`, { body: {} }))}>
                {busy === "sync" ? <span className="spinner" /> : "⟳ Sincronizar ahora"}
              </button>
              {data.canEdit && (
                <button
                  className="danger"
                  disabled={busy !== ""}
                  onClick={() => confirm("¿Desconectar el repositorio? El código se queda en GitHub y en Forja; solo deja de sincronizarse.") && run("unlink", () => api(`/projects/${projectId}/github`, { method: "DELETE" }))}
                >
                  Desconectar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {error && <div className="error-box">{error}</div>}
    </section>
  );
}
