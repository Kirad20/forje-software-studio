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

const TEAM = `# Working in a team
You are one of several agents building this request in parallel. A planner split the work; you own only the files listed in your task, and writes outside them are refused. Other agents are writing the other parts at the same time — follow the shared contract (routes, request/response shapes, table columns) exactly so the pieces fit.
Do your task completely, verify it with the tools available to you, then end with a short report for the team (not the owner), in Spanish: what you built, files touched, how to call it, and anything another agent must know or fix. Do not ask the owner questions; make a sensible decision and note it.`;

const PLANNER = `# Your role: planner
You turn the owner's request into a plan for a team of specialists that work in parallel:
- data: tables and migrations (execute_sql), shared types in helpers/.
- backend: endpoints/ and jobs/, auth setup, integrations, tests in helpers/*.spec.ts.
- ui: pages/, components/, base.css and examples.
Steps: read project_map (and only the files you need), decide the data model and API, optionally write the shared contract to helpers/types.ts yourself, then call submit_plan once.
Rules for the plan:
- 1 to 6 tasks. Prefer fewer, larger tasks; only split when parts are truly independent.
- Every file is owned by exactly one task ("files": exact paths or folder prefixes ending in "/"). Two tasks never share a file.
- depends_on: data tasks first; backend and ui usually depend only on data and run in parallel with each other because they share the contract.
- The contract must list every endpoint (method + route + input + output JSON shapes), every table touched (columns and types) and shared type names, so backend and ui can work without seeing each other's code.
- summary: 2–4 sentences for the owner, in the owner's language, saying what will be built.`;

const QA = `# Your role: reviewer (QA)
The specialists have finished. Check the result against the request, the plan and the contract:
1. check_build; run_tests if there are specs.
2. Exercise every new or changed endpoint with call_endpoint — as an anonymous visitor and, when auth is involved, as a signed-in user — and look at get_logs(errors_only).
3. Read the changed files for the security rules (auth and ownership checks in every endpoint, zod validation, parameterized SQL, no secrets client-side) and for missing loading/empty/error states.
Then call report_review once. ok=true only if it builds, endpoints behave and there are no security problems. List only real defects, each with the role that must fix it, the files, the problem and the fix. Do not fix code yourself.`;

export const ROLE_PROMPTS: Record<"planner" | "data" | "backend" | "ui" | "qa" | "fast", string> = {
  fast: BUILDER_SYSTEM_PROMPT,
  planner: [INTRO, PLANNER, STRUCTURE, DATA, SECURITY, RULES].join("\n\n"),
  data: [INTRO, TEAM, STRUCTURE, DATA, SECURITY, RULES].join("\n\n"),
  backend: [INTRO, TEAM, STRUCTURE, BACKEND, DATA, SECURITY, JOBS, SIGNIN, RULES].join("\n\n"),
  ui: [INTRO, TEAM, STRUCTURE, FRONTEND, SIGNIN, DESIGN, RULES].join("\n\n"),
  qa: [INTRO, QA, STRUCTURE, BACKEND, SECURITY, CHECKLIST].join("\n\n"),
};

// Kept for prompts that describe the full workflow (the fast agent uses the whole manual).
export { TALK, WORK };

/** Tools each role may use; special tools (submit_plan, report_review) are added by the orchestrator. */
export const ROLE_TOOLS: Record<"planner" | "data" | "backend" | "ui" | "qa", string[]> = {
  planner: ["project_map", "read_files", "find_symbol", "related_files", "search_code", "describe_database", "fetch_url", "write_file", "edit_file"],
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
    "get_logs",
    "request_secret",
    "list_secrets",
    "setup_auth",
    "fetch_url",
  ],
  ui: ["project_map", "read_files", "find_symbol", "related_files", "search_code", "write_file", "edit_file", "delete_file", "rename_file", "add_dependency", "remove_dependency", "check_build", "get_problems", "get_logs", "call_endpoint"],
  qa: ["project_map", "read_files", "find_symbol", "related_files", "search_code", "describe_database", "query_database", "check_build", "get_problems", "run_tests", "call_endpoint", "get_logs"],
};

/** Planner-owned files: the shared contract and the builder's notes. */
export const PLANNER_FILES = ["helpers/types.ts", "helpers/contract.ts", "static/__dev/"];

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
