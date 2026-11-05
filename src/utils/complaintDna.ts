import { Complaint, UnderlyingCivicIssue, SeverityLevel } from '../types';
import { haversineDistanceMeters } from './geo';

/**
 * Stopwords to filter for lightweight semantic similarity calculation
 */
const STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of',
  'with', 'near', 'by', 'from', 'about', 'our', 'my', 'there', 'has', 'been',
  'very', 'much', 'please', 'gvmc', 'colony', 'street', 'road', 'ward'
]);

/**
 * Tokenize and normalize text into word bag
 */
export function extractKeywords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOPWORDS.has(word));
  return new Set(words);
}

/**
 * Calculate Jaccard / token-overlap semantic similarity score between two texts (0 to 1)
 */
export function calculateSemanticSimilarity(textA: string, textB: string): number {
  const setA = extractKeywords(textA);
  const setB = extractKeywords(textB);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const word of setA) {
    if (setB.has(word)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Check if two complaints should be clustered under Complaint DNA
 * Criteria:
 * 1. Category matches or is adjacent (e.g. garbage + sanitation, or drainage + stormwater)
 * 2. Geo proximity <= 450 meters
 * 3. Semantic similarity >= 0.20 OR same specific locality + category within 14 days
 */
export function evaluateDnaLink(
  complaintA: Complaint,
  complaintB: Complaint
): {
  isLinked: boolean;
  confidence: number;
  distanceMeters: number;
  semanticSimilarity: number;
  temporalDeltaDays: number;
} {
  const distanceMeters = haversineDistanceMeters(
    complaintA.latitude,
    complaintA.longitude,
    complaintB.latitude,
    complaintB.longitude
  );

  const semanticSimilarity = calculateSemanticSimilarity(
    `${complaintA.title} ${complaintA.description}`,
    `${complaintB.title} ${complaintB.description}`
  );

  const timeA = new Date(complaintA.submittedAt).getTime();
  const timeB = new Date(complaintB.submittedAt).getTime();
  const temporalDeltaDays = Math.abs(timeA - timeB) / (1000 * 60 * 60 * 24);

  // Category match or related categories
  const exactCategoryMatch = complaintA.category === complaintB.category;
  const relatedCategoryMatch =
    (complaintA.category === 'garbage_solid_waste' && complaintB.category === 'sanitation') ||
    (complaintA.category === 'sanitation' && complaintB.category === 'garbage_solid_waste') ||
    (complaintA.category === 'drainage_sewerage' && complaintB.category === 'stormwater_flooding') ||
    (complaintA.category === 'stormwater_flooding' && complaintB.category === 'drainage_sewerage');

  if (!exactCategoryMatch && !relatedCategoryMatch) {
    return {
      isLinked: false,
      confidence: 0,
      distanceMeters,
      semanticSimilarity,
      temporalDeltaDays
    };
  }

  // Calculate DNA confidence score (0 to 100)
  // Distance score: 100 at 0m, 0 at 500m
  const geoScore = Math.max(0, 1 - distanceMeters / 500);
  // Temporal score: 100 at 0 days, drops over 30 days
  const tempScore = Math.max(0, 1 - temporalDeltaDays / 30);
  // Semantic score: normalized
  const textScore = Math.min(1, semanticSimilarity * 2.5);

  const confidence = Math.round((geoScore * 0.45 + textScore * 0.35 + tempScore * 0.20) * 100);

  const isLinked = distanceMeters <= 500 && (semanticSimilarity >= 0.15 || distanceMeters <= 250);

  return {
    isLinked,
    confidence,
    distanceMeters,
    semanticSimilarity: Math.round(semanticSimilarity * 100) / 100,
    temporalDeltaDays: Math.round(temporalDeltaDays * 10) / 10
  };
}

/**
 * Calculates priority score (0 - 100) based on severity, public safety, recurrence, duration, and infrastructure
 */
export function calculatePriorityScore(params: {
  severity: SeverityLevel;
  recurrenceCount: number;
  publicSafetyRisk: boolean;
  infrastructureCriticality: 'High' | 'Medium' | 'Normal';
  daysUnresolved: number;
}): { score: number; explainability: string[] } {
  const { severity, recurrenceCount, publicSafetyRisk, infrastructureCriticality, daysUnresolved } = params;

  let base = 25;
  const reasons: string[] = [];

  switch (severity) {
    case 'Critical':
      base += 35;
      reasons.push('High severity civic disruption (+35)');
      break;
    case 'High':
      base += 25;
      reasons.push('Elevated municipal severity rating (+25)');
      break;
    case 'Medium':
      base += 15;
      reasons.push('Moderate neighborhood impact (+15)');
      break;
    case 'Low':
      base += 5;
      reasons.push('Standard maintenance priority (+5)');
      break;
  }

  // Recurrence factor: +5 per repeat citizen report up to +25
  const recurrenceBoost = Math.min(25, (recurrenceCount - 1) * 6);
  if (recurrenceBoost > 0) {
    base += recurrenceBoost;
    reasons.push(`Persistent issue: ${recurrenceCount} independent citizen reports (+${recurrenceBoost})`);
  }

  if (publicSafetyRisk) {
    base += 15;
    reasons.push('Public health / road hazard safety alert (+15)');
  }

  if (infrastructureCriticality === 'High') {
    base += 15;
    reasons.push('Critical arterial corridor or water mainline (+15)');
  } else if (infrastructureCriticality === 'Medium') {
    base += 8;
    reasons.push('Secondary feeder road or collector drain (+8)');
  }

  if (daysUnresolved > 3) {
    const ageBoost = Math.min(10, Math.floor(daysUnresolved * 1.5));
    base += ageBoost;
    reasons.push(`Extended duration unresolved (${daysUnresolved} days, +${ageBoost})`);
  }

  const score = Math.min(100, Math.max(1, base));
  return { score, explainability: reasons };
}

/**
 * Group complaints into underlying civic issues
 */
export function clusterComplaintsIntoUnderlyingIssues(
  complaints: Complaint[],
  existingIssues: UnderlyingCivicIssue[] = []
): UnderlyingCivicIssue[] {
  const issuesMap = new Map<string, UnderlyingCivicIssue>();

  // Seed with existing
  for (const issue of existingIssues) {
    issuesMap.set(issue.id, { ...issue, complaintIds: [...issue.complaintIds] });
  }

  for (const complaint of complaints) {
    if (complaint.underlyingIssueId && issuesMap.has(complaint.underlyingIssueId)) {
      const existing = issuesMap.get(complaint.underlyingIssueId)!;
      if (!existing.complaintIds.includes(complaint.id)) {
        existing.complaintIds.push(complaint.id);
        existing.reportCount = existing.complaintIds.length;
        if (new Date(complaint.submittedAt) > new Date(existing.lastReportedAt)) {
          existing.lastReportedAt = complaint.submittedAt;
        }
      }
    }
  }

  return Array.from(issuesMap.values());
}
