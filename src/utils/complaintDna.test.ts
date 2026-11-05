import test from 'node:test';
import assert from 'node:assert/strict';
import { haversineDistanceMeters } from './geo';
import { calculateSemanticSimilarity, evaluateDnaLink, calculatePriorityScore } from './complaintDna';
import { calculateSlaDeadline, isSlaBreached, getSlaRemainingHours } from './slaCalculator';
import { Complaint } from '../types';

test('haversineDistanceMeters correctly computes distance between two GVMC coordinates', () => {
  // MVP Colony (17.7410, 83.3340) and Seethammadhara (17.7380, 83.3100)
  const dist = haversineDistanceMeters(17.7410, 83.3340, 17.7380, 83.3100);
  assert.ok(dist > 2000 && dist < 3000, `Expected distance ~2500m, got ${dist}`);

  // Two close points in MVP Colony sector 4 (~80 meters apart)
  const closeDist = haversineDistanceMeters(17.7410, 83.3340, 17.7415, 83.3345);
  assert.ok(closeDist < 120, `Expected close distance < 120m, got ${closeDist}`);
});

test('calculateSemanticSimilarity computes token overlap between civic descriptions', () => {
  const text1 = 'Garbage overflow and rotten waste near sector 4 park gate';
  const text2 = 'Severe garbage accumulation and waste dumped at park entrance';
  const score = calculateSemanticSimilarity(text1, text2);
  assert.ok(score >= 0.2, `Expected semantic similarity >= 0.2, got ${score}`);

  const unrelated = 'Streetlight broken near high school corner pole';
  const unrelatedScore = calculateSemanticSimilarity(text1, unrelated);
  assert.ok(unrelatedScore < 0.1, `Expected low similarity, got ${unrelatedScore}`);
});

test('evaluateDnaLink detects linked complaints in same neighborhood with same problem', () => {
  const complaintA: Complaint = {
    id: 'GVMC-2026-001',
    title: 'Garbage dump overflowing',
    description: 'Waste has not been collected for 4 days near sector 4 community hall',
    originalLanguage: 'en',
    category: 'garbage_solid_waste',
    departmentId: 'PHS',
    severity: 'High',
    priorityScore: 75,
    status: 'Submitted',
    locality: 'MVP Colony',
    wardNumber: 18,
    latitude: 17.7410,
    longitude: 83.3340,
    addressDetails: 'Sector 4',
    citizenId: 'cit-1',
    citizenName: 'Ramesh Varma',
    citizenPhoneMasked: '98480*****',
    isAnonymous: false,
    submittedAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
    slaDeadline: '2026-11-02T08:00:00Z',
    slaBreached: false,
    assignedDepartment: 'Public Health & Sanitation',
    evidence: [],
    timeline: []
  };

  const complaintB: Complaint = {
    ...complaintA,
    id: 'GVMC-2026-002',
    title: 'Rotting trash bins near community hall',
    description: 'Piles of solid waste attracting stray dogs near MVP sector 4',
    latitude: 17.7418,
    longitude: 83.3345,
    submittedAt: '2026-11-02T10:00:00Z'
  };

  const linkResult = evaluateDnaLink(complaintA, complaintB);
  assert.equal(linkResult.isLinked, true);
  assert.ok(linkResult.confidence > 50, `Expected confidence > 50, got ${linkResult.confidence}`);
  assert.ok(linkResult.distanceMeters < 200, `Expected distance < 200m, got ${linkResult.distanceMeters}`);
});

test('calculatePriorityScore reflects severity, recurrence and public safety', () => {
  const result = calculatePriorityScore({
    severity: 'Critical',
    recurrenceCount: 4,
    publicSafetyRisk: true,
    infrastructureCriticality: 'High',
    daysUnresolved: 4
  });

  assert.ok(result.score >= 85, `Expected high priority score >= 85, got ${result.score}`);
  assert.ok(result.explainability.length >= 4, 'Expected multiple explainability reasons');
});

test('slaCalculator properly determines deadlines and overdue state', () => {
  const submittedAt = '2026-11-01T10:00:00Z';
  const deadline = calculateSlaDeadline(submittedAt, 'garbage_solid_waste', 'Critical');
  const deadlineDate = new Date(deadline);
  const submittedDate = new Date(submittedAt);

  const diffHours = (deadlineDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60);
  assert.equal(diffHours, 6, 'Critical garbage SLA must be 6 hours');

  const breached = isSlaBreached('2026-11-01T16:00:00Z', '2026-11-02T10:00:00Z');
  assert.equal(breached, true);

  const remaining = getSlaRemainingHours('2026-11-01T16:00:00Z', '2026-11-01T12:00:00Z');
  assert.equal(remaining.isOverdue, false);
  assert.equal(remaining.hoursLeft, 4);
});
