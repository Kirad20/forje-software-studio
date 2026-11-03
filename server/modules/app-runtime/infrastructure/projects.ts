import type { RuntimeProjectsPort } from "../application/ports.js";

let ports: RuntimeProjectsPort | undefined;
let binding: object | undefined;
export function configureRuntimeProjects(next: RuntimeProjectsPort) {
  const current = {};
  binding = current;
  ports = next;
  return () => {
    if (binding !== current) return;
    binding = undefined;
    ports = undefined;
  };
}
function projects() {
  if (!ports) throw new Error("App runtime project ports have not been bound");
  return ports;
}
export const getProject: RuntimeProjectsPort["getProject"] = (...args) => projects().getProject(...args);
export const isSlugTaken: RuntimeProjectsPort["isSlugTaken"] = (...args) => projects().isSlugTaken(...args);
export const readAllFiles: RuntimeProjectsPort["readAllFiles"] = (...args) => projects().readAllFiles(...args);
export const recordPublish: RuntimeProjectsPort["recordPublish"] = (...args) => projects().recordPublish(...args);
export const unpublish: RuntimeProjectsPort["unpublish"] = (...args) => projects().unpublish(...args);
export const publishedFiles: RuntimeProjectsPort["publishedFiles"] = (...args) => projects().publishedFiles(...args);
export const isDevFile: RuntimeProjectsPort["isDevFile"] = (...args) => projects().isDevFile(...args);
