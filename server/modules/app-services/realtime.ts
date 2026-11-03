export { createRealtime } from "./application/realtime.js";
export type { RealtimeSocket } from "./ports/realtime.js";
import { createRealtime } from "./application/realtime.js";
export const { publish, attachSocket, realtimeStats, stopRealtime } = createRealtime();
