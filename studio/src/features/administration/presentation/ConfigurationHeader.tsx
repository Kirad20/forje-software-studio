import { Boxes, Cable } from "lucide-react";

export function ConfigurationHeader({ current }: { current: "providers" | "models" }) {
  return (
    <header className="ai-config-header">
      <div>
        <h2>{current === "providers" ? "Conexiones" : "Catálogo de modelos"}</h2>
        <p className="muted">{current === "providers"
          ? "Conecta tus servicios de IA. Abre un proveedor para configurar su conexión."
          : "Elige qué modelos puede usar Forja. Los detalles técnicos están en el editor."}</p>
      </div>
      <nav className="ai-config-nav" aria-label="Configuración de IA">
        <a href="/admin/providers" aria-current={current === "providers" ? "page" : undefined}><Cable size={16} /> Proveedores</a>
        <a href="/admin/models" aria-current={current === "models" ? "page" : undefined}><Boxes size={16} /> Modelos</a>
      </nav>
    </header>
  );
}
