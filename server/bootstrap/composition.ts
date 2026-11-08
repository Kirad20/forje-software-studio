import { randomBytes } from "node:crypto";
import { newId } from "../shared/crypto.js";
import { createCoreModules } from "./coreModules.js";
import { starterFiles } from "../modules/projects/index.js";
import * as builder from "../modules/builder/index.js";
import * as runtime from "../modules/app-runtime/index.js";
import { createPlatformModelManagement } from "../modules/model-management/index.js";
import { bindEvaluationBuilder, bindEvaluationResources } from "../modules/evaluations/runner.js";
import { bindMemorySecretDetector } from "../modules/memory/memory.js";
import { bindGithubProjectPorts } from "../modules/integrations/github.js";
import { integrationEnv } from "../modules/integrations/connections.js";
import { emitProject, log, projectEvents } from "../modules/project-observability/events.js";
import { bindProblemPorts, recheckBuild, watchProblems } from "../modules/project-observability/problems.js";
import { bindSecurityPorts, runQuickScan } from "../modules/project-observability/security.js";
import { configureAppServiceObserver } from "../modules/app-services/context.js";
import { configureSecretIntegrations } from "../modules/app-services/secrets.js";
import { configureJobRuntime, initializeAppServices } from "../modules/app-services/jobs.js";
import { applyProjectMigrations } from "../modules/app-services/projectDb.js";
import { sendPlatformEmail } from "../modules/app-services/email.js";
import { cloneDatabase, projectDb } from "../modules/app-services/projectDb.js";

export function createMonolith() {
  const modules = createCoreModules({
    projectServices: {
      projectId: () => randomBytes(8).toString("hex"),
      id: newId,
      templates: starterFiles,
      emit: emitProject,
      warmup: async (id) => projectDb(id).one("select 1"),
      clone: cloneDatabase,
    },
    sendPlatformEmail,
    findSecret: runtime.findSecret,
  });
  const models = createPlatformModelManagement(modules.settings.audit);
  let releases: (() => void | Promise<void>)[] = [];
  let started = false;

  async function stopBindings() {
    started = false;
    const errors: unknown[] = [];
    for (const release of releases.splice(0).reverse()) {
      try { await release(); } catch (error) { errors.push(error); }
    }
    if (errors.length) throw new AggregateError(errors, "Module bindings cleanup failed");
  }

  async function startBindings() {
    if (started) return;
    started = true;
    try {
      const bindings = [
        () => runtime.configureRuntimeProjects(modules.projects),
        () => runtime.configureRepositoryRuntime(modules.repositoryRuntime),
        () => bindProblemPorts({
          readAllFiles: modules.projects.readAllFiles,
          projectRuntime: modules.projects.projectRuntime,
          checkProject: runtime.checkProject,
          formatProblem: runtime.formatProblem,
        }),
        () => bindSecurityPorts({ readAllFiles: modules.projects.readAllFiles, quickScan: runtime.quickScan }),
        () => runtime.bindRuntimeObservation({ log, watchProblems, projectEvents, scan: runQuickScan }),
        () => bindMemorySecretDetector(runtime.findSecret),
        () => bindGithubProjectPorts({
          readAllFiles: modules.projects.readAllFiles,
          writeFile: modules.projects.writeFile,
          deleteFile: modules.projects.deleteFile,
          assertValidPath: modules.projects.assertValidPath,
          assertValidPathForProject: modules.projects.assertValidPathForProject,
          projectRuntime: modules.projects.projectRuntime,
          recheckBuild,
          emitProject,
          subscribe(projectId, listener) {
            projectEvents.on(projectId, listener);
            return () => { projectEvents.off(projectId, listener); };
          },
        }),
        () => builder.bindBuilderCoreModules(modules),
        () => bindEvaluationBuilder(builder),
        () => bindEvaluationResources(modules),
        () => configureAppServiceObserver({ log }),
        () => configureSecretIntegrations({ integrationEnv }),
        () => configureJobRuntime({
          publishedFiles: modules.projects.publishedFiles,
          readAllFiles: async (projectId) => {
            const files = await modules.projects.readAllFiles(projectId);
            await applyProjectMigrations(projectId, files, "preview");
            return files;
          },
          jobFiles: runtime.jobFiles,
          resolveExecution: runtime.resolveServiceExecution,
          readJobSettings: runtime.readJobSettings,
          compileServerModule: runtime.compileServerModule,
          runInSandbox: runtime.runInSandbox,
          appUrl: runtime.appUrl,
          previewOrigin: runtime.previewOrigin,
        }),
      ];
      for (const bind of bindings) releases.push(bind());
      await modules.repositoryRuntime.reconcile();
      initializeAppServices();
    } catch (startupError) {
      try { await stopBindings(); } catch (cleanupError) {
        throw new AggregateError([startupError, cleanupError], "Module binding startup and rollback failed");
      }
      throw startupError;
    }
  }
  return { ...modules, models, startBindings, stopBindings };
}
