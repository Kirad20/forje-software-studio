import type { Browser, BrowserContext, Page } from "playwright-core";
import { config } from "../config.js";
import { previewOrigin, SHARE_COOKIE, shareToken, type ShareScope } from "./urls.js";

/**
 * A headless Chromium the builder drives against an app's preview: it opens pages,
 * clicks and types like a visitor, and reports what it saw (text, screenshots,
 * console errors, failed requests). One browser is shared and closes when idle;
 * every test gets its own context, so cookies never leak between runs.
 */

export type BrowserStep =
  | { action: "goto"; path: string }
  | { action: "click"; selector: string }
  | { action: "fill"; selector: string; text: string }
  | { action: "press"; key: string; selector?: string }
  | { action: "select"; selector: string; value: string }
  | { action: "wait_for"; selector?: string; text?: string }
  | { action: "expect_text"; text: string }
  | { action: "screenshot"; full_page?: boolean };

export interface BrowserTestInput {
  steps: BrowserStep[];
  viewport?: "mobile" | "tablet" | "desktop";
  /** Session cookie of an app user, so the pages see them signed in. */
  session?: { name: string; token: string };
}

export interface BrowserTestResult {
  text: string;
  images: { media_type: string; data: string }[];
}

const VIEWPORTS = { mobile: { width: 390, height: 844 }, tablet: { width: 820, height: 1180 }, desktop: { width: 1280, height: 800 } };
const STEP_TIMEOUT = 8_000;
const MAX_STEPS = 25;
const MAX_SHOTS = 3;
const IDLE_MS = 60_000;

let browser: Promise<Browser> | null = null;
let idle: NodeJS.Timeout | undefined;
let running = 0;

async function launch(): Promise<Browser> {
  let pw: typeof import("playwright-core");
  try {
    pw = await import("playwright-core");
  } catch {
    throw new Error("El navegador de pruebas no está instalado en este servidor (falta playwright-core).");
  }
  try {
    return await pw.chromium.launch({ executablePath: config.browser.executablePath || undefined });
  } catch (e) {
    throw new Error(
      `No se pudo abrir Chromium: ${(e as Error).message.split("\n")[0]}. Instálalo con «npx playwright-core install chromium-headless-shell» o define FORJA_CHROMIUM.`,
    );
  }
}

async function getBrowser() {
  clearTimeout(idle);
  browser ??= launch().catch((e) => {
    browser = null;
    throw e;
  });
  return browser;
}

function release() {
  if (--running > 0) return;
  idle = setTimeout(() => {
    const b = browser;
    browser = null;
    void b?.then((x) => x.close()).catch(() => {});
  }, IDLE_MS);
  idle.unref?.();
}

/** Only the preview's own origin and public https resources (fonts, CDNs); never other local services. */
export function allowedRequest(url: string, origin: string) {
  if (url.startsWith(origin + "/") || url === origin) return true;
  if (url.startsWith("data:") || url.startsWith("blob:")) return true;
  if (!url.startsWith("https://")) return false;
  const host = new URL(url).hostname;
  return !(host === "localhost" || host.endsWith(".localhost") || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) || host.startsWith("["));
}

async function runStep(page: Page, s: BrowserStep, origin: string, shots: BrowserTestResult["images"]): Promise<string> {
  switch (s.action) {
    case "goto": {
      if (!s.path?.startsWith("/")) throw new Error("path debe empezar por /, p. ej. /notes");
      const res = await page.goto(origin + s.path, { waitUntil: "load", timeout: STEP_TIMEOUT });
      await page.waitForLoadState("networkidle", { timeout: 3_000 }).catch(() => {});
      return `→ ${res?.status() ?? "?"}`;
    }
    case "click":
      await page.locator(s.selector).first().click({ timeout: STEP_TIMEOUT });
      await page.waitForLoadState("networkidle", { timeout: 2_000 }).catch(() => {});
      return "";
    case "fill":
      await page.locator(s.selector).first().fill(s.text, { timeout: STEP_TIMEOUT });
      return "";
    case "press":
      if (s.selector) await page.locator(s.selector).first().press(s.key, { timeout: STEP_TIMEOUT });
      else await page.keyboard.press(s.key);
      await page.waitForLoadState("networkidle", { timeout: 2_000 }).catch(() => {});
      return "";
    case "select":
      await page.locator(s.selector).first().selectOption(s.value, { timeout: STEP_TIMEOUT });
      return "";
    case "wait_for":
      if (s.selector) await page.locator(s.selector).first().waitFor({ timeout: STEP_TIMEOUT });
      else if (s.text) await page.getByText(s.text).first().waitFor({ timeout: STEP_TIMEOUT });
      else throw new Error("wait_for necesita selector o text");
      return "";
    case "expect_text": {
      const found = await page
        .getByText(s.text)
        .first()
        .waitFor({ timeout: STEP_TIMEOUT })
        .then(() => true)
        .catch(() => false);
      if (!found) throw new Error(`No aparece el texto «${s.text}»`);
      return "";
    }
    case "screenshot": {
      if (shots.length >= MAX_SHOTS) return `(máximo ${MAX_SHOTS} capturas por prueba; omitida)`;
      const buf = await page.screenshot({ type: "jpeg", quality: 70, fullPage: !!s.full_page });
      shots.push({ media_type: "image/jpeg", data: buf.toString("base64") });
      return `captura ${shots.length}`;
    }
    default:
      throw new Error(`Acción desconocida: ${(s as { action: string }).action}`);
  }
}

