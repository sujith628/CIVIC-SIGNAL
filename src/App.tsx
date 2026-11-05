import React, { useState } from 'react';
import { CivicStoreProvider, useCivicStore } from './context/CivicStore';
import { Navbar } from './components/Navbar';
import { LandingPageView } from './views/LandingPageView';
import { CitizenDashboardView } from './views/CitizenDashboardView';
import { AuthorityCommandView } from './views/AuthorityCommandView';
import { ReportProblemModal } from './components/ReportProblemModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { AuthModal } from './components/AuthModal';
import { Complaint } from './types';

const MainAppContent: React.FC = () => {
  const { activeExperience } = useCivicStore();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'citizen' | 'authority'>('citizen');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const handleOpenAuth = (tab?: 'citizen' | 'authority') => {
    setAuthModalTab(tab || 'citizen');
    setAuthModalOpen(true);
  };

  const handleComplaintSubmitted = (complaintId: string) => {
    // Optional: auto-select newly submitted complaint
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-[#0F9D92] selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenReportModal={() => setReportModalOpen(true)}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        onOpenAuthModal={handleOpenAuth}
      />

      {/* Main View Router based on activeExperience */}
      <main className="flex-1">
        {activeExperience === 'public' && (
          <LandingPageView
            onOpenReportModal={() => setReportModalOpen(true)}
            onOpenVoiceModal={() => setVoiceModalOpen(true)}
            onOpenAuthModal={handleOpenAuth}
          />
        )}

        {activeExperience === 'citizen' && (
          <CitizenDashboardView
            onOpenReportModal={() => setReportModalOpen(true)}
            onOpenVoiceModal={() => setVoiceModalOpen(true)}
            onSelectComplaintForDetail={comp => setSelectedComplaint(comp)}
          />
        )}

        {activeExperience === 'authority' && (
          <AuthorityCommandView
            onSelectComplaintForDetail={comp => setSelectedComplaint(comp)}
          />
        )}
      </main>

      {/* Sign In & Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* Report a Problem Modal */}
      <ReportProblemModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSuccess={handleComplaintSubmitted}
        openVoiceAssistant={() => setVoiceModalOpen(true)}
      />

      {/* Bilingual AI Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onSuccess={handleComplaintSubmitted}
      />

      {/* Complaint Detail & Tracking Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <CivicStoreProvider>
      <MainAppContent />
    </CivicStoreProvider>
  );
}
