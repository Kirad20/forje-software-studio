import { expect, it, vi } from "vitest";
import { configureAppServiceObserver } from "../../../../server/modules/app-services/context.js";
import { configureSecretIntegrations } from "../../../../server/modules/app-services/secrets.js";
import { configureJobRuntime } from "../../../../server/modules/app-services/jobs.js";
import { log } from "../../../../server/modules/app-services/infrastructure/observer.js";
import { secretPorts } from "../../../../server/modules/app-services/infrastructure/secrets.js";
import { jobPorts } from "../../../../server/modules/app-services/infrastructure/jobs.js";
import type { JobRuntimePorts } from "../../../../server/modules/app-services/ports/jobs.js";

it("conditionally unbinds capabilities without letting stale disposers clear replacements", async () => {
  const observer = { log: vi.fn() };
  const integrations = { integrationEnv: vi.fn().mockResolvedValue({ KEY: "value" }) };
  const runtime = {} as JobRuntimePorts;
  const stale = [
    configureAppServiceObserver(observer),
    configureSecretIntegrations(integrations),
    configureJobRuntime(runtime),
  ];
  // Rebinding the same object is still a distinct lifecycle registration.
  const current = [
    configureAppServiceObserver(observer),
    configureSecretIntegrations(integrations),
    configureJobRuntime(runtime),
  ];
  try {
    for (const dispose of stale) dispose();
    log("p", { env: "preview", level: "info", source: "job", message: "message" });
    expect(observer.log).toHaveBeenCalledTimes(1);
    expect(await secretPorts.integrationEnv("p")).toEqual({ KEY: "value" });
    expect(jobPorts.runtime()).toBe(runtime);
  } finally {
    for (const dispose of current) dispose();
  }
  for (const dispose of stale) dispose();
  for (const dispose of current) dispose();
  expect(() => log("p", { env: "preview", level: "info", source: "job", message: "message" })).toThrow(/not configured/);
  expect(() => secretPorts.integrationEnv("p")).toThrow(/not configured/);
  expect(() => jobPorts.runtime()).toThrow(/not configured/);
});
