"use client";

import { useCallback, useEffect, useState } from "react";
import type { AlertLog } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { useChildContext } from "@/lib/ChildContext";

const TABLE = "alerts";

/** In-app alert log for the active child, kept live via Realtime. */
export function useAlerts() {
  const { child } = useChildContext();
  const childId = child?.id ?? null;

  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!childId) {
      setAlerts([]);
      setLoaded(false);
      return;
    }

    let cancelled = false;

    supabase
      .from(TABLE)
      .select("*")
      .eq("child_id", childId)
      .order("triggered_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Failed to load alerts:", error.message);
        setAlerts((data ?? []) as AlertLog[]);
        setLoaded(true);
      });

    const channel = supabase
      .channel(`alerts-changes-${childId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLE, filter: `child_id=eq.${childId}` },
        (payload) => {
          setAlerts((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((a) => a.id !== (payload.old as AlertLog).id);
            }
            const row = payload.new as AlertLog;
            const exists = prev.some((a) => a.id === row.id);
            const next = exists ? prev.map((a) => (a.id === row.id ? row : a)) : [row, ...prev];
            return next.sort((a, b) => +new Date(b.triggered_at) - +new Date(a.triggered_at));
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [childId]);

  const unseenCount = alerts.filter((a) => !a.seen).length;

  const markSeen = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, seen: true } : a)));
    supabase
      .from(TABLE)
      .update({ seen: true })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to mark alert seen:", error.message);
      });
  }, []);

  const markAllSeen = useCallback(() => {
    if (!childId) return;
    setAlerts((prev) => prev.map((a) => ({ ...a, seen: true })));
    supabase
      .from(TABLE)
      .update({ seen: true })
      .eq("child_id", childId)
      .eq("seen", false)
      .then(({ error }) => {
        if (error) console.error("Failed to mark all alerts seen:", error.message);
      });
  }, [childId]);

  return { alerts, loaded, unseenCount, markSeen, markAllSeen };
}
