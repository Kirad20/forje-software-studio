import type { QueryRepository } from "./repositories.js";
import type { ObserverPorts } from "./observer.js";
export interface EmailPorts extends QueryRepository, ObserverPorts {
  emailFrom(): string;
  getTransport(): { sendMail(input: { from: string; to: string; subject: string; html: string }): Promise<unknown> } | null;
}
