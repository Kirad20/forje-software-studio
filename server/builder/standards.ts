import type { BuildProblem } from "../runtime/bundler.js";
import { contractRoutes } from "./plan.js";

/**
 * The house standards, checked deterministically over a project's source: what the manual
 * asks for and a model forgets under pressure (tokens instead of colors, the kit instead
 * of hand-rolled UI, the contract instead of guessed types, specs for business rules).
 *
 * Findings use the shape of build problems so the finish gate treats them alike: only the
 * ones that are new since the agent started, and only in files it owns. Style is advice,
 * never a reason to block a publish (that is the security scan's job).
 */

type FileMap = Record<string, string>;

const isUiSource = (f: string) => /^(pages|components)\/.+\.(tsx|css)$/.test(f) && !/\.example\.tsx$/.test(f);
const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length;

const COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
const INLINE_VISUAL = /style=\{\{[^}]*\b(color|background|backgroundColor|fontSize|fontFamily|padding|margin|borderRadius)\s*:/;
const INTERNAL_ANCHOR = /<a\s[^>]*href=["']\/(?!\/)/;
/** `api.get<T>("route"`, `api.post<T>("route"` and `useApi<T>("route"`: a call typed by hand. */
const HAND_TYPED_API = /\b(api\.get|api\.post|useApi)\s*<[^()]*>\s*\(\s*["'`]([^"'`]+)["'`]/g;
const HAS_RULES = /Math\.|\.reduce\(|\b(price|total|amount|tax|discount)\b/i;
const NOT_LOGIC = /^helpers\/(types|contract|api)\.ts$/;

export function standardsScan(files: FileMap): BuildProblem[] {
  const out: BuildProblem[] = [];
  const add = (file: string, text: string, line?: number) => out.push({ file, line, text: `Estándar: ${text}` });
  const contract = files["helpers/contract.ts"];
  const routes = contract ? contractRoutes(contract) : [];

  for (const [file, text] of Object.entries(files)) {
    if (text.startsWith("base64:")) continue;

    if (isUiSource(file)) {
      const color = COLOR.exec(text);
      if (color) add(file, `color escrito a mano (${color[0]}); usa un token de base.css, p. ej. var(--primary), var(--muted) o var(--danger)`, lineOf(text, color.index));
      if (file.endsWith(".tsx")) {
        const inline = INLINE_VISUAL.exec(text);
        if (inline) add(file, "estilo visual en línea (color, fondo, tipografía o espaciado); ponlo en el .module.css con tokens, o usa una variante del componente", lineOf(text, inline.index));
        const anchor = INTERNAL_ANCHOR.exec(text);
        if (anchor) add(file, 'enlace interno con <a href="/…">; usa <Link to="/…"> de @forja/client para no recargar la página', lineOf(text, anchor.index));
        // Only routes the contract already covers: a call to anything else has nothing to be typed by.
        const api = [...text.matchAll(HAND_TYPED_API)].find((m) => routes.some((r) => r.route === m[2]!.replace(/^\//, "") && r.method === (m[1] === "api.post" ? "POST" : "GET")));
        if (api) add(file, `llamada a ${api[2]} con tipo escrito a mano, pero la ruta está en helpers/contract.ts; usa el cliente tipado createApi(contract) de helpers/api.ts`, lineOf(text, api.index!));
      }
    }

    if (/^helpers\/[^/]+\.ts$/.test(file) && !file.endsWith(".spec.ts") && !NOT_LOGIC.test(file) && /export\s+(async\s+)?function\s/.test(text) && HAS_RULES.test(text)) {
      const spec = file.replace(/\.ts$/, ".spec.ts");
      if (!(spec in files)) add(file, `tiene lógica de negocio (cálculos o reglas) sin pruebas; crea ${spec} con describe/it/expect y córrelo con run_tests`);
    }

    const endpoint = /^endpoints\/(.+)_(GET|POST)\.ts$/.exec(file);
    if (endpoint && routes.some((r) => r.route === endpoint[1] && r.method === endpoint[2]) && !/helpers\/contract|\bcontract\b/.test(text)) {
      add(file, `la ruta ${endpoint[2]} ${endpoint[1]} está en helpers/contract.ts pero el endpoint no lo usa; valida con el esquema de entrada del contrato y tipa la salida con el de salida`);
    }
  }
  return out;
}

export const formatStandard = (p: BuildProblem) => `${p.file}${p.line ? `:${p.line}` : ""} — ${p.text}`;
