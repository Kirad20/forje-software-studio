import { GithubError, type GithubGateway, type GithubProjectPorts, type SyncResult, type Link } from "./github.js";
import type { RepoSelection } from "./apps.js";

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
      if (tree.tree.some((e) => /^(?:next|vite|nuxt|svelte)\.config\.[^/]+$|^angular\.json$/.test(e.path))) throw new GithubError("Este repositorio contiene configuración de un framework no compatible. Convierte primero sus rutas al formato nativo de Forja.", 422);
      const files: Record<string, string> = {}, synced: Record<string, string> = {}, warnings: string[] = [];
      let total = 0, skipped = 0;
      for (const entry of tree.tree) {
        if (/(^|\/)(\.env(?:\..*)?|id_rsa|id_ed25519|credentials(?:\.json)?|secrets?(?:\.json)?)(\/|$)|\.(pem|p12|pfx|key)$/i.test(entry.path)) throw new GithubError(`El repositorio contiene un posible secreto (${entry.path}). Retíralo antes de importar.`, 422);
        try { project.assertValidPath(entry.path); } catch { if (entry.type !== "tree") skipped++; continue; }
        if (entry.type !== "blob" || (entry.mode && !["100644", "100755"].includes(entry.mode))) throw new GithubError(`No se admiten enlaces ni submódulos en ${entry.path}.`, 422);
        if ((entry.size ?? 0) > 1024 * 1024 || Object.keys(files).length >= 2000) throw new GithubError(`Archivo demasiado grande o demasiados archivos (${entry.path}). El límite es 1 MB por archivo y 2000 archivos nativos.`, 422);
        const blob = await gateway.request<{ content: string; encoding: string; size?: number }>(selected.token, "GET", `${base}/git/blobs/${entry.sha}`);
        if (!["base64", "utf-8", "utf8"].includes(blob.encoding)) throw new GithubError(`Codificación no compatible en ${entry.path}.`, 422);
        const content = gateway.decodeBlob(entry.path, blob.content, blob.encoding);
        const size = content.startsWith("base64:") ? Math.ceil((content.length - 7) * 0.75) : new TextEncoder().encode(content).length;
        total += size;
        if (size > 1024 * 1024 || total > 16 * 1024 * 1024) throw new GithubError("El contenido supera el límite de importación (1 MB por archivo, 16 MB total).", 422);
        if (gateway.blobSha(content) !== entry.sha) throw new GithubError(`GitHub devolvió contenido incompleto para ${entry.path}. Vuelve a intentarlo.`, 422);
        if (/-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----|(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}|(?:AKIA|ASIA)[A-Z0-9]{16}|sk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}/.test(content)) throw new GithubError(`Posible credencial en ${entry.path}; retírala antes de importar.`, 422);
        if (!entry.path.startsWith("static/") && content.startsWith("base64:")) throw new GithubError(`Se esperaba texto UTF-8 en ${entry.path}.`, 422);
        files[entry.path] = content; synced[entry.path] = entry.sha;
      }
      if (!Object.keys(files).some((p) => /^pages\/.+\.(tsx|jsx)$/.test(p))) throw new GithubError("No hay páginas nativas en pages/*.tsx o pages/*.jsx. Forja no importa proyectos Vite/Next/Node arbitrarios; convierte primero las rutas al formato nativo.", 422);
      if (files["package.json"]) {
        let pkg: { dependencies?: Record<string, unknown>; devDependencies?: Record<string, unknown>; scripts?: Record<string, unknown> };
        try { pkg = JSON.parse(files["package.json"]); if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) throw Error(); }
        catch { throw new GithubError("package.json no es JSON válido.", 422); }
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (["next", "vite", "nuxt", "@sveltejs/kit", "express", "@angular/core", "gatsby"].some((name) => name in deps)) throw new GithubError("El repositorio usa un framework/servidor no compatible. Convierte el proyecto a páginas, endpoints y helpers nativos de Forja antes de importarlo.", 422);
        if (Object.values(pkg.scripts ?? {}).some((command) => typeof command === "string" && /(?:^|\s)(?:next|vite|nuxt|ng|svelte-kit)(?:\s|$)/.test(command))) throw new GithubError("Los scripts del repositorio requieren un framework no compatible. Convierte primero el proyecto al formato nativo de Forja.", 422);
        if (pkg.scripts && Object.keys(pkg.scripts).length) warnings.push("Los scripts de package.json no se ejecutan; Forja usa su propio compilador y rutas nativas.");
      }
      if (Object.keys(files).some((p) => p.startsWith("migrations/"))) warnings.push("Las migraciones SQL se importaron como archivos nativos; no se han aplicado a la base de datos ni a producción. Revísalas y aplícalas con las herramientas de migración de Forja.");
      if (skipped) warnings.push(`${skipped} rutas ajenas al formato nativo (como README y .github) se conservaron solo en GitHub y no se importaron.`);
      return { owner: selected.owner, repo: selected.repo, branch: selected.branch, installationId: selected.installationId, files, synced, sha: ref.object.sha, tree: commit.tree.sha, warnings };
    },
    async attach(p: string, a: string, prepared: PreparedImport): Promise<SyncResult> {
      await saveLink(p, a, prepared.owner, prepared.repo, prepared.branch, prepared.installationId, { last_sha: prepared.sha, last_tree: prepared.tree, synced: prepared.synced });
      return { pulled: [{ sha: prepared.sha, message: "Contenido inicial del repositorio (sin cambios remotos)", files: Object.keys(prepared.files) }], pushed: null };
    },
  };
}
