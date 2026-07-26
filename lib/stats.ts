import type { Feed } from "./types";

/** "2:15 PM" (12h) or "14:15" (24h), depending on the user's clock preference. */
export function fmtTime(ms: number, hour12 = true): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes();
  if (!hour12) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const ap = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

/** Big/small parts for the "time since last feed" hero. */
export function timeSince(now: number, ms: number): { big: string; small: string } {
  const diff = Math.max(0, now - ms);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return { big: "Just", small: "now" };
  if (mins < 60) return { big: `${mins}m`, small: "ago" };
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return { big: m ? `${h}h ${m}m` : `${h}h`, small: "ago" };
}

export function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function todayStats(feeds: Feed[]): { count: number; ml: number } {
  const st = startOfToday();
  const today = feeds.filter((f) => f.time >= st);
  return {
    count: today.length,
    ml: today.reduce((a, f) => a + (f.type === "bottle" ? f.ml || 0 : 0), 0),
  };
}

export interface TrendDay {
  label: string;
  count: number;
  today: boolean;
}

/** Feed counts for the last 7 days, oldest → newest. */
export function trend7(feeds: Feed[]): TrendDay[] {
  const dl = ["S", "M", "T", "W", "T", "F", "S"];
  const out: TrendDay[] = [];
  for (let d = 6; d >= 0; d--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - d);
    const s = day.getTime();
    const e = s + 86400000;
    const count = feeds.filter((f) => f.time >= s && f.time < e).length;
    out.push({ label: dl[day.getDay()], count, today: d === 0 });
  }
  return out;
}

