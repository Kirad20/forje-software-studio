import type { IdentityModule } from "../../identity/index.js";
import type { CollaborationModule } from "../../collaboration/index.js";
import type { ProjectsModule } from "../../projects/index.js";
import type { ProjectKnowledgeModule } from "../../project-knowledge/index.js";
import type { RepositoryRuntime } from "../../repository-runtime/index.js";

export interface BuilderCoreModules {
  identity: Pick<IdentityModule, "getAccount">;
  collaboration: Pick<CollaborationModule, "enabledOrgSkills"> & Partial<Pick<CollaborationModule, "accessOf">>;
  projects: ProjectsModule;
  knowledge?: ProjectKnowledgeModule;
  repositoryRuntime?: Pick<RepositoryRuntime, "build" | "get">;
}

let binding: { modules: BuilderCoreModules } | undefined;

export function bindBuilderCoreModules(modules: BuilderCoreModules): () => void {
  const current = { modules };
  binding = current;
  return () => { if (binding === current) binding = undefined; };
}

export function builderCoreModules(): BuilderCoreModules {
  if (!binding) throw new Error("Builder core modules are not bound");
  return binding.modules;
}

export const getAccount: IdentityModule["getAccount"] = (...args) => builderCoreModules().identity.getAccount(...args);
export const enabledOrgSkills: CollaborationModule["enabledOrgSkills"] = (...args) => builderCoreModules().collaboration.enabledOrgSkills(...args);
export const getProject: ProjectsModule["getProject"] = (...args) => builderCoreModules().projects.getProject(...args);
export const readAllFiles: ProjectsModule["readAllFiles"] = (...args) => builderCoreModules().projects.readAllFiles(...args);
export const readFile: ProjectsModule["readFile"] = (...args) => builderCoreModules().projects.readFile(...args);
export const writeFile: ProjectsModule["writeFile"] = (...args) => builderCoreModules().projects.writeFile(...args);
export const createCheckpoint: ProjectsModule["createCheckpoint"] = (...args) => builderCoreModules().projects.createCheckpoint(...args);
