import type { Folder, Project, ProjectDashboard, ProjectProblem } from "../../../shared/contracts/index.js";
import type { HttpPort } from "../../../shared/application/http-port.js";
import type { EventStreamPort } from "../../../shared/infrastructure/browser.js";
import type { ProjectEvent, ProjectLogLine } from "./contracts.js";

export function subscribeToProjectEvents(
  createEventSource: (url: string) => EventStreamPort,
  id: string,
  onEvent: (event: ProjectEvent) => void,
): () => void {
  const source = createEventSource(`/api/projects/${id}/events`);
  source.onmessage = (message) => {
    const event = parseProjectEvent(message.data);
    if (event) onEvent(event);
  };
  return () => source.close();
}

export function parseProjectEvent(message: string): ProjectEvent | null {
  let value: unknown;
  try {
    value = JSON.parse(message);
  } catch {
    return null;
  }
  if (!isRecord(value) || typeof value.type !== "string") return null;
  if (value.type === "files" || value.type === "published") return { type: value.type };
  if (value.type === "log" && isRecord(value.entry) && isProjectLogLine(value.entry)) {
    return { type: "log", entry: value.entry };
  }
  if (value.type === "problems" && Array.isArray(value.problems) && value.problems.every(isProjectProblem)) {
    return { type: "problems", problems: value.problems };
  }
  if (value.type === "github" && typeof value.status === "string") return { type: "github", status: value.status };
  return null;
}

export function createProjectUseCases(http: HttpPort) {
  return {
    dashboard: async (): Promise<ProjectDashboard> => {
      const [projects, folders] = await Promise.all([
        http.request<{ projects: Project[]; shared: Project[] }>("/projects"),
        http.request<{ folders: Folder[] }>("/folders"),
      ]);
      return { projects: projects.projects, shared: projects.shared, folders: folders.folders };
    },
    loadProject: (id: string, signal?: AbortSignal) =>
      http.request<{ project: Project }>(`/projects/${id}`, { signal }),
    createProject: (prompt: string) =>
      http.request<{ project: Project }>("/projects", { body: { prompt } }),
  };
}

function isProjectLogLine(value: Record<string, unknown>): value is Record<string, unknown> & ProjectLogLine {
  return ["at", "env", "level", "source", "message"].every((key) => typeof value[key] === "string");
}

function isProjectProblem(value: unknown): value is ProjectProblem {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.kind === "string" &&
    ["build", "runtime", "network", "server"].includes(value.kind) &&
    typeof value.title === "string" &&
    typeof value.detail === "string" &&
    typeof value.count === "number" &&
    typeof value.lastAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
