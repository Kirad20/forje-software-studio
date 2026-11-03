import { createController } from "../../../shared/application/create-controller.js";
import { httpClient } from "../../../shared/infrastructure/http-client.js";
import { createIdentityUseCases } from "./usecases.js";

const transport = createController(httpClient);

export const identityController = {
  ...transport,
  ...createIdentityUseCases(httpClient),
};
