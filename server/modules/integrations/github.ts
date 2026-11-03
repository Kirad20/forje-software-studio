import { createGithubSyncService, type GithubProjectPorts } from "./application/github.js";
import { createGithubAccountService } from "./application/accounts.js";
import { githubRepository, githubGateway, githubAccountRepository, githubAuthorization } from "./infrastructure/github.js";
export { GithubError, type SyncResult, type GithubProjectPorts } from "./application/github.js";
export { blobSha } from "./infrastructure/github.js";
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
  recheckBuild: (p) => ports().recheckBuild(p),
  emitProject: (p, event) => ports().emitProject(p, event),
  subscribe: (p, listener) => ports().subscribe(p, listener),
});
export const { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll } = sync;
export const { connectAccount, disconnectAccount, accountStatus, oauthStart, oauthFinish, getLink, createRepo, linkRepo, unlink, handleWebhook } =
  createGithubAccountService(githubAccountRepository, githubGateway, githubAuthorization, syncProject);
