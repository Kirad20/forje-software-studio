export const TEST_DATABASE_URL: string;
export function freshDatabase(): Promise<{ url: string; drop(): Promise<void> }>;
