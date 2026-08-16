"use client";

import { useCallback, useEffect, useState } from "react";
import type { LengthUnit } from "@/lib/childUnits";

const KEY = "bft_length_unit_v1";

/** cm/in display preference — a per-device setting, kept in localStorage. */
export function useLengthUnit() {
  const [unit, setUnitState] = useState<LengthUnit>("cm");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === "cm" || raw === "in") setUnitState(raw);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const setUnit = useCallback((v: LengthUnit) => {
    setUnitState(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  return { unit, setUnit, loaded };
}
