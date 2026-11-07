import { useEffect, useState, type FormEvent } from "react";
import { identityController } from "../application/controller.js";
import { Logo } from "../../../shared/Icons.js";

type Mode = "password" | "code" | "forgot" | "reset" | "setup";

/**
 * Sign-in. Password is the default; the emailed code also creates new accounts (it proves the address)
 * and doubles as a way in when the password is forgotten. A fresh install shows the one-time setup instead.
 */
export function Login({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    identityController.authStatus()
      .then((s) => setMode(s.needsSetup ? "setup" : "password"))
      .catch(() => setMode("password"));
  }, []);
  if (!mode) return <div className="empty">Cargando…</div>;

  const go = (m: Mode) => {
    setMode(m);
    setStep("email");
    setError("");
    setHint("");
    setCode("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "setup") {
        await identityController.setup({ token, email, password, name });
        onDone();
      } else if (mode === "password") {
        await identityController.login({ email, password });
        onDone();
      } else if (mode === "code" && step === "email") {
        const r = await identityController.requestCode(email);
        setHint(r.hint);
        setStep("code");
      } else if (mode === "code") {
        await identityController.verifyCode(email, code);
        onDone();
      } else if (mode === "forgot") {
        const r = await identityController.requestPasswordReset(email);
        setHint(r.hint);
        setMode("reset");
      } else if (mode === "reset") {
        await identityController.resetPassword({ email, code, password });
        setPassword("");
        go("password");
        setHint("Contraseña cambiada. Entra con la nueva.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const emailField = (
    <label>
      Correo
      <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="username" />
    </label>
  );
  const passwordField = (label: string, isNew: boolean) => (
    <label>
      {label}
      <input
        type="password"
        required
        minLength={isNew ? 10 : undefined}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={isNew ? "new-password" : "current-password"}
      />
      {isNew && <span className="small muted">Al menos 10 caracteres.</span>}
    </label>
  );
  const codeField = (label: string) => (
    <label>
      {label}
      <input inputMode="numeric" autoFocus required value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" autoComplete="one-time-code" />
    </label>
  );

  const titles: Record<Mode, string> = {
    setup: "Configura Forja",
    password: "Construye apps reales conversando",
    code: "Entrar con un código",
    forgot: "Recupera tu contraseña",
    reset: "Elige una contraseña nueva",
  };

  return (
    <div className="login">
      <form className="card stack login-form" onSubmit={submit}>
        <div className="row" style={{ gap: 10 }}>
          <Logo size={34} />
          <div>
            <h2>Forja</h2>
            <div className="muted small">{titles[mode]}</div>
          </div>
        </div>

        {mode === "setup" && (
          <>
            <div className="small muted">
              Instalación nueva: aún no hay usuarios. Pega el token de un solo uso que Forja imprimió en el log del servidor (o el valor de{" "}
              <code>FORJA_BOOTSTRAP_TOKEN</code>) para crear la cuenta de administración.
            </div>
            <label>
              Token de instalación
              <input required autoFocus value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" spellCheck={false} />
            </label>
            <label>
              Nombre
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            {emailField}
            {passwordField("Contraseña", true)}
          </>
        )}
        {mode === "password" && (
          <>
            {emailField}
            {passwordField("Contraseña", false)}
          </>
        )}
        {mode === "code" && (step === "email" ? emailField : codeField(`Código enviado a ${email}`))}
        {mode === "forgot" && emailField}
        {mode === "reset" && (
          <>
            {codeField(`Código de 8 dígitos enviado a ${email}`)}
            {passwordField("Contraseña nueva", true)}
          </>
        )}

        {hint && <div className="small muted">{hint}</div>}
        {error && <div className="error-box">{error}</div>}
        <button className="primary" disabled={busy}>
          {busy ? <span className="spinner" /> : mode === "setup" ? "Crear administración" : mode === "code" && step === "email" ? "Enviar código" : mode === "forgot" ? "Enviar código" : mode === "reset" ? "Cambiar contraseña" : "Entrar"}
        </button>

        {mode === "password" && (
          <div className="row small login-actions">
            <button type="button" className="ghost sm" onClick={() => go("code")}>
              Entrar con código / crear cuenta
            </button>
            <button type="button" className="ghost sm" onClick={() => go("forgot")}>
              Olvidé mi contraseña
            </button>
          </div>
        )}
        {(mode === "code" || mode === "forgot" || mode === "reset") && (
          <button type="button" className="ghost sm" onClick={() => go("password")}>
            Volver a entrar con contraseña
          </button>
        )}
      </form>
    </div>
  );
}
