import { describe, expect, it } from "vitest";
import { quickScan } from "../../server/modules/app-runtime/index.js";

const rules = (files: Record<string, string>) => quickScan(files).map((f) => `${f.rule}:${f.severity}:${f.file}`);

describe("quick security scan", () => {
  it("passes a well-written endpoint and page", () => {
    expect(
      quickScan({
        "endpoints/todos/create_POST.ts":
          'import { z } from "zod";\nconst Input = z.object({ title: z.string() });\nexport default async (ctx: any) => { const u = ctx.requireUser(); const i = Input.parse(ctx.body); return ctx.db.one("insert into todos (user_id, title) values ($1, $2) returning *", [u.id, i.title]); };\n',
        "pages/_index.tsx": "export default () => <p>Hola</p>;\n",
      }),
    ).toEqual([]);
  });

  it("flags a secret key in a page as critical, and in an endpoint as high", () => {
    const key = "sk_live_" + "a1B2c3D4e5F6g7H8i9J0";
    expect(rules({ "pages/pay.tsx": `const k = "${key}";`, "endpoints/pay_POST.ts": `const k = "${key}"; export default async (ctx: any) => ctx.requireUser();` })).toEqual([
      "secret-in-client:critical:pages/pay.tsx",
      "hardcoded-secret:high:endpoints/pay_POST.ts",
    ]);
  });

  it("flags SQL built from text, writes without sign-in and unvalidated bodies", () => {
    const found = rules({
      "endpoints/notes/delete_POST.ts": "export default async (ctx: any) => ctx.db.query(`delete from notes where id = ${ctx.body.id}`);",
    });
    expect(found).toContain("sql-interpolation:high:endpoints/notes/delete_POST.ts");
    expect(found).toContain("write-without-auth:high:endpoints/notes/delete_POST.ts");
    expect(found).toContain("no-validation:medium:endpoints/notes/delete_POST.ts");
  });

  it("respects // forja:public for endpoints that are open on purpose", () => {
    const found = rules({
      "endpoints/contact_POST.ts": '// forja:public — contact form, rate-limited\nimport { z } from "zod";\nexport default async (ctx: any) => { const i = z.object({ msg: z.string().max(500) }).parse(ctx.body); await ctx.db.query("insert into messages (body) values ($1)", [i.msg]); };',
    });
    expect(found).toEqual([]);
  });

  it("flags admin endpoints without a role check, client secrets access, prices from the browser and raw HTML", () => {
    const found = rules({
      "endpoints/admin/users_GET.ts": "export default async (ctx: any) => { ctx.requireUser(); return ctx.db.query('select * from _forja_users'); };",
      "pages/settings.tsx": "const k = process.env.KEY; export default () => <div dangerouslySetInnerHTML={{ __html: k }} />;",
      "endpoints/checkout_POST.ts":
        'import { z } from "zod";\nexport default async (ctx: any) => { ctx.requireUser(); const input = z.object({ amount: z.number() }).parse(ctx.body); return ctx.payments.checkout({ lineItems: [{ name: "x", amountCents: input.amount }] }); };',
    });
    expect(found).toEqual(
      expect.arrayContaining([
        "admin-without-role:high:endpoints/admin/users_GET.ts",
        "env-in-client:high:pages/settings.tsx",
        "price-from-client:high:endpoints/checkout_POST.ts",
        "dangerous-html:medium:pages/settings.tsx",
      ]),
    );
  });

  it("gives a finding the same id after unrelated edits", () => {
    const page = (prefix: string) => ({ "pages/a.tsx": `${prefix}export default () => <div dangerouslySetInnerHTML={{ __html: x }} />;` });
    const [a] = quickScan(page(""));
    const [b] = quickScan(page("// a comment\n\n"));
    expect(a!.id).toBe(b!.id);
    expect(a!.line).not.toBe(b!.line);
  });
});
