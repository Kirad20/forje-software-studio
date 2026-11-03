/**
 * @forja/ui — the interface kit every generated app is built with. Components are styled
 * only through the design tokens in the app's base.css (--bg, --surface, --text, --primary…),
 * so changing the tokens restyles them, dark mode included, and every state (loading,
 * empty, error, disabled, focus) already exists. Behaviour that needs care (focus
 * trapping, keyboard navigation, aria) comes from Radix; motion respects reduced-motion.
 */
import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { Dialog as RDialog, Tabs as RTabs, Tooltip as RTooltip } from "radix-ui";
import { forwardRef, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Toaster as SonnerToaster, toast } from "sonner";
import "./ui.css";

export { clsx as cx, toast };

// --- Feedback ----------------------------------------------------------------------

export function Spinner({ size = 18, label = "Cargando" }: { size?: number; label?: string }) {
  return <span className="fj-spinner" role="status" aria-label={label} style={{ width: size, height: size }} />;
}

export function Skeleton({ width, height = 16, className }: { width?: number | string; height?: number | string; className?: string }) {
  return <span className={clsx("fj-skeleton", className)} aria-hidden="true" style={{ width, height }} />;
}

/** A list or screen with nothing in it yet: say what it is for and offer the first step. */
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

/** Something failed: a human message and, when there is one, a way to try again. */
export function ErrorState({ message = "Algo salió mal.", onRetry, retryLabel = "Reintentar" }: { message?: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="fj-state" role="alert">
      <h2 className="fj-state-title">No se pudo cargar</h2>
      <p className="fj-state-text">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/** Mount once (in pages/_layout.tsx); show messages with toast.success("Guardado") / toast.error(...). */
export function Toaster() {
  return <SonnerToaster position="bottom-right" closeButton richColors />;
}

// --- Actions -----------------------------------------------------------------------

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  /** Shows a spinner and blocks clicks while an action is running. */
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "primary", size = "md", loading, disabled, className, children, type = "button", ...rest }, ref) {
  return (
    <button ref={ref} type={type} className={clsx("fj-btn", `fj-btn-${variant}`, `fj-btn-${size}`, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Spinner size={14} label="Procesando" />}
      {children}
    </button>
  );
});

// --- Forms -------------------------------------------------------------------------

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
}

function Field({ id, label, hint, error, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="fj-field">
      {label && (
        <label className="fj-label" htmlFor={id}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="fj-field-error" id={`${id}-msg`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="fj-field-hint" id={`${id}-msg`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const describe = (id: string, { hint, error }: FieldProps) => ({ "aria-invalid": error ? true : undefined, "aria-describedby": error || hint ? `${id}-msg` : undefined });

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(function Input({ label, hint, error, id, className, ...rest }, ref) {
  const uid = useId();
  const fid = id ?? uid;
  return (
    <Field id={fid} label={label} hint={hint} error={error}>
      <input ref={ref} id={fid} className={clsx("fj-control", className)} {...describe(fid, { hint, error })} {...rest} />
    </Field>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(function Textarea({ label, hint, error, id, className, rows = 4, ...rest }, ref) {
  const uid = useId();
  const fid = id ?? uid;
  return (
    <Field id={fid} label={label} hint={hint} error={error}>
      <textarea ref={ref} id={fid} rows={rows} className={clsx("fj-control", className)} {...describe(fid, { hint, error })} {...rest} />
    </Field>
  );
});

/** A native <select>: pass <option>s as children. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(function Select({ label, hint, error, id, className, children, ...rest }, ref) {
  const uid = useId();
  const fid = id ?? uid;
  return (
    <Field id={fid} label={label} hint={hint} error={error}>
      <select ref={ref} id={fid} className={clsx("fj-control", className)} {...describe(fid, { hint, error })} {...rest}>
        {children}
      </select>
    </Field>
  );
});

export const Checkbox = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string }>(function Checkbox({ label, id, className, ...rest }, ref) {
  const uid = useId();
  const fid = id ?? uid;
  return (
    <label className={clsx("fj-check", className)} htmlFor={fid}>
      <input ref={ref} id={fid} type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
});

// --- Containers --------------------------------------------------------------------

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("fj-card", className)} {...rest}>
      {children}
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "primary" | "success" | "danger"; children: ReactNode }) {
  return <span className={clsx("fj-badge", `fj-badge-${tone}`)}>{children}</span>;
}

// --- Overlays and navigation (Radix) ------------------------------------------------

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Usually the action buttons. */
  footer?: ReactNode;
}) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fj-overlay" />
        {/* Without a description Radix expects aria-describedby to be undefined on purpose. */}
        <RDialog.Content className="fj-dialog" {...(description ? {} : { "aria-describedby": undefined })}>
          <RDialog.Title className="fj-dialog-title">{title}</RDialog.Title>
          {description ? <RDialog.Description className="fj-dialog-text">{description}</RDialog.Description> : null}
          {children}
          {footer && <div className="fj-dialog-footer">{footer}</div>}
          <RDialog.Close className="fj-dialog-close" aria-label="Cerrar">
            ×
          </RDialog.Close>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
}: {
  items: { value: string; label: string; content: ReactNode }[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <RTabs.Root value={value} defaultValue={value === undefined ? (defaultValue ?? items[0]?.value) : undefined} onValueChange={onValueChange}>
      <RTabs.List className="fj-tabs" aria-label="Secciones">
        {items.map((i) => (
          <RTabs.Trigger key={i.value} value={i.value} className="fj-tab">
            {i.label}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
      {items.map((i) => (
        <RTabs.Content key={i.value} value={i.value} className="fj-tab-panel">
          {i.content}
        </RTabs.Content>
      ))}
    </RTabs.Root>
  );
}

/** Wrap an icon button (it must also have an aria-label) or any short element. */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <RTooltip.Provider delayDuration={300}>
      <RTooltip.Root>
        <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content className="fj-tooltip" sideOffset={6}>
            {label}
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  );
}

// --- Motion ------------------------------------------------------------------------

/** Fades and lifts its content in once. Does nothing for people who asked for less motion. */
export function FadeIn({ children, delay = 0, y = 8, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
