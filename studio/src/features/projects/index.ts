import { lazy } from "react";

export { Dashboard } from "./presentation/Dashboard.js";
export const ProjectView = lazy(() => import("./presentation/ProjectView.js").then((module) => ({ default: module.ProjectView })));
export { projectsController } from "./application/controller.js";
export type { ProjectEvent, ProjectLogLine } from "./application/contracts.js";
