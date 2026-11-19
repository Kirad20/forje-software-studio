import { COMPONENTS_MANIFEST, GithubError, type GithubGateway, type GithubProjectPorts, type SyncResult, type Link } from "./github.js";
import type { RepoSelection } from "./apps.js";

/** Real secret files: never imported, and their presence stops the import so the owner removes them. */
const SECRET_FILE = /(^|\/)(\.env(?:\.[^/]*)?|id_rsa|id_ed25519|credentials(?:\.json)?|secrets?(?:\.json)?)(\/|$)|\.(pem|p12|pfx|key)$/i;
/** Templates that document which variables exist (.env.example, .env.sample, example.env…): they hold placeholders, not secrets. */
const ENV_TEMPLATE = /(^|\/)(?:\.env\.(?:example|sample|template|dist|defaults|tpl|schema)|(?:example|sample|template)\.env|env\.(?:example|sample|template))$/i;
const CREDENTIAL = /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----(?<pem>[\s\S]{0,4000}?)(?:-----END|$)|(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}|(?:AKIA|ASIA)[A-Z0-9]{16}|sk-(?:ant-|proj-|live_|test_)?[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}/g;

/**
 * Whether a token that has the shape of a credential is only an example: "sk-your-key-here",
 * "ghp_xxxxxxxxxxxxxxxxxxxx", "AKIAEXAMPLE…", a private key block with "..." inside. Docs and
 * templates are full of these; only something that could be a working key stops an import.
 */
export function isPlaceholderCredential(token: string, pemBody?: string): boolean {
  if (pemBody !== undefined) return pemBody.replace(/[^A-Za-z0-9+/=]/g, "").length < 64;
  const body = token.replace(/^(?:gh[pousr]_|github_pat_|AKIA|ASIA|sk-(?:ant-|proj-|live_|test_)?|xox[baprs]-)/, "");
  if (/your|example|placeholder|change[-_]?me|replace|dummy|fake|sample|redacted|insert|here|todo|secret[-_]?key|api[-_]?key|token/i.test(body)) return true;
  if (/x{4,}|\*{3,}|\.{3}|_{4,}|-{4,}|(.)\1{5,}/i.test(body)) return true;
  if (/0123456789|1234567890|abcdefghij|ABCDEFGHIJ/.test(body)) return true;
  // Real keys mix letters and digits; an all-letter or all-digit tail is a made-up example.
  return !/[0-9]/.test(body) || !/[A-Za-z]/.test(body);
}

/** The first thing in the text that looks like a working credential, if any. */
export function findCredential(content: string): string | null {
  for (const m of content.matchAll(CREDENTIAL)) {
    if (!isPlaceholderCredential(m[0], m.groups?.pem)) return m[0].slice(0, 12);
  }
  return null;
}

