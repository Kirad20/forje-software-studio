/**
 * Skills that ship with Forja: focused how-tos an agent loads only when the job calls for
 * them (load_skill), instead of every prompt carrying every topic. Each one is written
 * against the exact libraries and versions of the kit, because models know older APIs.
 *
 * Code samples avoid backticks and ${} so they can live in plain template strings; the
 * samples are compiled in test/unit/skills.test.ts, so they cannot drift from the kit.
 */
export interface Skill {
  name: string;
  /** One line shown in every prompt: it decides whether the agent loads the skill. */
  description: string;
  body: string;
}

export const BUILTIN_SKILLS: Skill[] = [
  {
    name: "forms",
    description: "Forms with several fields, validation and a submit state (react-hook-form with the contract's zod schema)",
    body: `Install once: add_dependency react-hook-form and @hookform/resolvers.
- Validate with the same zod schema the endpoint parses (contract["POST x/y"].input from helpers/contract.ts): the form and the server can never disagree.
- Use Input, Textarea and Select from @forja/ui with label and error; they forward refs, so register() works on them.
- Disable the submit with loading while it runs, report success and failure with toast, reset the form after success.

  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";
  import { api } from "@forja/client";
  import { Button, Input, toast } from "@forja/ui";

  const Schema = z.object({ title: z.string().trim().min(1, "Escribe un título").max(200) });
  type Values = z.infer<typeof Schema>;

  export function NoteForm({ onCreated }: { onCreated: () => void }) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(Schema) });
    const submit = handleSubmit(async (values) => {
      try {
        await api.post("notes/create", values);
        toast.success("Nota creada");
        reset();
        onCreated();
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
    return (
      <form onSubmit={submit} noValidate>
        <Input label="Título" error={errors.title?.message} {...register("title")} />
        <Button type="submit" loading={isSubmitting}>Guardar</Button>
      </form>
    );
  }

With a contract, call the typed client (helpers/api.ts) instead of api.post.`,
  },
  {
    name: "charts",
    description: "Charts and dashboards (recharts): bars, lines, areas, pies, with tokens, empty state and accessible labels",
    body: `Install once: add_dependency recharts (version 3).
- Colors come from the tokens: stroke="var(--primary)", fill="var(--primary)", axes and grid with var(--muted) and var(--border). Never hex colors: dark mode would break.
- Always wrap in ResponsiveContainer with a fixed height, give the chart role="img" and an aria-label, and show an EmptyState when there is no data.
- Aggregate in the endpoint (group by day in SQL), not in the browser: send a few dozen points, never thousands.

  import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
  import { EmptyState } from "@forja/ui";

  type Point = { day: string; total: number };

  export function SalesChart({ data }: { data: Point[] }) {
    if (!data.length) return <EmptyState title="Sin ventas todavía" description="Cuando registres la primera venta aparecerá aquí." />;
    return (
      <div role="img" aria-label="Ventas por día">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--muted)" tickLine={false} />
            <YAxis stroke="var(--muted)" tickLine={false} width={48} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }} />
            <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

For several series use one token per series (--primary, --success, --danger) and a legend; do not rely on color alone.`,
  },
  {
    name: "data-tables",
    description: "Sortable, filterable, paginated tables (@tanstack/react-table v8) with loading and empty states",
    body: `Install once: add_dependency @tanstack/react-table (version 8: useReactTable, flexRender).
- Under about 200 rows sort and filter in the browser. Beyond that paginate in the endpoint (limit and offset validated with zod, a fixed allow-list for the sort column) and keep the table in manual mode.
- Header cells are buttons, so sorting works from the keyboard. Show Skeleton rows while loading and EmptyState when there are no rows.

  import { useState } from "react";
  import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";

  type Row = { id: number; name: string; stock: number };
  const columns: ColumnDef<Row>[] = [
    { accessorKey: "name", header: "Producto" },
    { accessorKey: "stock", header: "Stock" },
  ];

  export function ProductsTable({ rows }: { rows: Row[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const table = useReactTable({ data: rows, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
    return (
      <table>
        <thead>
          {table.getHeaderGroups().map((g) => (
            <tr key={g.id}>
              {g.headers.map((h) => (
                <th key={h.id} aria-sort={h.column.getIsSorted() === "asc" ? "ascending" : h.column.getIsSorted() === "desc" ? "descending" : "none"}>
                  <button type="button" onClick={h.column.getToggleSortingHandler()}>{flexRender(h.column.columnDef.header, h.getContext())}</button>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => (
            <tr key={r.id}>
              {r.getVisibleCells().map((c) => (
                <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

Style the table in a CSS Module with tokens; wrap it in an overflow-x: auto container so it works at 375 px.`,
  },
  {
    name: "drag-and-drop",
    description: "Reorderable lists and drag and drop (@dnd-kit) with keyboard support and persisted order",
    body: `Install once: add_dependency @dnd-kit/core, @dnd-kit/sortable and @dnd-kit/utilities.
- Keep the order in the database (a position column) and save it with one POST that receives the ids in order; update the screen first and roll back with a toast if the call fails.
- Always add the keyboard sensor so the list can be reordered without a mouse.

  import { useState } from "react";
  import { api } from "@forja/client";
  import { toast } from "@forja/ui";
  import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
  import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
  import { CSS } from "@dnd-kit/utilities";

  type Item = { id: number; label: string };

  function Row({ item }: { item: Item }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    return (
      <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
        {item.label}
      </li>
    );
  }

  export function SortableList({ initial }: { initial: Item[] }) {
    const [items, setItems] = useState(initial);
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const onDragEnd = ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      const next = arrayMove(items, items.findIndex((i) => i.id === active.id), items.findIndex((i) => i.id === over.id));
      const before = items;
      setItems(next);
      api.post("tasks/reorder", { ids: next.map((i) => i.id) }).catch(() => {
        setItems(before);
        toast.error("No se pudo guardar el orden");
      });
    };
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul>{items.map((i) => <Row key={i.id} item={i} />)}</ul>
        </SortableContext>
      </DndContext>
    );
  }`,
  },
  {
    name: "animations",
    description: "Motion that helps (motion/react): entering and leaving lists, page transitions, reduced motion",
    body: `motion and FadeIn come with Forja (no install). Rules: animate only opacity and transform, 150-300 ms, nothing decorative on data-heavy screens, and honor prefers-reduced-motion.
- One-off entrance: <FadeIn> from @forja/ui.
- Items that appear and disappear (a list, a toast-like banner): AnimatePresence plus motion elements with initial, animate and exit; give each a stable key.
- Reorders: add the layout prop to the motion element.

  import { AnimatePresence, motion, useReducedMotion } from "motion/react";

  export function AnimatedList({ items }: { items: { id: number; label: string }[] }) {
    const reduce = useReducedMotion();
    return (
      <ul>
        <AnimatePresence initial={false}>
          {items.map((i) => (
            <motion.li
              key={i.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {i.label}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    );
  }`,
  },
  {
    name: "payments",
    description: "Charging with Stripe Checkout: amounts computed on the server, pending orders, confirmation",
    body: `Needs the secret STRIPE_SECRET_KEY: call request_secret and tell the owner to fill it in the Secrets tab. Never ask for it in chat.
- ctx.payments.checkout({ lineItems: [{ name, amountCents, currency?, quantity?, interval? }], successUrl, cancelUrl, mode? }) returns { url }; ctx.payments.getCheckout(id) reads a session back.
- The endpoint takes only ids (product, plan, quantity), signs in the user with ctx.requireUser(), loads the price from your own table and builds the line items from it. The amount NEVER comes from the request (security_scan flags it).
- Order flow: insert an orders row with status 'pending' first (user_id, amount_cents, currency), then create the checkout and return the url; the page does window.location.href = url.
- Confirm on the success page: read the session with getCheckout, and only then mark the order 'paid' (idempotent: update ... where id = $1 and status = 'pending'). Check the exact shape getCheckout returns with call_endpoint before relying on its fields.
- Money is integer cents everywhere; format with Intl.NumberFormat only for display.`,
  },
  {
    name: "email",
    description: "Sending email from endpoints and jobs: confirmations, reminders, limits, safe HTML",
    body: `- ctx.email.send({ to, subject, html, from? }). Until the owner verifies a sending domain, mail to anyone but the owner is redirected to the owner: tell them so in your summary.
- Sending is rate-sensitive: do it behind sign-in and keep a per-user counter in the database (for example an email_log table with user_id and created_at; refuse over a sensible daily number).
- Never put raw user text into html: escape it, or send plain text inside a <p>.
- Reminders: ctx.jobs.runAt("send-reminder", { id }, whenOrDelayMs) works from 1 minute to 7 days ahead; for recurring mail use a job with a cron schedule. Runs are not retried, so record 'sent_at' and skip rows that already have it.
- Keep the template in a helper (helpers/emails.ts) that returns { subject, html } and cover it with a spec.

  import type { Ctx } from "@forja/server";
  export default async function handler(ctx: Ctx) {
    const user = ctx.requireUser();
    await ctx.email.send({ to: user.email, subject: "Tu cita está confirmada", html: "<p>Te esperamos.</p>" });
    return { ok: true };
  }`,
  },
  {
    name: "file-uploads",
    description: "Uploading and showing files and images: limits, validation, storage keys",
    body: `- Browser: storage.upload(file) from @forja/client returns { key, url, filename, size, contentType }; keep the key (and url) in your table, never the file itself.
- Validate before uploading: accept="image/*" or an explicit list, a size limit (for example 5 MB) and a visible error with ErrorState-style text; show a preview with the returned url.
- Server side, ctx.storage.put(data, { filename, contentType }) / get / delete / list / url. Check the content type against an allow-list and the size against a limit, and never use the client's filename as a path.
- Private files: store the key and serve them through an endpoint that checks ownership (where id = $1 and user_id = $2) instead of exposing the url.

  import { useRef, useState } from "react";
  import { storage } from "@forja/client";
  import { Button, toast } from "@forja/ui";

  export function AvatarUpload({ onUploaded }: { onUploaded: (key: string, url: string) => void }) {
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const pick = async (file: File | undefined) => {
      if (!file) return;
      if (file.size > 5_000_000) {
        toast.error("La imagen pesa más de 5 MB");
        return;
      }
      setBusy(true);
      try {
        const up = await storage.upload(file);
        onUploaded(up.key, up.url);
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setBusy(false);
      }
    };
    return (
      <>
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => void pick(e.target.files?.[0])} />
        <Button type="button" variant="secondary" loading={busy} onClick={() => input.current?.click()}>Subir imagen</Button>
      </>
    );
  }`,
  },
  {
    name: "dates-and-money",
    description: "Dates, time zones and money: timestamptz, Intl formatting, date-fns for date math, integer cents",
    body: `- Store instants as timestamptz and send ISO strings; store plain calendar days as date. Money is integer cents (amount_cents) in the database and in the contract.
- Format for display with Intl: new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) and new Intl.NumberFormat("es", { style: "currency", currency }).format(cents / 100). Use the owner's language and currency, never a hard-coded locale.
- Date math (add days, start of week, same day) with date-fns: add_dependency date-fns (version 4), import { addDays, startOfWeek, isSameDay } from "date-fns", and the Spanish locale from "date-fns/locale" when it prints names.
- Time zones: a business has one (store it in a table or setting). Compute slots, "today" and reports on the server in that zone, not in the visitor's browser; jobs can set export const timezone = "America/Mexico_City".
- Put formatting in helpers/format.ts with a spec so every screen prints dates and money the same way.

  export const formatDateTime = (iso: string, locale = "es") => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  export const formatMoney = (cents: number, currency = "MXN", locale = "es") => new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);`,
  },
  {
    name: "realtime",
    description: "Live updates between users and tabs: channels, publish after writes, refreshing screens",
    body: `- Server: after a write, ctx.realtime.publish(channel, data) in the same endpoint. Name channels by what changes and who may see it: "orders:" + user.id for private data, "orders" only for data every signed-in user may see. Never publish another user's private data on a shared channel.
- Browser: useChannel(channel, handler) from @forja/client, with the handler wrapped in useCallback. Treat the event as a signal and reload with the typed client (reload() of useApi) instead of patching local state by hand.
- Realtime is best effort: the first load always comes from the endpoint, never only from events.

  import { useCallback } from "react";
  import { useApi, useChannel } from "@forja/client";

  export function useOrders(userId: string) {
    const orders = useApi<{ orders: { id: number }[] }>(userId ? "orders/list" : null);
    useChannel("orders:" + userId, useCallback(() => void orders.reload(), [orders.reload]));
    return orders;
  }`,
  },
];
