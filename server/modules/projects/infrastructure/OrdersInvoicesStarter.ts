/** A runnable, deliberately public demo without payments, personal data or external effects. */
export function ordersInvoicesFiles(): Record<string, string> {
  return {
    "forja.services.json": JSON.stringify({
      version: 1,
      services: {
        orders: { kind: "service", endpoints: ["endpoints/orders/create_POST.ts", "endpoints/orders/status_GET.ts"], jobs: [], replicas: 2, maxConcurrency: 8 },
        invoices: { kind: "worker", endpoints: [], jobs: ["jobs/invoice.ts"], replicas: 2, maxConcurrency: 1 },
      },
    }, null, 2) + "\n",
    "helpers/orderTypes.ts": `export interface Order {
  id: string;
  amount_cents: number;
  status: "pending" | "invoiced";
}
export interface Invoice {
  order_id: string;
  amount_cents: number;
}
export interface OrderStatus { order: Order; invoice: Invoice | null }
`,
    "helpers/orders.ts": `import type { Ctx } from "@forja/server";

// Demo bootstrap only. For an existing app, apply additive schema changes with execute_sql.
export async function ensureOrdersSchema(db: Ctx["db"]) {
  await db.exec(\`
    create table if not exists orders (
      id text primary key,
      amount_cents integer not null check (amount_cents > 0),
      status text not null default 'pending' check (status in ('pending', 'invoiced')),
      created_at timestamptz not null default now()
    );
    create table if not exists invoices (
      order_id text primary key references orders(id) on delete cascade,
      amount_cents integer not null check (amount_cents > 0),
      created_at timestamptz not null default now()
    );
  \`);
}
`,
    "endpoints/orders/create_POST.ts": `// forja:public — non-personal demo orders; add authentication and quotas before production.
import { z } from "zod";
import type { Ctx } from "@forja/server";
import { ensureOrdersSchema } from "../../helpers/orders";
const Input = z.object({ orderId: z.string().uuid() }).strict();

export default async function createOrder(ctx: Ctx) {
  const { orderId } = Input.parse(ctx.body);
  await ensureOrdersSchema(ctx.db);
  // Client retries reuse the same ID; prices always come from the server.
  await ctx.db.one(
    "insert into orders (id, amount_cents) values ($1, $2) on conflict (id) do nothing returning id",
    [orderId, 2500],
  );
  // Durable acceptance is not invoice completion. Duplicate delivery is safe.
  const queueId = await ctx.jobs.enqueue("invoice", { orderId });
  return { orderId, queueId };
}
`,
    "endpoints/orders/status_GET.ts": `// forja:public — demo status is public; never put personal data in these rows.
import { z } from "zod";
import type { Ctx } from "@forja/server";
import type { Order, Invoice, OrderStatus } from "../../helpers/orderTypes";
import { ensureOrdersSchema } from "../../helpers/orders";
const Input = z.object({ orderId: z.string().uuid() });

export default async function orderStatus(ctx: Ctx): Promise<OrderStatus> {
  const { orderId } = Input.parse(ctx.query);
  await ensureOrdersSchema(ctx.db);
  const order = await ctx.db.one<Order>("select id, amount_cents, status from orders where id = $1", [orderId]);
  if (!order) return ctx.fail(404, "Pedido no encontrado");
  const invoice = await ctx.db.one<Invoice>("select order_id, amount_cents from invoices where order_id = $1", [orderId]);
  return { order, invoice: invoice ?? null };
}
`,
    "jobs/invoice.ts": `import { z } from "zod";
import type { JobCtx } from "@forja/server";
import type { Order } from "../helpers/orderTypes";
const Input = z.object({ orderId: z.string().uuid() }).strict();

export default async function invoiceOrder(ctx: JobCtx) {
  const { orderId } = Input.parse(ctx.payload);
  await ctx.db.transaction(async (tx) => {
    const order = await tx.one<Order>("select id, amount_cents, status from orders where id = $1 for update", [orderId]);
    if (!order) throw new Error("Pedido no encontrado");
    await tx.query(
      "insert into invoices (order_id, amount_cents) values ($1, $2) on conflict (order_id) do nothing",
      [order.id, order.amount_cents],
    );
    await tx.query("update orders set status = 'invoiced' where id = $1", [order.id]);
  });
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
orders sirve POST orders/create y GET orders/status; invoices ejecuta jobs/invoice.ts.
Ambos usan la misma base de datos del proyecto administrada por app-runtime.
El precio fijo es 2500 centavos; no hay cobros ni datos personales.
La API devuelve queueId tras aceptación durable, no tras finalizar el worker.
El worker bloquea el pedido y guarda factura + estado en una transacción; invoices.order_id es único.
Reintentar el pedido con el mismo UUID recupera una aceptación fallida; nunca resetea una factura.
No hay atomicidad entre insertar el pedido y encolar: para producción, añadir outbox/reconciliación.
El esquema se inicializa con CREATE TABLE IF NOT EXISTS solo para esta demo nueva.
Al adaptar una app existente, inspeccionar tablas y aplicar migraciones aditivas con execute_sql.
Antes de producción: autenticación, autorización por propietario, cuotas y manejo de trabajos agotados.
`,
  };
}
