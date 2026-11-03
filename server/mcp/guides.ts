import { BUILDER_SYSTEM_PROMPT } from "../builder/prompt.js";

/**
 * Topic guides for external MCP agents, cut from the builder's manual so there is one
 * source of truth. An external agent fetches only what it needs (get_guides), instead of
 * the whole manual on every session — the same progressive disclosure Floot's MCP uses.
 */
export interface Guide {
  id: string;
  title: string;
  /** One line shown in the guide list, so the agent can pick without reading it. */
  summary: string;
  body: string;
}

/** Stable ids for each "# Heading" of BUILDER_SYSTEM_PROMPT. A new heading needs an entry here (a test checks it). */
export const SECTION_IDS: Record<string, { id: string; summary: string }> = {
  "Talking to the owner": { id: "talking-to-owner", summary: "Cómo hablar con el dueño: idioma, plan breve, resumen honesto al final." },
  "How to work": { id: "workflow", summary: "Orientarse, datos primero, construir, verificar, arreglar errores, notas." },
  "Project structure (the ONLY allowed paths)": { id: "structure", summary: "Las únicas rutas permitidas (pages, components, helpers, endpoints, jobs, static) e imports." },
  'Frontend SDK — import { ... } from "@forja/client"': { id: "frontend-sdk", summary: "Routing, api/useApi, auth, storage, realtime, ai y useHead en el navegador." },
  "Shared contract — helpers/contract.ts": { id: "contract", summary: "El contrato de la API como código (zod): endpoints y páginas lo importan y los desajustes fallan al compilar." },
  "Interface kit — use these, do not reinvent them": { id: "ui-kit", summary: "@forja/ui, iconos, animaciones y paquetes del catálogo: qué usar para cada cosa antes de escribir un componente." },
  "Backend — endpoints": { id: "backend", summary: "Forma de un endpoint y todo lo que trae ctx (db, storage, email, ai, jobs, payments, env)." },
  "Data model rules": { id: "data-model", summary: "Convenciones de tablas, dinero, fechas, user_id, índices y migraciones aditivas." },
  "Security rules (non-negotiable)": { id: "security", summary: "Autorizar en cada endpoint, validar con zod, SQL parametrizado, secretos solo en el servidor." },
  "Jobs — jobs/<name>.ts": { id: "jobs", summary: "Tareas en segundo plano y programadas (cron, zona horaria, límites)." },
  "Sign-in": { id: "auth", summary: "Cuándo y cómo añadir cuentas: setup_auth, página de login, proteger páginas." },
  Design: { id: "design", summary: "Tokens en base.css, estados vacío/carga/error, responsive, accesibilidad, SEO. Léela antes de hacer UI." },
  Memory: { id: "memory", summary: "Qué guardar con remember/forget y qué no." },
  "Before you finish a turn (checklist)": { id: "checklist", summary: "Lista de verificación antes de dar algo por terminado." },
  Rules: { id: "rules", summary: "Reglas generales: llamadas en paralelo, alcance, secretos, qué pedirle al dueño." },
};

/** Guides read together as the entry point. */
const OVERVIEW_PARTS = ["workflow", "structure", "rules"];

function parse(prompt: string) {
  const chunks = prompt.split(/\n(?=# )/);
  const intro = chunks.shift()!.trim();
  const sections = chunks.map((c) => {
    const nl = c.indexOf("\n");
    return { heading: c.slice(2, nl).trim(), body: c.slice(nl + 1).trim() };
  });
  return { intro, sections };
}

function build(): Guide[] {
  const { intro, sections } = parse(BUILDER_SYSTEM_PROMPT);
  const guides: Guide[] = sections.map(({ heading, body }) => {
    const meta = SECTION_IDS[heading];
    return { id: meta?.id ?? slug(heading), title: heading, summary: meta?.summary ?? heading, body: `# ${heading}\n${body}` };
  });
  const byId = new Map(guides.map((g) => [g.id, g]));
  const overview: Guide = {
    id: "forja-overview",
    title: "Cómo funciona un proyecto de Forja",
    summary: "Empieza aquí: qué es Forja, el flujo de trabajo, las rutas permitidas y las reglas. Léela antes del primer cambio.",
    body: [intro, ...OVERVIEW_PARTS.map((id) => byId.get(id)?.body ?? "")].filter(Boolean).join("\n\n"),
  };
  return [overview, ...guides];
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const GUIDES = build();
const guideById = new Map(GUIDES.map((g) => [g.id, g]));

export function guideList() {
  return [
    "Guías de Forja. Pide una con get_guides({ topic }) o varias con get_guides({ topics: [...] }).",
    "",
    ...GUIDES.map((g) => `- ${g.id}: ${g.summary}`),
  ].join("\n");
}

/** The requested guides, or the list plus a clear error for unknown ids. */
export function readGuides(ids: string[]): { text: string; unknown: string[] } {
  const unknown = ids.filter((id) => !guideById.has(id));
  const found = ids.filter((id) => guideById.has(id)).map((id) => guideById.get(id)!.body);
  const text = [
    ...found,
    unknown.length ? `Guía desconocida: ${unknown.join(", ")}.\n\n${guideList()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");
  return { text, unknown };
}
