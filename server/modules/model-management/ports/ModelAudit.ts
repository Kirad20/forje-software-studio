export type ModelAudit = (key: string, actorId: string | null, action: "create" | "set" | "delete") => Promise<void>;
