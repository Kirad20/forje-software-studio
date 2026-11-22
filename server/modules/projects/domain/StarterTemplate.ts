export type StarterTemplate = "standard" | "monolith" | "orders-invoices" | "components";

/** New projects start with forja.json components unless the creator picks another starter. */
export const DEFAULT_STARTER_TEMPLATE: StarterTemplate = "standard";

export function parseStarterTemplate(value: unknown): StarterTemplate | undefined {
  if (value === undefined) return undefined;
  if (value === "standard" || value === "monolith" || value === "orders-invoices" || value === "components") return value;
  throw new Error("Template no válido: usa standard, monolith, orders-invoices o components");
}

/** Files of the standard starter that are scaffolding, not app content: a project holding only these and the welcome page is still empty. */
export const STANDARD_SCAFFOLD_FILES: ReadonlySet<string> = new Set(["forja.json", "services/api/endpoints/health_GET.ts", "packages/shared/index.ts"]);

/**
 * The standard structure every new project starts with: a forja.json with a web frontend at
 * "/" (apps/web), an API with its own database schema (services/api, served at /_api/v1/…)
 * and a shared library (packages/shared). Empty: no demo data, only the welcome page.
 */
export function standardStarterFiles(name: string): Record<string, string> {
  const web: Record<string, string> = {};
  for (const [path, content] of Object.entries(starterFiles(name))) web[`apps/web/${path}`] = content;
  return {
    "forja.json": JSON.stringify({
      version: 1,
      components: {
        web: { kind: "web", root: "apps/web", mount: "/", description: "Frontend de la app" },
        api: { kind: "api", root: "services/api", route: "v1", database: true, description: "API y datos de la app" },
        shared: { kind: "library", root: "packages/shared", description: "Tipos y reglas compartidas entre web y api" },
      },
    }, null, 2) + "\n",
    ...web,
    "services/api/endpoints/health_GET.ts": `// forja:public — liveness check, returns no data.
export default async function () {
  return { ok: true };
}
`,
    "packages/shared/index.ts": `/** Types and pure rules shared by apps/web and services/api: import from "~/packages/shared". */
export {};
`,
  };
}

/** The native single-app starter (pages/, endpoints/… at the root); opt-in with template "monolith". */
export function starterFiles(name: string): Record<string, string> {
  return {
    "base.css": `/* Design tokens: the only place colors, radii, shadows and type sizes are defined.
   @forja/ui and every component read them, so editing this file restyles the whole app. */
:root {
  --bg: #fafaf9;
  --surface: #ffffff;
  --text: #1c1917;
  --muted: #6b645f;
  --border: #e0ddda;
  --primary: #c2410c;
  --primary-text: #ffffff;
  --danger: #b91c1c;
  --success: #15803d;
  --radius: 12px;
  --shadow: 0 8px 24px rgb(0 0 0 / 0.12);
  --font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 2rem;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 40px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0c0a09;
    --surface: #1c1917;
    --text: #fafaf9;
    --muted: #a8a29e;
    --border: #2f2b28;
    --primary: #fb923c;
    --primary-text: #1c1917;
    --danger: #f87171;
    --success: #4ade80;
    --shadow: 0 8px 24px rgb(0 0 0 / 0.5);
  }
}

* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font); font-size: var(--text-md); }
a { color: inherit; }
button { font: inherit; cursor: pointer; }
`,
    "pages/_layout.tsx": `import type { ReactNode } from "react";
import { Toaster } from "@forja/ui";

// Wraps every page. <Toaster /> shows the toast.success(...) / toast.error(...) messages.
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
`,
    "pages/_index.tsx": `import styles from "./_index.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <span className={styles.badge}>Nuevo proyecto</span>
        <h1>${name.replace(/[`$\\]/g, "")}</h1>
        <p>Describe en el chat lo que quieres construir y verás la app aparecer aquí.</p>
      </div>
    </main>
  );
}
`,
    "pages/_index.module.css": `.main {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.card {
  max-width: 480px;
  text-align: center;
}

.card h1 {
  font-size: 2.25rem;
  margin: 12px 0;
}

.card p {
  color: var(--muted);
  line-height: 1.6;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
}
`,
  };
}
