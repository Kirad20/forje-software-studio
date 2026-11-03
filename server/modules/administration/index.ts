import { Hono } from "hono";
import type { PublicAccount } from "../identity/index.js";

export type AdministrationEnv = { Variables: { account: PublicAccount } };

export interface AdministrationRouteGroups {
  accounts: Hono<AdministrationEnv>;
  settings: Hono<AdministrationEnv>;
  models: Hono<AdministrationEnv>;
  agents: Hono<AdministrationEnv>;
  router: Hono<AdministrationEnv>;
}

export function createAdministrationApi(groups: AdministrationRouteGroups): Hono<AdministrationEnv> {
  const api = new Hono<AdministrationEnv>();
  api.route("/", groups.accounts);
  api.route("/", groups.settings);
  api.route("/", groups.models);
  api.route("/", groups.agents);
  api.route("/", groups.router);
  return api;
}
