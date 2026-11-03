import type { BuilderToolResult, BuilderTurnInput } from "./builderService.js";
import type { ToolContext } from "./BuilderToolsAdapter.js";
import type { Account } from "../../identity/contracts.js";

export class BuilderServiceClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string, private readonly token: string) {
    if (!baseUrl || !token) throw new Error("Builder service URL and token must be configured");
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async status(projectId: string): Promise<{ building: boolean }> {
    return this.json("/internal/builder/status", { projectId });
  }

  async stop(projectId: string): Promise<void> {
    await this.json("/internal/builder/stop", { projectId });
  }

  securityReview(account: Account, projectId: string): Promise<{ started: boolean }> {
    return this.json("/internal/builder/security-review", { account, projectId });
  }

  turn(input: BuilderTurnInput, signal?: AbortSignal): Promise<Response> {
    return fetch(`${this.baseUrl}/internal/builder/turn`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(input),
      signal,
    });
  }

  tool(
    name: string,
    input: Record<string, unknown>,
    context: ToolContext,
    structured: boolean,
  ): Promise<BuilderToolResult> {
    return this.json("/internal/builder/tool", { name, input, ...context, structured });
  }

  private headers(): HeadersInit {
    return { authorization: `Bearer ${this.token}`, "content-type": "application/json" };
  }

  private async json<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Builder service returned ${response.status}: ${detail}`);
    }
    return response.json() as Promise<T>;
  }
}
