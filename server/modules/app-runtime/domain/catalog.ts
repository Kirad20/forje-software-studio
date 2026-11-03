/**
 * The packages generated apps are meant to be built with. Using the same few libraries for
 * the same jobs is what makes every app look, move and behave alike, and it keeps the
 * builder from guessing at the API of a package it barely knows.
 *
 * Two tiers:
 *  - BUILTIN: ships with Forja (one version for everyone, nothing to install, no slot used).
 *  - CATALOG: installed on demand, but always at the version listed here.
 * Nothing else installs: the catalog is closed (projects that already list other packages keep building).
 */

export interface KitEntry {
  /** What to use it for: shown to the builder when it asks for the package. */
  use: string;
}

/** Imported without installing: from Forja's own node_modules. */
export const KIT_BUILTIN: Record<string, KitEntry> = {
  "@forja/ui": { use: "componentes de interfaz listos (Button, Input, Dialog, Toaster, EmptyState…): úsalos antes de escribir un componente propio" },
  "radix-ui": { use: "primitivas accesibles sin estilo (Dialog, DropdownMenu, Popover, Select, Switch…) para un componente que @forja/ui no trae" },
  "lucide-react": { use: "iconos (import { Plus } from \"lucide-react\"); nada de SVG inline para iconos corrientes" },
  motion: { use: 'animaciones: import { motion, AnimatePresence } from "motion/react"; o FadeIn de @forja/ui' },
  clsx: { use: "clases CSS condicionales" },
  sonner: { use: "avisos tipo toast; con toast() y <Toaster /> de @forja/ui" },
};

/** Installed on demand at exactly this version (checked against React 19). */
export const KIT_CATALOG: Record<string, KitEntry & { version: string }> = {
  "react-hook-form": { version: "7.91.0", use: "formularios con varios campos, validación y estado de envío" },
  "@hookform/resolvers": { version: "5.9.2", use: "zodResolver para usar un esquema zod del contrato en react-hook-form" },
  recharts: { version: "3.10.1", use: "gráficas (líneas, barras, áreas, tarta)" },
  "date-fns": { version: "4.4.0", use: "cálculos y formato de fechas más allá de Intl.DateTimeFormat" },
  "@tanstack/react-table": { version: "8.21.3", use: "tablas con orden, filtros y paginación" },
  "@dnd-kit/core": { version: "6.3.1", use: "arrastrar y soltar" },
  "@dnd-kit/sortable": { version: "10.0.0", use: "listas reordenables (con @dnd-kit/core y @dnd-kit/utilities)" },
  "@dnd-kit/utilities": { version: "3.2.2", use: "utilidades de @dnd-kit (CSS.Transform)" },
};

/** The kit as a short list for prompts and error messages. */
export const kitSummary = () =>
  [...Object.entries(KIT_BUILTIN).map(([n, k]) => `- ${n} (incluido): ${k.use}`), ...Object.entries(KIT_CATALOG).map(([n, k]) => `- ${n} (add_dependency): ${k.use}`)].join("\n");
