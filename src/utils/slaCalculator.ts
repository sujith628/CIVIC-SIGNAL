import { ComplaintCategory, SeverityLevel } from '../types';

/**
 * Standard SLA duration in hours based on category and severity
 */
export const CATEGORY_SLA_HOURS: Record<ComplaintCategory, Record<SeverityLevel, number>> = {
  garbage_solid_waste: { Low: 48, Medium: 24, High: 12, Critical: 6 },
  drainage_sewerage: { Low: 36, Medium: 24, High: 12, Critical: 4 },
  water_supply: { Low: 24, Medium: 12, High: 6, Critical: 2 },
  roads_potholes: { Low: 96, Medium: 72, High: 48, Critical: 24 },
  streetlights: { Low: 72, Medium: 48, High: 24, Critical: 12 },
  sanitation: { Low: 48, Medium: 24, High: 12, Critical: 6 },
  stormwater_flooding: { Low: 24, Medium: 12, High: 6, Critical: 3 },
  stray_animals: { Low: 72, Medium: 48, High: 24, Critical: 12 },
  infrastructure: { Low: 120, Medium: 96, High: 48, Critical: 24 },
  parks: { Low: 120, Medium: 72, High: 48, Critical: 24 },
  encroachment: { Low: 168, Medium: 96, High: 72, Critical: 48 },
  other: { Low: 72, Medium: 48, High: 24, Critical: 12 },
};

/**
 * Computes ISO deadline string given a submitted timestamp, category, and severity
 */
export function calculateSlaDeadline(
  submittedAtIso: string,
  category: ComplaintCategory,
  severity: SeverityLevel
): string {
  const submittedDate = new Date(submittedAtIso);
  const hours = CATEGORY_SLA_HOURS[category]?.[severity] || 48;
  const deadlineDate = new Date(submittedDate.getTime() + hours * 60 * 60 * 1000);
  return deadlineDate.toISOString();
}

/**
 * Checks if an SLA deadline has been breached
 */
export function isSlaBreached(deadlineIso: string, resolvedAtIso?: string): boolean {
  const deadline = new Date(deadlineIso).getTime();
  const compareTime = resolvedAtIso ? new Date(resolvedAtIso).getTime() : Date.now();
  return compareTime > deadline;
}

/**
 * Calculates remaining hours or hours overdue
 */
export function getSlaRemainingHours(deadlineIso: string, nowIso?: string): {
  hoursLeft: number;
  isOverdue: boolean;
  formatted: string;
} {
  const now = nowIso ? new Date(nowIso).getTime() : Date.now();
  const deadline = new Date(deadlineIso).getTime();
  const diffMs = deadline - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) {
    return {
      hoursLeft: Math.abs(diffHours),
      isOverdue: true,
      formatted: `${Math.abs(diffHours)}h overdue`
    };
  }

  return {
    hoursLeft: diffHours,
    isOverdue: false,
    formatted: `${diffHours}h remaining`
  };
}
