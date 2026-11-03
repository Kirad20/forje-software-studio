import { createUsageService } from "./application/service.js";
import { usageRepository } from "./infrastructure/usage.js";
export { DAILY_ACTIONS } from "./application/service.js";
export const { countAction, actionsToday, usageSummary } = createUsageService(usageRepository);
