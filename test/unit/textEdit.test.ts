import { describe, expect, it } from "vitest";
import { replaceVisibleText } from "../../server/builder/textEdit.js";

const page = `export default function Home() {
  return (
    <main>
      <h1>
        Bienvenido a   mi tienda
      </h1>
      <input placeholder="Busca un producto" />
      <p>Envíos gratis</p>
    </main>
  );
}
`;

describe("visual text edits", () => {
  it("rewrites JSX text even when the source wraps it differently", () => {
    const r = replaceVisibleText({ "pages/_index.tsx": page }, "Bienvenido a mi tienda", "Hola de nuevo");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.path).toBe("pages/_index.tsx");
      expect(r.content).toContain("<h1>\n        Hola de nuevo\n      </h1>");
    }
  });

  it("rewrites a quoted string such as a placeholder", () => {
    const r = replaceVisibleText({ "pages/_index.tsx": page }, "Busca un producto", "¿Qué buscas?");
    expect(r.ok && r.content).toContain('placeholder="¿Qué buscas?"');
  });

  it("refuses when the text is in more than one place", () => {
    const r = replaceVisibleText({ "pages/_index.tsx": page, "components/Footer.tsx": "export const F = () => <p>Envíos gratis</p>;" }, "Envíos gratis", "Envío 24h");
    expect(r).toEqual({ ok: false, reason: "ambiguous", matches: ["pages/_index.tsx", "components/Footer.tsx"] });
  });

  it("refuses text it cannot find (e.g. data from the database) and code-like edits", () => {
    expect(replaceVisibleText({ "pages/_index.tsx": page }, "Pedido #42", "x").ok).toBe(false);
    expect(replaceVisibleText({ "pages/_index.tsx": page }, "Envíos gratis", "Hola {user}")).toEqual({ ok: false, reason: "unsafe" });
    expect(replaceVisibleText({ "pages/_index.tsx": page }, "Busca un producto", 'Di "hola"')).toEqual({ ok: false, reason: "unsafe" });
  });

  it("does not match part of a longer text", () => {
    expect(replaceVisibleText({ "pages/_index.tsx": page }, "Envíos", "Entregas")).toMatchObject({ ok: false, reason: "not_found" });
  });

  it("ignores files that are not pages or components", () => {
    expect(replaceVisibleText({ "helpers/copy.tsx": "<p>Envíos gratis</p>" }, "Envíos gratis", "x")).toMatchObject({ ok: false, reason: "not_found" });
  });
});
