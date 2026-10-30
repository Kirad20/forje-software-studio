import { useState, type FormEvent } from "react";
import { api } from "../api";
import { Logo } from "../components/Icons";

export function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (step === "email") {
        await api("/auth/request", { body: { email } });
        setStep("code");
      } else {
        await api("/auth/verify", { body: { email, code } });
        onDone();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100%", display: "grid", placeItems: "center", padding: 16 }}>
      <form className="card stack" style={{ width: "min(380px, 100%)", padding: 28 }} onSubmit={submit}>
        <div className="row" style={{ gap: 10 }}>
          <Logo size={34} />
          <div>
            <h2>Forja</h2>
            <div className="muted small">Construye apps reales conversando</div>
          </div>
        </div>
        {step === "email" ? (
          <label>
            Correo
            <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
          </label>
        ) : (
          <label>
            Código de 6 dígitos enviado a {email}
            <input inputMode="numeric" autoFocus required value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
            <span className="small">Sin SMTP configurado, el código aparece en la consola del servidor.</span>
          </label>
        )}
        {error && <div className="error-box">{error}</div>}
        <button className="primary" disabled={busy}>
          {busy ? <span className="spinner" /> : step === "email" ? "Continuar" : "Entrar"}
        </button>
        {step === "code" && (
          <button type="button" className="ghost sm" onClick={() => setStep("email")}>
            Usar otro correo
          </button>
        )}
      </form>
    </div>
  );
}
