# Implementation plan document (`static/__dev/plan.md`)

On team builds (planner → specialists) the planner first analyses the request (reusable pieces,
findings, 2–4 owner decisions with a recommendation) and writes `static/__dev/plan.md`, a
Markdown plan with exactly these `##` sections, in order: **Contexto**, **Modelo de datos**,
**Backend**, **Interfaz**, **Archivos clave**, **Verificación**, **Capacidad/orden**.

- `submit_plan` is rejected, with every problem listed, when the document is missing, has a missing,
  empty or misordered section, or exceeds 20 000 characters (`checkPlanDoc`).
- The planner is the only writer (it owns `static/__dev/`). Data, backend and ui specialists receive
  it first among their project docs, QA receives it as `implementationPlan` and checks the
  **Verificación** section, and the fast agent reads it when present.
- In Plan mode the chat shows the document and waits for «Implementar plan»; a direct Build continues
  without waiting. The parallel task split and `helpers/contract.ts` are unchanged.
- Small requests (fast path) and projects without a `plan.md` behave as before.
