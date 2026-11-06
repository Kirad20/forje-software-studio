export function ModelSetupSteps({ current }: { current: "providers" | "models" | "agents" }) {
  return (
    <nav className="card stack" aria-label="Configuración de IA" style={{ padding: 16, gap: 8 }}>
      <strong>Configura tu IA en tres pasos</strong>
      <div className="row" style={{ flexWrap: "wrap", gap: 16 }}>
        {([
          ["providers", "1. Conectar proveedor"],
          ["models", "2. Elegir y habilitar modelos"],
          ["agents", "3. Probar un agente"],
        ] as const).map(([step, label]) => (
          <a key={step} href={`/admin/${step}`} aria-current={current === step ? "step" : undefined}>
            {current === step ? <strong>{label}</strong> : label}
          </a>
        ))}
      </div>
      <span className="small muted">Los agentes de tus proyectos eligen automáticamente entre los modelos permitidos. Esta prueba no cambia su configuración.</span>
    </nav>
  );
}
