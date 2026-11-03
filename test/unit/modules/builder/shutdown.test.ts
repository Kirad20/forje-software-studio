import { expect, it, vi } from "vitest";
import { BuilderRunRegistry } from "../../../../server/modules/builder/application/BuilderRunRegistry.js";

it("cancels active turns and waits for their resource cleanup", async () => {
  const registry = new BuilderRunRegistry();
  let finish!: () => void;
  const cleanup = new Promise<void>((resolve) => { finish = resolve; });
  const cancel = vi.fn();
  const run = registry.run("p", cancel, () => cleanup);
  expect(registry.isRunning("p")).toBe(true);
  await expect(registry.run("p", vi.fn(), async () => {})).rejects.toThrow("trabajando");
  let stopped = false;
  const shutdown = registry.stop().then(() => { stopped = true; });
  await Promise.resolve();
  expect(cancel).toHaveBeenCalledOnce();
  expect(stopped).toBe(false);
  finish();
  await Promise.all([run, shutdown]);
  expect(registry.isRunning("p")).toBe(false);
  await expect(registry.run("q", vi.fn(), async () => {})).rejects.toThrow("detenido");
});

it("releases a failed turn and surfaces shutdown failures", async () => {
  const registry = new BuilderRunRegistry();
  let fail!: (error: Error) => void;
  const pending = new Promise<void>((_resolve, reject) => { fail = reject; });
  const run = registry.run("p", vi.fn(), () => pending);
  const rejected = expect(run).rejects.toThrow("failed");
  const shutdown = registry.stop();
  const rejectedShutdown = expect(shutdown).rejects.toBeInstanceOf(AggregateError);
  fail(new Error("failed"));
  await Promise.all([rejected, rejectedShutdown]);
  expect(registry.isRunning("p")).toBe(false);
});
