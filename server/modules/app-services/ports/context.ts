import type { ProjectDb } from "./database.js";
import type { ObserverPorts } from "./observer.js";
import type { AppEnv, EmailInput, EmailResult, AppAiInput, AppAiResult, StoredObject, CheckoutInput } from "../domain/contracts.js";
export interface JobsApi {
  runNow(projectId: string, env: AppEnv, name: string, payload: unknown, trigger: string): Promise<void>;
  addTimer(projectId: string, env: AppEnv, name: string, payload: unknown, runAt: Date): Promise<string>;
}
export interface ContextPorts extends ObserverPorts {
  appAiChat(projectId: string, input: AppAiInput): Promise<AppAiResult>;
  sendEmail(projectId: string, input: EmailInput): Promise<EmailResult[]>;
  paymentsFor(env: Record<string, string>): {
    checkout(input: CheckoutInput): Promise<{ id: string; url: string }>;
    getCheckout(id: string): Promise<{ id: string; status: string; paymentStatus: string; amountTotal: number }>;
    refund(id: string): Promise<Record<string, unknown>>;
  };
  putObject(projectId: string, data: Uint8Array, opts: { filename: string; contentType?: string; key?: string }): Promise<StoredObject>;
  getObject(projectId: string, key: string): Promise<{ data: Uint8Array; contentType: string; filename: string } | null>;
  deleteObject(projectId: string, key: string): Promise<void>;
  listObjects(projectId: string): Promise<(StoredObject & { createdAt: string })[]>;
  projectDb(projectId: string): ProjectDb;
  secretEnv(projectId: string): Promise<Record<string, string>>;
  publish(projectId: string, channel: string, data: unknown): number;
}
