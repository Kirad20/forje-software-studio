export { createPayments } from "./application/payments.js";
export type { CheckoutInput } from "./application/payments.js";
import { createPayments } from "./application/payments.js";
import { paymentPorts } from "./infrastructure/payments.js";
export const { paymentsFor } = createPayments(paymentPorts);
