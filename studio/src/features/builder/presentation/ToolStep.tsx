import { useState } from "react";
import { Check, Cross } from "../../../shared/Icons.js";
import { copyText } from "../../../shared/ui.js";

export interface ToolStepData {
  name: string;
  summary: string;
  state: "running" | "ok" | "err";
  output?: string;
}

export function ToolStep({ step, label }: { step: ToolStepData; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const failed = step.state === "err";
  const canOpen = failed || !!step.output;
  return (
    <div className={`tool-step ${failed ? "failed" : ""}`}>
      <button className={`step ${failed ? "err" : ""}`} aria-expanded={canOpen ? expanded : undefined} disabled={!canOpen} onClick={() => setExpanded((v) => !v)}>
        {step.state === "running" ? <span className="spinner" style={{ width: 11, height: 11 }} /> : failed ? <Cross /> : <Check />}
        <span>{label}</span>
        {step.summary && <span className="what">{step.summary}</span>}
        {canOpen && <span className="step-disclosure">{expanded ? "Ocultar" : failed ? "Ver error" : "Ver salida"} {expanded ? "▾" : "▸"}</span>}
      </button>
      {failed && !expanded && step.output && <div className="step-error-preview">{step.output.split("\n").find((line) => line.trim())}</div>}
      {expanded && (
        <div className="step-diagnostic">
          <div className="step-diagnostic-head">
            <strong>{failed ? "Detalle del error" : "Salida de la herramienta"}</strong>
            {step.output && <button className="sm ghost" onClick={async () => {
              const ok = await copyText(`${step.name}${step.summary ? ` · ${step.summary}` : ""}\n${step.output}`);
              setCopied(ok);
              setCopyError(!ok);
            }}>{copied ? "Copiado" : "Copiar detalle"}</button>}
          </div>
          <code className="step-tool-name">{step.name}</code>
          {step.output ? <pre className="step-output">{step.output}</pre> : <p className="small muted">Este registro no contiene la salida de la herramienta. El detalle no se guardó en esta ejecución.</p>}
          {copyError && <p className="small" role="alert">No se pudo copiar. Selecciona el detalle y cópialo manualmente.</p>}
        </div>
      )}
    </div>
  );
}
