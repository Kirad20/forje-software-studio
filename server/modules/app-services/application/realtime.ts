import type { RealtimeSocket } from "../ports/realtime.js";

/**
 * Channel fan-out over WebSockets, scoped per project. Server code publishes with
 * `ctx.realtime.publish`; browsers subscribe (and may publish) through @forja/client.
 */
export interface RealtimeLimits {
  maxConnectionsPerProject: number;
  maxChannelsPerSocket: number;
  maxMessageBytes: number;
}

const DEFAULT_LIMITS: RealtimeLimits = {
  maxConnectionsPerProject: 250,
  maxChannelsPerSocket: 50,
  maxMessageBytes: 64 * 1024,
};

export function createRealtime(limits: RealtimeLimits = DEFAULT_LIMITS) {
const maxPresenceStateBytes = Math.min(512, Math.max(1, Math.floor(limits.maxMessageBytes / 8)));
const maxPresencePerChannel = Math.max(1, Math.min(25, Math.floor(limits.maxMessageBytes / (maxPresenceStateBytes + 128))));
const rooms = new Map<string, Map<string, Set<RealtimeSocket>>>();
const attachments = new Map<RealtimeSocket, () => void>();
const connections = new Map<string, number>();
const presences = new Map<string, Map<string, Map<RealtimeSocket, { clientId: string; state: unknown }>>>();

const room = (projectId: string) => {
  let r = rooms.get(projectId);
  if (!r) rooms.set(projectId, (r = new Map()));
  return r;
};

function publish(projectId: string, channel: string, data: unknown) {
  if (!channel || channel.length > 200) throw new Error("Canal realtime no válido");
  const msg = JSON.stringify({ channel, data });
  if (new TextEncoder().encode(msg).byteLength > limits.maxMessageBytes) throw new Error("Mensaje realtime demasiado grande");
  const subs = rooms.get(projectId)?.get(channel);
  if (!subs) return 0;
  let delivered = 0;
  for (const ws of subs) {
    if (ws.readyState !== 1) continue;
    ws.send(msg);
    delivered++;
  }
  return delivered;
}

function publishPresence(projectId: string, channel: string, event: Record<string, unknown>) {
  const message = JSON.stringify({ type: "presence", channel, ...event });
  for (const ws of rooms.get(projectId)?.get(channel) ?? []) {
    if (ws.readyState === 1) ws.send(message);
  }
}

function attachSocket(projectId: string, ws: RealtimeSocket) {
  attachments.get(ws)?.();
  if ((connections.get(projectId) ?? 0) >= limits.maxConnectionsPerProject) {
    ws.close?.(1013, "Límite de conexiones realtime alcanzado");
    return false;
  }
  const mine = new Set<string>();
  const clientId = globalThis.crypto.randomUUID();
  connections.set(projectId, (connections.get(projectId) ?? 0) + 1);
  const sendError = (error: string) => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: "error", error }));
  };
  const onMessage = (raw: unknown) => {
    const text = String(raw);
    if (new TextEncoder().encode(text).byteLength > limits.maxMessageBytes) {
      sendError("Mensaje realtime demasiado grande");
      return;
    }
    let msg: { type?: string; channel?: string; data?: unknown };
    try {
      msg = JSON.parse(text);
    } catch {
      return;
    }
    const channel = typeof msg.channel === "string" && msg.channel.length <= 200 ? msg.channel : null;
    if (!channel) {
      sendError("Canal realtime no válido");
      return;
    }
    if (!["subscribe", "unsubscribe", "publish", "presence:join", "presence:update", "presence:leave"].includes(msg.type ?? "")) return;
    const r = room(projectId);
    if (msg.type === "subscribe") {
      if (!mine.has(channel) && mine.size >= limits.maxChannelsPerSocket) {
        sendError("Se alcanzó el límite de canales por conexión");
        return;
      }
      if (!r.has(channel)) r.set(channel, new Set());
      r.get(channel)!.add(ws);
      mine.add(channel);
      const current = presences.get(projectId)?.get(channel);
      if (current?.size) {
        ws.send(JSON.stringify({
          type: "presence", channel, action: "sync",
          clients: [...current.values()],
        }));
      }
    } else if (msg.type === "unsubscribe") {
      const current = presences.get(projectId)?.get(channel);
      const state = current?.get(ws);
      if (state) {
        current!.delete(ws);
        publishPresence(projectId, channel, { action: "leave", clientId });
        if (!current!.size) presences.get(projectId)?.delete(channel);
      }
      r.get(channel)?.delete(ws);
      mine.delete(channel);
    } else if (msg.type === "presence:join" || msg.type === "presence:update" || msg.type === "presence:leave") {
      if (!mine.has(channel)) {
        sendError("Suscríbete al canal antes de publicar presencia");
        return;
      }
      let projectPresence = presences.get(projectId);
      if (!projectPresence) presences.set(projectId, (projectPresence = new Map()));
      let current = projectPresence.get(channel);
      if (!current) projectPresence.set(channel, (current = new Map()));
      if (msg.type === "presence:leave") {
        if (current.delete(ws)) publishPresence(projectId, channel, { action: "leave", clientId });
        if (!current.size) projectPresence.delete(channel);
      } else {
        const action = current.has(ws) ? "update" : "join";
        if (msg.type === "presence:update" && action === "join") {
          sendError("No hay una presencia activa en este canal");
          return;
        }
        const state = msg.data ?? null;
        if (new TextEncoder().encode(JSON.stringify(state)).byteLength > maxPresenceStateBytes) {
          sendError("El estado de presencia supera el tamaño permitido");
          return;
        }
        if (action === "join" && current.size >= maxPresencePerChannel) {
          sendError("Se alcanzó el límite de presencia del canal");
          return;
        }
        current.set(ws, { clientId, state });
        publishPresence(projectId, channel, { action, clientId, state });
      }
    } else if (msg.type === "publish") {
      try {
        publish(projectId, channel, msg.data);
      } catch (error) {
        sendError((error as Error).message);
      }
    }
  };
  const dispose = () => {
    if (!attachments.has(ws)) return;
    const r = room(projectId);
    for (const ch of mine) {
      const current = presences.get(projectId)?.get(ch);
      if (current?.delete(ws)) {
        publishPresence(projectId, ch, { action: "leave", clientId });
        if (!current.size) presences.get(projectId)?.delete(ch);
      }
      r.get(ch)?.delete(ws);
      if (!r.get(ch)?.size) r.delete(ch);
    }
    if (!presences.get(projectId)?.size) presences.delete(projectId);
    if (!r.size) rooms.delete(projectId);
    const count = (connections.get(projectId) ?? 1) - 1;
    if (count > 0) connections.set(projectId, count);
    else connections.delete(projectId);
    ws.off?.("message", onMessage);
    ws.off?.("close", dispose);
    attachments.delete(ws);
  };
  attachments.set(ws, dispose);
  ws.on("message", onMessage);
  ws.on("close", dispose);
  return true;
}

function realtimeStats(projectId: string) {
  return [...(rooms.get(projectId)?.entries() ?? [])].map(([channel, subs]) => ({ channel, subscribers: subs.size }));
}
function stopRealtime() {
  for (const dispose of [...attachments.values()]) dispose();
  rooms.clear();
  connections.clear();
  presences.clear();
}
return { publish, attachSocket, realtimeStats, stopRealtime };
}
