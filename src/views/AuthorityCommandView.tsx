import React, { useState } from 'react';
import { useCivicStore } from '../context/CivicStore';
import { t, translateCategory, translateStatus, translateSeverity, translateRole } from '../utils/i18n';
import { Complaint, UserRole, ComplaintStatus, SeverityLevel } from '../types';
import { getSlaRemainingHours } from '../utils/slaCalculator';
import {
  Building2,
  Shield,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Upload,
  Send,
  Lock,
  Key,
  Flame,
  FileCheck2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Sliders,
  Award
} from 'lucide-react';

interface AuthorityCommandViewProps {
  onSelectComplaintForDetail: (complaint: Complaint) => void;
}

export const AuthorityCommandView: React.FC<AuthorityCommandViewProps> = ({
  onSelectComplaintForDetail
}) => {
  const {
    language,
    activeRole,
    setActiveRole,
    complaints,
    underlyingIssues,
    departments,
    updateComplaintStatus,
    assignOfficer,
    platformOwnerMfaVerified,
    setPlatformOwnerMfaVerified,
    auditLogs
  } = useCivicStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'issues' | 'verification' | 'admin'>('overview');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionModalComplaint, setActionModalComplaint] = useState<Complaint | null>(null);
  const [modalActionType, setModalActionType] = useState<'assign' | 'status' | 'evidence'>('status');

  // Modal form states
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('Inspector M. Prabhakar');

  // Platform Owner MFA simulation state
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');

  // Key stats
  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const criticalCount = complaints.filter(c => c.severity === 'Critical').length;
  const breachedCount = complaints.filter(c => {
    const sla = getSlaRemainingHours(c.slaDeadline);
    return sla.isOverdue && c.status !== 'Resolved' && c.status !== 'Closed';
  }).length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  // Filter complaints based on active role and department
  const visibleComplaints = complaints.filter(c => {
    if (selectedDeptId !== 'all' && c.departmentId !== selectedDeptId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.locality.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenActionModal = (complaint: Complaint, type: 'assign' | 'status' | 'evidence') => {
    setActionModalComplaint(complaint);
    setModalActionType(type);
    setNewStatus(complaint.status);
    setStatusNote('');
    setEvidenceUrl('');
  };

  const handleSaveModalAction = () => {
    if (!actionModalComplaint) return;

    if (modalActionType === 'status') {
      updateComplaintStatus(actionModalComplaint.id, newStatus, statusNote, evidenceUrl);
    } else if (modalActionType === 'assign') {
      assignOfficer(actionModalComplaint.id, actionModalComplaint.departmentId, assignedOfficer, statusNote);
    } else if (modalActionType === 'evidence') {
      updateComplaintStatus(actionModalComplaint.id, 'Pending Verification', statusNote || 'Resolution photo evidence submitted', evidenceUrl);
    }

    setActionModalComplaint(null);
  };

  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === '123456' || mfaCode.length === 6) {
      setPlatformOwnerMfaVerified(true);
      setMfaError('');
    } else {
      setMfaError('Invalid TOTP token. Enter 123456 for demonstration verification.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Role Navigation & Mode Switcher Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF0] shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#142B45]" />
            <h2 className="text-lg font-bold text-[#142B45]">
              {t(language, 'authPortalTitle')}
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Role-Based Access Control (RBAC) · Demonstrating 6 Municipal Governance Roles
          </p>
        </div>

        {/* Role Switcher (Demonstration Control) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap">Active Role:</span>
          <select
            value={activeRole}
            onChange={e => setActiveRole(e.target.value as UserRole)}
            className="px-3 py-1.5 rounded-lg border border-[#E5EAF0] bg-[#F8FAFC] text-xs font-bold text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
            aria-label="Switch User Role"
          >
            <option value="platform_owner">Platform Owner (Municipal Commissioner / Super Admin)</option>
            <option value="super_admin">Super Admin (Central Command)</option>
            <option value="department_head">Department Head (Chief Medical Officer / SE Roads)</option>
            <option value="department_officer">Department Officer (Sanitary Executive)</option>
            <option value="verification_officer">Verification Officer (Quality Audit)</option>
            <option value="field_officer">Field Officer (Ward Sanitary Inspector)</option>
          </select>
        </div>
      </div>

      {/* SLA Breach Alert Banner if any breached issues exist */}
      {breachedCount > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>{breachedCount} Critical Grievances have breached SLA deadlines.</strong> Immediate escalation to Department Head Er. P. Venkateswara Rao & Dr. V. Ramanjaneyulu.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('issues')}
            className="px-3 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
          >
            View Escalations
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EAF0] mb-6 text-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#142B45] text-[#142B45]'
              : 'border-transparent text-[#64748B] hover:text-[#142B45]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>City Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'issues'
              ? 'border-[#142B45] text-[#142B45]'
              : 'border-transparent text-[#64748B] hover:text-[#142B45]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Grievance Management ({visibleComplaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'departments'
              ? 'border-[#142B45] text-[#142B45]'
              : 'border-transparent text-[#64748B] hover:text-[#142B45]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'verification'
              ? 'border-[#142B45] text-[#142B45]'
              : 'border-transparent text-[#64748B] hover:text-[#142B45]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Verification Centre</span>
        </button>

        {(activeRole === 'platform_owner' || activeRole === 'super_admin') && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'border-[#142B45] text-[#142B45]'
                : 'border-transparent text-[#64748B] hover:text-[#142B45]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Platform Owner Admin & Audit</span>
          </button>
        )}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#E5EAF0]">
              <span className="text-xs text-[#64748B] block font-medium">Total Complaints</span>
              <span className="text-2xl font-extrabold font-mono-tabular text-[#142B45] mt-1 block">
                {totalComplaints}
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#E5EAF0]">
              <span className="text-xs text-[#64748B] block font-medium">Open / In Progress</span>
              <span className="text-2xl font-extrabold font-mono-tabular text-[#0F9D92] mt-1 block">
                {openComplaints}
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#E5EAF0]">
              <span className="text-xs text-[#64748B] block font-medium">Critical Priority</span>
              <span className="text-2xl font-extrabold font-mono-tabular text-[#D94B4B] mt-1 block">
                {criticalCount}
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#E5EAF0]">
              <span className="text-xs text-[#64748B] block font-medium">SLA Breaches</span>
              <span className="text-2xl font-extrabold font-mono-tabular text-red-600 mt-1 block">
                {breachedCount}
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#E5EAF0]">
              <span className="text-xs text-[#64748B] block font-medium">Verified Resolved</span>
              <span className="text-2xl font-extrabold font-mono-tabular text-[#16865A] mt-1 block">
                {resolvedCount}
              </span>
            </div>
          </div>

          {/* Chronic Hotspots Review */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EAF0] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0]">
              <div>
                <h3 className="text-base font-bold text-[#142B45]">
                  Active Complaint DNA Hotspots Requiring Municipal Intervention
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Clusters formed by multiple independent citizen reports within 450m radius.
                </p>
              </div>
              <span className="px-3 py-1 rounded bg-teal-50 text-[#0F9D92] font-bold text-xs">
                {underlyingIssues.length} Active Hotspots
              </span>
            </div>

            <div className="space-y-3">
              {underlyingIssues.map(issue => (
                <div
                  key={issue.id}
                  className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E5EAF0] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular font-bold text-xs text-[#0F9D92]">{issue.id}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {issue.recurrenceFrequency}
                      </span>
                      <span className="text-xs text-[#64748B]">{issue.locality} (Ward {issue.wardNumber})</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#142B45]">{issue.title}</h4>
                    <p className="text-xs text-[#64748B]">{issue.summary}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-[#64748B] block">Priority Score</span>
                      <span className="font-mono-tabular font-extrabold text-[#D94B4B] text-base">{issue.priorityScore}/100</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-[#64748B] block">Citizen Reports</span>
                      <span className="font-mono-tabular font-bold text-[#142B45] text-base">{issue.reportCount}</span>
                    </div>

                    <button
                      onClick={() => setActiveTab('issues')}
                      className="px-3 py-1.5 rounded-lg bg-[#142B45] text-white text-xs font-semibold hover:bg-[#1e3b5e]"
                    >
                      Manage Tickets
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Grievance Management List */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5EAF0]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search complaints, wards, IDs..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E5EAF0] text-xs text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDeptId}
                onChange={e => setSelectedDeptId(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E5EAF0] rounded-lg px-2.5 py-1.5 text-xs text-[#142B45]"
              >
                <option value="all">All GVMC Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grievance Table */}
          <div className="bg-white rounded-xl border border-[#E5EAF0] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E5EAF0] text-[#64748B] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Title & Description</th>
                    <th className="py-3 px-4">Locality / Ward</th>
                    <th className="py-3 px-4">Severity & SLA</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF0]">
                  {visibleComplaints.map(comp => {
                    const sla = getSlaRemainingHours(comp.slaDeadline);

                    return (
                      <tr key={comp.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-mono-tabular font-bold text-[#0F9D92]">
                          {comp.id}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-bold text-[#142B45] block truncate">{comp.title}</span>
                          <span className="text-[#64748B] block truncate text-[11px]">{comp.description}</span>
                          {comp.dnaClusterName && (
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                              <Flame className="w-3 h-3" />
                              <span className="truncate">DNA: {comp.dnaClusterName}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#142B45]">
                          <span className="font-semibold block">{comp.locality}</span>
                          <span className="text-[11px] text-[#64748B]">Ward {comp.wardNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] inline-block ${
                            comp.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {comp.severity}
                          </span>
                          <span className={`block font-mono-tabular text-[10px] mt-0.5 ${
                            sla.isOverdue ? 'text-red-600 font-bold' : 'text-[#64748B]'
                          }`}>
                            {sla.formatted}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-[11px] font-semibold bg-[#F1F5F9] text-[#142B45]">
                            {comp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">
                          {comp.assignedOfficerName || 'Unassigned'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenActionModal(comp, 'assign')}
                            className="px-2 py-1 rounded border border-[#E5EAF0] text-[#142B45] hover:bg-white text-[11px] font-medium"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => handleOpenActionModal(comp, 'status')}
                            className="px-2 py-1 rounded bg-[#0F9D92] text-white hover:bg-[#0A726A] text-[11px] font-medium"
                          >
                            Status
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Department Performance */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(dept => {
            const deptComplaints = complaints.filter(c => c.departmentId === dept.id);
            const resolved = deptComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
            const open = deptComplaints.length - resolved;

            return (
              <div key={dept.id} className="bg-white rounded-xl p-5 border border-[#E5EAF0] space-y-4">
                <div className="flex items-start justify-between pb-2 border-b border-[#E5EAF0]">
                  <div>
                    <span className="font-mono-tabular font-bold text-xs text-[#0F9D92]">{dept.code}</span>
                    <h4 className="text-sm font-bold text-[#142B45]">{dept.name}</h4>
                    <span className="text-[11px] text-[#64748B]">{dept.headName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg">
                    <span className="text-[#64748B] block text-[10px]">Open Grievances</span>
                    <span className="text-base font-bold font-mono-tabular text-[#142B45]">{open}</span>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg">
                    <span className="text-[#64748B] block text-[10px]">Resolved</span>
                    <span className="text-base font-bold font-mono-tabular text-[#16865A]">{resolved}</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] space-y-1">
                  <div className="flex justify-between">
                    <span>Critical Target SLA:</span>
                    <span className="font-mono-tabular font-semibold text-[#142B45]">{dept.slaHours.Critical} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard Target SLA:</span>
                    <span className="font-mono-tabular font-semibold text-[#142B45]">{dept.slaHours.Medium} hours</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Verification Centre */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-[#E5EAF0] text-xs">
            <h3 className="font-bold text-sm text-[#142B45]">Evidence-Based Verification Queue</h3>
            <p className="text-[#64748B] mt-0.5">
              Inspect photographic proof before and after field repair. Verification Officer must formally approve before closing.
            </p>
          </div>

          <div className="space-y-4">
            {complaints.filter(c => c.status === 'Pending Verification' || c.status === 'Resolved').map(comp => (
              <div key={comp.id} className="bg-white rounded-xl p-5 border border-[#E5EAF0] space-y-4">
                <div className="flex justify-between items-start pb-2 border-b border-[#E5EAF0]">
                  <div>
                    <span className="font-mono-tabular font-bold text-xs text-[#0F9D92]">{comp.id}</span>
                    <h4 className="text-base font-bold text-[#142B45]">{comp.title}</h4>
                    <span className="text-xs text-[#64748B]">{comp.locality} · Ward {comp.wardNumber}</span>
                  </div>
                  <span className="px-3 py-1 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {comp.status}
                  </span>
                </div>

                {/* Evidence Side-By-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {comp.evidence.map((ev, idx) => (
                    <div key={ev.id || idx} className="rounded-xl overflow-hidden border border-[#E5EAF0] bg-[#F8FAFC]">
                      <div className="p-2 border-b border-[#E5EAF0] flex justify-between text-[11px] font-semibold text-[#142B45]">
                        <span>{ev.stage === 'resolution' ? 'After (Resolution Evidence)' : 'Before (Initial Defect)'}</span>
                        <span className="text-[#64748B]">{ev.uploadedBy}</span>
                      </div>
                      <img src={ev.url} alt={ev.caption} referrerPolicy="no-referrer" className="w-full h-48 object-cover" />
                      <div className="p-2 text-xs text-[#64748B]">{ev.caption}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5EAF0]">
                  <button
                    onClick={() => updateComplaintStatus(comp.id, 'Resolved', 'Verification Officer approved before/after photographic audit.')}
                    className="px-4 py-1.5 rounded-lg bg-[#16865A] hover:bg-[#126b48] text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Resolution & Close</span>
                  </button>

                  <button
                    onClick={() => updateComplaintStatus(comp.id, 'In Progress', 'Verification rejected: Pavement patch uneven or waste residue remaining.')}
                    className="px-4 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold"
                  >
                    Reject & Reopen for Remediation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Platform Owner Admin & Audit */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          {!platformOwnerMfaVerified ? (
            <div className="bg-white rounded-2xl p-8 border border-[#E5EAF0] max-w-md mx-auto text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#142B45]/10 text-[#142B45] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142B45]">Platform Owner Mandatory MFA</h3>
              <p className="text-xs text-[#64748B]">
                Privileged administrative security requires two-factor authentication (TOTP token) for Dr. K. Srinivas Rao, IAS.
              </p>

              <form onSubmit={handleVerifyMfa} className="space-y-3 pt-2">
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  placeholder="Enter 6-digit TOTP (e.g. 123456)"
                  className="w-full text-center tracking-widest text-lg font-mono-tabular px-3 py-2 border border-[#E5EAF0] rounded-lg"
                />
                {mfaError && <span className="text-xs text-red-600 block">{mfaError}</span>}
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-[#142B45] text-white text-xs font-bold hover:bg-[#1e3b5e]"
                >
                  Verify MFA Session
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Authenticated Admin Dashboard */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5EAF0] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0]">
                  <div>
                    <span className="text-xs font-bold text-[#16865A] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>MFA Verified Session Active</span>
                    </span>
                    <h3 className="text-lg font-bold text-[#142B45] mt-0.5">
                      Platform Owner: Dr. K. Srinivas Rao, IAS (Municipal Commissioner)
                    </h3>
                  </div>
                  <button
                    onClick={() => setPlatformOwnerMfaVerified(false)}
                    className="px-3 py-1 rounded border border-[#E5EAF0] text-xs font-semibold text-[#64748B]"
                  >
                    Lock Session
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5EAF0]">
                    <span className="font-bold text-[#142B45] block">Emergency Ownership Transfer</span>
                    <p className="text-[#64748B] mt-0.5">Dual-authorization recovery key protected transfer protocol.</p>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5EAF0]">
                    <span className="font-bold text-[#142B45] block">Global RBAC Governance</span>
                    <p className="text-[#64748B] mt-0.5">Manage departmental permissions and field officer roster.</p>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5EAF0]">
                    <span className="font-bold text-[#142B45] block">Audit Log Immutability</span>
                    <p className="text-[#64748B] mt-0.5">Cryptographic log trail of all SLA overrides and closures.</p>
                  </div>
                </div>
              </div>

              {/* Immutable Audit Log Table */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5EAF0] shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-[#142B45]">Administrative Audit Trail</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E5EAF0] text-[#64748B]">
                      <tr>
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Actor & Role</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Audit Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EAF0]">
                      {auditLogs.map(log => (
                        <tr key={log.id}>
                          <td className="py-2.5 px-3 font-mono-tabular text-[#64748B] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#142B45]">
                            {log.actor} ({log.role})
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#0F9D92]">
                            {log.action}
                          </td>
                          <td className="py-2.5 px-3 text-[#64748B]">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Modal (Assign / Status / Evidence) */}
      {actionModalComplaint && (
        <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-[#E5EAF0] text-xs text-[#142B45] space-y-4">
            <div className="flex justify-between items-start pb-2 border-b border-[#E5EAF0]">
              <div>
                <span className="font-mono-tabular font-bold text-[#0F9D92]">{actionModalComplaint.id}</span>
                <h3 className="text-base font-bold text-[#142B45] mt-0.5">
                  {modalActionType === 'status' ? 'Update Lifecycle Status' : modalActionType === 'assign' ? 'Assign Field Officer' : 'Upload Evidence'}
                </h3>
              </div>
            </div>

            {modalActionType === 'status' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Select Status</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full p-2 rounded border border-[#E5EAF0]"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Verification">Pending Verification (Field Work Complete)</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Official Audit Note</label>
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    placeholder="State reason or dispatch details..."
                    className="w-full p-2 rounded border border-[#E5EAF0]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Photo Evidence URL (Optional)</label>
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={e => setEvidenceUrl(e.target.value)}
                    placeholder="https://example.com/resolved_photo.jpg"
                    className="w-full p-2 rounded border border-[#E5EAF0]"
                  />
                </div>
              </div>
            )}

            {modalActionType === 'assign' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Officer Name</label>
                  <select
                    value={assignedOfficer}
                    onChange={e => setAssignedOfficer(e.target.value)}
                    className="w-full p-2 rounded border border-[#E5EAF0]"
                  >
                    <option value="Inspector M. Prabhakar">Inspector M. Prabhakar (Sanitation Ward 18)</option>
                    <option value="Er. K. Suresh">Er. K. Suresh (Assistant Engineer Roads)</option>
                    <option value="N. Srinivasa Rao">N. Srinivasa Rao (Sub-Engineer Water)</option>
                    <option value="T. Rama Murthy">T. Rama Murthy (Electrical Lineman)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Dispatch Instructions</label>
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    placeholder="e.g. Inspect culvert and clear accumulation by 5:00 PM."
                    className="w-full p-2 rounded border border-[#E5EAF0]"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5EAF0]">
              <button
                onClick={() => setActionModalComplaint(null)}
                className="px-4 py-1.5 rounded-lg border border-[#E5EAF0] text-[#64748B]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModalAction}
                className="px-4 py-1.5 rounded-lg bg-[#0F9D92] text-white font-bold"
              >
                Save Action & Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
