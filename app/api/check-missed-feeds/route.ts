import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { publishToChild } from "@/lib/beamsServer";

/**
 * Periodic missed-feed check (KAN-4). Invoked by Vercel Cron (see
 * vercel.json) — Vercel automatically sends `Authorization: Bearer
 * $CRON_SECRET` on cron-triggered requests when CRON_SECRET is set as a
 * project env var, so we just compare against that.
 *
 * Only the "missed feed" alert type is implemented: medication/sleep
 * alerts need KAN-1/KAN-2 chambers that don't exist yet. Preferences for
 * those types exist in the schema and are intentionally ignored here.
 *
 * Alerts are always logged in-app (acceptance criteria: visible even if
 * push is missed); push is sent additionally only if the child's
 * push_enabled preference is on.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: prefs, error: prefsError } = await supabaseAdmin
    .from("alert_preferences")
    .select("child_id, missed_feed_enabled, missed_feed_threshold_hours, push_enabled")
    .eq("missed_feed_enabled", true);

  if (prefsError) {
    console.error("check-missed-feeds: failed to load alert_preferences:", prefsError.message);
    return NextResponse.json({ error: prefsError.message }, { status: 500 });
  }

  const results: Array<{ childId: string; fired: boolean; reason: string }> = [];

  for (const pref of prefs ?? []) {
    const childId = pref.child_id as string;
    const thresholdHours = Number(pref.missed_feed_threshold_hours) || 4;

    const { data: lastFeed, error: feedError } = await supabaseAdmin
      .from("feeds")
      .select("time")
      .eq("child_id", childId)
      .order("time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (feedError) {
      console.error(`check-missed-feeds: failed to load feeds for ${childId}:`, feedError.message);
      results.push({ childId, fired: false, reason: "feed query error" });
      continue;
    }

    if (!lastFeed) {
      results.push({ childId, fired: false, reason: "no feeds logged yet" });
      continue;
    }

    const lastFeedMs = Number(lastFeed.time);
    const hoursSince = (Date.now() - lastFeedMs) / 3_600_000;

    if (hoursSince < thresholdHours) {
      results.push({ childId, fired: false, reason: "within threshold" });
      continue;
    }

    // Dedupe: don't re-fire for the same miss window — only once per
    // elapsed-since-last-feed period, until a new feed is logged.
    const { data: existingAlert, error: alertCheckError } = await supabaseAdmin
      .from("alerts")
      .select("id")
      .eq("child_id", childId)
      .eq("type", "missed_feed")
      .gt("triggered_at", new Date(lastFeedMs).toISOString())
      .limit(1)
      .maybeSingle();

    if (alertCheckError) {
      console.error(`check-missed-feeds: failed to check existing alerts for ${childId}:`, alertCheckError.message);
      results.push({ childId, fired: false, reason: "alert check error" });
      continue;
    }

    if (existingAlert) {
      results.push({ childId, fired: false, reason: "already alerted this window" });
      continue;
    }

    const title = "Missed feed";
    const message = `No feed logged in over ${thresholdHours} hour${thresholdHours === 1 ? "" : "s"}.`;

    const { error: insertError } = await supabaseAdmin.from("alerts").insert({
      child_id: childId,
      type: "missed_feed",
      title,
      message,
    });

    if (insertError) {
      console.error(`check-missed-feeds: failed to insert alert for ${childId}:`, insertError.message);
      results.push({ childId, fired: false, reason: "insert error" });
      continue;
    }

    if (pref.push_enabled) {
      try {
        await publishToChild(childId, { title, body: message });
      } catch (error) {
        console.error(`check-missed-feeds: failed to publish push for ${childId}:`, error);
      }
    }

    results.push({ childId, fired: true, reason: "missed feed alert fired" });
  }

  return NextResponse.json({ checked: results.length, results });
}
