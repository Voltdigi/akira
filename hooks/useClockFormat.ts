"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "bft_hour12_v1";

/** 12h/24h display preference — a per-device setting, kept in localStorage. */
export function useClockFormat() {
  const [hour12, setHour12State] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setHour12State(raw === "12");
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const setHour12 = useCallback((v: boolean) => {
    setHour12State(v);
    try {
      localStorage.setItem(KEY, v ? "12" : "24");
    } catch {
      /* ignore */
    }
  }, []);

  return { hour12, setHour12, loaded };
}
