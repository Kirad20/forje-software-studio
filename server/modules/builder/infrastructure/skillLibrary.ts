import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

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
  /** Extra reference files by relative path without .md (for example "reference/critique"), loaded one at a time with load_skill and part. Only the skills copied from open-source projects have them. */
  parts?: Record<string, string>;
  /** Set on skills copied from open-source projects: where they come from and under which license. */
  origin?: { source: string; license: string };
}

const AUTHORED_SKILLS: Skill[] = [
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
- Reminders: ctx.jobs.runAt("send-reminder", { id }, whenOrDelayMs) works from 1 minute to 7 days ahead; for recurring mail use a job with a cron schedule. Durable enqueue delivery is at-least-once with bounded retries: use provider idempotency keys for mail, since recording sent_at alone cannot prevent a duplicate after a crash.
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
    name: "jobs",
    description: "Background and scheduled work (jobs/<name>.ts): cron schedule, time zone, limits, safe re-runs",
    body: `A job is a file jobs/<name>.ts (letters, digits, - and _). ctx.jobs.enqueue(name, payload?) returns a durable queue ID after acceptance, not execution. Delivery is at-least-once with bounded retries; a crash can replay an attempt. ctx.jobs.run(name, payload?) waits for completion; ctx.jobs.runAt(name, payload, dateOrDelayMs) keeps its existing scheduling semantics between 1 minute and 7 days ahead. Cron schedules remain supported.
- export const schedule is optional, only runs in the published app, at most every 5 minutes, at most 10 scheduled jobs per project. export const timezone is optional (default UTC): set the business's zone, for example "America/Mexico_City".
- ctx.payload carries the arguments; the job has the same services as an endpoint (db, email, storage, ai, jobs, realtime, env, log).
- A run may last 15 minutes. Make durable jobs idempotent: a unique business key (for example invoice.order_id), INSERT ... ON CONFLICT and a transaction updating output + status. External effects need provider idempotency keys; a database transaction cannot atomically commit email or payments.
- Optional extraction: forja.services.json = {"version":1,"services":{"orders":{"kind":"service","endpoints":["endpoints/orders/create_POST.ts"],"jobs":[],"replicas":2,"maxConcurrency":8},"invoices":{"kind":"worker","endpoints":[],"jobs":["jobs/invoice.ts"],"replicas":2,"maxConcurrency":1}}}. Assign existing exact endpoint/job filenames once only; workers cannot expose endpoints. Service names are lowercase letters/digits/hyphens, start with a letter, at most 40 characters, and cannot be monolith. Unknown fields fail validation. replicas: 1–8 per service, at most 16 total; maxConcurrency: 1–32. Unassigned files stay in the monolith.
- Routes remain /_api/<route>; imports work normally. All services share the project database owned by app-runtime; this is execution/process isolation, not database-per-service isolation. Local replica pools are not separate Docker containers. Independently scale the existing Docker worker service; never attach several app-runtime containers to shared PGlite.
- For existing apps, inspect tables and migrate additively before assigning entrypoints. Use enqueue for API → worker handoff and read persisted status through an authorized endpoint. Database writes + queue acceptance are not one transaction: handle enqueue failure with safe retries or an outbox/reconciler.
- Try it with the run_job tool and read the result with get_logs; a schedule only fires once published.

  import type { JobCtx } from "@forja/server";

  export const schedule = "0 8 * * 1-5";
  export const timezone = "America/Mexico_City";

  export default async function (ctx: JobCtx) {
    const due = await ctx.db.query<{ id: number; email: string }>("select id, email from reminders where sent_at is null and due_at <= now() order by id limit 100");
    for (const r of due) {
      await ctx.email.send({ to: r.email, subject: "Recordatorio", html: "<p>Te esperamos hoy.</p>" });
      await ctx.db.exec("update reminders set sent_at = now() where id = " + Number(r.id));
    }
    ctx.log("recordatorios enviados", due.length);
  }`,
  },
  {
    name: "auth",
    description: "Accounts: setup_auth, login, sign-up and forgot-password pages, guarding pages and endpoints",
    body: `When the app needs accounts:
- Server: call setup_auth once (it creates the owner's admin account, with no password) and protect every private endpoint with ctx.requireUser() (ctx.requireUser("admin") for admin-only), checking that the row belongs to that user.
- Pages: build pages/login.tsx with sign-in, sign-up and the full forgot-password flow (request a code with auth.requestPasswordReset(email), then auth.resetPassword({ email, code, password }) with the 8-digit code). Use auth.signIn, auth.signUp and auth.signOut from @forja/client, @forja/ui inputs with inline errors, and toast for failures.
- Guard private pages with useUser(): undefined means loading (show a Spinner), null means signed out (navigate to /login), an object is the user { id, email, name, role }.
- Tell the owner to set their own admin password with "forgot password".
- Hiding a button is not security: every check that matters is server-side.

  import { useEffect, type ReactNode } from "react";
  import { navigate, useUser } from "@forja/client";
  import { Spinner } from "@forja/ui";

  export function RequireUser({ children }: { children: ReactNode }) {
    const user = useUser();
    useEffect(() => {
      if (user === null) navigate("/login");
    }, [user]);
    if (user === undefined) return <Spinner />;
    return user ? <>{children}</> : null;
  }`,
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
  {
    name: "seo",
    description: "Search and sharing basics for public pages: title, description, headings, landmarks, images, structured data",
    body: `For every public page (landing, product, article, event, FAQ); private pages (dashboards, settings) only need a title.
- useHead from @forja/client on each page: a specific title under 60 characters and a description under 160, plus a canonical URL when the same content has several addresses. Different pages, different titles.
- Exactly one h1 per page, and the headings below it in order. Semantic landmarks: header, nav, main, section, footer.
- Images: descriptive alt on every meaningful image (empty alt for decoration), width and height set, loading="lazy" below the fold.
- Structured data: a <script type="application/ld+json"> block when the page shows a product, article, event, FAQ, local business or recipe. Use the schema.org type that matches and only facts the page really states; never invent ratings, reviews or prices.
- Links between pages use Link from @forja/client; give links descriptive text ("Ver el menú", not "Haz clic aquí").
- The project's SEO settings (site name, description, robots, sitemap, theme color) are set in the project settings; do not duplicate them in code.

  import { useHead } from "@forja/client";

  export default function Menu() {
    useHead({ title: "Menú del día | Café Aurora", description: "Platos de temporada, desayunos y café de especialidad en el centro de Querétaro." });
    return (
      <main>
        <h1>Menú del día</h1>
        <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "CafeOrCoffeeShop", name: "Café Aurora", servesCuisine: "Mexicana" })}</script>
      </main>
    );
  }`,
  },
  {
    name: "design-brief",
    description: "Start here for any new screen or app: decide purpose, audience, tone and one signature idea before writing UI",
    body: `Decide these in a few lines BEFORE writing code; they are what makes the result look intentional instead of generic.
1. Purpose and audience: who opens this, what is the one thing they come to do, on what device (phone in a shop, laptop at a desk)?
2. Tone: pick ONE and commit (editorial and calm, clean and clinical, warm and friendly, dense and technical, playful and bold). The tone chooses the type, the palette, the density and the motion; load "design-system" to turn it into tokens and "frontend-design" for the process of a design lead.
3. One signature idea: a single memorable element (a big numeric readout, a distinctive color block, an unusual layout of the main list). Everything else stays quiet so that one thing is seen.
4. Content first: write the real copy, the real labels and a few realistic sample rows before styling. A layout that only works with lorem ipsum does not work.
5. Hierarchy: one primary action per screen, one h1, a clear second level. If two things shout, one of them is wrong.
Then build with the kit: tokens in base.css, screens composed from @forja/ui, your own CSS Modules only for layout. Verify at 375 px and desktop, in light and dark, and run check_standards.
Before you finish, load the skill "impeccable" (part "reference/critique") and judge the result the way a reviewer would.`,
  },
  {
    name: "design-system",
    description: "Turn a tone into tokens: type scale, spacing, radius, shadows and four tested palettes (light and dark)",
    body: `Everything visual comes from the tokens in base.css; change them there and the whole app (and @forja/ui) follows. Never hard-code colors in components.
Type: system font stacks need no loading and look native. For character put a font file in static/ (woff2) and declare it with @font-face in base.css, one family for headings and one for text at most. Scale: --text-sm 0.875rem, --text-md 1rem, --text-lg 1.25rem, --text-xl 2rem; line-height 1.5 for text and 1.15 for large headings; keep text lines under 70 characters.
Spacing: a 4px base (--space-1..5 = 4, 8, 16, 24, 40); use only those values, so rhythm is consistent. Radius: one value (6-8 px sharp, 10-12 friendly, 16+ playful) plus a pill for badges. Shadows: at most two (a subtle one for cards, a strong one for overlays); on dark themes prefer borders to shadows.
Palette recipe: one accent (--primary) with a readable --primary-text, neutrals tinted toward the accent hue, --danger and --success used only for meaning. Contrast: body text 4.5:1 or more, the accent as text or icon on the background 3:1 or more, button text on the accent 4.5:1 or more, in BOTH themes.
These four palettes already pass those ratios in light and dark. They are neutral starting points, not an answer: when the subject has colors of its own (its materials, its street, its landscape), take the accent from there and re-check the contrast. Avoid the look every generated page shares: cream background with a terracotta accent, or near-black with one acid-green accent, unless the brief asks for it.

  Paper (calm, neutral; pair a serif for headings if the tone is editorial):
  light  --bg:#f7f8f6 --surface:#ffffff --text:#1a1c1a --muted:#5d625c --border:#dfe2dc --primary:#0f5f5a --primary-text:#ffffff
  dark   --bg:#0e1211 --surface:#151a19 --text:#eef2f0 --muted:#a3aea9 --border:#28312f --primary:#5eead4 --primary-text:#04201d

  Product (clean, trustworthy):
  light  --bg:#f8fafc --surface:#ffffff --text:#0f172a --muted:#526071 --border:#dbe3ec --primary:#1d4ed8 --primary-text:#ffffff
  dark   --bg:#0b1120 --surface:#111a2e --text:#e6edf7 --muted:#9db0c9 --border:#223049 --primary:#7aa2ff --primary-text:#0b1120

  Fresh (food, health, outdoors):
  light  --bg:#f6faf6 --surface:#ffffff --text:#14231a --muted:#4f6657 --border:#d6e4d9 --primary:#166534 --primary-text:#ffffff
  dark   --bg:#0c140f --surface:#131f17 --text:#e8f3ea --muted:#9bb5a3 --border:#23362a --primary:#4ade80 --primary-text:#06210f

  Ink (technical, creative, dark-leaning):
  light  --bg:#f4f5f6 --surface:#ffffff --text:#15171a --muted:#596068 --border:#dcdfe3 --primary:#0e7490 --primary-text:#ffffff
  dark   --bg:#0d0f11 --surface:#15181b --text:#eceff2 --muted:#a0a8b0 --border:#2a2f35 --primary:#67e8f9 --primary-text:#04222a

Put the light values in :root and the dark ones in @media (prefers-color-scheme: dark) { :root { … } }. Keep --danger #b91c1c (light) and #f87171 (dark), --success #15803d and #4ade80.`,
  },
];

