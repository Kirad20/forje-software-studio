import { platformDb, q } from "../../../shared/database/index.js";
import type { PublicAccount } from "../ports/accountLifecycle.js";

export interface McpOAuthClient {
  client_id: string;
  client_name: string;
  redirect_uris: string[];
}

export interface McpOAuthAuthorizationCode {
  account_id: string;
  scope: string;
}

export interface McpOAuthRefreshGrant {
  account_id: string;
  scope: string;
}

export class PostgresMcpOAuthRepository {
  async registerClient(clientId: string, clientName: string, redirectUris: string[]): Promise<void> {
    await q(
      `insert into mcp_oauth_clients (client_id, client_name, redirect_uris) values ($1, $2, $3::jsonb)`,
      [clientId, clientName, JSON.stringify(redirectUris)],
    );
  }

  async findClient(clientId: string): Promise<McpOAuthClient | null> {
    return (await q<McpOAuthClient>(
      `select client_id, client_name, redirect_uris from mcp_oauth_clients where client_id = $1`,
      [clientId],
    ))[0] ?? null;
  }

  async removeExpiredAuthorizationCodes(): Promise<void> {
    await q(`delete from mcp_oauth_codes where expires_at <= now() or consumed_at < now() - interval '10 minutes'`);
  }

  async createAuthorizationCode(input: {
    codeHash: string;
    clientId: string;
    accountId: string;
    redirectUri: string;
    codeChallenge: string;
    scope: string;
  }): Promise<void> {
    await q(
      `insert into mcp_oauth_codes
         (code_hash, client_id, account_id, redirect_uri, code_challenge, scope, expires_at)
       values ($1, $2, $3, $4, $5, $6, now() + interval '5 minutes')`,
      [input.codeHash, input.clientId, input.accountId, input.redirectUri, input.codeChallenge, input.scope],
    );
  }

  async consumeAuthorizationCode(
    codeHash: string,
    clientId: string,
    redirectUri: string,
    codeChallenge: string,
  ): Promise<McpOAuthAuthorizationCode | null> {
    const db = await platformDb();
    return db.transaction(async (tx) => {
      const found = (await tx.query<McpOAuthAuthorizationCode & { redirect_uri: string; code_challenge: string }>(
        `select account_id, redirect_uri, code_challenge, scope from mcp_oauth_codes
         where code_hash = $1 and client_id = $2 and redirect_uri = $3 and code_challenge = $4
           and expires_at > now() and consumed_at is null`,
        [codeHash, clientId, redirectUri, codeChallenge],
      )).rows[0];
      if (!found) return null;
      const consumed = await tx.query(
        `update mcp_oauth_codes set consumed_at = now()
         where code_hash = $1 and client_id = $2 and consumed_at is null and expires_at > now() returning code_hash`,
        [codeHash, clientId],
      );
      return consumed.rows.length ? { account_id: found.account_id, scope: found.scope } : null;
    });
  }

  async issueTokens(input: {
    accessTokenHash: string;
    refreshTokenHash: string;
    clientId: string;
    accountId: string;
    scope: string;
    accessTokenTtl: number;
    refreshTokenTtl: number;
  }): Promise<void> {
    await q(
      `insert into mcp_oauth_tokens
         (access_token_hash, refresh_token_hash, client_id, account_id, scope, expires_at, refresh_expires_at)
       values ($1, $2, $3, $4, $5, now() + ($6::double precision * interval '1 second'),
         now() + ($7::double precision * interval '1 second'))`,
      [
        input.accessTokenHash, input.refreshTokenHash, input.clientId, input.accountId,
        input.scope, input.accessTokenTtl, input.refreshTokenTtl,
      ],
    );
  }

  async consumeRefreshToken(refreshTokenHash: string, clientId: string): Promise<McpOAuthRefreshGrant | null> {
    const db = await platformDb();
    return db.transaction(async (tx) => {
      const consumed = await tx.query<McpOAuthRefreshGrant>(
        `update mcp_oauth_tokens t set revoked_at = now()
         from accounts a
         where t.refresh_token_hash = $1 and t.client_id = $2 and t.revoked_at is null
           and t.refresh_expires_at > now() and t.account_id = a.id and not a.disabled
         returning t.account_id, t.scope`,
        [refreshTokenHash, clientId],
      );
      return consumed.rows[0] ?? null;
    });
  }

  async revokeToken(clientId: string, tokenHash: string): Promise<void> {
    await q(
      `update mcp_oauth_tokens set revoked_at = now()
       where client_id = $1 and revoked_at is null and
       (access_token_hash = $2 or refresh_token_hash = $2)`,
      [clientId, tokenHash],
    );
  }

  async accountFromAccessToken(tokenHash: string): Promise<PublicAccount | null> {
    return (await q<PublicAccount>(
      `update mcp_oauth_tokens t set last_used_at = now()
       from accounts a
       where t.access_token_hash = $1 and t.account_id = a.id and t.revoked_at is null
         and t.expires_at > now() and not a.disabled
       returning a.id, a.email, a.name, a.credits, a.platform_role as "platformRole",
         null::text as "tokenOrgId", null::text as "tokenProjectId"`,
      [tokenHash],
    ))[0] ?? null;
  }
}
