## 2026-11-02 - Reusing ProjectIndex in Graph Traversal
**Learning:** `selectContext` in `server/modules/builder/infrastructure/projectIndex.ts` computed `buildIndex(files)` once, but looped over high-scoring files calling `relatedFiles(files, p)` which rebuilt the entire index each time ($O(K \times N)$).
**Action:** When building graph queries or performing multiple neighbour lookups, always accept and pass down an existing `ProjectIndex` instance to prevent redundant project-wide re-indexing.
