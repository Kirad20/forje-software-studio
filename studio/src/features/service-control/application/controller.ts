import { createController } from "../../../shared/application/create-controller.js";
import { httpClient } from "../../../shared/infrastructure/http-client.js";
import type { ServiceControlSnapshot } from "../../../shared/contracts/api.js";

const transport = createController(httpClient);
const path = (id: string) => `/projects/${encodeURIComponent(id)}/service-control`;
export const serviceControlController = {
  load: (id: string) => transport.request<ServiceControlSnapshot>(path(id)),
  scale: (id: string, service: string, body: { replicas: number; maxConcurrency: number }) =>
    transport.request(`${path(id)}/${encodeURIComponent(service)}`, { method: "PATCH", body }),
  restart: (id: string, service: string, env: "preview" | "published") =>
    transport.request(`${path(id)}/${encodeURIComponent(service)}/restart`, { body: { env } }),
};
