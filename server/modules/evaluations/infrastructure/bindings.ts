import type { EvaluationBuilderPort } from "../ports/builder.js";
import type { EvaluationResourcesPort } from "../ports/resources.js";

let builder: EvaluationBuilderPort | undefined;
let resources: EvaluationResourcesPort | undefined;

export function bindEvaluationBuilder(port: EvaluationBuilderPort): () => void {
  builder = port;
  return () => { if (builder === port) builder = undefined; };
}
export function evaluationBuilder(): EvaluationBuilderPort {
  if (!builder) throw new Error("Evaluation builder port is not bound");
  return builder;
}
export function bindEvaluationResources(port: EvaluationResourcesPort): () => void {
  resources = port;
  return () => { if (resources === port) resources = undefined; };
}
export function evaluationResources(): EvaluationResourcesPort {
  if (!resources) throw new Error("Evaluation resources port is not bound");
  return resources;
}
