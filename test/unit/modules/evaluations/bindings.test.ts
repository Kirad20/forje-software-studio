import { afterEach, describe, expect, it } from "vitest";
import type * as Builder from "../../../../server/modules/builder/index.js";
import type { createIdentityModule } from "../../../../server/modules/identity/index.js";
import type { createProjectsModule } from "../../../../server/modules/projects/index.js";
import type { EvaluationBuilderPort } from "../../../../server/modules/evaluations/ports/builder.js";
import type { EvaluationResourcesPort } from "../../../../server/modules/evaluations/ports/resources.js";
import {
  bindEvaluationBuilder, bindEvaluationResources, evaluationBuilder, evaluationResources,
} from "../../../../server/modules/evaluations/infrastructure/bindings.js";

type Compatible<T extends true> = T;
type BuilderCompatibility = Compatible<typeof Builder extends EvaluationBuilderPort ? true : false>;
type IdentityCompatibility = Compatible<ReturnType<typeof createIdentityModule> extends EvaluationResourcesPort["identity"] ? true : false>;
type ProjectsCompatibility = Compatible<ReturnType<typeof createProjectsModule> extends EvaluationResourcesPort["projects"] ? true : false>;

const builder: EvaluationBuilderPort = {
  isBuilding: () => false,
  stopBuilding: () => false,
  runBuilderTurn: async () => {},
  runAgent: async () => { throw new Error("unused"); },
  createFinishGate: async () => ({ check: async () => null }),
  projectMap: () => "",
  MAX_STEPS: { fast: 1, data: 1, backend: 1, ui: 1, chat: 1 },
  ROLE_PROMPTS: { fast: "", data: "", backend: "", ui: "", chat: "" },
  ROLE_TOOLS: { fast: [], data: [], backend: [], ui: [], chat: [] },
  builderTools: [],
  toolByName: new Map(),
  langfuse: null,
};
const resources: EvaluationResourcesPort = {
  identity: { createAccount: async () => "eval", getAccount: async () => undefined },
  projects: {
    createProject: async () => { throw new Error("unused"); },
    deleteProject: async () => {},
    readAllFiles: async () => ({}),
    writeFile: async () => {},
  },
};

describe("evaluation infrastructure bindings", () => {
  const disposers: (() => void)[] = [];
  afterEach(() => { for (const dispose of disposers.reverse()) dispose(); disposers.length = 0; });

  it("requires explicit composition and preserves bootstrap structural compatibility", () => {
    const compatibility: [BuilderCompatibility, IdentityCompatibility, ProjectsCompatibility] = [true, true, true];
    expect(compatibility.every(Boolean)).toBe(true);
    expect(() => evaluationBuilder()).toThrow("not bound");
    expect(() => evaluationResources()).toThrow("not bound");
    disposers.push(bindEvaluationBuilder(builder), bindEvaluationResources(resources));
    expect(evaluationBuilder()).toBe(builder);
    expect(evaluationResources()).toBe(resources);
  });

  it("old disposers cannot remove replacement bindings", () => {
    const oldBuilder = bindEvaluationBuilder(builder);
    const oldResources = bindEvaluationResources(resources);
    const nextBuilder = { ...builder };
    const nextResources = { ...resources };
    disposers.push(bindEvaluationBuilder(nextBuilder), bindEvaluationResources(nextResources));
    oldBuilder();
    oldResources();
    expect(evaluationBuilder()).toBe(nextBuilder);
    expect(evaluationResources()).toBe(nextResources);
    disposers[0]();
    disposers[1]();
    expect(() => evaluationBuilder()).toThrow("not bound");
    expect(() => evaluationResources()).toThrow("not bound");
  });
});
