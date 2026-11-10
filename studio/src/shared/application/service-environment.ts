export type ServiceEnvironment = "preview" | "published";

export function servicePath(projectId: string, resource: string, env: ServiceEnvironment) {
  return `/projects/${encodeURIComponent(projectId)}/${resource}${resource.includes("?") ? "&" : "?"}env=${env}`;
}
