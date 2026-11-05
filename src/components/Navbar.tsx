import React, { useState } from 'react';
import { useCivicStore } from '../context/CivicStore';
import { t } from '../utils/i18n';
import {
  Shield,
  Bell,
  Menu,
  X,
  Check,
  Users,
  Building2,
  Globe,
  LogIn,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onOpenReportModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenAuthModal: (tab?: 'citizen' | 'authority') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReportModal,
  onOpenVoiceModal,
  onOpenAuthModal
}) => {
  const {
    language,
    setLanguage,
    activeExperience,
    setActiveExperience,
    notifications,
    markAllNotificationsRead,
    isAuthenticated,
    authenticatedUser,
    logout,
    activeRole
  } = useCivicStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-[800] bg-white/95 backdrop-blur-md border-b border-[#E5EAF0]">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveExperience('public')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0F9D92] text-white flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:bg-[#0A726A] transition-colors">
              CS
            </div>
            <div className="leading-tight">
              <span className="text-lg font-extrabold tracking-tight text-[#142B45] whitespace-nowrap block">
                {t(language, 'brandName')}
              </span>
              <span className="text-[10px] font-semibold text-[#64748B] tracking-wider uppercase block">
                GVMC Municipal Intelligence
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#64748B]">
          <button
            onClick={() => setActiveExperience('public')}
            className={`hover:text-[#142B45] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeExperience === 'public' ? 'text-[#0F9D92] font-bold' : ''
            }`}
          >
            {t(language, 'navHome')}
          </button>

          <button
            onClick={() => {
              setActiveExperience('public');
              setTimeout(() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-[#142B45] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t(language, 'navHowItWorks')}
          </button>

          <button
            onClick={() => {
              setActiveExperience('public');
              setTimeout(() => {
                const el = document.getElementById('city-intelligence');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-[#142B45] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t(language, 'navCityIntelligence')}
          </button>

          <button
            onClick={() => setActiveExperience('citizen')}
            className={`hover:text-[#142B45] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeExperience === 'citizen' ? 'text-[#0F9D92] font-bold' : ''
            }`}
          >
            {t(language, 'navCitizenPortal')}
          </button>

          <button
            onClick={() => setActiveExperience('authority')}
            className={`hover:text-[#142B45] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeExperience === 'authority' ? 'text-[#142B45] font-bold' : ''
            }`}
          >
            {t(language, 'navAuthorityPortal')}
          </button>
        </nav>

        {/* Zone 3: Experience Switcher + Language Selector + Sign In + Notifications */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSignInDropdown(false);
                setShowUserDropdown(false);
              }}
              className="p-2 rounded-lg text-[#64748B] hover:text-[#142B45] hover:bg-[#F8FAFC] transition-colors relative cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D94B4B]"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E5EAF0] p-4 text-xs z-[900]">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF0] mb-2">
                  <span className="font-bold text-[#142B45]">Civic Alerts ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-[#0F9D92] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border transition-colors ${
                        n.read ? 'bg-white border-[#E5EAF0]' : 'bg-[#F8FAFC] border-[#0F9D92]/30'
                      }`}
                    >
                      <span className="font-bold text-[#142B45] block">
                        {language === 'te' ? n.titleTe : n.title}
                      </span>
                      <p className="text-[#64748B] mt-0.5 text-[11px]">
                        {language === 'te' ? n.messageTe : n.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bilingual Language Switcher (EN / TE) */}
          <div className="flex bg-[#F1F5F9] rounded-lg p-0.5 border border-[#E5EAF0] text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                language === 'en' ? 'bg-white text-[#142B45] shadow-xs' : 'text-[#64748B] hover:text-[#142B45]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                language === 'te' ? 'bg-[#0F9D92] text-white shadow-xs' : 'text-[#64748B] hover:text-[#142B45]'
              }`}
            >
              తెలుగు
            </button>
          </div>

          {/* SIGN IN BUTTON & SEPARATE ENTRY PATHS (User Requirement 1) */}
          <div className="relative">
            <div className="flex items-center rounded-lg border border-[#E5EAF0] bg-white overflow-hidden shadow-2xs">
              <button
                onClick={() => onOpenAuthModal('citizen')}
                className="px-3 py-1.5 text-xs font-bold text-[#142B45] hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                aria-label="Sign In to CivicSignal"
              >
                <LogIn className="w-3.5 h-3.5 text-[#0F9D92]" />
                <span>{language === 'te' ? 'సైన్ ఇన్' : 'Sign In'}</span>
              </button>
              <button
                onClick={() => {
                  setShowSignInDropdown(!showSignInDropdown);
                  setShowNotifications(false);
                }}
                className="px-1.5 py-1.5 text-[#64748B] hover:text-[#142B45] hover:bg-[#F8FAFC] border-l border-[#E5EAF0] transition-colors cursor-pointer"
                aria-label="Open Sign In options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown with separate paths: Citizen vs Municipal Authority */}
            {showSignInDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E5EAF0] p-2 text-xs z-[900]">
                <div className="p-2 border-b border-[#E5EAF0] mb-1">
                  <span className="font-bold text-[#142B45] block">Select Portal Access</span>
                  <span className="text-[10px] text-[#64748B]">Choose your role to proceed</span>
                </div>

                <button
                  onClick={() => {
                    setShowSignInDropdown(false);
                    onOpenAuthModal('citizen');
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-[#F8FAFC] flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-md bg-[#0F9D92]/10 text-[#0F9D92] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#142B45] block">Citizen Sign In / Register</span>
                    <span className="text-[10px] text-[#64748B]">Report issues, voice assistant & track</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowSignInDropdown(false);
                    onOpenAuthModal('authority');
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-[#F8FAFC] flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-md bg-[#142B45]/10 text-[#142B45] flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#142B45] block">Municipal Authority Sign In</span>
                    <span className="text-[10px] text-[#64748B]">Commissioner, Engineers & Officers</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          {activeExperience === 'citizen' ? (
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0F9D92] hover:bg-[#0A726A] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Report Problem</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveExperience('citizen')}
              className="hidden lg:flex px-4 py-2 text-xs font-bold text-white bg-[#0F9D92] hover:bg-[#0A726A] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              Citizen Portal
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#64748B] hover:text-[#142B45]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5EAF0] bg-white px-6 py-4 space-y-3 text-sm font-semibold">
          <button
            onClick={() => {
              setActiveExperience('public');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 text-[#142B45]"
          >
            {t(language, 'navHome')}
          </button>
          <button
            onClick={() => {
              setActiveExperience('citizen');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 text-[#0F9D92]"
          >
            {t(language, 'navCitizenPortal')}
          </button>
          <button
            onClick={() => {
              setActiveExperience('authority');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 text-[#142B45]"
          >
            {t(language, 'navAuthorityPortal')}
          </button>
          <div className="pt-2 border-t border-[#E5EAF0] flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenAuthModal('citizen');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded-lg bg-[#0F9D92] text-white text-xs font-bold text-center"
            >
              Citizen Sign In / Register
            </button>
            <button
              onClick={() => {
                onOpenAuthModal('authority');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded-lg bg-[#142B45] text-white text-xs font-bold text-center"
            >
              Municipal Authority Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
