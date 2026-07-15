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