/**
 * Skills copied from open-source projects live as folders next to this file, exactly as
 * published (SKILL.md, references, scripts, data, assets) plus the LICENSE they came with.
 * Nothing in them is edited: Forja only reads their text (SKILL.md and every .md file become
 * "parts" an agent can load) and prepends a note when it serves them (see skills.ts). The
 * scripts and data stay on disk untouched; the agents have no shell to run them.
 * See skills/NOTICE.md for the sources and licenses.
 */
const VENDORED = fileURLToPath(new URL("./skills/", import.meta.url));

/** One line for the index (the upstream descriptions are paragraphs) and where each skill comes from. */
const VENDORED_INFO: Record<string, { description: string; source: string; license: string }> = {
  "frontend-design": {
    description: "Anthropic's design-lead process: ground the design in the subject, avoid templated defaults, plan tokens and layout, build, self-critique",
    source: "Anthropic, github.com/anthropics/skills (skills/frontend-design)",
    license: "Apache-2.0",
  },
  impeccable: {
    description: "Design, critique, audit and polish an interface: craft floor, UX review, layout, type, color, motion, copy and hardening",
    source: "Paul Bakaus, github.com/pbakaus/impeccable (plugin/skills/impeccable)",
    license: "Apache-2.0",
  },
  hallmark: {
    description: "Make new UI look designed, not generated: a hard floor against model defaults, one idea per screen, a sweep before handing back",
    source: "github.com/Nutlope/hallmark (skills/hallmark)",
    license: "MIT",
  },
  "taste-skill": {
    description: "Art direction against the generic look: find the idea in the subject, write the argument and the copy, keep a strict no-ornament house style",
    source: "Leonxlnx, github.com/Leonxlnx/taste-skill (skills/taste-skill)",
    license: "MIT",
  },
  "ui-ux-pro-max": {
    description: "UI/UX design intelligence: ten priority categories of rules, style, palette and font choice, UX guidelines, design dials",
    source: "Next Level Builder, github.com/nextlevelbuilder/ui-ux-pro-max-skill (.claude/skills/ui-ux-pro-max)",
    license: "MIT",
  },
  "web-design-guidelines": {
    description: "Audit UI for accessibility, focus, forms, animation, typography, performance and UX with Vercel's Web Interface Guidelines",
    source: "Vercel Labs, github.com/vercel-labs/web-interface-guidelines",
    license: "MIT",
  },
};

