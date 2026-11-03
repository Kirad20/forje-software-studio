import type { RouterPosteriorRow, RouterStats } from "../domain/routerAdmin.js";
export interface RouterAdministrationRepository {
  stats(): Promise<RouterPosteriorRow[]>;
  decisions(limit: number): Promise<RouterStats["decisions"]>;
  reset(taskClass: string | null, modelId: string | null): Promise<number>;
}
