export type Unit = "ml" | "oz";

/** US fluid ounce, exact. */
const ML_PER_OZ = 29.5735295625;

export function mlToOz(ml: number): number {
  return ml / ML_PER_OZ;
}

export function ozToMl(oz: number): number {
  return oz * ML_PER_OZ;
}

/** Amount as a display string in the given unit — whole ml, or oz to 1 decimal. */
export function formatAmount(ml: number, unit: Unit): string {
  return unit === "oz" ? mlToOz(ml).toFixed(1) : String(Math.round(ml));
}

export interface StepOption {
  label: string;
  ml: number;
}

/** Selectable +/- stepper sizes, labeled in the given unit's own natural increments. */
export function stepOptionsFor(unit: Unit): StepOption[] {
  if (unit === "oz") {
    return [
      { label: "¼ oz", ml: Math.round(ozToMl(0.25)) },
      { label: "½ oz", ml: Math.round(ozToMl(0.5)) },
      { label: "1 oz", ml: Math.round(ozToMl(1)) },
      { label: "2 oz", ml: Math.round(ozToMl(2)) },
    ];
  }
  return [
    { label: "1 ml", ml: 1 },
    { label: "5 ml", ml: 5 },
    { label: "20 ml", ml: 20 },
    { label: "50 ml", ml: 50 },
    { label: "100 ml", ml: 100 },
  ];
}
