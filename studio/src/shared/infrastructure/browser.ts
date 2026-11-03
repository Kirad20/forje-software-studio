export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface EventStreamPort {
  onmessage: ((event: MessageEvent<string>) => void) | null;
  onerror: ((event: Event) => void) | null;
  close(): void;
}

export interface BrowserPort {
  localStorage: StoragePort;
  sessionStorage: StoragePort;
  location: Pick<Location, "protocol" | "hostname" | "port" | "host" | "origin" | "pathname" | "search">;
  navigate(url: string): void;
  createEventSource(url: string): EventStreamPort;
  download(name: string, content: string, type: string): void;
  writeClipboard(text: string): Promise<void>;
}

const localStoragePort: StoragePort = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: (key) => window.localStorage.removeItem(key),
};

const sessionStoragePort: StoragePort = {
  getItem: (key) => window.sessionStorage.getItem(key),
  setItem: (key, value) => window.sessionStorage.setItem(key, value),
  removeItem: (key) => window.sessionStorage.removeItem(key),
};

export const browser: BrowserPort = {
  localStorage: localStoragePort,
  sessionStorage: sessionStoragePort,
  location: window.location,
  navigate(url) {
    window.location.href = url;
  },
  createEventSource(url) {
    return new EventSource(url);
  },
  download(name, content, type) {
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([content], { type }));
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  },
  writeClipboard(text) {
    return navigator.clipboard.writeText(text);
  },
};
