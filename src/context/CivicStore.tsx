import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Complaint,
  UnderlyingCivicIssue,
  Language,
  UserRole,
  ComplaintCategory,
  ComplaintStatus,
  SeverityLevel,
  CitizenProfile,
  AuditEvent
} from '../types';
import { INITIAL_COMPLAINTS, INITIAL_UNDERLYING_ISSUES, DEMO_CITIZEN, DEPARTMENTS } from '../data/seedData';
import { calculateSlaDeadline, isSlaBreached } from '../utils/slaCalculator';
import { evaluateDnaLink, calculatePriorityScore } from '../utils/complaintDna';
import { GVMC_LOCALITIES } from '../utils/geo';

interface CivicNotification {
  id: string;
  timestamp: string;
  title: string;
  titleTe: string;
  message: string;
  messageTe: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  complaintId?: string;
}

interface CivicStoreContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeExperience: 'public' | 'citizen' | 'authority';
  setActiveExperience: (exp: 'public' | 'citizen' | 'authority') => void;
  
  // Data
  complaints: Complaint[];
  underlyingIssues: UnderlyingCivicIssue[];
  citizen: CitizenProfile;
  notifications: CivicNotification[];
  departments: typeof DEPARTMENTS;
  
  // Actions
  submitComplaint: (data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    locality: string;
    wardNumber: number;
    latitude: number;
    longitude: number;
    addressDetails: string;
    isAnonymous: boolean;
    evidenceUrls: string[];
    originalLanguage: Language;
    severity?: SeverityLevel;
  }) => Promise<Complaint>;
  
  updateComplaintStatus: (
    complaintId: string,
    newStatus: ComplaintStatus,
    note?: string,
    evidenceUrl?: string
  ) => void;
  
  assignOfficer: (
    complaintId: string,
    departmentId: string,
    officerName: string,
    note?: string
  ) => void;
  
  confirmCitizenResolution: (complaintId: string, confirmed: boolean, disputeReason?: string) => void;
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  
  // Authentication
  isAuthenticated: boolean;
  authenticatedUser: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    wardNumber?: number;
    department?: string;
  } | null;
  loginCitizen: (emailOrPhone: string, name?: string, wardNumber?: number) => void;
  loginAuthority: (role: UserRole, email: string, name: string) => void;
  logout: () => void;

  // Platform Owner Specific
  platformOwnerMfaVerified: boolean;
  setPlatformOwnerMfaVerified: (v: boolean) => void;
  auditLogs: AuditEvent[];
}

const CivicStoreContext = createContext<CivicStoreContextType | null>(null);

const STORAGE_KEY_COMPLAINTS = 'civicsignal_complaints_v1';
const STORAGE_KEY_ISSUES = 'civicsignal_issues_v1';
const STORAGE_KEY_LANG = 'civicsignal_lang_v1';
const STORAGE_KEY_ROLE = 'civicsignal_role_v1';
const STORAGE_KEY_CITIZEN = 'civicsignal_citizen_v1';

