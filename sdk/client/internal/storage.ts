import type { Http } from "./transport.js";

export interface StoredFile {
  key: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
}

export function createStorage(http: Http) {
  return {
    async upload(file: File | Blob, filename?: string): Promise<StoredFile> {
      const form = new FormData();
      form.append("file", file, filename ?? (file as File).name ?? "file");
      return http.request<StoredFile>("POST", http.baas("storage/upload"), form);
    },
    url: (key: string) => http.baas(`storage/files/${encodeURIComponent(key)}`),
  };
}
