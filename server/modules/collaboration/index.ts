import { PostgresMemberRepository } from "./infrastructure/PostgresMemberRepository.js";
import { CheckAccessUseCase } from "./application/CheckAccessUseCase.js";

// Domain & Models
export * from "./domain/MemberAccess.js";
export * from "./ports/repositories.js";

// Infrastructure Singleton Adapters
export const memberRepository = new PostgresMemberRepository();

// Application Use Cases
export const checkAccessUseCase = new CheckAccessUseCase(memberRepository);
