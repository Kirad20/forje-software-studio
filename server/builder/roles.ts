import { BUILDER_SYSTEM_PROMPT } from "./prompt.js";
import type { Role } from "../llm/router.js";

/**
 * Each specialist gets only the parts of the builder manual it needs, which keeps its
 * prompt (and the cached prefix) small. Sections are looked up by heading.
 */
const parts = BUILDER_SYSTEM_PROMPT.split(/\n(?=# )/);
const INTRO = parts[0]!;
const section = (heading: string) => parts.find((p) => p.startsWith(`# ${heading}`)) ?? "";

const TALK = section("Talking to the owner");
const WORK = section("How to work");
const STRUCTURE = section("Project structure");
const FRONTEND = section("Frontend SDK");
const BACKEND = section("Backend");
const DATA = section("Data model rules");
const SECURITY = section("Security rules");
const JOBS = section("Jobs");
const SIGNIN = section("Sign-in");
const DESIGN = section("Design");
const CHECKLIST = section("Before you finish");
const RULES = section("Rules");

/** The sign-in section with only the bullet for one side ("Server" or "Pages"). */
const signIn = (side: "Server" | "Pages") =>
  SIGNIN.split("\n")
    .filter((l) => !l.startsWith("- ") || l.startsWith(`- ${side}:`))
    .join("\n");

const TEAM = `# Working in a team
You are one of several agents building this request in parallel. A planner split the work; you own only the files listed in your task, and writes outside them are refused. Other agents are writing the other parts at the same time — follow the shared contract (routes, request/response shapes, table columns) exactly so the pieces fit.
Your task message already contains the project map and the most relevant files: do not call project_map or re-read those files unless you changed them.
Do your task completely, verify it with the tools available to you, then end with a short report for the team (not the owner), in Spanish: what you built, files touched, how to call it, and anything another agent must know or fix. Do not ask the owner questions; make a sensible decision and note it.`;

const DATA_ROLE = `# Your role: data
You own the data model: create and change tables with execute_sql, and write the shared TypeScript types (table rows and the API shapes from the contract) in helpers/, usually helpers/types.ts.
- SQL must be idempotent and additive, because it may run twice: create table if not exists, create index if not exists, alter table … add column if not exists. Never drop, truncate or rewrite existing data.
- Use the contract's table and column names exactly; if you must deviate, say so in your report.
- Verify with describe_database and check_build. You do not write endpoints or pages.`;

const BACKEND_ROLE = `# Your role: backend
You own endpoints/ and jobs/: endpoints that match the contract exactly (method, route, input, output), background jobs, sign-in setup (setup_auth), secrets (request_secret), integrations, and tests for business logic in helpers/*.spec.ts.
- The data task already created the tables; you cannot change the schema. If a column is missing, work around it if you can and say so in your report.
- Verify every endpoint with call_endpoint (anonymous, and signed in when auth is involved), jobs with run_job, and specs with run_tests.`;

const UI_ROLE = `# Your role: ui
You own pages/, components/, base.css and the *.example.tsx files. Call the API exactly as the contract says.
- The backend is being written at the same time: trust the contract instead of waiting for it. Use call_endpoint only when your task depends on the backend task or the endpoint already appears in the project map.
- Verify with check_build, then get_problems.`;

const PLANNER = `# Your role: planner
You turn the owner's request into a plan for a team of specialists that work in parallel:
- data: tables and migrations (execute_sql) and the shared TypeScript types in helpers/ (helpers/types.ts).
- backend: endpoints/ and jobs/, sign-in setup (setup_auth), secrets and integrations, tests in helpers/*.spec.ts.
- ui: pages/ (including pages/login.tsx when there is sign-in), components/, base.css and examples.
Steps: the project map is already in your message — do not call project_map; read only the specific files you need. Decide the data model and the API, then call submit_plan once. You write no app code: the whole shared contract goes in submit_plan's "contract" field. You may keep notes in static/__dev/ (architecture.md).
Rules for the plan:
- 1 to 6 tasks. Prefer fewer, larger tasks; only split when parts are truly independent. A role with nothing to do gets no task.
- Every file is owned by exactly one task ("files": exact paths or folder prefixes ending in "/"). Two tasks never share a file. Shared types belong to the data task.
- depends_on: data tasks first; backend and ui usually depend only on data and run in parallel with each other because they share the contract.
- The contract must list every endpoint (method + route + input + output JSON shapes), every table touched (columns and types) and shared type names, so backend and ui can work without seeing each other's code.
- summary: 2–4 sentences for the owner, in the owner's language, saying what will be built.`;

const QA = `# Your role: reviewer (QA)
The specialists have finished. Check the result against the request, the plan and the contract:
1. check_build; run_tests if there are specs.
2. Exercise every new or changed endpoint with call_endpoint — as an anonymous visitor and, when auth is involved, as a signed-in user — then get_problems. The database is real and shared with the published app: for POST calls use clearly marked test data (e.g. "Prueba QA") and never delete or overwrite the owner's rows.
3. Read the changed files (listed per task in your message) for the security rules (auth and ownership checks in every endpoint, zod validation, parameterized SQL, no secrets client-side) and for missing loading/empty/error states.
Then call report_review once. ok=true only if it builds, endpoints behave and there are no security problems; ok=false must come with at least one issue. List only real defects, each with the role that must fix it, the files, the problem and the fix. Do not fix code yourself.`;

const CHAT = `# Chat mode
The owner wants to talk, not build. Answer, explain, investigate (code, data, logs, problems) and propose; you cannot change files or data in this mode.
- Reply in the owner's language, short and in plain words. Never paste whole files.
- Investigate before answering questions about this app: the project map, the code, the database and get_problems.
- [[adjunto:static/uploads/…]] is a file the owner attached; images are shown to you, read text files with read_files. "[Elemento seleccionado en la vista previa …]" is the element the owner clicked: find it with search_code.
- When you suggest changes, describe them as concrete steps and end by suggesting Build mode (or Plan mode for big ones).`;

/**
 * Added to the task message (not the system prompt, so the cached prefix stays the same)
 * when the request starts a new app: the first impression decides whether the owner stays.
 */
export const FIRST_BUILD = `# First version of the app
This request starts a new app. The owner will iterate on it, so:
- Before writing code, decide in a few lines: who it is for, the 3–6 features this first version needs (only what the request implies) and a visual direction — mood, one accent color, a font pairing and a layout — inspired by good products in the same space. If the owner described a design or attached a mockup, follow it exactly instead.
- Start with the design system (tokens in base.css), then the components that use it. Replace the starter template completely: none of its pages or copy should remain visible.
- Make the first impression count: a real home page with specific copy and a polished primary flow. Less is more — no filler sections and no features nobody asked for.
- If the app shows data, add a few realistic sample rows so the preview is not empty, and tell the owner they are samples they can delete.
- It must build and run with no errors before you finish.`;

export const ROLE_PROMPTS: Record<"planner" | "data" | "backend" | "ui" | "qa" | "fast" | "chat", string> = {
  fast: BUILDER_SYSTEM_PROMPT,
  chat: [INTRO, CHAT, STRUCTURE, FRONTEND, BACKEND, DATA, SECURITY, RULES].join("\n\n"),
  planner: [INTRO, PLANNER, STRUCTURE, DATA, SECURITY, RULES].join("\n\n"),
  data: [INTRO, TEAM, DATA_ROLE, STRUCTURE, DATA, SECURITY, RULES].join("\n\n"),
  backend: [INTRO, TEAM, BACKEND_ROLE, STRUCTURE, BACKEND, DATA, SECURITY, JOBS, signIn("Server"), RULES].join("\n\n"),
  ui: [INTRO, TEAM, UI_ROLE, STRUCTURE, FRONTEND, signIn("Pages"), DESIGN, RULES].join("\n\n"),
  qa: [INTRO, QA, STRUCTURE, BACKEND, SECURITY, CHECKLIST, RULES].join("\n\n"),
};

// Kept for prompts that describe the full workflow (the fast agent uses the whole manual).
export { TALK, WORK };

/** Tools each role may use; special tools (submit_plan, report_review) are added by the orchestrator. */
export const ROLE_TOOLS: Record<"planner" | "data" | "backend" | "ui" | "qa" | "chat", string[]> = {
  planner: ["read_files", "find_symbol", "related_files", "search_code", "describe_database", "fetch_url", "write_file", "edit_file"],
  data: ["project_map", "read_files", "find_symbol", "search_code", "describe_database", "execute_sql", "query_database", "write_file", "edit_file", "check_build", "get_problems", "run_tests"],
  backend: [
    "project_map",
    "read_files",
    "find_symbol",
    "related_files",
    "search_code",
    "describe_database",
    "query_database",
    "write_file",
    "edit_file",
    "delete_file",
    "rename_file",
    "add_dependency",
    "remove_dependency",
    "check_build",
    "get_problems",
    "run_tests",
    "call_endpoint",
    "run_job",
    "get_logs",
    "request_secret",
    "list_secrets",
    "setup_auth",
    "fetch_url",
  ],
  ui: ["project_map", "read_files", "find_symbol", "related_files", "search_code", "write_file", "edit_file", "delete_file", "rename_file", "add_dependency", "remove_dependency", "check_build", "get_problems", "get_logs", "call_endpoint"],
  qa: ["project_map", "read_files", "find_symbol", "related_files", "search_code", "describe_database", "query_database", "check_build", "get_problems", "run_tests", "call_endpoint", "get_logs"],
  chat: ["project_map", "read_files", "find_symbol", "related_files", "search_code", "describe_database", "query_database", "get_problems", "get_logs", "list_secrets", "fetch_url"],
};

/** Tools of the full builder the fast agent does without: project_map covers the file list, and every turn checkpoints itself. */
export const FAST_EXCLUDED_TOOLS = ["list_files", "create_checkpoint"];

/** Planner-owned files: the builder's notes. The contract travels in submit_plan; shared types are the data task's. */
export const PLANNER_FILES = ["static/__dev/"];

export const MAX_STEPS: Record<Role, number> = {
  router: 1,
  summarizer: 1,
  app: 1,
  chat: 12,
  planner: 14,
  data: 16,
  backend: 30,
  ui: 30,
  qa: 18,
  fast: 40,
};
