import { createProblemService, type ProblemPorts } from "./application/problems.js";
import { createProblemAdapters } from "./infrastructure/problems.js";
import { emitProject, projectEvents } from "./events.js";
export * from "./application/problems.js";
let bound: ProblemPorts | undefined;
let binding: symbol | undefined;
export function bindProblemPorts(ports: ProblemPorts): () => Promise<void> {
  const token = Symbol();
  bound = ports;
  binding = token;
  let cleanup: Promise<void> | undefined;
  return () => {
    if (binding !== token) return Promise.resolve();
    if (cleanup) return cleanup;
    cleanup = stopProblems().then(() => {
      if (binding !== token) return;
      bound = undefined;
      binding = undefined;
    });
    return cleanup;
  };
}
function ports(): ProblemPorts { if (!bound) throw new Error("Problem ports not bound"); return bound; }
const adapters = createProblemAdapters();
export const { listProblems, clearProblems, recheckBuild, watchProblems, stopProblems } = createProblemService(adapters.repository, {
  readAllFiles: (p) => ports().readAllFiles(p), checkProject: (files) => ports().checkProject(files), formatProblem: (problem) => ports().formatProblem(problem),
}, {
  ...adapters, emit: emitProject,
  subscribe(projectId, listener) { projectEvents.on(projectId, listener); return () => { projectEvents.off(projectId, listener); }; },
});
