import React from 'react';
import { Complaint } from '../types';
import { useCivicStore } from '../context/CivicStore';
import { t, translateCategory, translateStatus, translateSeverity, translateRole } from '../utils/i18n';
import { getSlaRemainingHours } from '../utils/slaCalculator';
import {
  X,
  MapPin,
  Clock,
  Shield,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Calendar,
  Building2,
  User,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onConfirmResolution?: (complaintId: string) => void;
  onDisputeResolution?: (complaint: Complaint) => void;
}

const LIFECYCLE_STEPS = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Pending Verification',
  'Resolved',
  'Closed'
];

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onConfirmResolution,
  onDisputeResolution
}) => {
  const { language, activeRole, confirmCitizenResolution } = useCivicStore();

  if (!complaint) return null;

  const sla = getSlaRemainingHours(complaint.slaDeadline);
  const currentStepIdx = LIFECYCLE_STEPS.indexOf(complaint.status);

  return (
    <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#E5EAF0] text-[#142B45] relative">
        {/* Header */}
        <div className="p-5 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F8FAFC] sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-tabular font-bold text-xs text-[#0F9D92]">
                {complaint.id}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#F1F5F9] text-[#142B45]">
                {translateCategory(language, complaint.category)}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                complaint.severity === 'Critical' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {translateSeverity(language, complaint.severity)}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#142B45] mt-1">
              {complaint.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-[#142B45] hover:bg-[#F1F5F9]"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Lifecycle Progress Bar */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E5EAF0]">
            <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wider block mb-3">
              Complaint Lifecycle Progress
            </span>
            <div className="grid grid-cols-6 gap-1 relative">
              {LIFECYCLE_STEPS.slice(0, 6).map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = complaint.status === step;

                return (
                  <div key={step} className="text-center space-y-1">
                    <div
                      className={`h-2 rounded-full transition-colors ${
                        isCurrent
                          ? 'bg-[#0F9D92]'
                          : isPassed
                          ? 'bg-[#142B45]'
                          : 'bg-[#E5EAF0]'
                      }`}
                    />
                    <span
                      className={`block text-[9px] truncate ${
                        isCurrent
                          ? 'font-bold text-[#0F9D92]'
                          : isPassed
                          ? 'font-medium text-[#142B45]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description & Geographic Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-[#E5EAF0]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Locality & Ward</span>
              <span className="font-semibold text-sm text-[#142B45] block">{complaint.locality} (Ward {complaint.wardNumber})</span>
              <span className="text-[#64748B] block mt-0.5">{complaint.addressDetails}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">SLA Commitment</span>
              <span className={`font-mono-tabular font-bold text-sm block ${sla.isOverdue ? 'text-red-600' : 'text-[#16865A]'}`}>
                {sla.formatted}
              </span>
              <span className="text-[#64748B] block text-[11px] mt-0.5">
                Target Deadline: {new Date(complaint.slaDeadline).toLocaleString()}
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-[#E5EAF0]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">Detailed Grievance</span>
              <p className="text-[#142B45] leading-relaxed">{complaint.description}</p>
            </div>
          </div>

          {/* Complaint DNA linkage */}
          {complaint.dnaClusterName && (
            <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 text-[#0A726A] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Flame className="w-4 h-4 text-[#0F9D92]" />
                <span>Linked to Complaint DNA Hotspot</span>
              </div>
              <p className="text-xs">
                <strong>{complaint.dnaClusterName}</strong> (Cluster ID: {complaint.underlyingIssueId}) with {complaint.dnaConfidence}% semantic & geographic confidence match.
              </p>
            </div>
          )}

          {/* Evidence Gallery */}
          {complaint.evidence.length > 0 && (
            <div>
              <h4 className="font-bold text-[#142B45] mb-2 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#0F9D92]" />
                <span>Geotagged Photographic Proof ({complaint.evidence.length})</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {complaint.evidence.map(ev => (
                  <div key={ev.id} className="rounded-xl overflow-hidden border border-[#E5EAF0] bg-[#F8FAFC]">
                    <img src={ev.url} alt={ev.caption} referrerPolicy="no-referrer" className="w-full h-32 object-cover" />
                    <div className="p-2 text-[11px] space-y-0.5">
                      <span className="font-semibold text-[#142B45] block truncate">{ev.caption}</span>
                      <span className="text-[#64748B] block text-[10px]">{ev.uploadedBy} · {new Date(ev.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chronological Audit Trail */}
          <div>
            <h4 className="font-bold text-[#142B45] mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#142B45]" />
              <span>Full Lifecycle Audit Timeline</span>
            </h4>
            <div className="border border-[#E5EAF0] rounded-xl overflow-hidden divide-y divide-[#E5EAF0] bg-white">
              {complaint.timeline.map((evt, i) => (
                <div key={evt.id || i} className="p-3 text-xs flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0F9D92] mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#142B45]">{evt.action}</span>
                      <span className="font-mono-tabular text-[10px] text-[#64748B]">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748B] block">{evt.actor} ({evt.role})</span>
                    {evt.details && <p className="text-[#142B45] text-[11px] mt-1">{evt.details}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Verification Action Buttons if in Pending Verification */}
          {complaint.status === 'Pending Verification' && (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-purple-900 block">Citizen Resolution Review</span>
                <span className="text-xs text-purple-700">Confirm field resolution or dispute if incomplete.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => confirmCitizenResolution(complaint.id, true)}
                  className="px-4 py-1.5 rounded-lg bg-[#16865A] text-white text-xs font-bold hover:bg-[#126b48]"
                >
                  Confirm Resolved (+50 Pts)
                </button>
                <button
                  onClick={() => confirmCitizenResolution(complaint.id, false, 'Issue remains unresolved.')}
                  className="px-4 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold"
                >
                  Dispute
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5EAF0] flex justify-end bg-[#F8FAFC]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#142B45] text-white text-xs font-semibold hover:bg-[#1e3b5e]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
