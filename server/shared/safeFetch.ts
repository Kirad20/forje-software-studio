import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Fetches a public HTTPS page for the builder. Refuses anything that resolves to a
 * private, loopback or link-local address, so the tool cannot be used to reach the
 * platform itself or the local network (SSRF). Redirects are followed manually so each
 * hop is checked too.
 */
const MAX_BYTES = 2_000_000;

function isPrivate(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v === "::1" || v === "::" || v.startsWith("fe80") || v.startsWith("fc") || v.startsWith("fd")) return true;
    const mapped = /::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(v);
    return mapped ? isPrivate(mapped[1]!) : false;
  }
  const [a, b] = ip.split(".").map(Number) as [number, number];
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

async function assertPublic(url: URL) {
  if (url.protocol !== "https:") throw new Error("Solo se permiten URLs https://");
  if (url.username || url.password) throw new Error("La URL no puede llevar credenciales");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) throw new Error("Dirección no permitida");
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivate(a.address))) throw new Error("La URL apunta a una red privada");
}

export async function fetchPublicText(raw: string): Promise<string> {
  let url = new URL(raw);
  for (let hop = 0; hop < 5; hop++) {
    await assertPublic(url);
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15_000), headers: { "user-agent": "ForjaBuilder/1.0" } });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = new URL(res.headers.get("location")!, url);
      continue;
    }
    const type = res.headers.get("content-type") ?? "";
    if (!/text|json|xml|javascript/.test(type)) return `${res.status} — contenido ${type || "desconocido"} no legible como texto.`;
    const buf = await res.arrayBuffer();
    let text = new TextDecoder().decode(buf.slice(0, MAX_BYTES));
    if (type.includes("html")) {
      // Keep the readable text; scripts and styles are noise for the model.
      text = text
        .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s*\n+/g, "\n");
    }
    return `${res.status} ${url.href}\n${text.trim()}`;
  }
  throw new Error("Demasiadas redirecciones");
}
