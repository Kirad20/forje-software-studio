export type Handler = (data: unknown) => void;

export interface RealtimeTransport {
  url(): string;
  connect(url: string): WebSocket;
  schedule(callback: () => void, delay: number): unknown;
}

export function createRealtime(transport: RealtimeTransport) {
  let socket: WebSocket | null = null;
  const channels = new Map<string, Set<Handler>>();
  function ensureSocket(): WebSocket {
    if (socket && socket.readyState <= 1) return socket;
    const ws = transport.connect(transport.url());
    socket = ws;
    ws.onopen = () => channels.forEach((_, channel) => ws.send(JSON.stringify({ type: "subscribe", channel })));
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data as string) as { channel: string; data: unknown };
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
      const isNew = set.size === 0;
      set.add(handler);
      channels.set(channel, set);
      const ws = ensureSocket();
      if (isNew && ws.readyState === 1) ws.send(JSON.stringify({ type: "subscribe", channel }));
      return () => {
        set.delete(handler);
        if (!set.size) {
          channels.delete(channel);
          if (socket?.readyState === 1) socket.send(JSON.stringify({ type: "unsubscribe", channel }));
        }
      };
    },
    publish(channel: string, data: unknown) {
      const ws = ensureSocket();
      const send = () => ws.send(JSON.stringify({ type: "publish", channel, data }));
      if (ws.readyState === 1) send();
      else ws.addEventListener("open", send, { once: true });
    },
  };
}
