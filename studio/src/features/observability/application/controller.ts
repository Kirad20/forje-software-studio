import { createController } from "../../../shared/application/create-controller.js";
import { httpClient } from "../../../shared/infrastructure/http-client.js";

export const observabilityController = createController(httpClient);
export const api = observabilityController.request;
