import React from 'react';
import { useCivicStore } from '../context/CivicStore';
import { t } from '../utils/i18n';
import { GisMap } from '../components/GisMap';
import {
  Shield,
  Layers,
  Mic,
  MapPin,
  CheckCircle2,
  Users,
  Building2,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Clock,
  ArrowRight,
  Eye,
  Activity,
  Flame,
  Radio
} from 'lucide-react';

interface LandingPageViewProps {
  onOpenReportModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenAuthModal: (tab?: 'citizen' | 'authority') => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onOpenReportModal,
  onOpenVoiceModal,
  onOpenAuthModal
}) => {
  const {
    language,
    setActiveExperience,
    complaints,
    underlyingIssues
  } = useCivicStore();

  const totalComplaints = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const hotspotCount = underlyingIssues.length;
  const resolutionRate = Math.round((resolvedCount / (totalComplaints || 1)) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#142B45]">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 border-b border-[#E5EAF0] overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E5EAF0] text-xs font-semibold text-[#0F9D92]">
                <span className="w-2 h-2 rounded-full bg-[#0F9D92]"></span>
                <span>Greater Visakhapatnam Municipal Corporation (GVMC)</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#142B45] leading-[1.12]">
                {t(language, 'slogan')}
              </h1>

              <p className="text-base md:text-lg text-[#64748B] max-w-2xl leading-relaxed">
                {t(language, 'sloganSub')}
              </p>

              {/* Prominent CTAs: Report a Problem, Explore City Intelligence, and Sign In */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={onOpenReportModal}
                  className="px-6 py-3 rounded-xl bg-[#0F9D92] hover:bg-[#0A726A] text-white font-bold text-sm transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
                  aria-label="Report a Problem"
                >
                  <span>{t(language, 'reportProblem')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('city-intelligence');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#142B45] border border-[#E5EAF0] font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  aria-label="Explore City Intelligence"
                >
                  <Eye className="w-4 h-4 text-[#0F9D92]" />
                  <span>{t(language, 'viewCityIntelligence')}</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal('citizen')}
                  className="px-5 py-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#142B45] border border-[#E5EAF0] font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  aria-label="Sign In"
                >
                  <span>Sign In</span>
                </button>
              </div>

              {/* Key Trust Metrics Strip */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E5EAF0]">
                <div>
                  <span className="block text-2xl font-extrabold font-mono-tabular text-[#142B45]">
                    17
                  </span>
                  <span className="text-xs text-[#64748B]">
                    GVMC Localities & Zones
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold font-mono-tabular text-[#0F9D92]">
                    {hotspotCount}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    Active Complaint DNA Clusters
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold font-mono-tabular text-[#16865A]">
                    {resolutionRate}%
                  </span>
                  <span className="text-xs text-[#64748B]">
                    Verified Field Resolution Rate
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Column: Visakhapatnam Coastal Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#E5EAF0] shadow-md group">
                <img
                  src="/src/assets/images/visakhapatnam_coast_civic_1793910362463.jpg"
                  alt="Visakhapatnam Beach Road and Kailasagiri Coastline at Dawn"
                  referrerPolicy="no-referrer"
                  className="w-full h-96 object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142B45]/70 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white text-xs">
                    <span className="font-semibold block text-sm">Visakhapatnam Municipal Smart City Zone</span>
                    <span className="text-slate-200">Beach Road to Madhurawada IT SEZ Corridor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Distinct Entry Points */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-[#142B45]">
              Three Connected Governance Experiences
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              CivicSignal bridges citizens, field operational teams, and public transparency on a single verified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Citizens Card */}
            <div className="bg-white rounded-2xl p-7 border border-[#E5EAF0] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#0F9D92]/10 flex items-center justify-center text-[#0F9D92]">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#142B45]">For Citizens</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Report civic problems effortlessly with Telugu and English voice input, track GPS progress in real time, and earn CivicPoints for verified resolution reviews.
                </p>
                <div className="pt-2 text-xs text-[#142B45] space-y-1.5 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D92]" />
                    <span>Bilingual AI voice reporting (Telugu/English)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D92]" />
                    <span>Real-time lifecycle & SLA tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D92]" />
                    <span>Citizen resolution confirmation & dispute</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E5EAF0] space-y-2">
                <button
                  onClick={() => setActiveExperience('citizen')}
                  className="w-full py-2.5 rounded-lg bg-[#0F9D92] hover:bg-[#0A726A] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>Enter Citizen Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuthModal('citizen')}
                  className="w-full py-1.5 text-xs text-[#0F9D92] hover:underline font-semibold text-center cursor-pointer block"
                >
                  Citizen Sign In / Register →
                </button>
              </div>
            </div>

            {/* Municipal Authorities Card */}
            <div className="bg-white rounded-2xl p-7 border border-[#E5EAF0] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#142B45]/10 flex items-center justify-center text-[#142B45]">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#142B45]">Municipal Authorities</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Role-based command centre for department heads, engineers, verification officers, and the municipal commissioner. Prioritize chronic hotspots and enforce strict SLAs.
                </p>
                <div className="pt-2 text-xs text-[#142B45] space-y-1.5 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#142B45]" />
                    <span>6-role verified RBAC workflows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#142B45]" />
                    <span>Before & after photographic proof audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#142B45]" />
                    <span>Automated SLA breach escalation</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E5EAF0] space-y-2">
                <button
                  onClick={() => setActiveExperience('authority')}
                  className="w-full py-2.5 rounded-lg bg-[#142B45] hover:bg-[#1e3b5e] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>Enter Authority Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuthModal('authority')}
                  className="w-full py-1.5 text-xs text-[#142B45] hover:underline font-semibold text-center cursor-pointer block"
                >
                  Municipal Staff Sign In →
                </button>
              </div>
            </div>

            {/* Public City Intelligence Card */}
            <div className="bg-white rounded-2xl p-7 border border-[#E5EAF0] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#3677D5]/10 flex items-center justify-center text-[#3677D5]">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#142B45]">Public City Intelligence</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Open public GIS maps, recurring issue clusters, transparency scorecards, and municipal performance metrics accessible to all citizens with zero login.
                </p>
                <div className="pt-2 text-xs text-[#142B45] space-y-1.5 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3677D5]" />
                    <span>Live GIS heatmap across 17 localities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3677D5]" />
                    <span>Complaint DNA cluster root causes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3677D5]" />
                    <span>Strict privacy & masked citizen identity</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E5EAF0]">
                <button
                  onClick={() => {
                    const el = document.getElementById('city-intelligence');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#3677D5] hover:bg-[#2563eb] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore City Intelligence</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-y border-[#E5EAF0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#0F9D92] uppercase tracking-wider">
              CIVIC INTEGRITY ENGINE
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#142B45] mt-1">
              {t(language, 'howItWorksTitle')}
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              {t(language, 'howItWorksSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF0]">
              <span className="text-xs font-bold text-[#0F9D92]">STEP 01</span>
              <h3 className="text-sm font-bold text-[#142B45] mt-1">{t(language, 'step1Title')}</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{t(language, 'step1Desc')}</p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF0]">
              <span className="text-xs font-bold text-[#0F9D92]">STEP 02</span>
              <h3 className="text-sm font-bold text-[#142B45] mt-1">{t(language, 'step2Title')}</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{t(language, 'step2Desc')}</p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF0]">
              <span className="text-xs font-bold text-[#0F9D92]">STEP 03</span>
              <h3 className="text-sm font-bold text-[#142B45] mt-1">{t(language, 'step3Title')}</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{t(language, 'step3Desc')}</p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF0]">
              <span className="text-xs font-bold text-[#0F9D92]">STEP 04</span>
              <h3 className="text-sm font-bold text-[#142B45] mt-1">{t(language, 'step4Title')}</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{t(language, 'step4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Complaint DNA Showcase Section */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-[#0F9D92]">
                <Flame className="w-3.5 h-3.5" />
                <span>The Core Differentiator</span>
              </div>

              <h2 className="text-3xl font-extrabold text-[#142B45]">
                Complaint DNA: Connecting Isolated Reports into Actionable Intelligence
              </h2>

              <p className="text-sm text-[#64748B] leading-relaxed">
                Traditional portals treat every complaint as an isolated ticket. When 10 citizens report overflowing garbage in MVP Colony or broken pipes in Seethammadhara, CivicSignal recognizes the underlying breakdown.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-lg border border-[#E5EAF0] shadow-2xs">
                  <span className="font-bold text-[#142B45] block">1. Independent Citizen Records Maintained</span>
                  <p className="text-[#64748B] mt-0.5">Each citizen retains their own Complaint ID, audit history, and direct resolution verification right.</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E5EAF0] shadow-2xs">
                  <span className="font-bold text-[#142B45] block">2. Geospatial Haversine & Semantic Synthesis</span>
                  <p className="text-[#64748B] mt-0.5">Clusters within 450m radius based on semantic entity matching, time decay, and civic category.</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E5EAF0] shadow-2xs">
                  <span className="font-bold text-[#142B45] block">3. Root Cause Analysis for Municipal Engineers</span>
                  <p className="text-[#64748B] mt-0.5">Authorities fix the fundamental infrastructure flaw instead of repeatedly clearing the surface symptom.</p>
                </div>
              </div>
            </div>

            {/* Live DNA Cluster Preview Card */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl p-6 border border-[#E5EAF0] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0]">
                  <div>
                    <span className="text-xs font-mono-tabular font-bold text-[#0F9D92]">DNA-GVMC-101</span>
                    <h3 className="text-base font-bold text-[#142B45]">MVP Colony Sector 4 Chronic Solid Waste Overflow</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                    Chronic Hotspot
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg">
                    <span className="text-[#64748B] block text-[11px]">Linked Independent Reports</span>
                    <span className="font-bold text-[#142B45] text-sm">3 Citizen Submissions</span>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg">
                    <span className="text-[#64748B] block text-[11px]">Calculated Priority Score</span>
                    <span className="font-bold text-[#D94B4B] text-sm font-mono-tabular">88 / 100</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-[#142B45] block">Linked Citizen Complaints in this Cluster:</span>
                  {complaints.filter(c => c.underlyingIssueId === 'DNA-GVMC-101').map(c => (
                    <div key={c.id} className="p-2.5 bg-[#F8FAFC] rounded border border-[#E5EAF0] flex justify-between items-center">
                      <div>
                        <span className="font-mono-tabular font-bold text-[#142B45]">{c.id}</span>
                        <span className="text-[#64748B] ml-2 truncate max-w-[200px] inline-block align-bottom">{c.title}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#0F9D92]">{c.status}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100 text-[11px] text-[#0A726A] leading-relaxed">
                  <strong>AI Root Cause Insight:</strong> Irregular commercial vendor dumping during evening hours blocking storm culvert on Road 6. Public Health & Sanitation dispatched dedicated compactor unit.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive City Intelligence & Heatmap Section */}
      <section id="city-intelligence" className="py-16 bg-white border-t border-[#E5EAF0]">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#0F9D92] uppercase tracking-wider">
                GVMC GEOGRAPHIC INTELLIGENCE
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#142B45] mt-1">
                {t(language, 'mapTitle')}
              </h2>
              <p className="text-xs md:text-sm text-[#64748B] mt-1">
                {t(language, 'mapSub')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenReportModal}
                className="px-4 py-2 rounded-lg bg-[#0F9D92] hover:bg-[#0A726A] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {t(language, 'reportProblem')}
              </button>
            </div>
          </div>

          {/* Interactive GIS Map */}
          <GisMap />
        </div>
      </section>

      {/* 6. Bilingual Voice & Citizen Accessibility Spotlight */}
      <section className="py-16 bg-[#F8FAFC] border-t border-[#E5EAF0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <img
                src="/src/assets/images/gvmc_citizen_reporting_1793910363778.jpg"
                alt="Resident in Visakhapatnam inspecting neighborhood civic condition"
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover rounded-2xl border border-[#E5EAF0] shadow-sm"
              />
            </div>

            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-[#0F9D92] uppercase tracking-wider">
                INCLUSIVE CIVIC ACCESSIBILITY
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#142B45]">
                {t(language, 'voiceTitle')}
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                {t(language, 'voiceSub')}
              </p>

              <div className="p-4 bg-white rounded-xl border border-[#E5EAF0] space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0F9D92]/10 flex items-center justify-center text-[#0F9D92] shrink-0">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#142B45] block">Natural Telugu & English Speech Synthesis</span>
                    <p className="text-[#64748B] mt-0.5">
                      Citizens can speak in pure Telugu, English, or Telugu-English mixed speech. The voice assistant automatically extracts the locality, identifies the ward, recommends the category, and reads back the complaint before submission.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={onOpenVoiceModal}
                  className="px-5 py-2.5 rounded-lg bg-[#0F9D92] hover:bg-[#0A726A] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Try Bilingual Voice Assistant</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Municipal Command Centre & Verification Spotlight */}
      <section className="py-16 bg-white border-t border-[#E5EAF0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
                MUNICIPAL FIELD DISPATCH & ACCOUNTABILITY
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#142B45]">
                Evidence-Based Verification & Strict SLA Enforcement
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Physical repairs cannot be closed simply with a status toggle. Field officers must upload geotagged before-and-after photographs, verification officers inspect the evidence, and the citizen receives a prompt to confirm or dispute the resolution.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5EAF0]">
                  <span className="font-bold text-[#142B45] block">Role-Based Command Centre</span>
                  <p className="text-[#64748B] mt-0.5">Platform Owner, Super Admin, Department Heads, and Field Inspectors operate in unified coordination.</p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5EAF0]">
                  <span className="font-bold text-[#142B45] block">Citizen Dispute Rights</span>
                  <p className="text-[#64748B] mt-0.5">If the drain is still clogged or the pothole poorly patched, citizens can dispute and immediately reopen the ticket.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveExperience('authority')}
                  className="px-5 py-2.5 rounded-lg bg-[#142B45] hover:bg-[#1e3b5e] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  View Authority Command Centre
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <img
                src="/src/assets/images/municipal_command_centre_1793910363115.jpg"
                alt="GVMC Municipal Operations and GIS Command Centre"
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover rounded-2xl border border-[#E5EAF0] shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Public Transparency Scorecard */}
      <section className="py-16 bg-[#F8FAFC] border-t border-[#E5EAF0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0F9D92] uppercase tracking-wider">
              PUBLIC TRANSPARENCY SCORECARD
            </span>
            <h2 className="text-2xl font-bold text-[#142B45] mt-1">
              GVMC Municipal Resolution Performance
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Published live for citizens of Visakhapatnam without exposing private residential addresses or identities.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 bg-white rounded-xl border border-[#E5EAF0] text-center">
              <span className="text-3xl font-extrabold font-mono-tabular text-[#142B45]">{totalComplaints}</span>
              <span className="text-xs text-[#64748B] block mt-1">Total Registered Complaints</span>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#E5EAF0] text-center">
              <span className="text-3xl font-extrabold font-mono-tabular text-[#16865A]">{resolvedCount}</span>
              <span className="text-xs text-[#64748B] block mt-1">Verified Field Resolutions</span>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#E5EAF0] text-center">
              <span className="text-3xl font-extrabold font-mono-tabular text-[#0F9D92]">{hotspotCount}</span>
              <span className="text-xs text-[#64748B] block mt-1">Complaint DNA Hotspots</span>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#E5EAF0] text-center">
              <span className="text-3xl font-extrabold font-mono-tabular text-[#3677D5]">18.4 hrs</span>
              <span className="text-xs text-[#64748B] block mt-1">Average Resolution Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final CTA & Footer */}
      <footer className="bg-white border-t border-[#E5EAF0] py-12 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F9D92] text-white flex items-center justify-center font-bold text-sm">
              CS
            </div>
            <div>
              <span className="font-bold text-[#142B45] block text-sm">CivicSignal · GVMC</span>
              <span>Greater Visakhapatnam Municipal Corporation Municipal Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveExperience('citizen')}
              className="hover:text-[#142B45] font-medium transition-colors"
            >
              Citizen Portal
            </button>
            <button
              onClick={() => setActiveExperience('authority')}
              className="hover:text-[#142B45] font-medium transition-colors"
            >
              Authority Command Centre
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('city-intelligence');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#142B45] font-medium transition-colors"
            >
              GIS Intelligence
            </button>
          </div>

          <div className="text-right">
            <span>Andhra Pradesh GovTech Initiative · Visakhapatnam</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
