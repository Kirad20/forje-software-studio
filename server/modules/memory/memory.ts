import { randomBytes } from "node:crypto";
import { createMemoryService } from "./application/service.js";
import { memoryRepository } from "./infrastructure/memory.js";
export * from "./application/service.js";
let detector: ((text: string) => string | null) | undefined;
let binding: symbol | undefined;
export function bindMemorySecretDetector(findSecret: (text: string) => string | null): () => void {
  const token = Symbol();
  detector = findSecret;
  binding = token;
  return () => {
    if (binding !== token) return;
    detector = undefined;
    binding = undefined;
  };
}
export const { memorySettings, setMemoryEnabled, listMemories, addMemory, updateMemory, deleteMemory, memorySection } = createMemoryService(
  memoryRepository, () => randomBytes(5).toString("hex"), (text) => {
    if (!detector) throw new Error("Memory secret detector not bound");
    return detector(text);
  },
);
