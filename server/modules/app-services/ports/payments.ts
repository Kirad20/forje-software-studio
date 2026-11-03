export interface PaymentPorts {
  platformKey(): string;
  stripe(key: string, path: string, form: URLSearchParams | null, method?: string): Promise<Record<string, unknown>>;
}
