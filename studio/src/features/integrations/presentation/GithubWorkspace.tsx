import { useEffect, useRef, useState } from "react";
import { api } from "../application/controller.js";
import type { GithubAccount, GithubRepository, GithubSelection } from "../application/github.js";
import type { Project } from "../../../shared/contracts/index.js";
import { go } from "../../../app/router.js";

const keyOf = (repo: GithubRepository) => `${repo.installationId ?? "user"}:${repo.fullName}`;

export function GithubRepositoryForm({
  label, onSubmit, disabled = false,
}: { label: string; onSubmit: (selection: GithubSelection) => Promise<void>; disabled?: boolean }) {
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [nextPage, setNextPage] = useState<number | null>(1);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [branch, setBranch] = useState("");
  const [branchPage, setBranchPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchFailed, setBranchFailed] = useState(false);
  const [branchRetry, setBranchRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const repo = repositories.find((item) => keyOf(item) === selected);
  const alive = useRef(true);
  const selection = useRef(selected);
  selection.current = selected;
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const loadRepos = async (page: number) => {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ repositories: GithubRepository[]; nextPage: number | null }>(`/github/repos?page=${page}`);
      if (!alive.current) return;
      setRepositories((previous) => {
        const merged = new Map((page === 1 ? [] : previous).map((item) => [keyOf(item), item]));
        for (const item of data.repositories) merged.set(keyOf(item), item);
        return [...merged.values()];
      });
      setNextPage(data.nextPage);
    } catch (e) { if (alive.current) setError((e as Error).message); }
    finally { if (alive.current) setLoading(false); }
  };
  useEffect(() => { void loadRepos(1); }, []);

  useEffect(() => {
    let active = true;
    setBranches([]);
    setBranch(repo?.defaultBranch ?? "");
    setBranchPage(null);
    setBranchLoading(false);
    setBranchFailed(false);
    if (!repo) return;
    setBranchLoading(true);
    setError("");
    const query = new URLSearchParams({ repo: repo.fullName, page: "1" });
    if (repo.installationId !== null) query.set("installationId", String(repo.installationId));
    void api<{ branches: { name: string }[]; nextPage: number | null }>(`/github/branches?${query}`).then((data) => {
      if (active) { setBranches(data.branches.map((item) => item.name)); setBranchPage(data.nextPage); }
    }).catch((e: Error) => { if (active) { setError(e.message); setBranchFailed(true); } })
      .finally(() => { if (active) setBranchLoading(false); });
    return () => { active = false; };
  }, [selected, branchRetry]);

  const moreBranches = async () => {
    if (!repo || branchPage === null) return;
    const current = selected;
    setBranchLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ repo: repo.fullName, page: String(branchPage) });
      if (repo.installationId !== null) query.set("installationId", String(repo.installationId));
      const data = await api<{ branches: { name: string }[]; nextPage: number | null }>(`/github/branches?${query}`);
      if (!alive.current || current !== selection.current) return;
      setBranches((previous) => [...new Set([...previous, ...data.branches.map((item) => item.name)])]);
      setBranchPage(data.nextPage);
    } catch (e) { if (alive.current && current === selection.current) { setError((e as Error).message); setBranchFailed(true); } }
    finally { if (alive.current && current === selection.current) setBranchLoading(false); }
  };
  return (
    <form className="stack" onSubmit={async (event) => {
      event.preventDefault();
      if (!repo || !branch) return;
      setBusy(true);
      setError("");
      try { await onSubmit({ repo: repo.fullName, branch, installationId: repo.installationId }); }
      catch (e) { if (alive.current) setError((e as Error).message); }
      finally { if (alive.current) setBusy(false); }
    }}>
      <label>Buscar entre los repositorios cargados
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre u organización" />
      </label>
      <label>Repositorio autorizado
        <select aria-label="Repositorio autorizado" value={selected} disabled={disabled || busy || loading} onChange={(event) => setSelected(event.target.value)}>
          <option value="">{loading ? "Cargando repositorios…" : "Selecciona un repositorio"}</option>
          {repositories.filter((item) => keyOf(item) === selected || item.fullName.toLowerCase().includes(search.toLowerCase())).map((item) => (
            <option key={keyOf(item)} value={keyOf(item)}>{item.fullName}{item.private ? " · privado" : ""}</option>
          ))}
        </select>
      </label>
      {nextPage !== null && <button type="button" disabled={loading || busy || disabled} onClick={() => void loadRepos(nextPage)}>
        {loading ? "Cargando…" : repositories.length ? "Cargar más repositorios" : error ? "Reintentar repositorios" : "Cargar repositorios"}
      </button>}
      {!loading && !repositories.length && !error && <div className="small muted">No hay repositorios editables autorizados. Selecciona su acceso en GitHub y vuelve a cargar esta página.</div>}
      {repo && <label>Rama
        <select aria-label="Rama" value={branch} disabled={disabled || busy || branchLoading} onChange={(event) => setBranch(event.target.value)}>
          {[...new Set([repo.defaultBranch, ...branches])].filter(Boolean).map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>}
      {branchPage !== null && <button type="button" disabled={branchLoading || busy || disabled} onClick={() => void moreBranches()}>Cargar más ramas</button>}
      {branchFailed && <button type="button" disabled={branchLoading || busy || disabled} onClick={() => setBranchRetry((value) => value + 1)}>Reintentar ramas</button>}
      {error && <div className="error-box" role="alert">{error}</div>}
      <div><button className="primary" disabled={!repo || !branch || loading || branchLoading || branchFailed || busy || disabled}>{busy ? "Procesando…" : label}</button></div>
    </form>
  );
}

