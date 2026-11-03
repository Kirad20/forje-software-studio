import clsx from "clsx";
import type { ReactNode } from "react";
import { Toaster as SonnerToaster } from "sonner";
import { Button } from "./actions.js";

export function Skeleton({ width, height = 16, className }: { width?: number | string; height?: number | string; className?: string }) {
  return <span className={clsx("fj-skeleton", className)} aria-hidden="true" style={{ width, height }} />;
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="fj-state">
      {icon && <div className="fj-state-icon">{icon}</div>}
      <h2 className="fj-state-title">{title}</h2>
      {description && <p className="fj-state-text">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message = "Algo salió mal.", onRetry, retryLabel = "Reintentar" }: { message?: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="fj-state" role="alert">
      <h2 className="fj-state-title">No se pudo cargar</h2>
      <p className="fj-state-text">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>{retryLabel}</Button>}
    </div>
  );
}

export function Toaster() {
  return <SonnerToaster position="bottom-right" closeButton richColors />;
}
