import { go } from "../router";
import { Agents } from "./admin/Agents";
import { Models } from "./admin/Models";
import { Providers } from "./admin/Providers";
import { Router } from "./admin/Router";
import { Settings } from "./admin/Settings";
import { Users } from "./admin/Users";
import { Evals } from "./Evals";

/** Platform administration: everything that used to be environment variables, and the tools to try it. */
const TABS = [
  ["general", "General", Settings],
  ["providers", "Proveedores", Providers],
  ["models", "Modelos", Models],
  ["agents", "Agentes", Agents],
  ["router", "Enrutador", Router],
  ["evals", "Evals", Evals],
  ["users", "Usuarios", Users],
] as const;

export function Admin({ tab }: { tab: string }) {
  const current = TABS.find(([key]) => key === tab) ?? TABS[0];
  const Tab = current[2];
  return (
    <div className="page stack" style={{ gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 24, margin: 0 }}>Administración</h1>
        <div className="small muted">Configuración de toda la plataforma. Los cambios se aplican al momento, sin reiniciar.</div>
      </div>
      <nav className="admin-tabs" aria-label="Secciones de administración">
        {TABS.map(([key, label]) => (
          <a
            key={key}
            href={`/admin/${key}`}
            className={key === current[0] ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              go(`/admin/${key}`);
            }}
          >
            {label}
          </a>
        ))}
      </nav>
      <Tab key={current[0]} />
    </div>
  );
}
