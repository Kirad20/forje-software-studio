/**
 * The quick security scan: deterministic rules over the project's source, run on every
 * publish and on demand. It only catches patterns that are almost always wrong; the deep
 * review (builder/securityReview.ts) reads the code like a person would.
 */

export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
  /** Stable across unrelated edits: rule + file + the offending snippet. */
  id: string;
  rule: string;
  severity: Severity;
  title: string;
  detail: string;
  fix: string;
  file?: string;
  line?: number;
  source: "quick" | "deep";
}

type FileMap = Record<string, string>;

const isClient = (p: string) => p.startsWith("pages/") || p.startsWith("components/") || (p.startsWith("static/") && !p.startsWith("static/__dev/")) || p === "base.css";
const isServer = (p: string) => p.startsWith("endpoints/") || p.startsWith("jobs/") || p.startsWith("helpers/");
const isCode = (p: string) => /\.(tsx?|jsx?|mjs|html|css|json)$/.test(p) && !p.endsWith(".spec.ts") && !p.endsWith(".example.tsx");

const SECRETS: { name: string; re: RegExp }[] = [
  { name: "clave secreta de Stripe", re: /\b(sk|rk)_live_[0-9a-zA-Z]{16,}/ },
  { name: "clave de Anthropic", re: /\bsk-ant-[\w-]{20,}/ },
  { name: "clave de OpenAI", re: /\bsk-(proj-)?[A-Za-z0-9_-]{32,}/ },
  { name: "clave de AWS", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "token de GitHub", re: /\b(ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{30,}/ },
  { name: "token de Slack", re: /\bxox[abprs]-[\w-]{10,}/ },
  { name: "clave privada", re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "clave de Resend", re: /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}/ },
];

/** The kind of secret key found in a text (for refusing to store it), or null. */
export const findSecret = (text: string) => SECRETS.find((s) => s.re.test(text))?.name ?? null;

