export interface RealtimeSocket {
  readyState: number;
  send(message: string): void;
  close?(code?: number, reason?: string): void;
  on(event: "message" | "close", listener: (raw: unknown) => void): unknown;
  off?(event: "message" | "close", listener: (raw: unknown) => void): unknown;
}
