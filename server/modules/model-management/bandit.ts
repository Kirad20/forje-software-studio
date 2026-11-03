export * from "./domain/bandit.js";
export { recordOutcome } from "./router.js";
import { routingPorts } from "./infrastructure/routing.js";
export const posteriors = routingPorts.posteriors;
