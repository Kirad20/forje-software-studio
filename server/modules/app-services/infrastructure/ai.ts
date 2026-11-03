import { allowedModels } from "../../model-management/catalog.js";
import { callModel } from "../../model-management/router.js";
import { platformRepository } from "./repositories.js";
import { log } from "./observer.js";
import type { AiPorts } from "../ports/ai.js";
export const aiPorts: AiPorts = {
  ...platformRepository, allowedModels, log,
  callModel: (scope, intent, needs, input, options) => callModel(scope, intent,
    needs as Parameters<typeof callModel>[2], input,
    options as NonNullable<Parameters<typeof callModel>[4]>),
};
