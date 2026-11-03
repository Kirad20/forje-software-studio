export class RequestCache {
  private readonly entries = new Map<string, Promise<unknown>>();

  get<T>(key: string, load: () => Promise<T>): Promise<T> {
    const current = this.entries.get(key);
    if (current) return current as Promise<T>;

    const request = load();
    this.entries.set(key, request);
    void request.catch(() => {
      if (this.entries.get(key) === request) this.entries.delete(key);
    });
    return request;
  }

  invalidate(key: string): void {
    this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }
}
