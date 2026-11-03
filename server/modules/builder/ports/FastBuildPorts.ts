import type { Cancellation } from "../domain/BuilderWorkflow.js";

export interface FastBuildPorts<Result extends { text: string }, Problem extends { title: string }> {
  signal: Cancellation;
  run(): Promise<Result>;
  wrote(): boolean;
  check(): Promise<Problem[]>;
  learn(result: Result, problems: Problem[]): Promise<void>;
  fix(round: number, reply: string, problems: Problem[]): Promise<{ text: string }>;
  reply(text: string, initial: string): Promise<void>;
}
