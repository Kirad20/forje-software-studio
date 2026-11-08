import { scheduleProject } from "../app-services/jobs.js";
import { applyProjectMigrations } from "../app-services/projectDb.js";
import { getProject, isSlugTaken, readAllFiles, recordPublish, unpublish, configureRuntimeProjects as configureProjects } from "./infrastructure/projects.js";
import { createPublication } from "./application/publication.js";
import * as bundler from "./infrastructure/bundler.js";
import * as browser from "./infrastructure/browser.js";
import * as deps from "./infrastructure/deps.js";
import * as catalog from "./domain/catalog.js";
import * as urls from "./infrastructure/urls.js";
import * as sandbox from "./infrastructure/sandbox.js";
import * as server from "./infrastructure/appServer.js";
export { callRuntimeEndpoint, type RuntimeEndpointCall } from "./infrastructure/runtimeClient.js";
export { readProjectServices, resolveServiceExecution, SERVICES_MANIFEST } from "./domain/services.js";
export type { ServiceExecution, ProjectService, ProjectServices } from "./domain/services.js";
export { createServiceControl } from "./application/serviceControl.js";
export { readServiceRuntime, restartServiceRuntime } from "./infrastructure/serviceControlRuntime.js";
export type { ServiceControlSnapshot, ServiceRuntimeSnapshot, ServiceQueueEntry } from "./domain/serviceControl.js";
export type { ServiceControlPorts } from "./ports/serviceControl.js";
import * as types from "./infrastructure/typecheck.js";
import { removeProjectData as removeData } from "./infrastructure/projectData.js";
import { bindRuntimeObservation as bindObservation, scan } from "./infrastructure/observation.js";
import { suggestSlug as slugSuggestion } from "./domain/publication.js";
import * as security from "./infrastructure/securityScan.js";
import type { RuntimeObservationPorts, RuntimeProjectsPort } from "./application/ports.js";
import type { RepositoryRuntime } from "../repository-runtime/index.js";
import { RepositoryRuntimeError, repositoryShareToken, checkRepositoryShareToken } from "../repository-runtime/index.js";

let repositoryRuntime: RepositoryRuntime | undefined;
export function configureRepositoryRuntime(runtime: RepositoryRuntime) {
  repositoryRuntime = runtime;
  return () => { if (repositoryRuntime === runtime) repositoryRuntime = undefined; };
}
function repositories() {
  if (!repositoryRuntime) throw new RepositoryRuntimeError("Repository runtime is not configured", 503);
  return repositoryRuntime;
}

const publication = createPublication({
  async getProject(id) {
    const project = await getProject(id);
    if (!project) throw new Error("Proyecto no encontrado");
    return project;
  },
  isSlugTaken, readAllFiles, recordPublish, unpublish, scheduleProject,
  applyMigrations: (id, files) => applyProjectMigrations(id, files, "published"),
  checkProject: bundler.checkProject, scan, appUrl: urls.appUrl,
});

export async function publishProject(projectId: string, requestedSlug?: string, author: Parameters<typeof publication.publishProject>[2] = "owner") {
  const project = await getProject(projectId);
  if (project && (project as { runtime?: string }).runtime === "repository") {
    const slug = slugSuggestion(requestedSlug ?? project.slug ?? project.name);
    await repositories().publish(projectId, { slug }, author);
    return { slug, url: urls.appUrl(slug) };
  }
  return publication.publishProject(projectId, requestedSlug, author);
}
export async function unpublishProject(projectId: string) {
  const project = await getProject(projectId);
  if (project && (project as { runtime?: string }).runtime === "repository") {
    await repositories().stop(projectId, "published");
    await unpublish(projectId);
    return;
  }
  return publication.unpublishProject(projectId);
}
export const suggestSlug = slugSuggestion;
export const { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem } = bundler;
export const { runBrowserTest, inspectPreview, allowedRequest, closeBrowser } = browser;
export const { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock } = deps;
export const { KIT_BUILTIN } = catalog;
export const { SHARE_COOKIE, RESERVED_SLUG, previewOrigin, appUrl, parseAppHost } = urls;
type RuntimeShareScope = Parameters<typeof urls.shareToken>[0] & { runtime?: "native" | "repository" };
export function shareToken(scope: RuntimeShareScope, days = 30, env: "preview" | "published" = "preview") {
  return scope.runtime === "repository" ? repositoryShareToken(scope, env, days) : urls.shareToken(scope, days);
}
export function checkShareToken(scope: RuntimeShareScope, token: string | undefined | null, env: "preview" | "published" = "preview") {
  return scope.runtime === "repository" ? checkRepositoryShareToken(scope, token, env) : urls.checkShareToken(scope, token);
}
export function previewUrl(scope: RuntimeShareScope, days = 30, route = "/") {
  return scope.runtime === "repository" ? `${urls.previewOrigin(scope.id)}${route}?share=${shareToken(scope, days, "preview")}` : urls.previewUrl(scope, days, route);
}
export const { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService } = sandbox;
export const { parseCookies, cookie } = server;
export const serveApp: typeof server.serveApp = (request, target, rest) =>
  target.project.runtime === "repository"
    ? repositories().serve(request, target.project.id, target.env)
    : server.serveApp(request, target, rest);
export const { typecheckProject, parseDiagnostics, verifyBuild } = types;
export const { quickScan, findSecret, formatFinding } = security;
export const removeProjectData = removeData;
export function bindRuntimeObservation(ports: RuntimeObservationPorts) { return bindObservation(ports); }
export function configureRuntimeProjects(ports: RuntimeProjectsPort) { return configureProjects(ports); }
/** Stop request resources before releasing their project and observation bindings. */
export async function stopAppRuntime() {
  server.stopLiveReloads();
  sandbox.stopAllSandboxes();
  await browser.closeBrowser();
}

export type { AppTarget } from "./infrastructure/appServer.js";
export type { BrowserStep, BrowserTestInput, BrowserTestResult, PageInspection } from "./infrastructure/browser.js";
export type { BuildProblem, PageInfo, EndpointInfo, JobInfo, CompiledModule } from "./infrastructure/bundler.js";
export type { RunInput, SandboxError } from "./infrastructure/sandbox.js";
export type { Deps, PackageInfo } from "./domain/dependencies.js";
export type { KitEntry } from "./domain/catalog.js";
export type { ShareScope } from "./domain/share.js";
export type { Finding, Severity } from "./domain/securityScan.js";
export type { RuntimeObservationPorts, RuntimeProjectsPort } from "./application/ports.js";
