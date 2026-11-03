import { createController } from "../../../shared/application/create-controller.js";
import { browser } from "../../../shared/infrastructure/browser.js";
import { httpClient } from "../../../shared/infrastructure/http-client.js";
import { createProjectUseCases, subscribeToProjectEvents } from "./usecases.js";

const transport = createController(httpClient);

export const projectsController = {
  ...transport,
  ...createProjectUseCases(httpClient),
  subscribeToEvents: (id: string, onEvent: Parameters<typeof subscribeToProjectEvents>[2]) =>
    subscribeToProjectEvents((url) => browser.createEventSource(url), id, onEvent),
};

export const api = projectsController.request;
