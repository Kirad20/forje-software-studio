import { bootstrapService } from "../modules/identity/index.js";

export { SetupError } from "../modules/identity/index.js";

/** First-run setup compatibility API; identity owns the one-time token policy. */
export async function initBootstrap(): Promise<void> {
  await bootstrapService.init();
}

export async function needsSetup(): Promise<boolean> {
  return bootstrapService.needsSetup();
}

export async function completeSetup(input: { token: string; email: string; password: string; name?: string }): Promise<string> {
  return bootstrapService.complete(input);
}
