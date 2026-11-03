import type { RealtimeSocket } from "../ports/realtime.js";

/**
 * Channel fan-out over WebSockets, scoped per project. Server code publishes with
 * `ctx.realtime.publish`; browsers subscribe (and may publish) through @forja/client.
 */
export function createRealtime() {
const rooms = new Map<string, Map<string, Set<RealtimeSocket>>>();
const attachments = new Map<RealtimeSocket, () => void>();

const room = (projectId: string) => {
  let r = rooms.get(projectId);
  if (!r) rooms.set(projectId, (r = new Map()));
  return r;
};

function publish(projectId: string, channel: string, data: unknown) {
  const subs = room(projectId).get(channel);
  if (!subs) return 0;
  const msg = JSON.stringify({ channel, data });
  for (const ws of subs) if (ws.readyState === 1) ws.send(msg);
  return subs.size;
}

function attachSocket(projectId: string, ws: RealtimeSocket) {
  attachments.get(ws)?.();
  const mine = new Set<string>();
  const onMessage = (raw: unknown) => {
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
  };
  const dispose = () => {
    const r = room(projectId);
    for (const ch of mine) {
      r.get(ch)?.delete(ws);
      if (!r.get(ch)?.size) r.delete(ch);
    }
    if (!r.size) rooms.delete(projectId);
    ws.off?.("message", onMessage);
    ws.off?.("close", dispose);
    attachments.delete(ws);
  };
  attachments.set(ws, dispose);
  ws.on("message", onMessage);
  ws.on("close", dispose);
  return dispose;
}

function realtimeStats(projectId: string) {
  return [...room(projectId).entries()].map(([channel, subs]) => ({ channel, subscribers: subs.size }));
}
function stopRealtime() {
  for (const dispose of [...attachments.values()]) dispose();
  rooms.clear();
}
return { publish, attachSocket, realtimeStats, stopRealtime };
}
