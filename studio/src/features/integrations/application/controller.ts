import { createController } from "../../../shared/application/create-controller.js";
import { httpClient } from "../../../shared/infrastructure/http-client.js";

export const integrationsController = createController(httpClient);
export const api = integrationsController.request;
