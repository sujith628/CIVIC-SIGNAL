export type Language = 'en' | 'te';

export type UserRole =
  | 'citizen'
  | 'field_officer'
  | 'verification_officer'
  | 'department_officer'
  | 'department_head'
  | 'super_admin'
  | 'platform_owner';

export type ComplaintCategory =
  | 'garbage_solid_waste'
  | 'drainage_sewerage'
  | 'water_supply'
  | 'roads_potholes'
  | 'streetlights'
  | 'sanitation'
  | 'stormwater_flooding'
  | 'stray_animals'
  | 'infrastructure'
  | 'parks'
  | 'encroachment'
  | 'other';

export type ComplaintStatus =
  | 'Draft'
  | 'Submitted'
  | 'Received'
  | 'Under Review'
  | 'Needs Clarification'
  | 'Validated'
  | 'Assigned'
  | 'Accepted'
  | 'In Progress'
  | 'Awaiting Evidence'
  | 'Pending Verification'
  | 'Resolved'
  | 'Closed'
  | 'Reopened'
  | 'Rejected';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  details?: string;
  evidenceUrl?: string;
}

export interface ComplaintEvidence {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  uploadedAt: string;
  stage: 'initial' | 'in_progress' | 'resolution' | 'verification';
  uploadedBy: string;
}

export interface Complaint {
  id: string; // e.g. GVMC-2026-0842
  title: string;
  description: string;
  originalLanguage: Language;
  category: ComplaintCategory;
  departmentId: string;
  severity: SeverityLevel;
  priorityScore: number; // 0 - 100
  status: ComplaintStatus;
  
  // Location
  locality: string;
  wardNumber: number;
  latitude: number;
  longitude: number;
  addressDetails: string;
  
  // Citizen
  citizenId: string;
  citizenName: string;
  citizenPhoneMasked: string;
  isAnonymous: boolean;
  
  // Timestamps
  submittedAt: string;
  updatedAt: string;
  slaDeadline: string;
  resolvedAt?: string;
  slaBreached: boolean;

  // Assignments
  assignedDepartment: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  verificationOfficerName?: string;
  
  // Evidence
  evidence: ComplaintEvidence[];
  
  // Complaint DNA linkage
  underlyingIssueId?: string;
  dnaConfidence?: number;
  dnaClusterName?: string;
  
  // History & Audit
  timeline: AuditEvent[];
  
  // Citizen Verification
  citizenResolutionConfirmed?: boolean;
  citizenDisputeReason?: string;
}

export interface UnderlyingCivicIssue {
  id: string; // e.g. DNA-GVMC-104
  title: string;
  summary: string;
  category: ComplaintCategory;
  departmentId: string;
  locality: string;
  wardNumber: number;
  latitude: number;
  longitude: number;
  firstReportedAt: string;
  lastReportedAt: string;
  complaintIds: string[]; // Linked citizen reports
  reportCount: number;
  priorityScore: number; // 0 - 100
  severity: SeverityLevel;
  recurrenceFrequency: 'Frequent' | 'Chronic' | 'Seasonal' | 'Emerging';
  status: 'Active Hotspot' | 'Under Investigation' | 'Remediation Scheduled' | 'Resolved';
  rootCauseAnalysis?: string;
  aiExplainability: {
    geographicProximityMeters: number;
    semanticSimilarityScore: number; // 0-1
    temporalClusterDays: number;
    publicSafetyFactor: number; // 1-5
    infrastructureCriticality: string;
  };
}

export interface LocalityInfo {
  name: string;
  teluguName: string;
  ward: number;
  zone: string;
  lat: number;
  lng: number;
  description: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  teluguName: string;
  code: string;
  headName: string;
  contactEmail: string;
  slaHours: Record<SeverityLevel, number>;
}

export interface CitizenProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  civicPoints: number;
  wardNumber: number;
  preferredLanguage: Language;
  notificationsEnabled: boolean;
  submissionsCount: number;
  verifiedResolutionsCount: number;
}
