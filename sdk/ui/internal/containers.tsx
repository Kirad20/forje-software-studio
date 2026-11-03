import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("fj-card", className)} {...rest}>{children}</div>;
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "primary" | "success" | "danger"; children: ReactNode }) {
  return <span className={clsx("fj-badge", `fj-badge-${tone}`)}>{children}</span>;
}
