import { lazy } from "react";

export { ProblemsBar, fixMessage } from "./presentation/Problems.js";
export const SecurityPanel = lazy(() => import("./presentation/Security.js").then((module) => ({ default: module.SecurityPanel })));
export { observabilityController } from "./application/controller.js";
export type { Problem } from "./presentation/Problems.js";