export interface PreparedImport {
  owner: string; repo: string; branch: string; installationId: number | null;
  files: Record<string, string>; synced: Record<string, string>; sha: string; tree: string; warnings: string[];
}
export function createGithubImportService(
  gateway: GithubGateway,
  project: Pick<GithubProjectPorts, "assertValidPath">,
  select: (a: string, input: RepoSelection) => Promise<{ token: string; owner: string; repo: string; branch: string; installationId: number | null }>,
  saveLink: (p: string, a: string, owner: string, repo: string, branch: string, id?: number | null, baseline?: Pick<Link, "last_sha" | "last_tree" | "synced">) => Promise<void>,
) {
  return {
    async prepare(a: string, input: RepoSelection): Promise<PreparedImport> {
      const selected = await select(a, input), base = `/repos/${selected.owner}/${selected.repo}`;
      const ref = await gateway.request<{ object: { sha: string } }>(selected.token, "GET", `${base}/git/ref/heads/${encodeURIComponent(selected.branch)}`);
      const commit = await gateway.request<{ tree: { sha: string } }>(selected.token, "GET", `${base}/git/commits/${ref.object.sha}`);
      const tree = await gateway.request<{ truncated?: boolean; tree: { path: string; type: string; mode?: string; sha: string; size?: number }[] }>(selected.token, "GET", `${base}/git/trees/${commit.tree.sha}?recursive=1`);
      if (tree.truncated || tree.tree.length > 10000) throw new GithubError("El árbol del repositorio es demasiado grande o GitHub lo truncó. Importa un repositorio nativo más pequeño.", 422);
      // A forja.json in the repository maps its structure: other frameworks' files are then just not imported.
      const mapped = tree.tree.some((e) => e.path === COMPONENTS_MANIFEST && e.type === "blob");
      const frameworkConfig = tree.tree.some((e) => /^(?:next|vite|nuxt|svelte)\.config\.[^/]+$|^angular\.json$/.test(e.path));
      if (frameworkConfig && !mapped) throw new GithubError("Este repositorio contiene configuración de un framework no compatible. Convierte primero sus rutas al formato nativo de Forja, o añade un forja.json que mapee sus carpetas (paths y conventions de cada componente).", 422);
      const files: Record<string, string> = {}, synced: Record<string, string> = {}, warnings: string[] = [];
      let total = 0, skipped = 0, templates = 0;
      // A repository exported from a project with components brings forja.json: its folders are importable.
      let manifest: string | undefined;
      const manifestEntry = tree.tree.find((e) => e.path === COMPONENTS_MANIFEST && e.type === "blob");
      if (manifestEntry) {
        const blob = await gateway.request<{ content: string; encoding: string }>(selected.token, "GET", `${base}/git/blobs/${manifestEntry.sha}`);
        manifest = gateway.decodeBlob(COMPONENTS_MANIFEST, blob.content, blob.encoding);
        try { project.assertValidPath(COMPONENTS_MANIFEST, manifest); }
        catch (e) { throw new GithubError(`${(e as Error).message}. Corrige forja.json en el repositorio antes de importarlo.`, 422); }
      }
      for (const entry of [...tree.tree].sort((a, b) => Number(b.path === COMPONENTS_MANIFEST) - Number(a.path === COMPONENTS_MANIFEST))) {
        if (ENV_TEMPLATE.test(entry.path) && entry.type === "blob") {
          // A template is not imported, but a working key written in it is still exposed on GitHub.
          if ((entry.size ?? 0) <= 256 * 1024) {
            const blob = await gateway.request<{ content: string; encoding: string }>(selected.token, "GET", `${base}/git/blobs/${entry.sha}`);
            if (findCredential(gateway.decodeBlob(entry.path, blob.content, blob.encoding))) throw new GithubError(`Posible credencial real en ${entry.path} (las plantillas deben llevar valores de ejemplo); retírala antes de importar.`, 422);
          }
          templates++;
          continue;
        }
        if (SECRET_FILE.test(entry.path)) throw new GithubError(`El repositorio contiene un posible secreto (${entry.path}). Retíralo antes de importar.`, 422);
        try { project.assertValidPath(entry.path, manifest); } catch { if (entry.type !== "tree") skipped++; continue; }
        if (entry.type !== "blob" || (entry.mode && !["100644", "100755"].includes(entry.mode))) throw new GithubError(`No se admiten enlaces ni submódulos en ${entry.path}.`, 422);
        if ((entry.size ?? 0) > 1024 * 1024 || Object.keys(files).length >= 2000) throw new GithubError(`Archivo demasiado grande o demasiados archivos (${entry.path}). El límite es 1 MB por archivo y 2000 archivos nativos.`, 422);
        const blob = await gateway.request<{ content: string; encoding: string; size?: number }>(selected.token, "GET", `${base}/git/blobs/${entry.sha}`);
        if (!["base64", "utf-8", "utf8"].includes(blob.encoding)) throw new GithubError(`Codificación no compatible en ${entry.path}.`, 422);
        const content = gateway.decodeBlob(entry.path, blob.content, blob.encoding);
        const size = content.startsWith("base64:") ? Math.ceil((content.length - 7) * 0.75) : new TextEncoder().encode(content).length;
        total += size;
        if (size > 1024 * 1024 || total > 16 * 1024 * 1024) throw new GithubError("El contenido supera el límite de importación (1 MB por archivo, 16 MB total).", 422);
        if (gateway.blobSha(content) !== entry.sha) throw new GithubError(`GitHub devolvió contenido incompleto para ${entry.path}. Vuelve a intentarlo.`, 422);
        if (!content.startsWith("base64:") && findCredential(content)) throw new GithubError(`Posible credencial en ${entry.path}; retírala antes de importar.`, 422);
        if (!entry.path.startsWith("static/") && !(manifest !== undefined && /^[^/].*\/static\//.test(entry.path)) && content.startsWith("base64:")) throw new GithubError(`Se esperaba texto UTF-8 en ${entry.path}.`, 422);
        files[entry.path] = content; synced[entry.path] = entry.sha;
      }
      if (!Object.keys(files).some((p) => /^pages\/.+\.(tsx|jsx)$/.test(p)) && !(manifest !== undefined && Object.keys(files).some((p) => /^.+\/pages\/[^/]+\.(tsx|jsx)$/.test(p)))) throw new GithubError("No hay páginas nativas en pages/*.tsx o pages/*.jsx. Forja no importa proyectos Vite/Next/Node arbitrarios; convierte primero las rutas al formato nativo.", 422);
      if (files["package.json"]) {
        let pkg: { dependencies?: Record<string, unknown>; devDependencies?: Record<string, unknown>; scripts?: Record<string, unknown> };
        try { pkg = JSON.parse(files["package.json"]); if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) throw Error(); }
        catch { throw new GithubError("package.json no es JSON válido.", 422); }
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        const framework = ["next", "vite", "nuxt", "@sveltejs/kit", "express", "@angular/core", "gatsby"].some((name) => name in deps)
          || Object.values(pkg.scripts ?? {}).some((command) => typeof command === "string" && /(?:^|\s)(?:next|vite|nuxt|ng|svelte-kit)(?:\s|$)/.test(command));
        if (framework && !mapped) throw new GithubError("El repositorio usa un framework/servidor no compatible. Convierte el proyecto a páginas, endpoints y helpers nativos de Forja, o añade un forja.json que mapee sus carpetas.", 422);
        if (pkg.scripts && Object.keys(pkg.scripts).length) warnings.push("Los scripts de package.json no se ejecutan; Forja usa su propio compilador y rutas nativas.");
      }
      if (Object.keys(files).some((p) => p.startsWith("migrations/"))) warnings.push("Las migraciones SQL se importaron como archivos nativos; no se han aplicado a la base de datos ni a producción. Revísalas y aplícalas con las herramientas de migración de Forja.");
      if (mapped && frameworkConfig) warnings.push("La configuración del otro framework (vite/next/…) no se importó: Forja compila y sirve el código según forja.json.");
      if (templates) warnings.push(`${templates === 1 ? "La plantilla de variables (.env.example o similar) no se importó" : `${templates} plantillas de variables (.env.example o similares) no se importaron`}: crea los valores reales en la pestaña Secretos.`);
      if (skipped) warnings.push(`${skipped} rutas ajenas al formato nativo (como README y .github) se conservaron solo en GitHub y no se importaron.`);
      return { owner: selected.owner, repo: selected.repo, branch: selected.branch, installationId: selected.installationId, files, synced, sha: ref.object.sha, tree: commit.tree.sha, warnings };
    },
    async attach(p: string, a: string, prepared: PreparedImport): Promise<SyncResult> {
      await saveLink(p, a, prepared.owner, prepared.repo, prepared.branch, prepared.installationId, { last_sha: prepared.sha, last_tree: prepared.tree, synced: prepared.synced });
      return { pulled: [{ sha: prepared.sha, message: "Contenido inicial del repositorio (sin cambios remotos)", files: Object.keys(prepared.files) }], pushed: null };
    },
  };
}