/** "HH:MM" (24h) for an <input type="time">. */
export function toHhmm(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Apply an "HH:MM" string to the date portion of an existing timestamp. */
export function applyHhmm(baseMs: number, hhmm: string): number {
  const [h, m] = String(hhmm || "0:0").split(":").map(Number);
  const d = new Date(baseMs);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.getTime();
}

export function greetingFor(ms: number): string {
  const h = new Date(ms).getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

/** "45s", "12m 34s", or "1h 05m" for a logged feed's duration. */
export function fmtDuration(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

export function dateLabelFor(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** "Today", "Yesterday", or a full date label — for grouping feeds by day. */
export function dayLabelFor(ms: number): string {
  const day = new Date(ms);
  day.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return dateLabelFor(ms);
}

export type Granularity = "day" | "week" | "month" | "quarter" | "year";

/** Number of bars/cards shown per Insights window, per granularity. */
export const BUCKET_COUNT: Record<Granularity, number> = {
  day: 7,
  week: 8,
  month: 6,
  quarter: 4,
  year: 5,
};

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Start-of-bucket for a timestamp, in local time. */
function bucketStartFor(ms: number, g: Granularity): Date {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  if (g === "week") {
    d.setDate(d.getDate() - d.getDay());
  } else if (g === "month") {
    d.setDate(1);
  } else if (g === "quarter") {
    d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1);
  } else if (g === "year") {
    d.setMonth(0, 1);
  }
  return d;
}

/** Advances a (bucket-aligned) date by `n` whole buckets, using local calendar math. */
function addBuckets(d: Date, g: Granularity, n: number): Date {
  const c = new Date(d);
  if (g === "day") c.setDate(c.getDate() + n);
  else if (g === "week") c.setDate(c.getDate() + n * 7);
  else if (g === "month") c.setMonth(c.getMonth() + n);
  else if (g === "quarter") c.setMonth(c.getMonth() + n * 3);
  else c.setFullYear(c.getFullYear() + n);
  return c;
}

/**
 * Calendar-day count between two local-midnight timestamps, via UTC-normalized
 * differencing rather than raw ms subtraction — a DST transition inside the
 * range would otherwise make the real elapsed time 23h/25h off from a whole
 * number of days and skew per-day averages.
 */
function daysBetween(aMs: number, bMs: number): number {
  const a = new Date(aMs);
  const b = new Date(bMs);
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.max(1, Math.round((utcB - utcA) / 86400000));
}

function bucketBarLabel(start: Date, g: Granularity): string {
  const curYear = new Date().getFullYear();
  const yearSuffix = start.getFullYear() !== curYear ? `'${String(start.getFullYear()).slice(2)}` : "";
  switch (g) {
    case "day":
      return WEEKDAY_LETTERS[start.getDay()];
    case "week":
      return `${start.getMonth() + 1}/${start.getDate()}`;
    case "month":
      return `${MONTH_SHORT[start.getMonth()]}${yearSuffix}`;
    case "quarter":
      return `Q${Math.floor(start.getMonth() / 3) + 1}${yearSuffix}`;
    case "year":
      return String(start.getFullYear());
  }
}

function bucketFullLabel(start: Date, end: Date, g: Granularity): string {
  switch (g) {
    case "day":
      return dayLabelFor(start.getTime());
    case "week": {
      const endIncl = new Date(end.getTime() - 86400000);
      return `${MONTH_SHORT[start.getMonth()]} ${start.getDate()} – ${MONTH_SHORT[endIncl.getMonth()]} ${endIncl.getDate()}, ${endIncl.getFullYear()}`;
    }
    case "month":
      return `${MONTH_SHORT[start.getMonth()]} ${start.getFullYear()}`;
    case "quarter": {
      const endIncl = new Date(end.getTime() - 86400000);
      return `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()} (${MONTH_SHORT[start.getMonth()]}–${MONTH_SHORT[endIncl.getMonth()]})`;
    }
    case "year":
      return String(start.getFullYear());
  }
}

function windowRangeLabel(firstStart: Date, lastEnd: Date, g: Granularity): string {
  const endIncl = new Date(lastEnd.getTime() - 86400000);
  if (g === "day" || g === "week") {
    return `${MONTH_SHORT[firstStart.getMonth()]} ${firstStart.getDate()} – ${MONTH_SHORT[endIncl.getMonth()]} ${endIncl.getDate()}, ${endIncl.getFullYear()}`;
  }
  if (g === "month" || g === "quarter") {
    return firstStart.getFullYear() === endIncl.getFullYear()
      ? `${MONTH_SHORT[firstStart.getMonth()]} – ${MONTH_SHORT[endIncl.getMonth()]} ${endIncl.getFullYear()}`
      : `${MONTH_SHORT[firstStart.getMonth()]} ${firstStart.getFullYear()} – ${MONTH_SHORT[endIncl.getMonth()]} ${endIncl.getFullYear()}`;
  }
  return `${firstStart.getFullYear()} – ${endIncl.getFullYear()}`;
}

export interface BucketStats {
  start: number;
  end: number;
  feedCount: number;
  bottleMl: number;
  formulaMl: number;
  breastMilkMl: number;
  breastCount: number;
  breastDurationSec: number;
  avgFeedsPerDay: number;
  avgMlPerDay: number;
  avgIntervalSec: number | null;
  isCurrent: boolean;
  barLabel: string;
  fullLabel: string;
}

export interface InsightsWindow {
  buckets: BucketStats[];
  rangeLabel: string;
  canGoNext: boolean;
}

function statsForBucket(start: Date, end: Date, feeds: Feed[], g: Granularity): BucketStats {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const inBucket = feeds.filter((f) => f.time >= startMs && f.time < endMs);

  let bottleMl = 0;
  let formulaMl = 0;
  let breastMilkMl = 0;
  let breastCount = 0;
  let breastDurationSec = 0;
  for (const f of inBucket) {
    if (f.type === "bottle") {
      const ml = f.ml ?? 0;
      bottleMl += ml;
      if (f.is_formula) formulaMl += ml;
      else breastMilkMl += ml;
    } else {
      breastCount++;
      breastDurationSec += f.duration_sec ?? 0;
    }
  }

  let avgIntervalSec: number | null = null;
  if (inBucket.length >= 2) {
    const sorted = [...inBucket].sort((a, b) => a.time - b.time);
    let totalGap = 0;
    for (let i = 1; i < sorted.length; i++) totalGap += sorted[i].time - sorted[i - 1].time;
    avgIntervalSec = totalGap / (sorted.length - 1) / 1000;
  }

  const days = daysBetween(startMs, endMs);
  const now = Date.now();

  return {
    start: startMs,
    end: endMs,
    feedCount: inBucket.length,
    bottleMl,
    formulaMl,
    breastMilkMl,
    breastCount,
    breastDurationSec,
    avgFeedsPerDay: inBucket.length / days,
    avgMlPerDay: bottleMl / days,
    avgIntervalSec,
    isCurrent: now >= startMs && now < endMs,
    barLabel: bucketBarLabel(start, g),
    fullLabel: bucketFullLabel(start, end, g),
  };
}

/** Builds an ordered (oldest→newest) window of `BUCKET_COUNT[g]` buckets ending at `anchorMs`'s bucket. */
export function buildInsightsWindow(feeds: Feed[], granularity: Granularity, anchorMs: number): InsightsWindow {
  const n = BUCKET_COUNT[granularity];
  const lastStart = bucketStartFor(anchorMs, granularity);
  const buckets: BucketStats[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = addBuckets(lastStart, granularity, -i);
    const end = addBuckets(start, granularity, 1);
    buckets.push(statsForBucket(start, end, feeds, granularity));
  }
  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  const nowBucketStart = bucketStartFor(Date.now(), granularity).getTime();
  return {
    buckets,
    rangeLabel: windowRangeLabel(new Date(first.start), new Date(last.end), granularity),
    canGoNext: lastStart.getTime() < nowBucketStart,
  };
}

/** Pages the window a full page forward/backward through history, clamped at the present. */
export function shiftAnchor(anchorMs: number, granularity: Granularity, dir: 1 | -1): number {
  const n = BUCKET_COUNT[granularity];
  const base = bucketStartFor(anchorMs, granularity);
  const shifted = addBuckets(base, granularity, dir * n);
  const nowBucketStart = bucketStartFor(Date.now(), granularity);
  return Math.min(shifted.getTime(), nowBucketStart.getTime());
}

export interface FeedDayGroup {
  key: number;
  label: string;
  feeds: Feed[];
}

/** Groups feeds by calendar day, newest day first, feeds within a day newest first. */
export function groupFeedsByDay(feeds: Feed[]): FeedDayGroup[] {
  const sorted = [...feeds].sort((a, b) => b.time - a.time);
  const map = new Map<number, Feed[]>();
  for (const f of sorted) {
    const d = new Date(f.time);
    d.setHours(0, 0, 0, 0);
    const key = d.getTime();
    const group = map.get(key);
    if (group) group.push(f);
    else map.set(key, [f]);
  }
  return Array.from(map.entries()).map(([key, dayFeeds]) => ({
    key,
    label: dayLabelFor(key),
    feeds: dayFeeds,
  }));
}
