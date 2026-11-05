import type { FileMap } from "./publication.js";
import { endpointRoutes, jobFiles } from "./routes.js";

export const SERVICES_MANIFEST = "forja.services.json";

export interface ServiceExecution {
  service: string;
  replicas: number;
  maxConcurrency: number;
}

export interface ProjectService {
  kind: "service" | "worker";
  endpoints: string[];
  jobs: string[];
  replicas: number;
  maxConcurrency: number;
}

export interface ProjectServices {
  version: 1;
  services: Record<string, ProjectService>;
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(message: string): never {
  throw new Error(`${SERVICES_MANIFEST}: ${message}`);
}

function keys(value: Record<string, unknown>, allowed: string[]) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) invalid(`campo desconocido "${key}"`);
}

function integer(value: unknown, fallback: number, max: number, label: string) {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > max) invalid(`${label} debe ser un entero entre 1 y ${max}`);
  return value;
}

export function readProjectServices(files: FileMap): ProjectServices | null {
  const source = files[SERVICES_MANIFEST];
  if (source === undefined) return null;
  let value: unknown;
  try { value = JSON.parse(source); } catch { invalid("JSON no valido"); }
  if (!object(value)) invalid("debe ser un objeto");
  keys(value, ["version", "services"]);
  if (value.version !== 1 || !object(value.services)) invalid("requiere version: 1 y services");
  const entries = Object.entries(value.services);
  if (!entries.length || entries.length > 16) invalid("requiere entre 1 y 16 servicios");
  const endpoints = new Set(endpointRoutes(files).map((entry) => entry.file));
  const jobs = new Set(jobFiles(files).map((entry) => entry.file));
  const owners = new Set<string>();
  const services: Record<string, ProjectService> = Object.create(null);
  let replicas = 0;
  for (const [name, entry] of entries) {
    if (!/^[a-z][a-z0-9-]{0,39}$/.test(name) || name === "monolith") invalid(`nombre de servicio no valido: "${name}"`);
    if (!object(entry)) invalid(`${name} debe ser un objeto`);
    keys(entry, ["kind", "endpoints", "jobs", "replicas", "maxConcurrency"]);
    if (entry.kind !== "service" && entry.kind !== "worker") invalid(`${name}.kind debe ser service o worker`);
    const assigned = (field: "endpoints" | "jobs", available: Set<string>) => {
      const paths = entry[field] === undefined ? [] : entry[field];
      if (!Array.isArray(paths)) invalid(`${name}.${field} debe ser una lista de archivos`);
      return paths.map((file: unknown) => {
        if (typeof file !== "string" || !available.has(file)) invalid(`${name}.${field}: archivo inexistente o no ejecutable "${String(file)}"`);
        if (owners.has(file)) invalid(`"${file}" pertenece a mas de un servicio`);
        owners.add(file);
        return file;
      });
    };
    const service: ProjectService = {
      kind: entry.kind,
      endpoints: assigned("endpoints", endpoints),
      jobs: assigned("jobs", jobs),
      replicas: integer(entry.replicas, 1, 8, `${name}.replicas`),
      maxConcurrency: integer(entry.maxConcurrency, entry.kind === "worker" ? 1 : 8, 32, `${name}.maxConcurrency`),
    };
    if (service.kind === "worker" && service.endpoints.length) invalid(`${name}: un worker no puede exponer endpoints`);
    if (!service.endpoints.length && !service.jobs.length) invalid(`${name}: asigna al menos un endpoint o tarea`);
    replicas += service.replicas;
    services[name] = service;
  }
  if (replicas > 16) invalid("el total de replicas no puede superar 16");
  return { version: 1, services };
}

/** Unassigned entrypoints stay in the monolith, allowing extraction one module at a time. */
export function resolveServiceExecution(files: FileMap, file: string): ServiceExecution {
  const manifest = readProjectServices(files);
  for (const [service, entry] of Object.entries(manifest?.services ?? {})) {
    if (entry.endpoints.includes(file) || entry.jobs.includes(file)) {
      return { service, replicas: entry.replicas, maxConcurrency: entry.maxConcurrency };
    }
  }
  return { service: "monolith", replicas: 1, maxConcurrency: Number.MAX_SAFE_INTEGER };
}
