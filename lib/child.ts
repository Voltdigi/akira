/**
 * Computes a human-readable age from a birthdate ISO string.
 * E.g. "3 days old" / "6 months old" / "1 year, 2 months old"
 */
export function calculateAge(birthdateIso: string | null, nowMs: number = Date.now()): string | null {
  if (!birthdateIso) return null;

  const birthdate = new Date(`${birthdateIso}T00:00:00Z`);
  const now = new Date(nowMs);

  let years = now.getUTCFullYear() - birthdate.getUTCFullYear();
  let months = now.getUTCMonth() - birthdate.getUTCMonth();
  let days = now.getUTCDate() - birthdate.getUTCDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    // Use last day of previous month
    const lastDayOfPrevMonth = new Date(now.getUTCFullYear(), now.getUTCMonth(), 0).getUTCDate();
    days += lastDayOfPrevMonth;
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  // Special case: less than 1 month
  if (years === 0 && months === 0) {
    return days === 1 ? "1 day old" : `${days} days old`;
  }

  // Special case: less than 1 year
  if (years === 0) {
    return months === 1 ? "1 month old" : `${months} months old`;
  }

  // Years + months
  const yearPart = years === 1 ? "1 year" : `${years} years`;
  if (months === 0) {
    return `${yearPart} old`;
  }
  const monthPart = months === 1 ? "1 month" : `${months} months`;
  return `${yearPart}, ${monthPart} old`;
}
