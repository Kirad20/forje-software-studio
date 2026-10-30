import { useState } from "react";
import { Check, Cross } from "./Icons";

export interface LaneStep {
  id: string;
  name: string;
  summary: string;
  state: "running" | "ok" | "err";
  output?: string;
}

export interface Lane {
  id: string;
  role: string;
  goal: string;
  model?: string;
  status: "pending" | "running" | "done" | "failed";
  steps: LaneStep[];
  note?: string;
  usd?: number;
  tokens?: number;
  dependsOn?: string[];
}

export interface TeamTurn {
  summary?: string;
  lanes: Lane[];
  review?: { ok: boolean; summary: string; issues: { role: string; problem: string }[] };
  metrics?: { usd: number; baselineUsd: number; cachedTokens: number };
}

const ROLE: Record<string, { label: string; icon: string }> = {
  planner: { label: "Planificador", icon: "◇" },
  data: { label: "Datos", icon: "⛁" },
  backend: { label: "Backend", icon: "⚙" },
  ui: { label: "Interfaz", icon: "▭" },
  qa: { label: "Revisión", icon: "✓" },
  fast: { label: "Constructor", icon: "✦" },
  chat: { label: "Chat", icon: "◌" },
};

const STEP_LABEL: Record<string, string> = {
  project_map: "Mapa del proyecto",
  read_files: "Leyó",
  find_symbol: "Buscó",
  related_files: "Relacionados",
  search_code: "Buscó en el código",
  write_file: "Escribió",
  edit_file: "Editó",
  delete_file: "Borró",
  rename_file: "Movió",
  describe_database: "Revisó la base de datos",
  execute_sql: "SQL",
  query_database: "Consultó",
  check_build: "Comprobó que compila",
  run_tests: "Pruebas",
  call_endpoint: "Probó",
  get_logs: "Leyó los registros",
  get_problems: "Revisó los errores",
  submit_plan: "Entregó el plan",
  report_review: "Entregó la revisión",
  request_secret: "Pidió el secreto",
  setup_auth: "Preparó el inicio de sesión",
  fetch_url: "Consultó la web",
};

const money = (usd: number) => (usd < 0.01 ? `$${usd.toFixed(4)}` : `$${usd.toFixed(3)}`);
const tokens = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

function LaneCard({ lane }: { lane: Lane }) {
  const [open, setOpen] = useState(false);
  const role = ROLE[lane.role] ?? { label: lane.role, icon: "•" };
  const errors = lane.steps.filter((s) => s.state === "err").length;
  return (
    <div className={`lane lane-${lane.status}`}>
      <div className="lane-head">
        <span className="lane-icon">{role.icon}</span>
        <strong>{role.label}</strong>
        {lane.model && <span className="pill model-pill" title="Modelo elegido por el enrutador">{lane.model}</span>}
        <span className="grow" />
        {lane.status === "running" ? (
          <span className="spinner" style={{ width: 12, height: 12 }} />
        ) : lane.status === "done" ? (
          <span style={{ color: "var(--ok)" }}>
            <Check />
          </span>
        ) : lane.status === "failed" ? (
          <span style={{ color: "var(--err)" }}>
            <Cross />
          </span>
        ) : (
          <span className="small muted">en espera</span>
        )}
      </div>
      {lane.goal && <div className="small muted lane-goal">{lane.goal}</div>}
      {lane.steps.length > 0 && (
        <button className="ghost sm lane-toggle" onClick={() => setOpen((o) => !o)}>
          {open ? "▾" : "▸"} {lane.steps.length} paso{lane.steps.length === 1 ? "" : "s"}
          {errors > 0 && <span style={{ color: "var(--err)" }}> · {errors} con error</span>}
        </button>
      )}
      {open && (
        <div className="steps" style={{ margin: "2px 0 4px" }}>
          {lane.steps.map((s) => (
            <div key={s.id} className={`step ${s.state === "err" ? "err" : ""}`} title={s.output?.slice(0, 400)}>
              {s.state === "running" ? <span className="spinner" style={{ width: 10, height: 10 }} /> : s.state === "ok" ? <Check /> : <Cross />}
              <span>{STEP_LABEL[s.name] ?? s.name}</span>
              {s.summary && <span className="what">{s.summary}</span>}
            </div>
          ))}
        </div>
      )}
      {lane.note && lane.status !== "running" && <div className="small lane-note">{lane.note.slice(0, 280)}</div>}
      {(lane.usd !== undefined || lane.tokens !== undefined) && lane.status !== "pending" && (
        <div className="small muted">
          {lane.tokens ? `${tokens(lane.tokens)} tokens` : ""}
          {lane.usd ? ` · ${money(lane.usd)}` : ""}
        </div>
      )}
    </div>
  );
}

/** One builder turn as a team: plan, one lane per agent (each with its model), review and savings. */
export function AgentLanes({ team }: { team: TeamTurn }) {
  const solo = team.lanes.length === 1 && ["fast", "chat"].includes(team.lanes[0]!.role);
  if (solo) {
    const l = team.lanes[0]!;
    return (
      <div className="team solo">
        <LaneCard lane={l} />
        {team.metrics && <Savings m={team.metrics} />}
      </div>
    );
  }
  return (
    <div className="team">
      <div className="team-head">
        <strong>Equipo de agentes</strong>
        <span className="small muted">{team.lanes.filter((l) => l.status === "done").length}/{team.lanes.length} listos</span>
      </div>
      <div className="lanes">
        {team.lanes.map((l) => (
          <LaneCard key={l.id} lane={l} />
        ))}
      </div>
      {team.review && (
        <div className={`small review ${team.review.ok ? "ok" : "warn"}`}>
          {team.review.ok ? "✓ Revisión aprobada" : "⚠ La revisión encontró problemas"} — {team.review.summary}
          {!team.review.ok && team.review.issues.length > 0 && (
            <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
              {team.review.issues.map((i, k) => (
                <li key={k}>
                  {ROLE[i.role]?.label ?? i.role}: {i.problem}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {team.metrics && <Savings m={team.metrics} />}
    </div>
  );
}

function Savings({ m }: { m: NonNullable<TeamTurn["metrics"]> }) {
  const saved = m.baselineUsd > 0 ? Math.max(0, Math.round((1 - m.usd / m.baselineUsd) * 100)) : 0;
  return (
    <div className="small muted savings" title="Comparado con usar siempre el modelo más potente permitido y sin caché">
      {money(m.usd)}
      {saved > 0 && <> · {saved}% menos que con el modelo más potente</>}
      {m.cachedTokens > 0 && <> · {tokens(m.cachedTokens)} tokens desde caché</>}
    </div>
  );
}
