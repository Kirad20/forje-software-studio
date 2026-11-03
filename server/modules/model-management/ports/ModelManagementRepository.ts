import type { ModelSpendView, ProjectModelSettings, RouterDecisionView } from "../domain/management.js";
export interface ModelManagementRepository {
  projectSettings(projectId: string): Promise<ProjectModelSettings | undefined>;
  projectModels(projectId: string): Promise<string[]>;
  updateProjectSettings(projectId: string, mode: string | null, concurrency: number | null): Promise<void>;
  decisions(projectId: string): Promise<RouterDecisionView[]>;
  spend(projectId: string): Promise<ModelSpendView[]>;
}
