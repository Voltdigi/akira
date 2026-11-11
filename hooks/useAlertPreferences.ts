"use client";

import { useCallback, useEffect, useState } from "react";
import type { AlertPreferences } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { enablePushForChild, disablePushForChild } from "@/lib/beamsClient";

const TABLE = "alert_preferences";

interface UseAlertPreferencesResult {
  prefs: AlertPreferences | null;
  loaded: boolean;
  updatePrefs: (patch: Partial<Pick<AlertPreferences, "missed_feed_enabled" | "missed_feed_threshold_hours">>) => void;
  setPushEnabled: (enabled: boolean) => Promise<{ error: string | null }>;
}

/** Fetch and manage the alert preferences row for a child (auto-provisioned on first load). */
export function useAlertPreferences(childId: string | null): UseAlertPreferencesResult {
  const [prefs, setPrefs] = useState<AlertPreferences | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!childId) {
      setPrefs(null);
      setLoaded(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data, error: fetchError } = await supabase
        .from(TABLE)
        .select("*")
        .eq("child_id", childId)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        console.error("Failed to load alert preferences:", fetchError.message);
        setLoaded(true);
        return;
      }

      if (data) {
        setPrefs(data as AlertPreferences);
        setLoaded(true);
        return;
      }

      const { data: created, error: insertError } = await supabase
        .from(TABLE)
        .insert({ child_id: childId })
        .select("*")
        .single();

      if (cancelled) return;

      if (insertError) {
        console.error("Failed to create alert preferences:", insertError.message);
        setLoaded(true);
        return;
      }

      setPrefs(created as AlertPreferences);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [childId]);

  const updatePrefs = useCallback(
    (patch: Partial<Pick<AlertPreferences, "missed_feed_enabled" | "missed_feed_threshold_hours">>) => {
      if (!prefs) return;
      setPrefs({ ...prefs, ...patch });
      supabase
        .from(TABLE)
        .update(patch)
        .eq("child_id", prefs.child_id)
        .then(({ error }) => {
          if (error) console.error("Failed to update alert preferences:", error.message);
        });
    },
    [prefs]
  );

  const setPushEnabled = useCallback(
    async (enabled: boolean): Promise<{ error: string | null }> => {
      if (!prefs || !childId) return { error: "Profile not loaded yet" };

      const result = enabled ? await enablePushForChild(childId) : await disablePushForChild(childId);
      if (result.error) return result;

      setPrefs({ ...prefs, push_enabled: enabled });
      const { error } = await supabase.from(TABLE).update({ push_enabled: enabled }).eq("child_id", childId);
      if (error) {
        console.error("Failed to persist push_enabled:", error.message);
        return { error: error.message };
      }
      return { error: null };
    },
    [prefs, childId]
  );

  return { prefs, loaded, updatePrefs, setPushEnabled };
}
