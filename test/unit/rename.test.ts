import { describe, expect, it } from "vitest";
import { rewriteImports } from "../../server/modules/builder/infrastructure/rename.js";

const files = {
  "components/Button.tsx": `import styles from "./Button.module.css";\nimport { cents } from "../helpers/money";\nexport function Button() { return null; }`,
  "components/Button.module.css": ".b {}",
  "helpers/money.ts": "export const cents = 1;",
  "pages/_index.tsx": `import { Button } from "../components/Button";\nimport { cents } from "~/helpers/money";\nexport default function Home() { return <Button />; }`,
  "pages/about.tsx": `import { Button } from "~/components/Button";\nconst Lazy = import("../components/Button");\nexport { Button } from "../components/Button";`,
  "pages/other.tsx": `import { Other } from "../components/Other";`,
};

describe("rewriteImports", () => {
  it("rewrites relative and ~/ importers, keeping the extensionless style", () => {
    const out = rewriteImports(files, "components/Button.tsx", "components/ui/PrimaryButton.tsx");
    expect(out["pages/_index.tsx"]).toContain(`from "../components/ui/PrimaryButton"`);
    expect(out["pages/_index.tsx"]).toContain(`from "~/helpers/money"`);
    expect(out["pages/about.tsx"]).toContain(`from "~/components/ui/PrimaryButton"`);
    expect(out["pages/about.tsx"]).toContain(`import("../components/ui/PrimaryButton")`);
    expect(out["pages/about.tsx"]).toContain(`export { Button } from "../components/ui/PrimaryButton"`);
    expect(out["pages/other.tsx"]).toBeUndefined();
  });

  it("fixes the moved file's own relative imports when its folder changes", () => {
    const out = rewriteImports(files, "components/Button.tsx", "components/ui/PrimaryButton.tsx");
    const moved = out["components/ui/PrimaryButton.tsx"]!;
    expect(moved).toContain(`from "../Button.module.css"`);
    expect(moved).toContain(`from "../../helpers/money"`);
  });

  it("changes nothing for a rename in the same folder that nobody imports", () => {
    expect(rewriteImports(files, "pages/other.tsx", "pages/otra.tsx")).toEqual({});
  });

  it("keeps an explicit extension when the importer wrote one", () => {
    const out = rewriteImports(files, "components/Button.module.css", "components/Btn.module.css");
    expect(out["components/Button.tsx"]).toContain(`from "./Btn.module.css"`);
  });
});
