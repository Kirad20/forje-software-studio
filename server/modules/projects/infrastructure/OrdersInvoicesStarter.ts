/** A runnable, deliberately public demo without payments, personal data or external effects. */
export function ordersInvoicesFiles(): Record<string, string> {
  return {
    "forja.services.json": JSON.stringify({
      version: 1,
      services: {
        orders: { kind: "service", endpoints: ["endpoints/orders/create_POST.ts", "endpoints/orders/status_GET.ts"], jobs: ["jobs/order-invoiced.ts"], replicas: 2, maxConcurrency: 8 },
        invoices: { kind: "worker", endpoints: [], jobs: ["jobs/invoice.ts"], replicas: 2, maxConcurrency: 1 },
      },
    }, null, 2) + "\n",
    "helpers/orders/domain.ts": `export interface Order {
  id: string;
  amount_cents: number;
  status: "pending" | "invoiced";
  invoice_amount_cents: number | null;
}
export interface Invoice {
  order_id: string;
  amount_cents: number;
}
export interface OrderStatus { order: Order; invoice: Invoice | null }
export function pendingOrder(id: string, amountCents: number): Order {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) throw new Error("Importe inválido");
  return { id, amount_cents: amountCents, status: "pending", invoice_amount_cents: null };
}
export function invoiceFor(order: Order): Invoice | null {
  return order.status === "invoiced" && order.invoice_amount_cents !== null
    ? { order_id: order.id, amount_cents: order.invoice_amount_cents }
    : null;
}
`,
    "helpers/orderTypes.ts": `export type { Invoice, Order, OrderStatus } from "./orders/domain";
`,
    "helpers/orders/ports.ts": `import type { Order } from "./domain";
export interface OrderRepository {
  createIfAbsent(order: Order): Promise<void>;
  findById(id: string): Promise<Order | undefined>;
  markInvoiced(id: string, amountCents: number): Promise<boolean>;
}
export interface JobQueue {
  enqueue(name: string, payload: unknown): Promise<string>;
}
`,
    "helpers/orders/application.ts": `import { invoiceFor, pendingOrder, type OrderStatus } from "./domain";
import type { JobQueue, OrderRepository } from "./ports";
export async function createOrder(orders: OrderRepository, jobs: JobQueue, orderId: string) {
  const order = pendingOrder(orderId, 2500);
  await orders.createIfAbsent(order);
  const queueId = await jobs.enqueue("invoice", { orderId, amountCents: order.amount_cents });
  return { orderId, queueId };
}
export async function getOrderStatus(orders: OrderRepository, orderId: string): Promise<OrderStatus | undefined> {
  const order = await orders.findById(orderId);
  return order ? { order, invoice: invoiceFor(order) } : undefined;
}
export async function markOrderInvoiced(orders: OrderRepository, orderId: string, amountCents: number) {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) throw new Error("Importe inválido");
  if (!await orders.markInvoiced(orderId, amountCents)) throw new Error("Pedido no encontrado");
}
`,
    "helpers/orders/adapters.ts": `import type { Ctx } from "@forja/server";
import type { Order } from "./domain";
import type { OrderRepository } from "./ports";

async function ensureOrdersSchema(db: Ctx["db"]) {
  await db.exec(\`
    create table if not exists orders (
      id text primary key,
      amount_cents integer not null check (amount_cents > 0),
      status text not null default 'pending' check (status in ('pending', 'invoiced')),
      invoice_amount_cents integer check (invoice_amount_cents > 0),
      created_at timestamptz not null default now()
    );
  \`);
}
export function postgresOrders(db: Ctx["db"]): OrderRepository {
  return {
    async createIfAbsent(order) {
      await ensureOrdersSchema(db);
      await db.query("insert into orders (id, amount_cents) values ($1, $2) on conflict (id) do nothing", [order.id, order.amount_cents]);
    },
    async findById(id) {
      await ensureOrdersSchema(db);
      return db.one<Order>("select id, amount_cents, status, invoice_amount_cents from orders where id = $1", [id]);
    },
    async markInvoiced(id, amountCents) {
      await ensureOrdersSchema(db);
      return Boolean(await db.one<{ id: string }>(
        "update orders set status = 'invoiced', invoice_amount_cents = $2 where id = $1 returning id",
        [id, amountCents],
      ));
    },
  };
}
`,
    "helpers/invoices/domain.ts": `export interface Invoice { order_id: string; amount_cents: number }
export function invoice(orderId: string, amountCents: number): Invoice {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) throw new Error("Importe inválido");
  return { order_id: orderId, amount_cents: amountCents };
}
`,
    "helpers/invoices/ports.ts": `import type { Invoice } from "./domain";
export interface InvoiceRepository { saveIfAbsent(value: Invoice): Promise<void> }
export interface OrderEvents { enqueue(name: string, payload: unknown): Promise<string> }
`,
    "helpers/invoices/application.ts": `import { invoice } from "./domain";
import type { InvoiceRepository, OrderEvents } from "./ports";
export async function issueInvoice(invoices: InvoiceRepository, events: OrderEvents, orderId: string, amountCents: number) {
  const value = invoice(orderId, amountCents);
  await invoices.saveIfAbsent(value);
  await events.enqueue("order-invoiced", { orderId, amountCents: value.amount_cents });
}
`,
    "helpers/invoices/adapters.ts": `import type { Ctx } from "@forja/server";
import type { Invoice } from "./domain";
import type { InvoiceRepository } from "./ports";
async function ensureInvoicesSchema(db: Ctx["db"]) {
  await db.exec(\`
    create table if not exists invoices (
      order_id text primary key,
      amount_cents integer not null check (amount_cents > 0),
      created_at timestamptz not null default now()
    );
  \`);
}
export function postgresInvoices(db: Ctx["db"]): InvoiceRepository {
  return {
    async saveIfAbsent(value) {
      await ensureInvoicesSchema(db);
      await db.query("insert into invoices (order_id, amount_cents) values ($1, $2) on conflict (order_id) do nothing", [value.order_id, value.amount_cents]);
    },
  };
}
`,
    "endpoints/orders/create_POST.ts": `// forja:public — non-personal demo orders; add authentication and quotas before production.
import { z } from "zod";
import type { Ctx } from "@forja/server";
import { createOrder as createOrderUseCase } from "../../helpers/orders/application";
import { postgresOrders } from "../../helpers/orders/adapters";
const Input = z.object({ orderId: z.string().uuid() }).strict();

export default async function createOrder(ctx: Ctx) {
  const { orderId } = Input.parse(ctx.body);
  return createOrderUseCase(postgresOrders(ctx.db), ctx.jobs, orderId);
}
`,
    "endpoints/orders/status_GET.ts": `// forja:public — demo status is public; never put personal data in these rows.
import { z } from "zod";
import type { Ctx } from "@forja/server";
import { getOrderStatus } from "../../helpers/orders/application";
import { postgresOrders } from "../../helpers/orders/adapters";
const Input = z.object({ orderId: z.string().uuid() });

export default async function orderStatus(ctx: Ctx) {
  const { orderId } = Input.parse(ctx.query);
  const status = await getOrderStatus(postgresOrders(ctx.db), orderId);
  if (!status) return ctx.fail(404, "Pedido no encontrado");
  return status;
}
`,
    "jobs/invoice.ts": `import { z } from "zod";
import type { JobCtx } from "@forja/server";
import { issueInvoice } from "../helpers/invoices/application";
import { postgresInvoices } from "../helpers/invoices/adapters";
const Input = z.object({ orderId: z.string().uuid() }).strict();

export default async function invoiceOrder(ctx: JobCtx) {
  const { orderId, amountCents } = Input.extend({ amountCents: z.number().int().positive() }).strict().parse(ctx.payload);
  await issueInvoice(postgresInvoices(ctx.db), ctx.jobs, orderId, amountCents);
}
`,
    "jobs/order-invoiced.ts": `import { z } from "zod";
import type { JobCtx } from "@forja/server";
import { markOrderInvoiced } from "../helpers/orders/application";
import { postgresOrders } from "../helpers/orders/adapters";
const Input = z.object({ orderId: z.string().uuid(), amountCents: z.number().int().positive() }).strict();

export default async function orderInvoiced(ctx: JobCtx) {
  const { orderId, amountCents } = Input.parse(ctx.payload);
  await markOrderInvoiced(postgresOrders(ctx.db), orderId, amountCents);
}
`,
    "pages/_index.tsx": `import { useEffect, useState } from "react";
import { api } from "@forja/client";
import type { OrderStatus } from "../helpers/orderTypes";
import styles from "./_index.module.css";

export default function Home() {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [queueId, setQueueId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId || !queueId || status?.order.status === "invoiced") return;
    let active = true;
    const poll = async () => {
      try {
        const next = await api.get<OrderStatus>("orders/status", { orderId });
        if (active) { setStatus(next); setError(""); }
      } catch (err) {
        if (active) setError((err as Error).message);
      }
    };
    void poll();
    const timer = setInterval(() => void poll(), 2000);
    return () => { active = false; clearInterval(timer); };
  }, [orderId, queueId, status?.order.status]);

  const create = async () => {
    const id = orderId || crypto.randomUUID();
    setOrderId(id);
    setBusy(true);
    setError("");
    try {
      const accepted = await api.post<{ orderId: string; queueId: string }>("orders/create", { orderId: id });
      setQueueId(accepted.queueId);
    } catch (err) {
      setError((err as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <span className={styles.badge}>Pedidos → worker de facturas</span>
        <h1>Una app, dos servicios</h1>
        <p>Pedido de demostración: $25.00. La API acepta el trabajo y un worker guarda la factura después.</p>
        {!queueId && <button disabled={busy} onClick={() => void create()}>{busy ? "Enviando…" : orderId ? "Reintentar el mismo pedido" : "Crear pedido"}</button>}
        {queueId && <p role="status">{status?.order.status === "invoiced" ? "Factura guardada" : "Pedido aceptado; esperando al worker…"}</p>}
        {status?.invoice && <p>Factura: {status.invoice.order_id} · {new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(status.invoice.amount_cents / 100)}</p>}
        {queueId && <p>Cola: {queueId}</p>}
        {error && <p role="alert">{error}</p>}
        {status?.invoice && <button onClick={() => { setOrderId(""); setQueueId(""); setStatus(null); }}>Otro pedido</button>}
        <p>Ejemplo público sin pagos ni datos personales. En modo externo debe estar activo el worker.</p>
      </section>
    </main>
  );
}
`,
    "static/__dev/architecture.md": `# Pedidos y facturas

Creado con template: orders-invoices. No reemplazar con un monolito en el primer turno.
orders sirve POST orders/create, GET orders/status y jobs/order-invoiced.ts;
invoices ejecuta jobs/invoice.ts. Cada contexto posee sus tablas por convención,
pero ambos usan la base de datos compartida del proyecto.
Los límites hexagonales están en helpers/orders/ y helpers/invoices/: dominio,
aplicación, puertos y adaptadores; endpoints/jobs son los adaptadores de entrada.
El precio fijo es 2500 centavos; no hay cobros ni datos personales.
La API devuelve queueId tras aceptación durable, no tras finalizar el worker.
El worker guarda la factura de forma idempotente y encola order-invoiced; el
servicio orders es el único que cambia el estado del pedido.
Reintentar el pedido con el mismo UUID recupera una aceptación fallida; nunca resetea una factura.
Cada escritura y su evento posterior no son atómicos: para producción, añadir outbox/reconciliación.
El esquema se inicializa con CREATE TABLE IF NOT EXISTS solo para esta demo nueva.
Al adaptar una app existente, inspeccionar tablas y aplicar migraciones aditivas con execute_sql.
Antes de producción: autenticación, autorización por propietario, cuotas y manejo de trabajos agotados.
`,
  };
}