export function GithubWorkspace({ allowImport = true, onChange }: { allowImport?: boolean; onChange?: () => void }) {
  const [account, setAccount] = useState<GithubAccount | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [registration, setRegistration] = useState<{ url: string; manifest: string } | null>(null);
  const [imported, setImported] = useState<{ project: Project; warnings: string[] } | null>(null);
  const [runtime, setRuntime] = useState<"native" | "repository">("native");
  const [importing, setImporting] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const result = new URLSearchParams(location.search).get("github");
  const load = async () => {
    setError("");
    try { setAccount(await api<GithubAccount>("/github")); }
    catch (e) { setError((e as Error).message); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => { if (registration) form.current?.submit(); }, [registration]);
  const createApp = async () => {
    setBusy(true);
    setError("");
    try { setRegistration(await api<{ url: string; manifest: string }>("/github/app/start", { body: {} })); }
    catch (e) { setError((e as Error).message); setBusy(false); }
  };
  return (
    <section className="card section" aria-label="Conexión con GitHub">
      <h3>GitHub</h3>
      <div className="small muted">Conecta tu cuenta con una GitHub App y elige los repositorios que Forja puede usar. Sin copiar tokens, claves ni configurar webhooks a mano.</div>
      {result && <div className={["ok", "connected", "app-created"].includes(result) ? "small muted" : "error-box"} role="status">
        {result === "app-created" ? "App creada. Ahora selecciona los repositorios que quieres autorizar." : ["ok", "connected"].includes(result) ? "GitHub conectado." : result}
      </div>}
      {!account ? error ? <button onClick={() => void load()}>Reintentar conexión</button> : <div className="small muted" role="status">Cargando GitHub…</div> : (
        <>
          {account.app ? (
            <div className="stack">
              <div>App <strong>{account.app.name}</strong> · {account.app.owner}</div>
              <a className="btn primary" href="/api/github/app/install">Seleccionar repositorios en GitHub</a>
              <div className="small muted">Puedes añadir acceso a repositorios de tu cuenta o de una organización.</div>
            </div>
          ) : (
            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="primary" disabled={busy} onClick={() => void createApp()}>{busy ? "Preparando GitHub…" : "Crear GitHub App y conectar"}</button>
              {account.oauth && !account.connected && <a className="btn" href="/api/github/oauth/start">Conectar con GitHub</a>}
            </div>
          )}
          {account.connected && <div className="row" style={{ flexWrap: "wrap" }}>
            <span className="small grow">Conectado como <strong>{account.login}</strong></span>
            <button disabled={busy} onClick={async () => {
              if (!confirm("¿Desconectar GitHub? Los repositorios y el código se conservan; se detiene el acceso de Forja.")) return;
              setBusy(true);
              setError("");
              try { await api("/github", { method: "DELETE" }); await load(); onChange?.(); }
              catch (e) { setError((e as Error).message); }
              finally { setBusy(false); }
            }}>Desconectar cuenta</button>
          </div>}
          {account.connected && allowImport && <div className="stack" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <h4>Trabajar con un repositorio existente</h4>
            {!imported && <label>Tipo de proyecto
              <select aria-label="Tipo de proyecto" value={runtime} disabled={busy || importing} onChange={(event) => setRuntime(event.target.value === "repository" ? "repository" : "native")}>
                <option value="native">App nativa de Forja</option>
                <option value="repository">Repositorio Docker / Node</option>
              </select>
            </label>}
            <div className="small muted">{runtime === "repository"
              ? "Se conserva la estructura original y se ejecuta con Dockerfile o Node."
              : "Importa una app compatible con Forja (pages, components, endpoints y helpers). Otros frameworks requieren el modo repositorio."} La importación inicial no modifica GitHub; los cambios posteriores se sincronizan.</div>
            {!imported && <GithubRepositoryForm key={`${account.login}:${account.installations?.map((item) => item.id).join(",")}`} label="Importar y abrir proyecto" onSubmit={async (selection) => {
              setImporting(true);
              try {
                const data = await api<{ project: Project; warnings: string[] }>("/github/import", { body: { ...selection, ...(runtime === "repository" ? { runtime } : {}) } });
                if (data.warnings.length) setImported(data);
                else go(`/p/${data.project.id}`);
              } finally { setImporting(false); }
            }} />}
            {imported && <div className="stack" role="status">
              <strong>Proyecto importado con observaciones</strong>
              {imported.warnings.map((warning, index) => <div key={index} className="small">{warning}</div>)}
              <button onClick={() => go(`/p/${imported.project.id}`)}>Abrir proyecto importado</button>
            </div>}
          </div>}
        </>
      )}
      {error && <div className="error-box" role="alert">{error}</div>}
      {registration && <form ref={form} method="post" action={registration.url} hidden><input type="hidden" name="manifest" value={registration.manifest} /></form>}
    </section>
  );
}