const unix = (text: string) => text.replace(/\r\n/g, "\n");
const SKIPPED_DIRS = /(^|\/)(node_modules|\.git|evals|tests?)(\/|$)/;
const NOT_PARTS = /(^|\/)(SKILL|LICENSE|NOTICE)(\.\w+)?$/i;

function readVendored(): Skill[] {
  if (!existsSync(VENDORED)) return [];
  const out: Skill[] = [];
  for (const dir of readdirSync(VENDORED, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
    const root = `${VENDORED}${dir}/`;
    if (!existsSync(`${root}SKILL.md`)) continue;
    const text = unix(readFileSync(`${root}SKILL.md`, "utf8"));
    const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
    const info = VENDORED_INFO[dir];
    const description = info?.description ?? /^description:\s*(.+)$/m.exec(m?.[1] ?? "")?.[1]?.trim();
    const body = (m ? m[2]! : text).trim();
    if (!description || !body) continue;
    const parts: Record<string, string> = {};
    const found = readdirSync(root, { recursive: true })
      .map((f) => String(f).replace(/\\/g, "/"))
      .filter((f) => f.endsWith(".md") && !NOT_PARTS.test(f) && !SKIPPED_DIRS.test(f))
      .sort();
    for (const f of found) parts[f.slice(0, -3)] = unix(readFileSync(root + f, "utf8")).trim();
    out.push({ name: dir, description, body, ...(Object.keys(parts).length ? { parts } : {}), ...(info ? { origin: { source: info.source, license: info.license } } : {}) });
  }
  return out;
}

export const BUILTIN_SKILLS: Skill[] = [...AUTHORED_SKILLS, ...readVendored()];
