"use client";

import { useCallback, useEffect, useState } from "react";
import type { Feed, FeedType } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";

const TABLE = "feeds";

/**
 * Feed log backed by Supabase. No auth — one shared table, kept in sync
 * across devices via Realtime. `loaded` guards against a flash of empty
 * state before the initial fetch resolves.
 */
export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from(TABLE)
      .select("id, time, type, ml")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Failed to load feeds:", error.message);
        setFeeds(data ?? []);
        setLoaded(true);
      });

    const channel = supabase
      .channel("feeds-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLE },
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
  }, []);

  const addFeed = useCallback((type: FeedType, ml: number | null) => {
    const feed: Feed = {
      id: crypto.randomUUID(),
      time: Date.now(),
      type,
      ml: type === "bottle" ? ml ?? 0 : null,
    };
    setFeeds((prev) => [...prev, feed]);
    supabase
      .from(TABLE)
      .insert(feed)
      .then(({ error }) => {
        if (error) console.error("Failed to save feed:", error.message);
      });
  }, []);

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
