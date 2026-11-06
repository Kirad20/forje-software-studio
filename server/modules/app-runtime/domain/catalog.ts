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
