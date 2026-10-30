export type Theme = "light" | "dark" | "system";

export function savedTheme(): Theme {
  try {
    const t = localStorage.getItem("forja:theme");
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(theme: Theme) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("forja:theme", theme);
  } catch {
    /* storage unavailable: the choice lasts for this page only */
  }
}
