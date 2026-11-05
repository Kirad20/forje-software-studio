import { fromJSONSchema } from "zod";
import { ModelCallError } from "../domain/messages.js";

export function validateToolInput(input: unknown, schema: Record<string, unknown>): boolean {
  let validator: ReturnType<typeof fromJSONSchema>;
  try {
    validator = fromJSONSchema(schema);
  } catch (error) {
    throw new ModelCallError(`Esquema de herramienta incompatible: ${error instanceof Error ? error.message : String(error)}`, false);
  }
  return validator.safeParse(input).success;
}
