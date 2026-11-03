export function Spinner({ size = 18, label = "Cargando" }: { size?: number; label?: string }) {
  return <span className="fj-spinner" role="status" aria-label={label} style={{ width: size, height: size }} />;
}
