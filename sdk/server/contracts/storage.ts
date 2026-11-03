export interface StoredFile {
  key: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface Storage {
  put(data: Uint8Array | string, opts: { filename: string; contentType?: string; key?: string }): Promise<StoredFile>;
  get(key: string): Promise<{ data: Uint8Array; contentType: string; filename: string } | null>;
  delete(key: string): Promise<void>;
  list(): Promise<(StoredFile & { createdAt: string })[]>;
  url(key: string): string;
}
