export type Handler = (data: unknown) => void;

export interface RealtimeTransport {
  url(): string;
  connect(url: string): WebSocket;
  schedule(callback: () => void, delay: number): unknown;
}

export function createRealtime(transport: RealtimeTransport) {
  let socket: WebSocket | null = null;
  const channels = new Map<string, Set<Handler>>();
  const presenceChannels = new Map<string, Set<Handler>>();
  const tracked = new Map<string, unknown>();
  const isSubscribed = (channel: string) =>
    (channels.get(channel)?.size ?? 0) > 0 ||
    (presenceChannels.get(channel)?.size ?? 0) > 0 ||
    tracked.has(channel);
  const send = (message: unknown) => socket?.send(JSON.stringify(message));
  const releaseChannelIfUnused = (channel: string) => {
    if (!isSubscribed(channel) && socket?.readyState === 1) {
      send({ type: "unsubscribe", channel });
    }
  };
  function ensureSocket(): WebSocket {
    if (socket && socket.readyState <= 1) return socket;
    const ws = transport.connect(transport.url());
    socket = ws;
    ws.onopen = () => {
      const subscribed = new Set([...channels.keys(), ...presenceChannels.keys(), ...tracked.keys()]);
      for (const channel of subscribed) ws.send(JSON.stringify({ type: "subscribe", channel }));
      for (const [channel, state] of tracked) {
        ws.send(JSON.stringify({ type: "presence:join", channel, data: state }));
      }
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data as string) as { type?: string; channel: string; data: unknown };
      if (message.type === "presence") {
        presenceChannels.get(message.channel)?.forEach((handler) => handler(message));
        return;
      }
      channels.get(message.channel)?.forEach((handler) => handler(message.data));
    };
    ws.onclose = () => {
      socket = null;
      if (channels.size) transport.schedule(ensureSocket, 1000);
    };
    return ws;
  }
  return {
    subscribe(channel: string, handler: Handler) {
      const set = channels.get(channel) ?? new Set<Handler>();
      const isNew = !isSubscribed(channel);
      set.add(handler);
      channels.set(channel, set);
      const ws = ensureSocket();
      if (isNew && ws.readyState === 1) ws.send(JSON.stringify({ type: "subscribe", channel }));
      return () => {
        set.delete(handler);
        if (!set.size) {
          channels.delete(channel);
          releaseChannelIfUnused(channel);
        }
      };
    },
    publish(channel: string, data: unknown) {
      const ws = ensureSocket();
      const send = () => ws.send(JSON.stringify({ type: "publish", channel, data }));
      if (ws.readyState === 1) send();
      else ws.addEventListener("open", send, { once: true });
    },
    subscribePresence(channel: string, handler: Handler) {
      const set = presenceChannels.get(channel) ?? new Set<Handler>();
      const isNew = !isSubscribed(channel);
      set.add(handler);
      presenceChannels.set(channel, set);
      const ws = ensureSocket();
      if (isNew && ws.readyState === 1) ws.send(JSON.stringify({ type: "subscribe", channel }));
      return () => {
        set.delete(handler);
        if (!set.size) {
          presenceChannels.delete(channel);
          releaseChannelIfUnused(channel);
        }
      };
    },
    track(channel: string, state: unknown) {
      const hadState = tracked.has(channel);
      const isNew = !isSubscribed(channel);
      tracked.set(channel, state);
      const ws = ensureSocket();
      if (isNew && ws.readyState === 1) ws.send(JSON.stringify({ type: "subscribe", channel }));
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: hadState ? "presence:update" : "presence:join", channel, data: state }));
      }
      return () => {
        if (tracked.get(channel) !== state) return;
        tracked.delete(channel);
        if (socket?.readyState === 1) {
          send({ type: "presence:leave", channel });
          releaseChannelIfUnused(channel);
        }
      };
    },
  };
}
