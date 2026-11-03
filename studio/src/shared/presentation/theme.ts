import { browser } from "../infrastructure/browser.js";

export type Theme = "light" | "dark" | "system";

export function savedTheme(): Theme {
  try {
    const theme = browser.localStorage.getItem("forja:theme");
    return theme === "light" || theme === "dark" ? theme : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(theme: Theme): void {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
  try {
    browser.localStorage.setItem("forja:theme", theme);
  } catch {
    // Theme selection remains active for the current page if storage is unavailable.
  }
}
