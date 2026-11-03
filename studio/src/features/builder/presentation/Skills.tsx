/** Slash commands ("/") in the chat: ready-made prompts with a description, like Lovable's skills. */
export type SkillMode = "build" | "chat" | "plan";

export interface Skill {
  id: string;
  name: string;
  desc: string;
  mode: SkillMode;
  prompt: string;
}

export const SKILLS: Skill[] = [
  {
    id: "goal",
    name: "Objetivo",
    desc: "Trabaja hasta que el objetivo esté cumplido por completo.",
    mode: "build",
    prompt: "Objetivo: . Trabaja hasta cumplirlo por completo: comprueba que compila y revisa la vista previa antes de terminar.",
  },
  {
    id: "plan",
    name: "Plan",
    desc: "Prepara un plan detallado para revisarlo antes de construir.",
    mode: "plan",
    prompt: "Prepara un plan detallado para: ",
  },
  {
    id: "review",
    name: "Revisión de código",
    desc: "Busca duplicados, archivos enormes y puntos frágiles, sin cambiar nada.",
    mode: "chat",
    prompt: "Revisa el código de la app: busca código duplicado, archivos demasiado grandes, lógica frágil y problemas de seguridad. Dame una lista priorizada, sin cambiar nada.",
  },
  {
    id: "a11y",
    name: "Accesibilidad",
    desc: "Audita contraste, teclado, etiquetas y lectores de pantalla.",
    mode: "build",
    prompt: "Audita la accesibilidad de la app (contraste, navegación con teclado, etiquetas, texto alternativo, foco) y corrige lo que encuentres.",
  },
  {
    id: "seo",
    name: "Revisión SEO",
    desc: "Títulos, descripciones, encabezados y metadatos de cada página.",
    mode: "build",
    prompt: "Haz una revisión SEO de la app: títulos, meta descripciones, encabezados, URLs y datos para compartir en redes. Aplica las mejoras.",
  },
  {
    id: "db",
    name: "Optimizar base de datos",
    desc: "Revisa índices, relaciones y consultas lentas.",
    mode: "plan",
    prompt: "Revisa la base de datos: índices que faltan, relaciones, consultas lentas y reglas de acceso. Propón un plan de mejoras.",
  },
  {
    id: "explain",
    name: "Explicar la app",
    desc: "Resume cómo está organizada la app y qué hace cada parte.",
    mode: "chat",
    prompt: "Explícame cómo está organizada esta app: páginas, datos y qué hace cada parte.",
  },
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function filterSkills(query: string): Skill[] {
  const q = norm(query);
  return SKILLS.filter((s) => !q || norm(s.name).includes(q) || norm(s.id).includes(q));
}

export function SlashMenu({ skills, active, onPick, onHover }: { skills: Skill[]; active: number; onPick: (s: Skill) => void; onHover: (i: number) => void }) {
  if (!skills.length) return null;
  const cur = skills[Math.min(active, skills.length - 1)]!;
  return (
    <div className="popover up left slash-menu" role="listbox" aria-label="Comandos">
      <div className="menu-label">Habilidades · ↑↓ Enter</div>
      {skills.map((s, i) => (
        <button key={s.id} role="option" aria-selected={i === active} className={`menu-item ${i === active ? "active" : ""}`} onMouseEnter={() => onHover(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(s)}>
          <span>{s.name}</span>
          <span className="muted small slash-mode">{s.mode === "build" ? "Construir" : s.mode === "chat" ? "Chat" : "Plan"}</span>
        </button>
      ))}
      <div className="menu-sep" />
      <div className="small muted slash-desc">{cur.desc}</div>
    </div>
  );
}
