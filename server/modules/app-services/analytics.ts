export { createAnalytics } from "./application/analytics.js";
import { createAnalytics } from "./application/analytics.js";
import { analyticsPorts } from "./infrastructure/analytics.js";
export const { visitorId, recordPageView, analyticsSummary } = createAnalytics(analyticsPorts);
