import { availableModels, listCatalog } from "../../model-management/catalog.js";
import { ListAgentTasksUseCase } from "../application/ListAgentTasksUseCase.js";
import { SqlAgentTaskRepository } from "./SqlAgentTaskRepository.js";

const tasks = new ListAgentTasksUseCase(new SqlAgentTaskRepository(), async () => [
  ...await listCatalog(), ...await availableModels(),
]);
export const listTasks = (projectId: string) => tasks.execute(projectId);
