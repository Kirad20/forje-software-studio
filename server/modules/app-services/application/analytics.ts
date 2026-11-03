import type { AnalyticsPorts } from "../ports/analytics.js";
import { analyticsDays } from "../domain/policies.js";

/**
 * Cookie-free visitor analytics for published apps. A visitor is a salted hash of IP and
 * user agent that changes every day, so nobody can be followed across days or apps.
 */
export function createAnalytics({ q, now, salt, hash }: AnalyticsPorts) {
function visitorId(projectId: string, ip: string, userAgent: string) {
  const day = now().toISOString().slice(0, 10);
  return hash(`${salt()}|${projectId}|${day}|${ip}|${userAgent}`).slice(0, 16);
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

async function recordPageView(projectId: string, input: { ip: string; userAgent: string; path: string; referrer?: string }) {
  if (/bot|crawler|spider|headless/i.test(input.userAgent)) return;
  let referrer: string | null = null;
  try {
    referrer = input.referrer ? new URL(input.referrer).hostname || null : null;
  } catch {
    /* ignore malformed referrers */
  }
  await q("analyticsRecord", [
    projectId,
    visitorId(projectId, input.ip, input.userAgent),
    input.path.slice(0, 300) || "/",
    referrer,
    browserOf(input.userAgent),
    deviceOf(input.userAgent),
  ]);
}

async function analyticsSummary(projectId: string, days = 7) {
  days = analyticsDays(days);
  const top = (col: string) =>
    q<{ label: string; count: number }>(
      `analyticsTop:${col}`,
      [projectId, days],
    );
  const [totals] = await q<{ visitors: number; views: number }>(
    "analyticsTotals",
    [projectId, days],
  );
  const [current] = await q<{ n: number }>(
    "analyticsCurrent",
    [projectId],
  );
  const trend = await q<{ day: string; visitors: number; views: number }>(
    "analyticsTrend",
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
return { visitorId, recordPageView, analyticsSummary };
}
