import { useEffect, useState, type ReactNode } from "react";
import { identityController } from "../application/controller.js";
import type { Me } from "../../../shared/contracts/index.js";
import { AccountModels } from "../../models/index.js";
import { Modal } from "../../../shared/ui.js";
import { browser } from "../../../shared/infrastructure/browser.js";
import { applyTheme, savedTheme, type Theme } from "../../../shared/presentation/theme.js";
import { McpTokens } from "./McpTokens.js";

const Row = ({ title, hint, children }: { title: string; hint?: ReactNode; children?: ReactNode }) => (
  <div className="row-setting" style={{ padding: "12px 0", borderTop: "1px solid var(--border)" }}>
    <div>
      <div style={{ fontWeight: 500 }}>{title}</div>
      {hint && <div className="small muted">{hint}</div>}
    </div>
    {children}
  </div>
);

/** Set or change the password. The code sign-in keeps working, so this is optional for code-created accounts. */
function PasswordSection() {
  const [sec, setSec] = useState<{ hasPassword: boolean } | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    void identityController.security().then(setSec);
  }, []);
  return (
    <section className="card stack" style={{ padding: 18 }}>
      <div>
        <div className="section-title" style={{ margin: 0 }}>Contraseña</div>
        <div className="small muted">
          {sec?.hasPassword ? "Cambiarla cierra tus otras sesiones." : "Aún no tienes contraseña: entras con un código por correo. Puedes poner una."}
        </div>
      </div>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          setMsg("");
          try {
            await identityController.changePassword({ current: current || undefined, password: next });
            setCurrent("");
            setNext("");
            setSec({ hasPassword: true });
            setMsg("Contraseña guardada.");
          } catch (x) {
            setErr((x as Error).message);
          }
        }}
      >
        {sec?.hasPassword && (
          <input type="password" required placeholder="Contraseña actual" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        )}
        <input type="password" required minLength={10} placeholder="Contraseña nueva (mín. 10 caracteres)" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        {err && <div className="error-box">{err}</div>}
        {msg && <div className="small muted">{msg}</div>}
        <div>
          <button className="primary">Guardar contraseña</button>
        </div>
      </form>
    </section>
  );
}

export function Account({ me, onChange }: { me: Me; onChange: () => void }) {
  const [name, setName] = useState(me.name ?? "");
  const [theme, setTheme] = useState<Theme>(savedTheme());
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState(false);
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
                await identityController.updateProfile(name);
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

      <PasswordSection />

      <McpTokens />

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
              const r = await identityController.signOutOtherSessions();
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
              await identityController.deleteAccount(typed);
              browser.navigate("/");
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
