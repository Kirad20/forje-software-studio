import { scheduleProject } from "../app-services/jobs.js";
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

const publication = createPublication({
  async getProject(id) {
    const project = await getProject(id);
    if (!project) throw new Error("Proyecto no encontrado");
    return project;
  },
  isSlugTaken, readAllFiles, recordPublish, unpublish, scheduleProject,
  checkProject: bundler.checkProject, scan, appUrl: urls.appUrl,
});

export const { publishProject, unpublishProject } = publication;
export const suggestSlug = slugSuggestion;
export const { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem } = bundler;
export const { runBrowserTest, inspectPreview, allowedRequest, closeBrowser } = browser;
export const { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock } = deps;
export const { KIT_BUILTIN } = catalog;
export const { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost } = urls;
export const { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService } = sandbox;
export const { serveApp, parseCookies, cookie } = server;
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
