import type { ProjectProblem } from "../../../shared/contracts/index.js";

export interface ProjectLogLine {
  at: string;
  env: string;
  level: string;
  source: string;
  message: string;
}

export type ProjectEvent =
  | { type: "files" }
  | { type: "published" }
  | { type: "log"; entry: ProjectLogLine }
  | { type: "problems"; problems: ProjectProblem[] }
  | { type: "github"; status: string };
