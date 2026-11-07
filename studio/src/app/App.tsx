import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Account as AccountView, Login } from "../features/identity/index.js";
import { Logo } from "../shared/Icons.js";
import { Menu, MenuItem } from "../shared/ui.js";
import { Dashboard, ProjectView } from "../features/projects/index.js";
import { Integrations } from "../features/integrations/index.js";
import { Plan } from "../features/billing/index.js";
import { go, usePath } from "./router.js";
import { applyTheme, savedTheme, type Theme } from "../shared/presentation/theme.js";
import { identityController } from "../features/identity/index.js";
import type { Me } from "../shared/contracts/index.js";

export type { Me } from "../shared/contracts/index.js";

const Admin = lazy(() => import("../features/administration/index.js").then((module) => ({ default: module.Admin })));

export function App() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const path = usePath();
  const refreshMe = () =>
    identityController.currentAccount()
      .then((r) => setMe(r.account))
      .catch(() => setMe(null));
  useEffect(() => {
    void refreshMe();
  }, []);

  if (me === undefined) return <div className="empty">Cargando…</div>;
  if (me === null) return <Login onDone={refreshMe} />;

  const project = /^\/p\/([^/?]+)/.exec(path);
  if (project) return (
    <Suspense fallback={<div className="empty" role="status">Cargando proyecto…</div>}>
      <ProjectView key={project[1]} id={project[1]!} me={me} onCredits={refreshMe} userMenu={UserMenu} />
    </Suspense>
  );

  const section = path.split("?")[0]!.split("/")[1] ?? "";
  return (
    <Shell me={me} section={section}>
      {section === "plan" ? (
        <Plan />
      ) : section === "integrations" ? (
        <Integrations />
      ) : section === "admin" && me.platformRole === "admin" ? (
        <Suspense fallback={<div className="empty" role="status">Cargando administración…</div>}>
          <Admin tab={path.split("?")[0]!.split("/")[2] ?? ""} />
        </Suspense>
      ) : section === "evals" && me.platformRole === "admin" ? (
        // The evals page moved into the admin panel.
        <Redirect to="/admin/evals" />
      ) : section === "account" ? (
        <AccountView me={me} onChange={refreshMe} />
      ) : (
        <Dashboard />
      )}
    </Shell>
  );
}

function Redirect({ to }: { to: string }) {
  useEffect(() => go(to, { replace: true }), [to]);
  return null;
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
        <button className="ghost account-menu-trigger" aria-label="Menú de cuenta" style={{ width: "100%", justifyContent: "flex-start", height: 40, padding: "0 8px" }} onClick={toggle}>
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
          <MenuItem onClick={() => (close(), go("/integrations"))}>Integraciones</MenuItem>
          <MenuItem onClick={() => (close(), go("/account"))}>Cuenta</MenuItem>
          {me.platformRole === "admin" && <MenuItem onClick={() => (close(), go("/admin"))}>Administración</MenuItem>}
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
              await identityController.logout();
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
          {[...NAV, ...(me.platformRole === "admin" ? ([["admin", "Administración", "⚙"]] as const) : [])].map(([key, label, icon]) => (
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
