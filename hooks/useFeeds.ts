"use client";

import { useCallback, useEffect, useState } from "react";
import type { Feed, FeedType } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { useChildContext } from "@/lib/ChildContext";

const TABLE = "feeds";

/**
 * Feed log backed by Supabase, scoped to the active child profile.
 * Kept in sync across devices via Realtime. `loaded` guards against
 * a flash of empty state before the initial fetch resolves.
 */
export function useFeeds() {
  const { child, loaded: childLoaded } = useChildContext();
  const childId = child?.id ?? null;

  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // If no child, don't fetch
    if (!childId) {
      setFeeds([]);
      setLoaded(false);
      return;
    }

    let cancelled = false;

    supabase
      .from(TABLE)
      .select("id, time, type, ml, is_formula, duration_sec, child_id")
      .eq("child_id", childId)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Failed to load feeds:", error.message);
        setFeeds(data ?? []);
        setLoaded(true);
      });

    const channelName = `feeds-changes-${childId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLE, filter: `child_id=eq.${childId}` },
        (payload) => {
          setFeeds((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((f) => f.id !== (payload.old as Feed).id);
            }
            const row = payload.new as Feed;
            const exists = prev.some((f) => f.id === row.id);
            return exists ? prev.map((f) => (f.id === row.id ? row : f)) : [...prev, row];
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [childId]);

  const addFeed = useCallback(
    (type: FeedType, opts: { ml?: number | null; isFormula?: boolean | null; durationSec?: number | null } = {}) => {
      if (!childId) {
        console.warn("No child selected, cannot add feed");
        return;
      }

      const feed: Feed = {
        id: crypto.randomUUID(),
        time: Date.now(),
        type,
        ml: type === "bottle" ? opts.ml ?? 0 : null,
        is_formula: type === "bottle" ? opts.isFormula ?? false : null,
        duration_sec: type === "breast" ? opts.durationSec ?? null : null,
        child_id: childId,
      };
      setFeeds((prev) => [...prev, feed]);
      supabase
        .from(TABLE)
        .insert(feed)
        .then(({ error }) => {
          if (error) console.error("Failed to save feed:", error.message);
        });
    },
    [childId]
  );

  const deleteFeed = useCallback((id: string) => {
    setFeeds((prev) => prev.filter((f) => f.id !== id));
    supabase
      .from(TABLE)
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to delete feed:", error.message);
      });
  }, []);

  const updateFeed = useCallback((id: string, patch: Partial<Feed>) => {
    setFeeds((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    supabase
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to update feed:", error.message);
      });
  }, []);

  return { feeds, loaded, addFeed, deleteFeed, updateFeed };
}
