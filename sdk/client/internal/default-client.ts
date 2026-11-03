import { createClient } from "../client.js";
import { base } from "./browser.js";

export const client = createClient(
  { base, fetch: (url, init) => fetch(url, init) },
  {
    url: () => `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${base()}/_baas/realtime`,
    connect: (url) => new WebSocket(url),
    schedule: (callback, delay) => setTimeout(callback, delay),
  },
);

export const { api, auth, storage, ai } = client;
export const realtime = client.realtime!;
