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

/** +/- stepper size, in ml, that feels natural for the given unit. */
export function stepMl(unit: Unit): number {
  return unit === "oz" ? Math.round(ozToMl(0.5)) : 10;
}

export interface AmountPreset {
  label: string;
  ml: number;
}

/** Quick-pick amounts, in ml, labeled in the given unit. */
export function presetsFor(unit: Unit): AmountPreset[] {
  if (unit === "oz") {
    return [2, 3, 4, 5, 6].map((oz) => ({ label: `${oz} oz`, ml: Math.round(ozToMl(oz)) }));
  }
  return [60, 90, 120, 150, 180].map((ml) => ({ label: `${ml} ml`, ml }));
}
