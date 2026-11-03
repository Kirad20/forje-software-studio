import clsx from "clsx";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Spinner } from "./spinner.js";

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
