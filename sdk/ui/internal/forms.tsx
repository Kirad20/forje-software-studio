import clsx from "clsx";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
}

function Field({ id, label, hint, error, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="fj-field">
      {label && <label className="fj-label" htmlFor={id}>{label}</label>}
      {children}
      {error ? <p className="fj-field-error" id={`${id}-msg`} role="alert">{error}</p>
        : hint && <p className="fj-field-hint" id={`${id}-msg`}>{hint}</p>}
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

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(function Select({ label, hint, error, id, className, children, ...rest }, ref) {
  const uid = useId();
  const fid = id ?? uid;
  return (
    <Field id={fid} label={label} hint={hint} error={error}>
      <select ref={ref} id={fid} className={clsx("fj-control", className)} {...describe(fid, { hint, error })} {...rest}>{children}</select>
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
