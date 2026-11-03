import { config } from "../../../shared/config.js";
import type { PaymentPorts } from "../ports/payments.js";

export const paymentPorts: PaymentPorts = {
  platformKey: () => config.stripeKey,
  async stripe(key, path, form, method = "POST") {
    const res = await fetch(`https://api.stripe.com/v1/${path}`, {
      method, headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded" },
      body: form ?? undefined,
    });
    const data = await res.json() as Record<string, unknown>;
    if (!res.ok) throw new Error(`Stripe: ${(data.error as { message?: string })?.message ?? res.status}`);
    return data;
  },
};
