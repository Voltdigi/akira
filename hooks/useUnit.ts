"use client";

import { useCallback, useEffect, useState } from "react";
import type { Unit } from "@/lib/units";

const KEY = "bft_unit_v1";

/** ml/oz display preference — a per-device setting, kept in localStorage. */
export function useUnit() {
  const [unit, setUnitState] = useState<Unit>("ml");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === "ml" || raw === "oz") setUnitState(raw);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const setUnit = useCallback((v: Unit) => {
    setUnitState(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  return { unit, setUnit, loaded };
}
