export interface AppServiceEvent {
  env: "preview" | "published";
  level: "info" | "error";
  source: "endpoint" | "job" | "email" | "ai";
  message: string;
}
export interface ObserverPorts {
  log(projectId: string, event: AppServiceEvent): void;
}
