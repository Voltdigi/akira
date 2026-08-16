"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeightUnit } from "@/lib/childUnits";

const KEY = "bft_weight_unit_v1";

/** kg/lb display preference — a per-device setting, kept in localStorage. */
export function useWeightUnit() {
  const [unit, setUnitState] = useState<WeightUnit>("kg");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === "kg" || raw === "lb") setUnitState(raw);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const setUnit = useCallback((v: WeightUnit) => {
    setUnitState(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  return { unit, setUnit, loaded };
}
