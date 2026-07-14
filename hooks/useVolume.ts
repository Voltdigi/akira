"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "bft_volume_v1";
const DEFAULT_VOLUME = 0.7;

/** Sound-effect volume (0-1) — a per-device setting, kept in localStorage. */
export function useVolume() {
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw !== null) {
        const n = Number(raw);
        if (!Number.isNaN(n)) setVolumeState(Math.min(1, Math.max(0, n)));
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    try {
      localStorage.setItem(KEY, String(clamped));
    } catch {
      /* ignore */
    }
  }, []);

  return { volume, setVolume, loaded };
}
