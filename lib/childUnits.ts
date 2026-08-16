export type LengthUnit = "cm" | "in";
export type WeightUnit = "kg" | "lb";

/** Inch to cm conversion factor. */
const CM_PER_IN = 2.54;

/** Pound to kg conversion factor. */
const KG_PER_LB = 0.45359237;

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN;
}

export function inToCm(inch: number): number {
  return inch * CM_PER_IN;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/** Height as a display string in the given unit — whole cm, or in to 1 decimal. */
export function formatHeight(cm: number, unit: LengthUnit): string {
  return unit === "in" ? cmToIn(cm).toFixed(1) : String(Math.round(cm));
}

/** Weight as a display string in the given unit — both to 1 decimal. */
export function formatWeight(kg: number, unit: WeightUnit): string {
  return unit === "lb" ? kgToLb(kg).toFixed(1) : kg.toFixed(1);
}