const describe = (s: BrowserStep) =>
  s.action === "goto" ? `goto ${s.path}` : s.action === "fill" ? `fill ${s.selector} = ${JSON.stringify(s.text)}` : `${s.action} ${"selector" in s && s.selector ? s.selector : "text" in s && s.text ? JSON.stringify(s.text) : "key" in s ? s.key : ""}`.trim();

/** Runs the steps against the project's preview and reports what happened. Stops at the first failing step. */
export async function runBrowserTest(project: ShareScope, input: BrowserTestInput): Promise<BrowserTestResult> {
  if (!config.browser.enabled) throw new Error("Las pruebas en navegador están desactivadas en este servidor (FORJA_BROWSER=0).");
  const steps = (input.steps ?? []).slice(0, MAX_STEPS);
  if (!steps.length) throw new Error("Pasa al menos un paso, p. ej. [{action:'goto', path:'/'}, {action:'screenshot'}]");
  if (steps[0]!.action !== "goto") steps.unshift({ action: "goto", path: "/" });

  running++;
  let context: BrowserContext | undefined;
  try {
    const b = await getBrowser();
    const origin = previewOrigin(project.id);
    const { hostname } = new URL(origin);
    const vp = VIEWPORTS[input.viewport ?? "desktop"] ?? VIEWPORTS.desktop;
    context = await b.newContext({ viewport: vp, isMobile: input.viewport === "mobile", hasTouch: input.viewport === "mobile", locale: "es-ES" });
    const cookies = [{ name: SHARE_COOKIE, value: shareToken(project, 1), domain: hostname, path: "/", httpOnly: true, sameSite: "Lax" as const }];
    if (input.session) cookies.push({ name: input.session.name, value: input.session.token, domain: hostname, path: "/", httpOnly: true, sameSite: "Lax" });
    await context.addCookies(cookies);

    const consoleLines: string[] = [];
    const failed: string[] = [];
    const blocked = new Set<string>();
    await context.route("**/*", (route) => {
      const url = route.request().url();
      if (allowedRequest(url, origin)) return route.continue();
      blocked.add(new URL(url).origin);
      return route.abort("blockedbyclient");
    });
    const page = await context.newPage();
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") consoleLines.push(`[${m.type()}] ${m.text().slice(0, 300)}`);
    });
    page.on("pageerror", (e) => consoleLines.push(`[excepción] ${e.message.slice(0, 300)}`));
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push(`${r.request().method()} ${r.url().replace(origin, "")} → ${r.status()}`);
    });
    page.on("requestfailed", (r) => {
      if (r.failure()?.errorText !== "net::ERR_BLOCKED_BY_CLIENT") failed.push(`${r.method()} ${r.url().replace(origin, "")} → ${r.failure()?.errorText}`);
    });

    const images: BrowserTestResult["images"] = [];
    const log: string[] = [];
    let failedAt = -1;
    for (const [i, s] of steps.entries()) {
      try {
        const note = await runStep(page, s, origin, images);
        log.push(`${i + 1}. ✓ ${describe(s)}${note ? ` ${note}` : ""}`);
      } catch (e) {
        log.push(`${i + 1}. ✗ ${describe(s)}: ${(e as Error).message.split("\n")[0]}`);
        failedAt = i;
        break;
      }
    }
    // A failure without a picture is hard to diagnose: capture the state it stopped in.
    if (failedAt >= 0 && images.length < MAX_SHOTS) {
      const buf = await page.screenshot({ type: "jpeg", quality: 70 }).catch(() => null);
      if (buf) images.push({ media_type: "image/jpeg", data: buf.toString("base64") });
    }

    const url = page.url().replace(origin, "") || "/";
    const title = await page.title().catch(() => "");
    const bodyText = ((await page.locator("body").innerText({ timeout: 2_000 }).catch(() => "")) ?? "").replace(/\n{3,}/g, "\n\n").trim();
    const out = [
      failedAt >= 0 ? `Falló en el paso ${failedAt + 1} de ${steps.length}.` : `Los ${steps.length} pasos pasaron.`,
      `Pantalla: ${input.viewport ?? "desktop"} (${vp.width}×${vp.height})${input.session ? ", con sesión de usuario" : ", anónimo"}`,
      "",
      ...log,
      "",
      `URL final: ${url}${title ? ` — título «${title}»` : ""}`,
      `Consola: ${consoleLines.length ? `\n${[...new Set(consoleLines)].slice(0, 20).join("\n")}` : "sin errores ni avisos"}`,
      `Peticiones fallidas: ${failed.length ? `\n${[...new Set(failed)].slice(0, 20).join("\n")}` : "ninguna"}`,
      ...(blocked.size ? [`Bloqueadas (fuera de la vista previa): ${[...blocked].join(", ")}`] : []),
      `Capturas adjuntas: ${images.length}`,
      "",
      "Texto visible:",
      bodyText.length > 3000 ? `${bodyText.slice(0, 3000)}\n… (recortado)` : bodyText || "(vacío)",
    ];
    return { text: out.join("\n"), images };
  } finally {
    await context?.close().catch(() => {});
    release();
  }
}

/** Closes the shared browser (on shutdown and in tests). */
export async function closeBrowser() {
  clearTimeout(idle);
  const b = browser;
  browser = null;
  await b?.then((x) => x.close()).catch(() => {});
}
