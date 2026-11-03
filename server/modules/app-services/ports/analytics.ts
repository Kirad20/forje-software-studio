import type { QueryRepository } from "./repositories.js";
export interface AnalyticsPorts extends Pick<QueryRepository, "q"> {
  now(): Date;
  salt(): string;
  hash(value: string): string;
}
