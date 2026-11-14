import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FileTree } from "../../../studio/src/features/files/presentation/FileTree.js";

const files = [
  { path: "src/components/App.tsx", size: 1 },
  { path: "README.md", size: 1 },
  { path: "src/index.ts", size: 1 },
  { path: "other/App.tsx", size: 1 },
];

describe("FileTree", () => {
  it("groups nested files by folder and keeps root files separate", () => {
    const html = renderToStaticMarkup(<FileTree files={files} selectedPath="src/components/App.tsx" searching={false} onSelect={() => {}} />);
    expect(html).toContain('<summary class="tool-folder" title="src">src</summary>');
    expect(html).toContain('<summary class="tool-folder" title="src/components">components</summary>');
    expect(html).toContain('aria-label="src/components/App.tsx" aria-current="page"');
    expect(html).toContain('aria-label="other/App.tsx"');
    expect(html.indexOf('title="src"')).toBeLessThan(html.indexOf('title="README.md"'));
    expect(html.match(/<details open=""/g)).toHaveLength(2);
  });

  it("opens all matching folders while searching", () => {
    const html = renderToStaticMarkup(<FileTree files={files.filter((file) => file.path.includes("App.tsx"))} selectedPath={null} searching onSelect={() => {}} />);
    expect(html.match(/<details open=""/g)).toHaveLength(3);
    expect(html).not.toContain("README.md");
  });
});
