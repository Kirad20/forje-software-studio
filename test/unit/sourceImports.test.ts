import { expect, it } from "vitest";
import { sourceImports } from "../helpers/sourceImports.js";

it("distinguishes runtime, type-only, dynamic and reexport edges from generated source strings", () => {
  const source = [
    'import "./sideEffect.js";',
    'import type { Foo } from "./types.js";',
    'import { type Bar } from "./namedTypes.js";',
    'import { type Baz, value } from "./mixed.js";',
    'export { value } from "./reexport.js";',
    'export type { Foo } from "./exportedTypes.js";',
    'const lazy = () => import("./dynamic.js");',
    'type Inline = import("./inlineType.js").Foo;',
    'const template = () => import(`./dynamicTemplate.js`);',
    'vi.mock("./mocked.js", () => ({}));',
    'const generated = `import { widget } from "./virtual.js";`;',
    '// import "./comment.js";',
  ].join("\n");
  expect(sourceImports(source)).toEqual([
    { specifier: "./sideEffect.js", runtime: true },
    { specifier: "./types.js", runtime: false },
    { specifier: "./namedTypes.js", runtime: false },
    { specifier: "./mixed.js", runtime: true },
    { specifier: "./reexport.js", runtime: true },
    { specifier: "./exportedTypes.js", runtime: false },
    { specifier: "./dynamic.js", runtime: true },
    { specifier: "./inlineType.js", runtime: false },
    { specifier: "./dynamicTemplate.js", runtime: true },
    { specifier: "./mocked.js", runtime: false },
  ]);
});
