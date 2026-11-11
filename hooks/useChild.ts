"use client";

import { useCallback, useEffect, useState } from "react";
import type { Child } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";

const TABLE = "children";
const PHOTO_BUCKET = "child-photos";

interface UseChildResult {
  child: Child | null;
  loaded: boolean;
  updateChild: (patch: Partial<Pick<Child, "name" | "birthdate" | "height_cm" | "weight_kg" | "photo_url">>) => void;
  uploadPhoto: (file: File) => Promise<{ error: string | null }>;
}

/** Fetch and manage a single child profile for the authenticated user. */
export function useChild(userId: string | null): UseChildResult {
  const [child, setChild] = useState<Child | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setChild(null);
      setLoaded(false);
      return;
    }

    let cancelled = false;

    (async () => {
      // Fetch the first (and typically only) child for this user
      const { data, error: fetchError } = await supabase
        .from(TABLE)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        console.error("Failed to load child:", fetchError.message);
        setLoaded(true);
        return;
      }

      if (data) {
        setChild(data as Child);
        setLoaded(true);
        return;
      }

      // Auto-provision a child if none exists
      const { data: newChild, error: insertError } = await supabase
        .from(TABLE)
        .insert({ user_id: userId, name: "Baby" })
        .select("*")
        .single();

      if (cancelled) return;

      if (insertError) {
        console.error("Failed to create child:", insertError.message);
        setLoaded(true);
        return;
      }

      setChild(newChild as Child);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const updateChild = useCallback(
    (patch: Partial<Pick<Child, "name" | "birthdate" | "height_cm" | "weight_kg" | "photo_url">>) => {
      if (!child) return;

      // Optimistic update
      setChild({ ...child, ...patch });

      // Persist to Supabase
      supabase
        .from(TABLE)
        .update(patch)
        .eq("id", child.id)
        .then(({ error }) => {
          if (error) console.error("Failed to update child:", error.message);
        });
    },
    [child]
  );

  const uploadPhoto = useCallback(
    async (file: File): Promise<{ error: string | null }> => {
      if (!child || !userId) return { error: "No profile loaded yet" };

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${child.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });

      if (uploadError) {
        console.error("Failed to upload photo:", uploadError.message);
        return { error: uploadError.message };
      }

      const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      updateChild({ photo_url: data.publicUrl });
      return { error: null };
    },
    [child, userId, updateChild]
  );

  return { child, loaded, updateChild, uploadPhoto };
}
