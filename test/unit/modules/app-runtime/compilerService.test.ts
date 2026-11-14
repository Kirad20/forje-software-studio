import { beforeEach, expect, it, vi } from "vitest";
import * as esbuild from "esbuild";
import { withCompilerRecovery } from "../../../../server/modules/app-runtime/infrastructure/compilerService.js";

vi.mock("esbuild", () => ({ stop: vi.fn() }));
vi.mock("../../../../server/shared/operationalLog.js", () => ({ recordOperationalEvent: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

it("restarts a stopped service once for concurrent failed builds", async () => {
  const first = vi.fn().mockRejectedValueOnce(new Error("The service was stopped")).mockResolvedValue("first");
  const second = vi.fn().mockRejectedValueOnce(new Error("The service is no longer running")).mockResolvedValue("second");
  await expect(Promise.all([withCompilerRecovery(first), withCompilerRecovery(second)])).resolves.toEqual(["first", "second"]);
  expect(esbuild.stop).toHaveBeenCalledTimes(1);
});

it("does not restart for an ordinary compilation error or retry repeatedly", async () => {
  const syntax = vi.fn().mockRejectedValue(new Error("Invalid syntax"));
  await expect(withCompilerRecovery(syntax)).rejects.toThrow("Invalid syntax");
  expect(esbuild.stop).not.toHaveBeenCalled();
  const stopped = vi.fn().mockRejectedValue(new Error("The service is no longer running"));
  await expect(withCompilerRecovery(stopped)).rejects.toThrow("The service is no longer running");
  expect(stopped).toHaveBeenCalledTimes(2);
  expect(esbuild.stop).toHaveBeenCalledTimes(1);
});
