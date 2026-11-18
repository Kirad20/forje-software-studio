/**
 * A runnable architecture with forja.json components: the public app at the root, an admin
 * frontend at /admin, an orders API with hexagonal layers, its own process pool and its own
 * database schema, a billing worker with its own schema that consumes order events and answers
 * with another event, and a shared domain library. Services never touch each other's tables.
 * Deliberately public demo data: no payments, personal data or external effects.
 */
export function componentsStarterFiles(): Record<string, string> {
  return {
    "forja.json": JSON.stringify({
      version: 1,
      components: {
        admin: { kind: "web", root: "apps/admin", mount: "/admin", description: "Panel interno de pedidos" },
        orders: { kind: "api", root: "services/orders", route: "orders", replicas: 1, maxConcurrency: 8, database: true, description: "API de pedidos (DDD + hexagonal), dueña de sus tablas" },
        billing: { kind: "worker", root: "services/billing", database: true, description: "Factura los pedidos a partir de sus eventos" },
        domain: { kind: "library", root: "packages/domain", description: "Tipos y reglas compartidas" },
      },
    }, null, 2) + "\n",
    "services/orders/migrations/001_orders.sql": `-- Runs inside the orders schema: only the orders service can use these tables.
create table if not exists orders (
  id text primary key,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending', 'invoiced')),
  created_at timestamptz not null default now()
);
`,
    "services/billing/migrations/001_invoices.sql": `-- Runs inside the billing schema: billing keeps its own copy of what it needs.
create table if not exists invoices (
  order_id text primary key,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);
`,
    "packages/domain/money.ts": `/** Shared by the admin frontend and every service: amounts travel as integer cents. */
export const formatMoney = (cents: number) =>
  new Intl.NumberFormat("es", { style: "currency", currency: "EUR" }).format(cents / 100);
`,
    "packages/domain/orders.ts": `/** The public shape of an order, shared by the API and its clients. */
export interface OrderView {
  id: string;
  amountCents: number;
  status: "pending" | "invoiced";
}
`,
    "services/orders/domain/order.ts": `import type { OrderView } from "~/packages/domain/orders";

/** Pure rules: no ctx, SQL or SDK. */
export function placeOrder(id: string, amountCents: number): OrderView {
  if (!/^[A-Za-z0-9-]{1,64}$/.test(id)) throw new Error("Id de pedido no válido");
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) throw new Error("Importe inválido");
  return { id, amountCents, status: "pending" };
}
`,
    "services/orders/ports.ts": `import type { OrderView } from "~/packages/domain/orders";

export interface OrdersRepository {
  save(order: OrderView): Promise<void>;
  page(limit: number, offset: number): Promise<OrderView[]>;
  markInvoiced(id: string): Promise<void>;
}
export interface OrderEvents {
  placed(order: OrderView): Promise<void>;
}
`,
    "services/orders/application/placeOrder.ts": `import { placeOrder as newOrder } from "../domain/order";
import type { OrderEvents, OrdersRepository } from "../ports";

/** Fixed demo price computed on the server, never taken from the browser. */
const DEMO_PRICE_CENTS = 1250;

export async function placeOrder(deps: { orders: OrdersRepository; events: OrderEvents }, id: string) {
  const order = newOrder(id, DEMO_PRICE_CENTS);
  await deps.orders.save(order);
  await deps.events.placed(order);
  return order;
}
`,
    "services/orders/application/markInvoiced.ts": `import type { OrdersRepository } from "../ports";

/** Billing reports an invoice: idempotent, a repeated event changes nothing. */
export async function markInvoiced(deps: { orders: OrdersRepository }, event: { orderId: string }) {
  if (!event.orderId) throw new Error("Evento de factura no válido");
  await deps.orders.markInvoiced(event.orderId);
}
`,
    "services/orders/jobs/invoiced.ts": `import type { JobCtx } from "@forja/server";
import { markInvoiced } from "../application/markInvoiced";
import { ordersRepository } from "../infrastructure/adapters";

/** Enqueued by billing as "orders.invoiced". */
export default async function (ctx: JobCtx) {
  await markInvoiced({ orders: ordersRepository(ctx) }, ctx.payload as { orderId: string });
}
`,
    "services/orders/application/listOrders.ts": `import type { OrdersRepository } from "../ports";

export async function listOrders(deps: { orders: OrdersRepository }, page: number) {
  const size = 20;
  const offset = Math.max(0, Math.floor(page) - 1) * size;
  return { orders: await deps.orders.page(size, offset), page: Math.max(1, Math.floor(page)) };
}
`,
    "services/orders/infrastructure/adapters.ts": `import type { ServiceCtx } from "@forja/server";
import type { OrderView } from "~/packages/domain/orders";
import type { OrderEvents, OrdersRepository } from "../ports";

/** Adapters: the only place with SQL and ctx. ctx.db only sees the orders schema. */
export const ordersRepository = (ctx: ServiceCtx): OrdersRepository => ({
  async save(order) {
    await ctx.db.query("insert into orders (id, amount_cents) values ($1, $2) on conflict (id) do nothing", [order.id, order.amountCents]);
  },
  async page(limit, offset) {
    const rows = await ctx.db.query<{ id: string; amount_cents: number; status: OrderView["status"] }>(
      "select id, amount_cents, status from orders order by created_at desc limit $1 offset $2", [limit, offset]);
    return rows.map((r) => ({ id: r.id, amountCents: r.amount_cents, status: r.status }));
  },
  async markInvoiced(id) {
    await ctx.db.query("update orders set status = 'invoiced' where id = $1", [id]);
  },
});

/** Events go to the billing worker through the durable queue (at least once). */
export const orderEvents = (ctx: ServiceCtx): OrderEvents => ({
  async placed(order) {
    await ctx.jobs.enqueue("billing.invoice", { orderId: order.id, amountCents: order.amountCents });
  },
});
`,
    "services/orders/endpoints/create_POST.ts": `// forja:public — demo endpoint; add authentication before real use.
import type { Ctx } from "@forja/server";
import { z } from "zod";
import { placeOrder } from "../application/placeOrder";
import { orderEvents, ordersRepository } from "../infrastructure/adapters";

const Input = z.object({ id: z.string().min(1).max(64) });

export default async function (ctx: Ctx) {
  const { id } = Input.parse(ctx.body);
  return { order: await placeOrder({ orders: ordersRepository(ctx), events: orderEvents(ctx) }, id) };
}
`,
    "services/orders/endpoints/list_GET.ts": `// forja:public — demo endpoint; add authentication before real use.
import type { Ctx } from "@forja/server";
import { listOrders } from "../application/listOrders";
import { ordersRepository } from "../infrastructure/adapters";

export default async function (ctx: Ctx) {
  return listOrders({ orders: ordersRepository(ctx) }, Number(ctx.query.page ?? 1) || 1);
}
`,
    "services/billing/ports.ts": `export interface Invoices {
  /** Creates the invoice once; repeating it changes nothing. */
  issue(orderId: string, amountCents: number): Promise<void>;
}
export interface BillingEvents {
  /** Tells the orders service; billing never writes its tables. */
  invoiced(orderId: string): Promise<void>;
}
`,
    "services/billing/application/invoiceOrder.ts": `import type { BillingEvents, Invoices } from "../ports";

/** Idempotent: a redelivered event finds the invoice already there. */
export async function invoiceOrder(deps: { invoices: Invoices; events: BillingEvents }, event: { orderId: string; amountCents: number }) {
  if (!event.orderId || !Number.isSafeInteger(event.amountCents) || event.amountCents <= 0) throw new Error("Evento de pedido no válido");
  await deps.invoices.issue(event.orderId, event.amountCents);
  await deps.events.invoiced(event.orderId);
}
`,
    "services/billing/infrastructure/adapters.ts": `import type { JobCtx } from "@forja/server";
import type { BillingEvents, Invoices } from "../ports";

/** ctx.db only sees the billing schema. */
export const invoices = (ctx: JobCtx): Invoices => ({
  async issue(orderId, amountCents) {
    await ctx.db.query("insert into invoices (order_id, amount_cents) values ($1, $2) on conflict (order_id) do nothing", [orderId, amountCents]);
  },
});

export const billingEvents = (ctx: JobCtx): BillingEvents => ({
  async invoiced(orderId) {
    await ctx.jobs.enqueue("orders.invoiced", { orderId });
  },
});
`,
    "services/billing/jobs/invoice.ts": `import type { JobCtx } from "@forja/server";
import { invoiceOrder } from "../application/invoiceOrder";
import { billingEvents, invoices } from "../infrastructure/adapters";

export default async function (ctx: JobCtx) {
  await invoiceOrder({ invoices: invoices(ctx), events: billingEvents(ctx) }, ctx.payload as { orderId: string; amountCents: number });
}
`,
    "apps/admin/base.css": `:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --primary: #4338ca;
  --primary-text: #ffffff;
  --radius: 10px;
  --font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font); }
`,
    "apps/admin/pages/_layout.tsx": `import styles from "./_layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}><header className={styles.header}>Panel de pedidos</header><main>{children}</main></div>;
}
`,
    "apps/admin/pages/_layout.module.css": `.shell { max-width: 960px; margin: 0 auto; padding: 24px; }
.header { font-weight: 700; margin-bottom: 16px; color: var(--primary); }
`,
    "apps/admin/pages/_index.tsx": `import { OrdersPanel } from "../features/orders/OrdersPanel";

export default function AdminHome() {
  return <OrdersPanel />;
}
`,
    "apps/admin/features/orders/OrdersPanel.tsx": `import { useState } from "react";
import { api, useApi } from "@forja/client";
import type { OrderView } from "~/packages/domain/orders";
import { formatMoney } from "~/packages/domain/money";
import styles from "./OrdersPanel.module.css";

export function OrdersPanel() {
  const [page, setPage] = useState(1);
  const { data, reload } = useApi<{ orders: OrderView[]; page: number }>("orders/list", { page });
  const create = async () => {
    await api.post("orders/create", { id: crypto.randomUUID() });
    reload();
  };
  return (
    <section className={styles.panel}>
      <button className={styles.primary} onClick={create}>Crear pedido de prueba</button>
      <ul className={styles.list}>
        {data?.orders.map((o) => <li key={o.id}>{o.id.slice(0, 8)} · {formatMoney(o.amountCents)} · {o.status === "invoiced" ? "facturado" : "pendiente"}</li>)}
      </ul>
      <nav className={styles.pager} aria-label="Paginación">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
        <span>Página {page}</span>
        <button disabled={(data?.orders.length ?? 0) < 20} onClick={() => setPage(page + 1)}>Siguiente</button>
      </nav>
    </section>
  );
}
`,
    "apps/admin/features/orders/OrdersPanel.module.css": `.panel { display: grid; gap: 12px; }
.primary { justify-self: start; background: var(--primary); color: var(--primary-text); border: 0; border-radius: var(--radius); padding: 8px 14px; cursor: pointer; }
.list { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
.list li { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 12px; }
.pager { display: flex; gap: 8px; align-items: center; color: var(--muted); }
`,
  };
}
