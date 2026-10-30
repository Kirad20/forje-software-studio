import { createHash } from "node:crypto";
import { config } from "../config.js";
import { q } from "../platform/db.js";

/**
 * Cookie-free visitor analytics for published apps. A visitor is a salted hash of IP and
 * user agent that changes every day, so nobody can be followed across days or apps.
 */
export function visitorId(projectId: string, ip: string, userAgent: string) {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${config.secretsKey}|${projectId}|${day}|${ip}|${userAgent}`).digest("hex").slice(0, 16);
}

function browserOf(ua: string) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/firefox\//i.test(ua)) return "Firefox";
  if (/chrome\//i.test(ua)) return "Chrome";
  if (/safari\//i.test(ua)) return "Safari";
  return "Otro";
}

const deviceOf = (ua: string) => (/ipad|tablet/i.test(ua) ? "Tablet" : /mobi|iphone|android/i.test(ua) ? "Móvil" : "Escritorio");

export async function recordPageView(projectId: string, input: { ip: string; userAgent: string; path: string; referrer?: string }) {
  if (/bot|crawler|spider|headless/i.test(input.userAgent)) return;
  let referrer: string | null = null;
  try {
    referrer = input.referrer ? new URL(input.referrer).hostname || null : null;
  } catch {
    /* ignore malformed referrers */
  }
  await q(`insert into page_views (project_id, visitor, path, referrer, browser, device) values ($1, $2, $3, $4, $5, $6)`, [
    projectId,
    visitorId(projectId, input.ip, input.userAgent),
    input.path.slice(0, 300) || "/",
    referrer,
    browserOf(input.userAgent),
    deviceOf(input.userAgent),
  ]);
}

export async function analyticsSummary(projectId: string, days = 7) {
  const since = `now() - interval '${Math.min(Math.max(days, 1), 90)} days'`;
  const top = (col: string) =>
    q<{ label: string; count: number }>(
      `select coalesce(${col}, 'Directo') as label, count(*)::int as count from page_views
       where project_id = $1 and created_at > ${since} group by 1 order by 2 desc limit 8`,
      [projectId],
    );
  const [totals] = await q<{ visitors: number; views: number }>(
    `select count(distinct visitor)::int as visitors, count(*)::int as views from page_views where project_id = $1 and created_at > ${since}`,
    [projectId],
  );
  const [current] = await q<{ n: number }>(
    `select count(distinct visitor)::int as n from page_views where project_id = $1 and created_at > now() - interval '5 minutes'`,
    [projectId],
  );
  const trend = await q<{ day: string; visitors: number; views: number }>(
    `select to_char(d, 'YYYY-MM-DD') as day,
       (select count(distinct visitor)::int from page_views where project_id = $1 and created_at::date = d) as visitors,
       (select count(*)::int from page_views where project_id = $1 and created_at::date = d) as views
     from generate_series(current_date - ($2::int - 1), current_date, interval '1 day') as d`,
    [projectId, days],
  );
  return {
    currentVisitors: current?.n ?? 0,
    visitors: totals?.visitors ?? 0,
    views: totals?.views ?? 0,
    trend,
    topPages: await top("path"),
    topReferrers: await top("referrer"),
    browsers: await top("browser"),
    devices: await top("device"),
  };
}
