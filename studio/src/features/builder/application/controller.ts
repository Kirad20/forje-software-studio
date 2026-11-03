import { createController } from "../../../shared/application/create-controller.js";
import { httpClient } from "../../../shared/infrastructure/http-client.js";

export const builderController = createController(httpClient);
export const api = builderController.request;
export const streamPost = builderController.stream;
export const streamGet = builderController.streamGet;