export const CivicStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEY_LANG) as Language) || 'en';
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEY_ROLE) as UserRole) || 'citizen';
  });

  const [activeExperience, setActiveExperience] = useState<'public' | 'citizen' | 'authority'>('public');

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading complaints from localStorage', e);
    }
    return INITIAL_COMPLAINTS;
  });

  const [underlyingIssues, setUnderlyingIssues] = useState<UnderlyingCivicIssue[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ISSUES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading issues from localStorage', e);
    }
    return INITIAL_UNDERLYING_ISSUES;
  });

  const [citizen, setCitizen] = useState<CitizenProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CITIZEN);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading citizen from localStorage', e);
    }
    return DEMO_CITIZEN;
  });

  const [authenticatedUser, setAuthenticatedUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    wardNumber?: number;
    department?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('civicsignal_auth_user_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: DEMO_CITIZEN.name,
      email: DEMO_CITIZEN.email,
      role: 'citizen',
      phone: DEMO_CITIZEN.phone,
      wardNumber: DEMO_CITIZEN.wardNumber
    };
  });

  const isAuthenticated = !!authenticatedUser;

  const loginCitizen = (emailOrPhone: string, name?: string, wardNumber?: number) => {
    const citizenName = name || (emailOrPhone.includes('ramesh') ? 'Ramesh Varma' : DEMO_CITIZEN.name);
    const citizenWard = wardNumber || (emailOrPhone.includes('ramesh') ? 18 : DEMO_CITIZEN.wardNumber);
    const user = {
      name: citizenName,
      email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone.replace(/\D/g, '')}@citizen.gvmc.in`,
      phone: emailOrPhone.includes('@') ? '+91 98480 23456' : emailOrPhone,
      role: 'citizen' as UserRole,
      wardNumber: citizenWard
    };
    setAuthenticatedUser(user);
    setActiveRoleState('citizen');
    setActiveExperience('citizen');
    localStorage.setItem('civicsignal_auth_user_v1', JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_ROLE, 'citizen');
  };

  const loginAuthority = (role: UserRole, email: string, name: string) => {
    const user = {
      name,
      email,
      role,
      department: role === 'platform_owner' ? 'Commissioner Office' : 'Municipal Operations'
    };
    setAuthenticatedUser(user);
    setActiveRoleState(role);
    setActiveExperience('authority');
    localStorage.setItem('civicsignal_auth_user_v1', JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_ROLE, role);
  };

  const logout = () => {
    setAuthenticatedUser(null);
    localStorage.removeItem('civicsignal_auth_user_v1');
    setActiveExperience('public');
  };

  const [platformOwnerMfaVerified, setPlatformOwnerMfaVerified] = useState(false);

  const [notifications, setNotifications] = useState<CivicNotification[]>([
    {
      id: 'notif-1',
      timestamp: new Date().toISOString(),
      title: 'SLA Alert: Madhurawada Road Cave-in',
      titleTe: 'SLA హెచ్చరిక: మధురవాడ రోడ్డు గుంత అత్యవసరం',
      message: 'Complaint GVMC-2026-0850 requires immediate verification inspection.',
      messageTe: 'ఫిర్యాదు GVMC-2026-0850 తక్షణ ధృవీకరణ తనిఖీని కోరుతోంది.',
      type: 'alert',
      read: false,
      complaintId: 'GVMC-2026-0850'
    },
    {
      id: 'notif-2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      title: 'Complaint DNA Hotspot Detected',
      titleTe: 'కంప్లైంట్ డిఎన్ఎ పునరావృత కేంద్రం గుర్తింపు',
      message: 'MVP Colony Sector 4 has 3 linked complaints regarding chronic solid waste overflow.',
      messageTe: 'MVP కాలనీ సెక్టార్ 4 లో 3 ఫిర్యాదులు ఒకే సమస్యతో లింక్ చేయబడ్డాయి.',
      type: 'warning',
      read: false,
      complaintId: 'GVMC-2026-0841'
    },
    {
      id: 'notif-3',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      title: 'Resolution Verified & 50 CivicPoints Awarded',
      titleTe: 'పరిష్కారం ధృవీకరించబడింది & 50 సివిక్ పాయింట్లు లభించాయి',
      message: 'Gajuwaka Streetlight replacement confirmed. Thank you for participating.',
      messageTe: 'గాజువాక వీధి దీపాల పునరుద్ధరణ పూర్తయింది. ధన్యవాదాలు.',
      type: 'success',
      read: true,
      complaintId: 'GVMC-2026-0870'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([
    {
      id: 'audit-001',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actor: 'Dr. K. Srinivas Rao, IAS',
      role: 'platform_owner',
      action: 'MFA Authentication Verified',
      details: 'Secure session established via TOTP hardware token.'
    },
    {
      id: 'audit-002',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actor: 'Er. P. Venkateswara Rao',
      role: 'department_head',
      action: 'SLA Override Reason Logged',
      details: 'Emergency asphalt mixing plant maintenance delayed paving work by 12 hours.'
    }
  ]);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    } catch (e) {
      console.error(e);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(underlyingIssues));
    } catch (e) {
      console.error(e);
    }
  }, [underlyingIssues]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CITIZEN, JSON.stringify(citizen));
    } catch (e) {
      console.error(e);
    }
  }, [citizen]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    document.documentElement.lang = lang;
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem(STORAGE_KEY_ROLE, role);
  };

  // Submit Complaint with Complaint DNA analysis
  const submitComplaint = async (data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    locality: string;
    wardNumber: number;
    latitude: number;
    longitude: number;
    addressDetails: string;
    isAnonymous: boolean;
    evidenceUrls: string[];
    originalLanguage: Language;
    severity?: SeverityLevel;
  }): Promise<Complaint> => {
    const nowIso = new Date().toISOString();
    const complaintNumber = Math.floor(1000 + Math.random() * 9000);
    const id = `GVMC-2026-${complaintNumber}`;

    // Map department
    const deptMap: Record<ComplaintCategory, string> = {
      garbage_solid_waste: 'PHS',
      sanitation: 'PHS',
      drainage_sewerage: 'PHS',
      stormwater_flooding: 'PHS',
      roads_potholes: 'ERD',
      infrastructure: 'ERD',
      water_supply: 'WSS',
      streetlights: 'EPL',
      encroachment: 'TPE',
      parks: 'HUF',
      stray_animals: 'PHS',
      other: 'PHS'
    };
    const departmentId = deptMap[data.category] || 'PHS';
    const deptInfo = DEPARTMENTS.find(d => d.id === departmentId);

    const severity: SeverityLevel = data.severity || (
      data.description.toLowerCase().includes('emergency') ||
      data.description.toLowerCase().includes('accident') ||
      data.description.toLowerCase().includes('burst') ||
      data.description.toLowerCase().includes('cave-in') ||
      data.description.includes('ప్రమాదం') ||
      data.description.includes('పగిలింది')
        ? 'Critical'
        : 'High'
    );

    const slaDeadline = calculateSlaDeadline(nowIso, data.category, severity);

    const initialEvidence = data.evidenceUrls.map((url, idx) => ({
      id: `ev-new-${Date.now()}-${idx}`,
      type: 'image' as const,
      url,
      caption: `Citizen uploaded photo (${data.locality})`,
      uploadedAt: nowIso,
      stage: 'initial' as const,
      uploadedBy: data.isAnonymous ? 'Anonymous Citizen' : citizen.name
    }));

    const newComplaint: Complaint = {
      id,
      title: data.title,
      description: data.description,
      originalLanguage: data.originalLanguage,
      category: data.category,
      departmentId,
      severity,
      priorityScore: 78,
      status: 'Submitted',
      locality: data.locality,
      wardNumber: data.wardNumber,
      latitude: data.latitude,
      longitude: data.longitude,
      addressDetails: data.addressDetails,
      citizenId: citizen.id,
      citizenName: data.isAnonymous ? 'Anonymous Citizen' : citizen.name,
      citizenPhoneMasked: data.isAnonymous ? '******' : citizen.phone.replace(/(\d{4})\d{4}(\d{2})/, '$1****$2'),
      isAnonymous: data.isAnonymous,
      submittedAt: nowIso,
      updatedAt: nowIso,
      slaDeadline,
      slaBreached: false,
      assignedDepartment: deptInfo?.name || 'Public Health & Sanitation',
      evidence: initialEvidence,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          timestamp: nowIso,
          actor: data.isAnonymous ? 'Anonymous Citizen' : citizen.name,
          role: 'citizen',
          action: 'Complaint Submitted',
          details: `Grievance registered in GVMC Ward ${data.wardNumber} (${data.locality}).`
        }
      ]
    };

    // Run Complaint DNA clustering against existing complaints
    let matchedIssue: UnderlyingCivicIssue | undefined;
    let highestConfidence = 0;

    for (const existing of complaints) {
      const link = evaluateDnaLink(newComplaint, existing);
      if (link.isLinked && link.confidence > highestConfidence) {
        highestConfidence = link.confidence;
        if (existing.underlyingIssueId) {
          matchedIssue = underlyingIssues.find(i => i.id === existing.underlyingIssueId);
        }
      }
    }

    if (matchedIssue) {
      newComplaint.underlyingIssueId = matchedIssue.id;
      newComplaint.dnaConfidence = highestConfidence;
      newComplaint.dnaClusterName = matchedIssue.title;

      // Update the underlying issue
      setUnderlyingIssues(prev =>
        prev.map(iss => {
          if (iss.id === matchedIssue!.id) {
            const updatedIds = [...iss.complaintIds, newComplaint.id];
            const updatedRecurrence = updatedIds.length >= 4 ? 'Chronic' : 'Frequent';
            const { score } = calculatePriorityScore({
              severity: iss.severity,
              recurrenceCount: updatedIds.length,
              publicSafetyRisk: iss.severity === 'Critical' || iss.severity === 'High',
              infrastructureCriticality: 'High',
              daysUnresolved: 2
            });

            return {
              ...iss,
              complaintIds: updatedIds,
              reportCount: updatedIds.length,
              lastReportedAt: nowIso,
              recurrenceFrequency: updatedRecurrence,
              priorityScore: score
            };
          }
          return iss;
        })
      );

      // Add DNA event to timeline
      newComplaint.timeline.push({
        id: `t-${Date.now()}-dna`,
        timestamp: nowIso,
        actor: 'CivicSignal DNA Engine',
        role: 'super_admin',
        action: 'Complaint DNA Linked',
        details: `Connected to recurring issue ${matchedIssue.id} (${matchedIssue.title}) with ${highestConfidence}% confidence.`
      });
    } else {
      // Create new DNA candidate if recurrence starts
      const { score } = calculatePriorityScore({
        severity: newComplaint.severity,
        recurrenceCount: 1,
        publicSafetyRisk: newComplaint.severity === 'Critical',
        infrastructureCriticality: 'Medium',
        daysUnresolved: 0
      });
      newComplaint.priorityScore = score;
    }

    // Award CivicPoints for submitting valid complaint (+25 points)
    setCitizen(prev => ({
      ...prev,
      civicPoints: prev.civicPoints + 25,
      submissionsCount: prev.submissionsCount + 1
    }));

    // Add in-app notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        timestamp: nowIso,
        title: `Complaint Registered: ${id}`,
        titleTe: `ఫిర్యాదు నమోదైంది: ${id}`,
        message: `Your grievance has been assigned to ${deptInfo?.name}. Target SLA: ${severity}.`,
        messageTe: `మీ ఫిర్యాదు ${deptInfo?.teluguName} కు పంపబడింది.`,
        type: 'info',
        read: false,
        complaintId: id
      },
      ...prev
    ]);

    setComplaints(prev => [newComplaint, ...prev]);
    return newComplaint;
  };

  const updateComplaintStatus = (
    complaintId: string,
    newStatus: ComplaintStatus,
    note?: string,
    evidenceUrl?: string
  ) => {
    const nowIso = new Date().toISOString();
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const updatedTimeline = [...c.timeline];
          const updatedEvidence = [...c.evidence];

          if (evidenceUrl) {
            updatedEvidence.push({
              id: `ev-res-${Date.now()}`,
              type: 'image',
              url: evidenceUrl,
              caption: note || 'Field officer resolution evidence upload',
              uploadedAt: nowIso,
              stage: newStatus === 'Resolved' || newStatus === 'Pending Verification' ? 'resolution' : 'in_progress',
              uploadedBy: `${activeRole.replace('_', ' ').toUpperCase()}`
            });
          }

          updatedTimeline.push({
            id: `t-${Date.now()}`,
            timestamp: nowIso,
            actor: `Officer (${activeRole.replace('_', ' ')})`,
            role: activeRole,
            action: `Status Updated to ${newStatus}`,
            details: note || `Complaint progressed to ${newStatus}.`,
            evidenceUrl
          });

          return {
            ...c,
            status: newStatus,
            updatedAt: nowIso,
            resolvedAt: newStatus === 'Resolved' ? nowIso : c.resolvedAt,
            evidence: updatedEvidence,
            timeline: updatedTimeline
          };
        }
        return c;
      })
    );
  };

  const assignOfficer = (
    complaintId: string,
    departmentId: string,
    officerName: string,
    note?: string
  ) => {
    const nowIso = new Date().toISOString();
    const dept = DEPARTMENTS.find(d => d.id === departmentId);

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            departmentId,
            assignedDepartment: dept?.name || c.assignedDepartment,
            assignedOfficerName: officerName,
            status: c.status === 'Submitted' ? 'Assigned' : c.status,
            updatedAt: nowIso,
            timeline: [
              ...c.timeline,
              {
                id: `t-${Date.now()}`,
                timestamp: nowIso,
                actor: 'Department Head',
                role: 'department_head',
                action: 'Officer Assigned',
                details: note || `Assigned to ${officerName} (${dept?.code}).`
              }
            ]
          };
        }
        return c;
      })
    );
  };

  const confirmCitizenResolution = (complaintId: string, confirmed: boolean, disputeReason?: string) => {
    const nowIso = new Date().toISOString();
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          if (confirmed) {
            // Reward 50 CivicPoints
            setCitizen(p => ({
              ...p,
              civicPoints: p.civicPoints + 50,
              verifiedResolutionsCount: p.verifiedResolutionsCount + 1
            }));

            return {
              ...c,
              status: 'Closed',
              citizenResolutionConfirmed: true,
              updatedAt: nowIso,
              timeline: [
                ...c.timeline,
                {
                  id: `t-${Date.now()}`,
                  timestamp: nowIso,
                  actor: citizen.name,
                  role: 'citizen',
                  action: 'Citizen Confirmed Resolution',
                  details: 'Citizen verified before/after photographic proof and closed the issue.'
                }
              ]
            };
          } else {
            return {
              ...c,
              status: 'Reopened',
              citizenResolutionConfirmed: false,
              citizenDisputeReason: disputeReason,
              updatedAt: nowIso,
              timeline: [
                ...c.timeline,
                {
                  id: `t-${Date.now()}`,
                  timestamp: nowIso,
                  actor: citizen.name,
                  role: 'citizen',
                  action: 'Citizen Disputed Resolution',
                  details: `Work disputed: "${disputeReason || 'Issue persists in the locality.'}". Reopened for inspection.`
                }
              ]
            };
          }
        }
        return c;
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_COMPLAINTS);
    localStorage.removeItem(STORAGE_KEY_ISSUES);
    localStorage.removeItem(STORAGE_KEY_CITIZEN);
    setComplaints(INITIAL_COMPLAINTS);
    setUnderlyingIssues(INITIAL_UNDERLYING_ISSUES);
    setCitizen(DEMO_CITIZEN);
  };

  return (
    <CivicStoreContext.Provider
      value={{
        language,
        setLanguage,
        activeRole,
        setActiveRole,
        activeExperience,
        setActiveExperience,
        complaints,
        underlyingIssues,
        citizen,
        notifications,
        departments: DEPARTMENTS,
        submitComplaint,
        updateComplaintStatus,
        assignOfficer,
        confirmCitizenResolution,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        isAuthenticated,
        authenticatedUser,
        loginCitizen,
        loginAuthority,
        logout,
        platformOwnerMfaVerified,
        setPlatformOwnerMfaVerified,
        auditLogs
      }}
    >
      {children}
    </CivicStoreContext.Provider>
  );
};

export const useCivicStore = () => {
  const context = useContext(CivicStoreContext);
  if (!context) throw new Error('useCivicStore must be used within CivicStoreProvider');
  return context;
};
