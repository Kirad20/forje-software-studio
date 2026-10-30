/** Line diffs for the change card and the details view. */
export type DiffLine = { op: " " | "+" | "-"; text: string; a?: number; b?: number };

/** Line diff by longest common subsequence, after trimming the common head and tail. */
export function diffLines(before: string, after: string): DiffLine[] {
  // A file's final newline ends its last line; it is not an extra empty line.
  const lines = (s: string) => (s === "" ? [] : s.replace(/\n$/, "").split("\n"));
  const a = lines(before);
  const b = lines(after);
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) (endA--, endB--);
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  const out: DiffLine[] = a.slice(0, start).map((text, i) => ({ op: " ", text, a: i + 1, b: i + 1 }));
  const n = midA.length;
  const m = midB.length;
  if (n * m > 4_000_000) {
    // Too big to align line by line: show it as replaced.
    midA.forEach((text, i) => out.push({ op: "-", text, a: start + i + 1 }));
    midB.forEach((text, j) => out.push({ op: "+", text, b: start + j + 1 }));
  } else {
    const lcs: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) lcs[i]![j] = midA[i] === midB[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    let i = 0;
    let j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && midA[i] === midB[j]) (out.push({ op: " ", text: midA[i]!, a: start + i + 1, b: start + j + 1 }), i++, j++);
      // Removals go before additions, as in any diff.
      else if (i < n && (j === m || lcs[i + 1]![j]! >= lcs[i]![j + 1]!)) (out.push({ op: "-", text: midA[i]!, a: start + i + 1 }), i++);
      else (out.push({ op: "+", text: midB[j]!, b: start + j + 1 }), j++);
    }
  }
  const shift = endB - endA;
  a.slice(endA).forEach((text, k) => out.push({ op: " ", text, a: endA + k + 1, b: endA + k + 1 + shift }));
  return out;
}

/** Keeps `context` unchanged lines around each change; the rest collapses into a "…" marker. */
export function hunks(lines: DiffLine[], context = 3): (DiffLine | { op: "gap"; count: number })[] {
  const keep = lines.map(() => false);
  lines.forEach((l, i) => {
    if (l.op === " ") return;
    for (let k = Math.max(0, i - context); k <= Math.min(lines.length - 1, i + context); k++) keep[k] = true;
  });
  const out: (DiffLine | { op: "gap"; count: number })[] = [];
  let gap = 0;
  lines.forEach((l, i) => {
    if (keep[i]) {
      if (gap) out.push({ op: "gap", count: gap });
      gap = 0;
      out.push(l);
    } else gap++;
  });
  if (gap && out.length) out.push({ op: "gap", count: gap });
  return out;
}
