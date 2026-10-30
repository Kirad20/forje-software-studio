import { useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import { Logo } from "./components/Icons";
import { Account } from "./pages/Account";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { ProjectView } from "./pages/ProjectView";
import { go, usePath } from "./router";

export interface Me {
  id: string;
  email: string;
  credits: number;
}

export function App() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const path = usePath();
  const refreshMe = () =>
    api<{ account: Me }>("/me")
      .then((r) => setMe(r.account))
      .catch(() => setMe(null));
  useEffect(() => {
    void refreshMe();
  }, []);

  if (me === undefined) return <div className="empty">Cargando…</div>;
  if (me === null) return <Login onDone={refreshMe} />;

  const project = /^\/p\/([0-9a-f]+)/.exec(path);
  if (project) return <ProjectView id={project[1]!} me={me} onCredits={refreshMe} />;

  return (
    <Shell me={me} path={path}>
      {path.startsWith("/account") ? <Account me={me} /> : <Dashboard />}
    </Shell>
  );
}

function Shell({ me, path, children }: { me: Me; path: string; children: ReactNode }) {
  const link = (to: string, label: string, active: boolean) => (
    <a
      href={to}
      className={active ? "active" : ""}
      onClick={(e) => {
        e.preventDefault();
        go(to);
      }}
    >
      {label}
    </a>
  );
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Logo /> Forja
        </div>
        <nav className="nav row" style={{ flexDirection: "inherit", alignItems: "stretch", display: "flex", gap: 4 }}>
          {link("/", "Proyectos", !path.startsWith("/account"))}
          {link("/account", "Cuenta y MCP", path.startsWith("/account"))}
        </nav>
        <div className="spacer grow" />
        <div className="account-mini card" style={{ padding: 10, boxShadow: "none" }}>
          <div className="small muted">Créditos</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{me.credits.toLocaleString()}</div>
          <div className="small muted" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {me.email}
          </div>
          <button
            className="ghost sm"
            style={{ marginTop: 6, paddingLeft: 0 }}
            onClick={async () => {
              await api("/auth/logout", { body: {} });
              location.href = "/";
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
