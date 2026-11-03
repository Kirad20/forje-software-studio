import { createHash } from "node:crypto";
import { config } from "../../../shared/config.js";
import { platformRepository } from "./repositories.js";
import type { AnalyticsPorts } from "../ports/analytics.js";
export const analyticsPorts: AnalyticsPorts = {
  q: platformRepository.q, now: () => new Date(), salt: () => config.secretsKey,
  hash: (value) => createHash("sha256").update(value).digest("hex"),
};
