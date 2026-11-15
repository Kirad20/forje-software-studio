import * as esbuild from "esbuild";
import { recordOperationalEvent } from "../../../shared/operationalLog.js";

let generation = 0;

export async function withCompilerRecovery<T>(build: () => Promise<T>): Promise<T> {
  const started = generation;
  try {
    return await build();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("The service is no longer running") && !message.includes("The service was stopped")) throw error;
    if (started === generation) {
      generation++;
      console.error("[compiler] esbuild service stopped; restarting before one retry");
      await esbuild.stop();
      await recordOperationalEvent({ service: "compiler", event: "compiler_stopped", error });
    }

    return build();
  }
}

export async function checkCompiler(): Promise<void> {
  await withCompilerRecovery(() => esbuild.transform("export const ready = true", { loader: "js", logLevel: "silent" }));
}
