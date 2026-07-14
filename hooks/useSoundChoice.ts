"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SOUND_ID, SOUND_OPTIONS } from "@/lib/sounds";

const KEY = "bft_sound_v1";

/** Which settings-icon sound effect to play — a per-device setting, kept in localStorage. */
export function useSoundChoice() {
  const [soundId, setSoundIdState] = useState(DEFAULT_SOUND_ID);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw && SOUND_OPTIONS.some((s) => s.id === raw)) setSoundIdState(raw);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const setSoundId = useCallback((id: string) => {
    setSoundIdState(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const sound = SOUND_OPTIONS.find((s) => s.id === soundId) ?? SOUND_OPTIONS[0];

  return { soundId, setSoundId, sound, loaded };
}
