export interface ServiceReplica {
  pid: number | null;
  active: number;
  ready: boolean;
}
export interface RuntimeService {
  env: "preview" | "published";
  service: string;
  replicas: ServiceReplica[];
}
export interface ServiceRuntimeSnapshot {
  available: boolean;
  scope: "app-runtime";
  services: RuntimeService[];
  error?: string;
}
export interface ServiceQueueEntry {
  id: string;
  job: string;
  service?: string;
  env: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  error: string | null;
  createdAt?: string;
  availableAt?: string;
}
export interface ControlledService {
  name: string;
  kind: "service" | "worker" | "monolith";
  endpoints: string[];
  jobs: string[];
  scalable: boolean;
  desired: { replicas: number; maxConcurrency: number | null };
  runtime: Omit<RuntimeService, "service">[];
  queue: ServiceQueueEntry[];
  queueCounts: Record<string, number>;
  lastFailure: string | null;
}
export interface ServiceControlSnapshot {
  manifest: boolean;
  services: ControlledService[];
  runtime: ServiceRuntimeSnapshot;
  queueScope: string;
}
