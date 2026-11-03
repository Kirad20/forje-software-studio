import { createController } from "../../../shared/application/create-controller.js";
import { httpClient } from "../../../shared/infrastructure/http-client.js";

export const appServicesController = createController(httpClient);
export const api = appServicesController.request;
