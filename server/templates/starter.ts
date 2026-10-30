/** Files every new project starts with. The builder replaces them on its first turn. */
export function starterFiles(name: string): Record<string, string> {
  return {
    "base.css": `:root {
  --bg: #fafaf9;
  --surface: #ffffff;
  --text: #1c1917;
  --muted: #78716c;
  --border: #e7e5e4;
  --primary: #ea580c;
  --primary-text: #ffffff;
  --radius: 12px;
  --font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0c0a09;
    --surface: #1c1917;
    --text: #fafaf9;
    --muted: #a8a29e;
    --border: #292524;
  }
}

* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font); }
a { color: inherit; }
button { font: inherit; cursor: pointer; }
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
