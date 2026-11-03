import { describe, expect, it, vi } from "vitest";
import { createProjectsModule } from "../../../../server/modules/projects/index.js";

describe("Projects module factory", () => {
  it("exposes application capabilities using injected stores and service ports", async () => {
    const store = {
      getProject: vi.fn().mockResolvedValue({ id: "p" }),
    };
    const module = createProjectsModule({
      store: store as never,
      files: {} as never,
      services: {} as never,
    });
    expect(await module.getProject("p")).toEqual({ id: "p" });
    expect(store.getProject).toHaveBeenCalledWith("p");
    await module.start();
    await module.start();
    await module.stop();
    await module.stop();
  });
});
