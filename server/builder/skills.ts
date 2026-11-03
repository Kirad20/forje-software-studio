import { BUILTIN_SKILLS, type Skill } from "./skillLibrary.js";

/**
 * Skills the agents can load on demand. Two sources: the ones that ship with Forja and the
 * project's own, written by the owner or by an agent as static/__dev/skills/<name>.md (the
 * folder is never published). A project skill with the same name replaces the built-in one.
 *
 * The prompt carries only the index (name and one line each); load_skill returns the body.
 * A project skill is the owner's own text, so it is read as guidance like the owner's
 * project instructions, and it never changes the rules of the manual.
 */

export const SKILLS_DIR = "static/__dev/skills/";
const MAX_PROJECT_SKILLS = 30;
const MAX_DESCRIPTION = 160;

/** `---\nname: x\ndescription: y\n---\nbody`, or just markdown (the first line is then the description). */
export function parseSkill(file: string, text: string): Skill | null {
  const fallback = file.slice(SKILLS_DIR.length).replace(/\.md$/, "");
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text.trim());
  const meta = (key: string) => new RegExp(`^${key}:\s*(.+)$`, "m").exec(m?.[1] ?? "")?.[1]?.trim();
  const body = (m ? m[2]! : text).trim();
  if (!body) return null;
  const name = (meta("name") ?? fallback).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  const description = meta("description") ?? body.split("\n").find((l) => l.trim())?.replace(/^#+\s*/, "").trim();
  if (!name || !description) return null;
  return { name, description: description.slice(0, MAX_DESCRIPTION), body };
}

export function projectSkills(files: Record<string, string>): Skill[] {
  return Object.keys(files)
    .filter((f) => f.startsWith(SKILLS_DIR) && /^[^/]+\.md$/.test(f.slice(SKILLS_DIR.length)) && !files[f]!.startsWith("base64:"))
    .sort()
    .slice(0, MAX_PROJECT_SKILLS)
    .map((f) => parseSkill(f, files[f]!))
    .filter((s): s is Skill => !!s);
}

/** Built-in skills first, each replaced by the project's skill of the same name; the rest follow. */
export function allSkills(files: Record<string, string>): Skill[] {
  const mine = new Map(projectSkills(files).map((s) => [s.name, s]));
  const builtin = BUILTIN_SKILLS.map((s) => mine.get(s.name) ?? s);
  const names = new Set(BUILTIN_SKILLS.map((s) => s.name));
  return [...builtin, ...[...mine.values()].filter((s) => !names.has(s.name))];
}

export const findSkill = (files: Record<string, string>, name: string) => allSkills(files).find((s) => s.name === name.trim().toLowerCase());

/** The section every prompt carries: what exists, and when to load it. */
export function skillIndex(files: Record<string, string> = {}): string {
  return [
    "# Skills (load on demand)",
    "Focused how-tos for specific jobs. Before work that matches one, call load_skill with its name and follow it; do not guess the API of a library from memory.",
    ...allSkills(files).map((s) => `- ${s.name}: ${s.description}`),
    `The owner or you can add project skills as ${SKILLS_DIR}<name>.md (optional front matter: name, description).`,
  ].join("\n");
}