const WRITE_SQL = /\b(insert\s+into|update\s+\w+\s+set|delete\s+from)\b/i;
const SQL_TEMPLATE = /\.(query|one|exec)\s*(<[^>]*>)?\s*\(\s*`[^`]*\$\{/g;
const SQL_CONCAT = /\.(query|one|exec)\s*(<[^>]*>)?\s*\(\s*(["'])[^"'\n]*\3\s*\+/g;

const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length;

/** `// forja:public` in an endpoint says it is open on purpose (a contact form, a public counter). */
const markedPublic = (text: string) => /\/\/\s*forja:public\b/.test(text);

export function quickScan(files: FileMap, fingerprint: (...parts: string[]) => string): Finding[] {
  const out: Finding[] = [];
  const add = (f: Omit<Finding, "id" | "source">, snippet: string) => out.push({ ...f, id: fingerprint(f.rule, f.file ?? "", snippet.trim().replace(/\s+/g, " ")), source: "quick" });

  for (const [path, text] of Object.entries(files)) {
    if (text.startsWith("base64:") || !isCode(path)) continue;
    const client = isClient(path);
    const server = isServer(path);

    for (const s of SECRETS) {
      const m = s.re.exec(text);
      if (!m) continue;
      add(
        {
          rule: client ? "secret-in-client" : "hardcoded-secret",
          severity: client ? "critical" : "high",
          title: client ? `Hay una ${s.name} en código que ve el navegador` : `Hay una ${s.name} escrita en el código`,
          detail: client
            ? "Cualquier visitante puede leerla en el código de la página y usarla en tu nombre."
            : "Queda en el historial de cambios y en cualquier copia o descarga del código.",
          fix: "Revoca esa clave en el proveedor, guarda una nueva como secreto (request_secret) y léela solo en el servidor con ctx.env.",
          file: path,
          line: lineOf(text, m.index),
        },
        m[0],
      );
    }

    if (client && /\b(ctx\.env|process\.env)\b/.test(text)) {
      const i = text.search(/\b(ctx\.env|process\.env)\b/);
      add(
        {
          rule: "env-in-client",
          severity: "high",
          title: "Una página intenta leer secretos",
          detail: "Los secretos solo existen en el servidor; si llegaran a la página, cualquiera los vería.",
          fix: "Mueve esa lógica a un endpoint que use ctx.env y devuelva solo el resultado.",
          file: path,
          line: lineOf(text, i),
        },
        text.slice(i, i + 40),
      );
    }

    if (server) {
      for (const re of [SQL_TEMPLATE, SQL_CONCAT]) {
        for (const m of text.matchAll(re)) {
          add(
            {
              rule: "sql-interpolation",
              severity: "high",
              title: "SQL construido juntando texto",
              detail: "Si alguna parte viene del navegador, alguien puede leer o borrar datos de otros (inyección SQL).",
              fix: "Pasa los valores como parámetros ($1, $2) y elige columnas u orden de una lista fija.",
              file: path,
              line: lineOf(text, m.index!),
            },
            m[0],
          );
        }
      }
      if (/\b(eval\s*\(|new\s+Function\s*\()/.test(text)) {
        const i = text.search(/\b(eval\s*\(|new\s+Function\s*\()/);
        add(
          {
            rule: "eval",
            severity: "high",
            title: "Se ejecuta código construido en tiempo de ejecución",
            detail: "eval o new Function con datos de fuera permite ejecutar cualquier cosa en el servidor.",
            fix: "Sustitúyelo por lógica explícita (un mapa de funciones, JSON.parse para datos).",
            file: path,
            line: lineOf(text, i),
          },
          text.slice(i, i + 40),
        );
      }
      const leak = /ctx\.log\([^)]*ctx\.env|return\s*\{[^}]*ctx\.env\./.exec(text);
      if (leak)
        add(
          {
            rule: "secret-exposed",
            severity: "high",
            title: "Un secreto se registra o se devuelve",
            detail: "Lo que se devuelve llega al navegador, y lo que se registra lo ve cualquiera con acceso a los registros.",
            fix: "Usa el secreto solo para llamar al servicio y no lo incluyas en respuestas ni en ctx.log.",
            file: path,
            line: lineOf(text, leak.index),
          },
          leak[0],
        );
      const amount = /amountCents\s*:\s*(ctx\.body|ctx\.query|input|body)\b/.exec(text);
      if (amount)
        add(
          {
            rule: "price-from-client",
            severity: "high",
            title: "El importe del pago viene del navegador",
            detail: "Cualquiera puede cambiar el precio antes de pagar.",
            fix: "Calcula el importe en el servidor a partir de tus tablas (producto, plan) y recibe solo su id.",
            file: path,
            line: lineOf(text, amount.index),
          },
          amount[0],
        );
    }

    if (path.startsWith("endpoints/") && !markedPublic(text)) {
      const authed = /requireUser\s*\(|ctx\.user\b/.test(text);
      if (/_POST\.tsx?$/.test(path) && WRITE_SQL.test(text) && !authed)
        add(
          {
            rule: "write-without-auth",
            severity: "high",
            title: "Un endpoint cambia datos sin pedir sesión",
            detail: "Cualquiera, sin cuenta, puede llamarlo directamente y crear, cambiar o borrar filas.",
            fix: "Añade ctx.requireUser() y comprueba que la fila es de ese usuario. Si debe ser público a propósito (un formulario de contacto), limita el abuso y márcalo con // forja:public.",
            file: path,
          },
          "write",
        );
      if (/(^|\/)admin(\/|_)/.test(path) && !/requireUser\s*\(\s*["']admin["']|role\s*[!=]==?\s*["']admin["']/.test(text))
        add(
          {
            rule: "admin-without-role",
            severity: "high",
            title: "Un endpoint de administración no comprueba el rol",
            detail: "Esconder el botón no basta: cualquiera que conozca la ruta puede llamarlo.",
            fix: 'Usa ctx.requireUser("admin") al principio del endpoint.',
            file: path,
          },
          "admin",
        );
      if (/_POST\.tsx?$/.test(path) && /ctx\.body/.test(text) && !/\.(safeParse|parse)\s*\(/.test(text))
        add(
          {
            rule: "no-validation",
            severity: "medium",
            title: "Un endpoint usa datos del navegador sin validarlos",
            detail: "Valores inesperados (textos enormes, tipos cambiados, números negativos) llegan tal cual a la base de datos.",
            fix: "Define un esquema zod para el cuerpo y usa Input.parse(ctx.body).",
            file: path,
          },
          "validation",
        );
    }

    if (client && /dangerouslySetInnerHTML/.test(text)) {
      const i = text.indexOf("dangerouslySetInnerHTML");
      add(
        {
          rule: "dangerous-html",
          severity: "medium",
          title: "Se inserta HTML sin escapar",
          detail: "Si ese HTML contiene texto de usuarios, de la IA o de correos, puede ejecutar scripts en la app (XSS).",
          fix: "Muestra el texto como texto normal, o renderiza markdown con una librería que lo sanee.",
          file: path,
          line: lineOf(text, i),
        },
        text.slice(i, i + 80),
      );
    }
  }

  const rank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity] || (a.file ?? "").localeCompare(b.file ?? ""));
}

const SEVERITY_LABEL: Record<Severity, string> = { critical: "CRÍTICO", high: "ALTO", medium: "MEDIO", low: "BAJO" };

/** One line per finding, for tools and error messages. */
export const formatFinding = (f: Finding) =>
  `[${SEVERITY_LABEL[f.severity]}] ${f.title}${f.file ? ` (${f.file}${f.line ? `:${f.line}` : ""})` : ""} — ${f.detail} Arreglo: ${f.fix} [id ${f.id}]`;
