declare global {
  interface Window {
    __FORJA__?: { base: string; projectId: string; env: "preview" | "published" };
  }
}

export const base = () => window.__FORJA__?.base ?? "";
