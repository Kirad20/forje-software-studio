import type { WebSocket } from "ws";

/**
 * Channel fan-out over WebSockets, scoped per project. Server code publishes with
 * `ctx.realtime.publish`; browsers subscribe (and may publish) through @forja/client.
 */
const rooms = new Map<string, Map<string, Set<WebSocket>>>();

const room = (projectId: string) => {
  let r = rooms.get(projectId);
  if (!r) rooms.set(projectId, (r = new Map()));
  return r;
};

export function publish(projectId: string, channel: string, data: unknown) {
  const subs = room(projectId).get(channel);
  if (!subs) return 0;
  const msg = JSON.stringify({ channel, data });
  for (const ws of subs) if (ws.readyState === 1) ws.send(msg);
  return subs.size;
}

export function attachSocket(projectId: string, ws: WebSocket) {
  const mine = new Set<string>();
  ws.on("message", (raw) => {
    let msg: { type?: string; channel?: string; data?: unknown };
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    const channel = typeof msg.channel === "string" ? msg.channel.slice(0, 200) : null;
    if (!channel) return;
    const r = room(projectId);
    if (msg.type === "subscribe") {
      if (!r.has(channel)) r.set(channel, new Set());
      r.get(channel)!.add(ws);
      mine.add(channel);
    } else if (msg.type === "unsubscribe") {
      r.get(channel)?.delete(ws);
      mine.delete(channel);
    } else if (msg.type === "publish") {
      publish(projectId, channel, msg.data);
    }
  });
  ws.on("close", () => {
    const r = room(projectId);
    for (const ch of mine) {
      r.get(ch)?.delete(ws);
      if (!r.get(ch)?.size) r.delete(ch);
    }
  });
}

export function realtimeStats(projectId: string) {
  return [...room(projectId).entries()].map(([channel, subs]) => ({ channel, subscribers: subs.size }));
}
