import { createGithubSyncService, GithubError, type GithubProjectPorts } from "./application/github.js";
import { createGithubAccountService } from "./application/accounts.js";
import { githubRepository, githubGateway, githubAccountRepository, githubAuthorization } from "./infrastructure/github.js";
import { createGithubAppService, type RepoSelection } from "./application/apps.js";
import { createGithubImportService } from "./application/imports.js";
import { githubAppStore } from "./infrastructure/apps.js";
import { config } from "../../shared/config.js";
export { GithubError, type SyncResult, type GithubProjectPorts } from "./application/github.js";
export { blobSha } from "./infrastructure/github.js";
export { createGithubImportService } from "./application/imports.js";
export type { PreparedImport } from "./application/imports.js";
let bound: GithubProjectPorts | undefined;
let binding: symbol | undefined;
export function bindGithubProjectPorts(ports: GithubProjectPorts): () => Promise<void> {
  const token = Symbol();
  bound = ports;
  binding = token;
  let cleanup: Promise<void> | undefined;
  return () => {
    if (binding !== token) return Promise.resolve();
    if (cleanup) return cleanup;
    cleanup = stopGithubSync().then(() => {
      if (binding !== token) return;
      bound = undefined;
      binding = undefined;
    });
    return cleanup;
  };
}
function ports(): GithubProjectPorts { if (!bound) throw new Error("GitHub project ports not bound"); return bound; }
const sync = createGithubSyncService(githubRepository, githubGateway, {
  readAllFiles: (p) => ports().readAllFiles(p),
  writeFile: (p, path, content, actor, author) => ports().writeFile(p, path, content, actor, author),
  deleteFile: (p, path, actor) => ports().deleteFile(p, path, actor),
  assertValidPath: (path) => ports().assertValidPath(path),
  assertValidPathForProject: async (p, path) => {
    const bound = ports();
    return bound.assertValidPathForProject ? bound.assertValidPathForProject(p, path) : bound.assertValidPath(path);
  },
  projectRuntime: async (p) => ports().projectRuntime?.(p) ?? "native",
  recheckBuild: (p) => ports().recheckBuild(p),
  emitProject: (p, event) => ports().emitProject(p, event),
  subscribe: (p, listener) => ports().subscribe(p, listener),
});
export const { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll } = sync;
const legacy = createGithubAccountService(githubAccountRepository, githubGateway, githubAuthorization, syncProject);
export const { connectAccount, oauthStart, oauthFinish, getLink, unlink } = legacy;
export const disconnectAccount = (a: string) => githubAppStore.disconnect(a);
const apps = createGithubAppService(githubAppStore, githubGateway, githubAccountRepository.token, () => config.publicUrl);
export const { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches } = apps;
export async function accountStatus(a: string) {
  const old = await legacy.accountStatus(a), current = await apps.status(a);
  return { ...old, ...current, connected: old.connected || current.installations.length > 0, login: current.installations[0]?.login ?? old.login, canCreateRepo: old.connected && !current.app };
}
export async function createRepo(p: string, a: string, input: Parameters<typeof legacy.createRepo>[2]) {
  if (await githubAppStore.app(a)) throw new GithubError("Una GitHub App no puede crear repositorios. Crea el repositorio en GitHub y selecciónalo en la instalación.", 409);
  return legacy.createRepo(p, a, input);
}
export async function linkRepo(p: string, a: string, input: RepoSelection) {
  // Keep URL entry working for legacy callers; the new picker sends owner/name.
  const repo = input.repo.trim().replace(/^https?:\/\/[^/]+\//, "").replace(/\.git\/?$/, "").replace(/\/$/, "");
  const selected = await apps.selectRepository(a, { ...input, repo }, true);
  await githubAccountRepository.saveLink(p, a, selected.owner, selected.repo, selected.branch, selected.installationId);
  return syncProject(p, { message: "Conectar con Forja" });
}
const imports = createGithubImportService(githubGateway, { assertValidPath: (p) => ports().assertValidPath(p) }, apps.selectRepository, githubAccountRepository.saveLink);
export const { prepare: prepareImport, attach: attachImport } = imports;
export async function handleWebhook(raw: string, signature?: string) {
  if (Buffer.byteLength(raw) > 2 * 1024 * 1024) throw new GithubError("Webhook demasiado grande.", 413);
  const account = await apps.handleAppWebhook(raw, signature);
  if (!account) return legacy.handleWebhook(raw, signature);
  const body = JSON.parse(raw) as { ref?: string; installation?: { id?: number }; repository?: { name?: string; owner?: { login?: string } } };
  if (!body.ref || !body.repository) return 0;
  if (!(await githubAppStore.installations(account)).some((i) => i.id === body.installation?.id)) return 0;
  const projects = await githubAccountRepository.webhookLinks(body.repository.owner?.login ?? "", body.repository.name ?? "", body.ref.replace(/^refs\/heads\//, ""));
  let count = 0;
  for (const p of projects) {
    const link = await githubRepository.link(p);
    if (link?.account_id !== account || link.installation_id == null || Number(link.installation_id) !== body.installation?.id) continue;
    count++; void syncProject(p).catch(() => {});
  }
  return count;
}
