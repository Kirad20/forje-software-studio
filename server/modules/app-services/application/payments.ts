import type { PaymentPorts } from "../ports/payments.js";

/**
 * Stripe Checkout through the platform's own key (test mode while building). An app can
 * also bring its own key as a project secret named STRIPE_SECRET_KEY, which wins.
 */
export interface CheckoutInput {
  mode?: "payment" | "subscription";
  lineItems: { name: string; amountCents: number; currency?: string; quantity?: number; interval?: "month" | "year" }[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export function createPayments({ stripe, platformKey }: PaymentPorts) {
function paymentsFor(env: Record<string, string>) {
  const key = env.STRIPE_SECRET_KEY || platformKey();
  const need = () => {
    if (!key) throw new Error("Pagos no configurados: añade STRIPE_SECRET_KEY (clave de prueba sk_test_...) en Secretos.");
    return key;
  };
  return {
    async checkout(input: CheckoutInput): Promise<{ id: string; url: string }> {
      const form = new URLSearchParams({
        mode: input.mode ?? "payment",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
      });
      if (input.customerEmail) form.set("customer_email", input.customerEmail);
      for (const [k, v] of Object.entries(input.metadata ?? {})) form.set(`metadata[${k}]`, v);
      input.lineItems.forEach((li, i) => {
        const p = `line_items[${i}]`;
        form.set(`${p}[quantity]`, String(li.quantity ?? 1));
        form.set(`${p}[price_data][currency]`, li.currency ?? "usd");
        form.set(`${p}[price_data][unit_amount]`, String(li.amountCents));
        form.set(`${p}[price_data][product_data][name]`, li.name);
        if (li.interval) form.set(`${p}[price_data][recurring][interval]`, li.interval);
      });
      const s = await stripe(need(), "checkout/sessions", form);
      return { id: s.id as string, url: s.url as string };
    },
    async getCheckout(id: string) {
      const s = await stripe(need(), `checkout/sessions/${encodeURIComponent(id)}`, null, "GET");
      return { id, status: s.status as string, paymentStatus: s.payment_status as string, amountTotal: s.amount_total as number };
    },
    async refund(paymentIntentId: string) {
      return stripe(need(), "refunds", new URLSearchParams({ payment_intent: paymentIntentId }));
    },
  };
}
return { paymentsFor };
}
