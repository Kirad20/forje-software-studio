import { useEffect, useRef, useState, type ReactNode } from "react";
export { Select } from "./Select.js";

/** Closes on outside click and Escape. */
export function useDismiss<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

/** A button that opens a popover. `children` receives a close function. */
export function Menu(props: {
  button: (open: boolean, toggle: () => void) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  up?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useDismiss<HTMLDivElement>(open, close);
  return (
    <div className="menu-anchor" ref={ref}>
      {props.button(open, () => setOpen((o) => !o))}
      {open && <div className={`${props.className ?? "popover"} ${props.align ?? "left"} ${props.up ? "up" : ""}`}>{props.children(close)}</div>}
    </div>
  );
}

export function MenuItem(props: { onClick: () => void; children: ReactNode; danger?: boolean; checked?: boolean; disabled?: boolean }) {
  return (
    <button className={`menu-item ${props.danger ? "danger" : ""}`} onClick={props.onClick} disabled={props.disabled}>
      {props.children}
      {props.checked && <span className="check">✓</span>}
    </button>
  );
}

export function Switch({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} className={`switch ${on ? "on" : ""}`} onClick={() => onChange(!on)} />;
}

export function Modal({ onClose, children, className }: { onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`card ${className ?? "modal"}`} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const COLORS = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#db2777", "#7c3aed"];
export const colorFor = (id: string) => COLORS[parseInt(id.slice(0, 4), 16) % COLORS.length] ?? COLORS[0];

export function Avatar({ id, name, size = 36 }: { id: string; name: string; size?: number }) {
  return (
    <div className={size < 30 ? "mini-avatar" : "avatar"} style={{ background: colorFor(id), width: size, height: size }}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
