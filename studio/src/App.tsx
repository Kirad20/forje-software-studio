import { useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import { Logo } from "./components/Icons";
import { Menu, MenuItem } from "./components/ui";
import { Account } from "./pages/Account";
import { Dashboard } from "./pages/Dashboard";
import { Integrations } from "./pages/Integrations";
import { Login } from "./pages/Login";
import { Plan } from "./pages/Plan";
import { ProjectView } from "./pages/ProjectView";
import { go, usePath } from "./router";
import { applyTheme, savedTheme, type Theme } from "./theme";

export interface Me {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  sessions: number;
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
  if (project) return <ProjectView key={project[1]} id={project[1]!} me={me} onCredits={refreshMe} />;

  const section = path.split("?")[0]!.split("/")[1] ?? "";
  return (
    <Shell me={me} section={section}>
      {section === "plan" ? (
        <Plan />
      ) : section === "integrations" ? (
        <Integrations />
      ) : section === "account" ? (
        <Account me={me} onChange={refreshMe} />
      ) : (
        <Dashboard />
      )}
    </Shell>
  );
}

const NAV = [
  ["", "Proyectos", "▦"],
  ["plan", "Plan y uso", "◔"],
  ["integrations", "Integraciones", "⚷"],
  ["account", "Cuenta", "◯"],
] as const;

export function UserMenu({ me, up, asLogo }: { me: Me; up?: boolean; asLogo?: boolean }) {
  const [theme, setTheme] = useState<Theme>(savedTheme());
  const pick = (t: Theme) => {
    applyTheme(t);
    setTheme(t);
  };
  return (
    <Menu
      up={up}
      button={(_, toggle) =>
        asLogo ? (
          <button className="ghost" style={{ padding: "0 6px", height: 32 }} aria-label="Menú de Forja" onClick={toggle}>
            <Logo size={24} /> ▾
          </button>
        ) : (
        <button className="ghost" style={{ width: "100%", justifyContent: "flex-start", height: 40, padding: "0 8px" }} onClick={toggle}>
          <span className="mini-avatar" style={{ background: "#4f46e5" }}>
            {(me.name || me.email).slice(0, 1).toUpperCase()}
          </span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{me.name || me.email}</span>
        </button>
        )
      }
    >
      {(close) => (
        <>
          <div className="menu-label" style={{ color: "var(--text)" }}>
            {me.name || "Tu cuenta"}
            <div className="small muted" style={{ fontWeight: 400 }}>
              {me.email}
            </div>
          </div>
          <div className="menu-sep" />
          <MenuItem onClick={() => (close(), go("/"))}>Proyectos</MenuItem>
          <MenuItem onClick={() => (close(), go("/plan"))}>Plan y uso</MenuItem>
          <MenuItem onClick={() => (close(), go("/account"))}>Cuenta</MenuItem>
          <div className="menu-sep" />
          <div className="row" style={{ padding: "4px 10px" }}>
            <span className="small grow">Tema</span>
            <div className="segmented">
              {(["light", "dark", "system"] as const).map((t) => (
                <button key={t} className={theme === t ? "on" : ""} onClick={() => pick(t)} title={t === "light" ? "Claro" : t === "dark" ? "Oscuro" : "Sistema"} style={{ height: 24, padding: "0 7px" }}>
                  {t === "light" ? "☀" : t === "dark" ? "☾" : "▭"}
                </button>
              ))}
            </div>
          </div>
          <div className="menu-sep" />
          <MenuItem
            onClick={async () => {
              await api("/auth/logout", { body: {} });
              location.href = "/";
            }}
          >
            Cerrar sesión
          </MenuItem>
        </>
      )}
    </Menu>
  );
}

function Shell({ me, section, children }: { me: Me; section: string; children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Logo /> Forja
        </div>
        <nav className="nav" style={{ display: "grid", gap: 2 }}>
          {NAV.map(([key, label, icon]) => (
            <a
              key={key}
              href={`/${key}`}
              className={section === key ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                go(`/${key}`);
              }}
            >
              <span style={{ width: 16, textAlign: "center", opacity: 0.8 }}>{icon}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="spacer grow" />
        <div className="account-mini" style={{ display: "grid", gap: 4 }}>
          <div className="small muted" style={{ padding: "0 10px" }}>
            {me.credits.toLocaleString()} créditos
          </div>
          <UserMenu me={me} up />
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
