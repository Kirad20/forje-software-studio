import { createController } from "../../../shared/application/create-controller.js";
import { httpClient } from "../../../shared/infrastructure/http-client.js";
import { createEvaluationUseCases } from "./usecases.js";

export const evaluationsController = {
  ...createController(httpClient),
  ...createEvaluationUseCases(httpClient),
};
export const api = evaluationsController.request;
