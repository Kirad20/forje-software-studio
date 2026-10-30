import { useState } from "react";

export interface Problem {
  id: string;
  kind: "build" | "runtime" | "network" | "server";
  title: string;
  detail: string;
  file?: string;
  line?: number;
  status?: number;
  count: number;
  lastAt: string;
}

const KIND: Record<Problem["kind"], { label: string; icon: string }> = {
  build: { label: "Compilación", icon: "⛔" },
  server: { label: "Servidor", icon: "⚙" },
  runtime: { label: "Navegador", icon: "⚠" },
  network: { label: "Red", icon: "⇅" },
};

/** The message sent to the builder: the full error text, like pasting it from the console. */
export function fixMessage(list: Problem[]) {
  const body = list
    .slice(0, 8)
    .map((p) => {
      const where = p.file ? ` (${p.file}${p.line ? `:${p.line}` : ""})` : "";
      const detail = p.detail && p.detail !== p.title ? `\n${p.detail.slice(0, 1500)}` : "";
      return `[${KIND[p.kind].label}]${p.count > 1 ? ` ×${p.count}` : ""} ${p.title}${where}${detail}`;
    })
    .join("\n\n");
  const what = list.length === 1 ? "este error" : "estos errores";
  return `Arregla ${what} de la vista previa. Busca la causa paso a paso antes de cambiar nada y comprueba que desaparece.\n\n\`\`\`\n${body}\n\`\`\``;
}

/** Above the composer: what is broken right now, with "Intentar arreglar" for all or one. */
export function ProblemsBar({ problems, disabled, onFix }: { problems: Problem[]; disabled: boolean; onFix: (list: Problem[]) => void }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  if (!problems.length) return null;
  const build = problems.filter((p) => p.kind === "build").length;
  const headline = build ? `La app no compila${build > 1 ? ` (${build} errores)` : ""}` : `${problems.length} problema${problems.length > 1 ? "s" : ""} en la vista previa`;
  return (
    <div className={`problems ${build ? "severe" : ""}`}>
      <div className="row" style={{ gap: 8 }}>
        <button className="ghost sm problems-toggle grow" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span>{build ? "⛔" : "⚠"}</span>
          <span className="grow" style={{ textAlign: "left" }}>
            {headline}
            {!open && <span className="muted"> · {problems[0]!.title.slice(0, 80)}</span>}
          </span>
          <span className="muted">{open ? "▾" : "▸"}</span>
        </button>
        <button className="sm primary" disabled={disabled} onClick={() => onFix(build ? problems.filter((p) => p.kind === "build") : problems)}>
          Intentar arreglar
        </button>
      </div>
      {open && (
        <div className="problems-list">
          {problems.map((p) => (
            <div key={p.id} className="problem">
              <div className="row" style={{ gap: 6, alignItems: "flex-start" }}>
                <span title={KIND[p.kind].label}>{KIND[p.kind].icon}</span>
                <button className="ghost problem-title grow" onClick={() => setDetail(detail === p.id ? null : p.id)}>
                  <span className="small muted">{KIND[p.kind].label}</span> {p.title}
                  {p.file && (
                    <span className="small muted">
                      {" "}
                      · {p.file}
                      {p.line ? `:${p.line}` : ""}
                    </span>
                  )}
                  {p.count > 1 && <span className="pill" style={{ marginLeft: 6 }}>×{p.count}</span>}
                </button>
                <button className="ghost sm" disabled={disabled} onClick={() => onFix([p])}>
                  Arreglar
                </button>
              </div>
              {detail === p.id && p.detail && <pre className="problem-detail">{p.detail}</pre>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
