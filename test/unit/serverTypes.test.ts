import { describe, expect, it } from "vitest";
import type { EndpointContext, JobContext } from "../../server/modules/app-services/context.js";
import type { Ctx, JobCtx } from "../../sdk/server/index.js";

// Compile-time contract (npm run typecheck): what the server really passes must satisfy the
// types the generated apps are checked against. A new ctx feature has to be added to both.
const endpoint = (c: EndpointContext): Ctx => c;
const job = (c: JobContext): JobCtx => c;

describe("@forja/server types", () => {
  it("match the real endpoint and job contexts", () => {
    expect(typeof endpoint).toBe("function");
    expect(typeof job).toBe("function");
  });
});
