import type { Http } from "./transport.js";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function createAi(http: Http) {
  return {
    chat: (input: { messages: ChatMessage[]; system?: string; model?: string }) =>
      http.request<{ text: string; credits: number }>("POST", http.baas("ai/chat"), input),
  };
}
