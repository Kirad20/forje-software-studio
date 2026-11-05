export interface AiMessage {
  role: "user" | "assistant";
  content: string | any[];
}

export interface CheckoutInput {
  mode?: "payment" | "subscription";
  lineItems: { name: string; amountCents: number; currency?: string; quantity?: number; interval?: "month" | "year" }[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface Email {
  send(input: { to: string | string[]; subject: string; html: string; from?: string }): Promise<unknown>;
}
export interface Ai {
  chat(input: { messages: AiMessage[]; system?: string; model?: string; tools?: any[]; maxTokens?: number }): Promise<{ text: string; content: any[]; credits: number }>;
}
export interface Jobs {
  /** Resolves after durable acceptance, not after execution. Delivery is at least once. */
  enqueue(name: string, payload?: unknown): Promise<string>;
  run(name: string, payload?: unknown): Promise<void>;
  runAt(name: string, payload: unknown, when: Date | number): Promise<string>;
}
export interface Realtime {
  publish(channel: string, data: unknown): number;
}
export interface Payments {
  checkout(input: CheckoutInput): Promise<{ id: string; url: string }>;
  getCheckout(id: string): Promise<{ id: string; status: string; paymentStatus: string; amountTotal: number }>;
  refund(paymentIntentId: string): Promise<unknown>;
}
