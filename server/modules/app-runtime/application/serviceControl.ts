import type { ControlledService, ServiceControlSnapshot, ServiceRuntimeSnapshot } from "../domain/serviceControl.js";
import { endpointRoutes, jobFiles } from "../domain/routes.js";
import { readProjectServices, SERVICES_MANIFEST } from "../domain/services.js";
import type { ServiceControlPorts } from "../ports/serviceControl.js";

export function createServiceControl(ports: ServiceControlPorts) {
  async function snapshot(projectId: string, env?: "preview" | "published"): Promise<ServiceControlSnapshot> {
    const files = await ports.readFiles(projectId, env);
    const manifest = readProjectServices(files);
    const [queue, runtime] = await Promise.all([
      ports.listQueue(projectId),
      ports.runtime(projectId).catch((error: unknown): ServiceRuntimeSnapshot => ({
        available: false, scope: "app-runtime", services: [], error: error instanceof Error ? error.message : String(error),
      })),
    ]);
    const entries = Object.entries(manifest?.services ?? {});
    const assigned = new Set(entries.flatMap(([, service]) => [...service.endpoints, ...service.jobs]));
    const services: ControlledService[] = entries.map(([name, service]) => ({
      name, kind: service.kind, endpoints: service.endpoints, jobs: service.jobs, scalable: env !== "published",
      desired: { replicas: service.replicas, maxConcurrency: service.maxConcurrency },
      runtime: [], queue: [], queueCounts: {}, lastFailure: null,
    }));
    services.push({
      name: "monolith", kind: "monolith", scalable: false,
      endpoints: endpointRoutes(files).map((entry) => entry.file).filter((file) => !assigned.has(file)),
      jobs: jobFiles(files).map((entry) => entry.file).filter((file) => !assigned.has(file)),
      desired: { replicas: 1, maxConcurrency: null }, runtime: [], queue: [], queueCounts: {}, lastFailure: null,
    });
    for (const service of services) {
      service.runtime = runtime.services.filter((entry) => entry.service === service.name && (!env || entry.env === env)).map(({ env, replicas }) => ({ env, replicas }));
      service.queue = queue.filter((entry) => (entry.service ?? "monolith") === service.name && (!env || entry.env === env));
      for (const entry of service.queue) service.queueCounts[entry.status] = (service.queueCounts[entry.status] ?? 0) + 1;
      service.lastFailure = service.queue.find((entry) => entry.error)?.error ?? null;
    }
    return { manifest: manifest !== null, services, runtime, queueScope: "Últimas 100 tareas del proyecto; no es el total de la cola" };
  }
  async function scale(projectId: string, service: string, patch: unknown) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) throw new Error("Escala no válida");
    const fields = Object.keys(patch);
    if (!fields.length || fields.some((field) => !["replicas", "maxConcurrency"].includes(field))) throw new Error("Solo replicas y maxConcurrency son editables");
    for (const [field, value] of Object.entries(patch)) {
      const max = field === "replicas" ? 8 : 32;
      if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > max) throw new Error(`${field} debe ser un entero entre 1 y ${max}`);
    }
    const files = await ports.readFiles(projectId);
    const manifest = readProjectServices(files);
    if (service === "monolith") throw new Error("monolith conserva la configuración de compatibilidad");
    if (!manifest || !Object.hasOwn(manifest.services, service)) throw new Error("Servicio no encontrado");
    const source = JSON.parse(files[SERVICES_MANIFEST]!);
    Object.assign(source.services[service], patch);
    const content = JSON.stringify(source, null, 2) + "\n";
    readProjectServices({ ...files, [SERVICES_MANIFEST]: content });
    await ports.writeManifest(projectId, content);
    return { ok: true };
  }
  async function restart(projectId: string, service: string, env?: unknown) {
    if (env !== undefined && env !== "preview" && env !== "published") throw new Error("Entorno no válido");
    const files = await ports.readFiles(projectId, env);
    const manifest = readProjectServices(files);
    if (service !== "monolith" && !Object.hasOwn(manifest?.services ?? {}, service)) throw new Error("Servicio no encontrado");
    await ports.restart(projectId, service, env);
    return { ok: true };
  }
  return { snapshot, scale, restart };
}
