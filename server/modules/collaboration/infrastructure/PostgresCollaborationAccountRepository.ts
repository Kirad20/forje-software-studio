import { one } from "../../../platform/db.js";
import type { CollaborationAccount, ICollaborationAccountRepository } from "../ports/repositories.js";

export class PostgresCollaborationAccountRepository implements ICollaborationAccountRepository {
  async findByEmail(email: string): Promise<CollaborationAccount | null> {
    const row = await one<{ id: string; email: string }>(
      `select id, email from accounts where email = $1 and not disabled`,
      [email.trim().toLowerCase()],
    );
    if (!row) return null;
    return { id: row.id, email: row.email };
  }
}
