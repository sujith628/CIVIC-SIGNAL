import React, { useState } from 'react';
import { useCivicStore } from '../context/CivicStore';
import { t, translateCategory, translateStatus, translateSeverity } from '../utils/i18n';
import { Complaint } from '../types';
import { getSlaRemainingHours } from '../utils/slaCalculator';
import {
  PlusCircle,
  Mic,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Flame,
  Award,
  Bell,
  ChevronRight,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Search,
  Filter,
  Eye
} from 'lucide-react';

interface CitizenDashboardViewProps {
  onOpenReportModal: () => void;
  onOpenVoiceModal: () => void;
  onSelectComplaintForDetail: (complaint: Complaint) => void;
}

export const CitizenDashboardView: React.FC<CitizenDashboardViewProps> = ({
  onOpenReportModal,
  onOpenVoiceModal,
  onSelectComplaintForDetail
}) => {
  const {
    language,
    citizen,
    complaints,
    underlyingIssues,
    confirmCitizenResolution
  } = useCivicStore();

  const [activeTab, setActiveTab] = useState<'my' | 'nearby' | 'dna' | 'points'>('my');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [disputeModalComplaint, setDisputeModalComplaint] = useState<Complaint | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  // My citizen complaints (by citizen ID or recent)
  const myComplaints = complaints.filter(c => c.citizenId === citizen.id || c.citizenId === 'cit-101' || c.citizenId === 'cit-104');
  const activeCount = myComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const resolvedCount = myComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  // Filter complaints based on tab & filters
  const displayedComplaints = myComplaints.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.locality.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmResolution = (complaintId: string) => {
    confirmCitizenResolution(complaintId, true);
  };

  const handleOpenDispute = (complaint: Complaint) => {
    setDisputeModalComplaint(complaint);
    setDisputeReason('');
  };

  const handleSubmitDispute = () => {
    if (!disputeModalComplaint) return;
    confirmCitizenResolution(disputeModalComplaint.id, false, disputeReason || 'Work remains incomplete.');
    setDisputeModalComplaint(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Citizen Profile Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF0] shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F9D92]/10 border border-[#0F9D92]/20 flex items-center justify-center text-[#0F9D92] font-extrabold text-xl">
            {citizen.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#142B45]">{citizen.name}</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#E5EAF0]">
                Ward {citizen.wardNumber} · MVP Colony
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Verified Resident Citizen · {citizen.phone}
            </p>
          </div>
        </div>

        {/* CivicPoints Counter */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end text-[#0F9D92]">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">CivicPoints</span>
            </div>
            <span className="text-2xl font-extrabold font-mono-tabular text-[#142B45]">
              {citizen.civicPoints}
            </span>
          </div>

          <div className="h-10 w-px bg-[#E5EAF0]"></div>

          <div className="text-right">
            <span className="text-xs text-[#64748B] block font-medium">Resolutions Verified</span>
            <span className="text-2xl font-extrabold font-mono-tabular text-[#16865A]">
              {citizen.verifiedResolutionsCount}
            </span>
          </div>
        </div>
      </div>

      {/* BIG PRIMARY REPORT A PROBLEM ACTION (Prompt Requirement §4) */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Large Prominent Report a Problem Button */}
        <div className="md:col-span-8">
          <button
            onClick={onOpenReportModal}
            className="w-full bg-[#0F9D92] hover:bg-[#0A726A] text-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all text-left flex items-center justify-between group cursor-pointer"
            aria-label="Report a Problem"
          >
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider inline-block">
                Primary Action
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                <span>{t(language, 'reportProblem')}</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-white/90 max-w-xl">
                Submit an urgent issue with GPS location, photograph, and description. Routed immediately to the assigned GVMC Ward officer.
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <PlusCircle className="w-10 h-10" />
            </div>
          </button>
        </div>

        {/* Prominent Voice Assistant CTA */}
        <div className="md:col-span-4">
          <button
            onClick={onOpenVoiceModal}
            className="w-full h-full bg-[#142B45] hover:bg-[#1e3b5e] text-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all text-left flex items-center justify-between group cursor-pointer"
            aria-label="Open AI Voice Assistant"
          >
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider inline-block">
                Bilingual AI Voice
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{t(language, 'voiceAssistant')}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-white/80">
                Speak in Telugu or English. Transcribed & categorized instantly.
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#0F9D92] shrink-0">
              <Mic className="w-8 h-8" />
            </div>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E5EAF0] mb-6 text-sm">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'my'
              ? 'border-[#0F9D92] text-[#0F9D92]'
              : 'border-transparent text-[#64748B] hover:text-[#142B45]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t(language, 'myComplaints')} ({myComplaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('nearby')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'nearby'
              ? 'border-[#0F9D92] text-[#0F9D92]'
              : 'border-transparent text-[#64748B] hover:text-[#142B45]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t(language, 'nearbyIssues')} (MVP Colony)</span>
        </button>

        <button
          onClick={() => setActiveTab('dna')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dna'
              ? 'border-[#0F9D92] text-[#0F9D92]'
              : 'border-transparent text-[#64748B] hover:text-[#142B45]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>{t(language, 'complaintDna')} Insights ({underlyingIssues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('points')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'points'
              ? 'border-[#0F9D92] text-[#0F9D92]'
              : 'border-transparent text-[#64748B] hover:text-[#142B45]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>CivicPoints & Badges</span>
        </button>
      </div>

      {/* Tab: My Complaints */}
      {activeTab === 'my' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5EAF0]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t(language, 'searchPlaceholder')}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E5EAF0] text-xs text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-[#64748B]" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E5EAF0] rounded-lg px-2.5 py-1.5 text-xs text-[#142B45] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-3">
            {displayedComplaints.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-[#E5EAF0] space-y-3">
                <FileText className="w-10 h-10 text-[#64748B] mx-auto opacity-50" />
                <h4 className="text-sm font-semibold text-[#142B45]">{t(language, 'noResults')}</h4>
                <p className="text-xs text-[#64748B]">Click Report a Problem to register your first civic complaint.</p>
              </div>
            ) : (
              displayedComplaints.map(complaint => {
                const sla = getSlaRemainingHours(complaint.slaDeadline);
                const needsCitizenConfirmation = complaint.status === 'Pending Verification' && !complaint.citizenResolutionConfirmed;

                return (
                  <div
                    key={complaint.id}
                    className="bg-white rounded-xl p-5 border border-[#E5EAF0] shadow-2xs hover:border-[#0F9D92] transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5EAF0]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-tabular font-bold text-xs text-[#0F9D92]">
                            {complaint.id}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#F1F5F9] text-[#142B45]">
                            {translateCategory(language, complaint.category)}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                            complaint.severity === 'Critical'
                              ? 'bg-red-50 text-red-700'
                              : complaint.severity === 'High'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {translateSeverity(language, complaint.severity)}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#142B45] mt-1">
                          {complaint.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          complaint.status === 'Resolved' || complaint.status === 'Closed'
                            ? 'bg-emerald-50 text-[#16865A] border border-emerald-200'
                            : complaint.status === 'Pending Verification'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-teal-50 text-[#0F9D92] border border-teal-200'
                        }`}>
                          {translateStatus(language, complaint.status)}
                        </span>

                        <button
                          onClick={() => onSelectComplaintForDetail(complaint)}
                          className="px-3 py-1 rounded-lg border border-[#E5EAF0] text-xs font-medium text-[#142B45] hover:bg-[#F8FAFC] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </button>
                      </div>
                    </div>

                    {/* Description & Locality */}
                    <div className="py-3 text-xs text-[#64748B] space-y-1.5">
                      <p className="leading-relaxed text-[#142B45]">{complaint.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[11px]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#0F9D92]" />
                          <span>{complaint.locality} · Ward {complaint.wardNumber} ({complaint.addressDetails})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Submitted: {new Date(complaint.submittedAt).toLocaleDateString()}</span>
                        </span>
                        <span className={`font-mono-tabular font-medium ${sla.isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                          SLA: {sla.formatted}
                        </span>
                      </div>
                    </div>

                    {/* Complaint DNA Badge */}
                    {complaint.dnaClusterName && (
                      <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100 flex items-center justify-between text-xs text-emerald-900 mt-2">
                        <div className="flex items-center gap-2">
                          <Flame className="w-3.5 h-3.5 text-emerald-700" />
                          <span>
                            Connected to Complaint DNA Hotspot: <strong>{complaint.dnaClusterName}</strong> ({complaint.dnaConfidence}% match)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Citizen Verification Prompt (Action Required from Citizen) */}
                    {needsCitizenConfirmation && (
                      <div className="mt-3 p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-purple-900 block">
                              Officer Marked Issue Resolved — Citizen Verification Required
                            </span>
                            <p className="text-xs text-purple-700 mt-0.5">
                              Please review the field officer's resolution photograph below. Did GVMC successfully solve the problem in your neighborhood?
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-900 text-[10px] font-bold">
                            Action Required
                          </span>
                        </div>

                        {/* Evidence preview */}
                        {complaint.evidence.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto py-1">
                            {complaint.evidence.map(ev => (
                              <div key={ev.id} className="w-28 rounded-lg overflow-hidden border border-purple-200 bg-white shrink-0">
                                <img src={ev.url} alt={ev.caption} referrerPolicy="no-referrer" className="w-full h-16 object-cover" />
                                <span className="block p-1 text-[9px] text-[#64748B] truncate">{ev.caption}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => handleConfirmResolution(complaint.id)}
                            className="px-4 py-1.5 rounded-lg bg-[#16865A] hover:bg-[#126b48] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Confirm Resolved (+50 CivicPoints)</span>
                          </button>

                          <button
                            onClick={() => handleOpenDispute(complaint)}
                            className="px-4 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>Dispute & Reopen Ticket</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Nearby Civic Issues */}
      {activeTab === 'nearby' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-[#E5EAF0] text-xs space-y-1">
            <h3 className="font-bold text-sm text-[#142B45]">Active Grievances in MVP Colony (Ward 18)</h3>
            <p className="text-[#64748B]">Showing public civic reports submitted by neighbors in your zone. Resident identities are protected.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.filter(c => c.locality === 'MVP Colony').map(c => (
              <div key={c.id} className="bg-white p-4 rounded-xl border border-[#E5EAF0] space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <span className="font-mono-tabular font-bold text-[#0F9D92]">{c.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F5F9] text-[#142B45]">
                    {translateStatus(language, c.status)}
                  </span>
                </div>
                <h4 className="font-bold text-[#142B45] text-sm">{c.title}</h4>
                <p className="text-[#64748B] line-clamp-2">{c.description}</p>
                <div className="pt-2 border-t border-[#E5EAF0] flex justify-between items-center text-[11px] text-[#64748B]">
                  <span>{c.addressDetails}</span>
                  <span>{new Date(c.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Complaint DNA Insights */}
      {activeTab === 'dna' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-[#E5EAF0] text-xs space-y-1">
            <h3 className="font-bold text-sm text-[#142B45]">Persistent Municipal Breakdown Clusters</h3>
            <p className="text-[#64748B]">How CivicSignal connects individual complaints to uncover recurring city infrastructure failures.</p>
          </div>

          <div className="space-y-3">
            {underlyingIssues.map(issue => (
              <div key={issue.id} className="bg-white p-5 rounded-xl border border-[#E5EAF0] space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono-tabular font-bold text-[#0F9D92]">{issue.id}</span>
                    <h4 className="font-bold text-[#142B45] text-base mt-0.5">{issue.title}</h4>
                    <span className="text-[#64748B]">{issue.locality} · Ward {issue.wardNumber}</span>
                  </div>
                  <span className="px-3 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                    {issue.recurrenceFrequency} ({issue.reportCount} Reports)
                  </span>
                </div>

                <p className="text-[#64748B] leading-relaxed">{issue.summary}</p>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5EAF0] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Cluster Spread</span>
                    <span className="font-mono-tabular font-bold text-[#142B45]">{issue.aiExplainability.geographicProximityMeters}m</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Semantic Match</span>
                    <span className="font-mono-tabular font-bold text-[#142B45]">{Math.round(issue.aiExplainability.semanticSimilarityScore * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">First Reported</span>
                    <span className="font-mono-tabular font-bold text-[#142B45]">{new Date(issue.firstReportedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Priority Score</span>
                    <span className="font-mono-tabular font-bold text-[#D94B4B]">{issue.priorityScore}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: CivicPoints */}
      {activeTab === 'points' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAF0] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#142B45]">Civic Participation Reward Program</h3>
                <p className="text-xs text-[#64748B]">CivicPoints incentivize truthful reporting and verified field closures, not spam submissions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E5EAF0]">
                <span className="font-bold text-[#142B45] block">Submit Valid Grievance</span>
                <span className="text-[#0F9D92] font-bold text-base mt-1 block">+25 Points</span>
                <p className="text-[#64748B] mt-0.5">Awarded upon officer validation and ward assignment.</p>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E5EAF0]">
                <span className="font-bold text-[#142B45] block">Confirm Field Resolution</span>
                <span className="text-[#16865A] font-bold text-base mt-1 block">+50 Points</span>
                <p className="text-[#64748B] mt-0.5">Awarded when you verify before/after photographic evidence.</p>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E5EAF0]">
                <span className="font-bold text-[#142B45] block">Hotspot Root Cause Report</span>
                <span className="text-[#3677D5] font-bold text-base mt-1 block">+100 Points</span>
                <p className="text-[#64748B] mt-0.5">Recognized when a complaint forms a verified Complaint DNA hotspot.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalComplaint && (
        <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-[#E5EAF0] text-xs text-[#142B45] space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono-tabular font-bold text-[#D94B4B]">{disputeModalComplaint.id}</span>
                <h3 className="text-base font-bold text-[#142B45] mt-0.5">Dispute Municipal Resolution</h3>
              </div>
            </div>

            <p className="text-[#64748B]">
              Please state why the work has not been completed satisfactorily. Your dispute will reopen the ticket and notify the Verification Officer.
            </p>

            <textarea
              rows={3}
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="e.g. Garbage bins were emptied but black water is still overflowing onto the road..."
              className="w-full p-2.5 rounded-lg border border-[#E5EAF0] focus:outline-none focus:border-[#D94B4B]"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5EAF0]">
              <button
                onClick={() => setDisputeModalComplaint(null)}
                className="px-4 py-1.5 rounded-lg border border-[#E5EAF0] text-[#64748B]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDispute}
                className="px-4 py-1.5 rounded-lg bg-[#D94B4B] text-white font-bold"
              >
                Submit Dispute & Reopen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
