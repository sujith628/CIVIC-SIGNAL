import React, { useState } from 'react';
import { useCivicStore } from '../context/CivicStore';
import { UserRole } from '../types';
import { GVMC_LOCALITIES } from '../utils/geo';
import {
  X,
  User,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'citizen' | 'authority';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'citizen'
}) => {
  const { language, loginCitizen, loginAuthority } = useCivicStore();
  const [activeTab, setActiveTab] = useState<'citizen' | 'authority'>(initialTab);

  // Citizen State
  const [citizenMode, setCitizenMode] = useState<'signin' | 'register'>('signin');
  const [citizenIdentifier, setCitizenIdentifier] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenLocality, setCitizenLocality] = useState(GVMC_LOCALITIES[0].name);
  const [showCitizenPassword, setShowCitizenPassword] = useState(false);
  const [citizenError, setCitizenError] = useState('');

  // Authority State
  const [authorityRole, setAuthorityRole] = useState<UserRole>('platform_owner');
  const [authorityEmail, setAuthorityEmail] = useState('platform.owner@gvmc.gov.in');
  const [authorityName, setAuthorityName] = useState('Dr. K. Srinivas Rao, IAS (Municipal Commissioner)');
  const [authorityPassword, setAuthorityPassword] = useState('');
  const [showAuthorityPassword, setShowAuthorityPassword] = useState(false);
  const [authorityError, setAuthorityError] = useState('');

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Sync tab if initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
    setCitizenError('');
    setAuthorityError('');
    setShowForgotPassword(false);
    setForgotSent(false);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  // Pre-configured Authority accounts
  const AUTHORITY_ACCOUNTS: {
    role: UserRole;
    name: string;
    email: string;
    title: string;
  }[] = [
    {
      role: 'platform_owner',
      name: 'Dr. K. Srinivas Rao, IAS',
      email: 'platform.owner@gvmc.gov.in',
      title: 'Municipal Commissioner (Platform Owner - Full Governance)'
    },
    {
      role: 'super_admin',
      name: 'P. Rajendra Prasad',
      email: 'superadmin@gvmc.gov.in',
      title: 'Super Admin (GVMC Central Command & Triage)'
    },
    {
      role: 'department_head',
      name: 'Dr. V. Ramanjaneyulu, CMO',
      email: 'cmo.phs@gvmc.gov.in',
      title: 'Department Head (Public Health & Sanitation)'
    },
    {
      role: 'department_head',
      name: 'Er. P. Venkateswara Rao, SE',
      email: 'se.roads@gvmc.gov.in',
      title: 'Department Head (Engineering & Roads Department)'
    },
    {
      role: 'verification_officer',
      name: 'Quality Audit Directorate',
      email: 'verify.gvmc@gvmc.gov.in',
      title: 'Verification Officer (Quality & Photographic Audit)'
    },
    {
      role: 'field_officer',
      name: 'Inspector M. Prabhakar',
      email: 'inspector.mvp@gvmc.gov.in',
      title: 'Field Officer (Ward 18 Sanitary Inspector)'
    }
  ];

  const handleSelectAuthorityRole = (email: string) => {
    const acc = AUTHORITY_ACCOUNTS.find(a => a.email === email);
    if (acc) {
      setAuthorityEmail(acc.email);
      setAuthorityRole(acc.role);
      setAuthorityName(acc.name);
      setAuthorityPassword('gvmc2026');
      setAuthorityError('');
    }
  };

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCitizenError('');

    if (citizenMode === 'signin') {
      if (!citizenIdentifier.trim()) {
        setCitizenError('Please enter your mobile number or registered email.');
        return;
      }
      if (!citizenPassword || citizenPassword.length < 4) {
        setCitizenError('Please enter your password.');
        return;
      }

      loginCitizen(citizenIdentifier);
      onClose();
    } else {
      // Register
      if (!citizenName.trim()) {
        setCitizenError('Please enter your full name.');
        return;
      }
      if (!citizenPhone.trim()) {
        setCitizenError('Please enter your 10-digit mobile number.');
        return;
      }
      if (!citizenPassword || citizenPassword.length < 6) {
        setCitizenError('Password must be at least 6 characters.');
        return;
      }

      const loc = GVMC_LOCALITIES.find(l => l.name === citizenLocality) || GVMC_LOCALITIES[0];
      loginCitizen(citizenPhone, citizenName, loc.ward);
      onClose();
    }
  };

  const handleAuthoritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthorityError('');

    if (!authorityPassword) {
      setAuthorityError('Please enter your secure officer password.');
      return;
    }

    loginAuthority(authorityRole, authorityEmail, authorityName);
    onClose();
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotSent(false);
    }, 2500);
  };

  // Quick fill helper
  const quickFillCitizen = (type: 'sujith' | 'ramesh') => {
    if (type === 'sujith') {
      setCitizenIdentifier('sujithkameshmangipudi@gmail.com');
      setCitizenPassword('civic2026');
      setCitizenError('');
    } else {
      setCitizenIdentifier('+91 98480 12345');
      setCitizenPassword('ramesh2026');
      setCitizenError('');
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#E5EAF0] text-[#142B45] relative">
        {/* Top Header */}
        <div className="p-5 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F9D92] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              CS
            </div>
            <div>
              <h3 className="text-base font-bold text-[#142B45] leading-tight">
                {language === 'te' ? 'సివిక్‌సిగ్నల్ లాగిన్' : 'Sign in to CivicSignal'}
              </h3>
              <span className="text-[10px] text-[#64748B] block font-medium">
                Greater Visakhapatnam Municipal Corporation
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#142B45] hover:bg-[#E5EAF0] transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Citizen vs Authority */}
        <div className="grid grid-cols-2 p-1.5 bg-[#F1F5F9] border-b border-[#E5EAF0] text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('citizen');
              setShowForgotPassword(false);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'citizen'
                ? 'bg-white text-[#0F9D92] shadow-xs'
                : 'text-[#64748B] hover:text-[#142B45]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'పౌర పోర్టల్' : 'Citizen Portal'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('authority');
              setShowForgotPassword(false);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'authority'
                ? 'bg-white text-[#142B45] shadow-xs'
                : 'text-[#64748B] hover:text-[#142B45]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'మున్సిపల్ అథారిటీ' : 'Municipal Authority'}</span>
          </button>
        </div>

        {/* Forgot Password View */}
        {showForgotPassword ? (
          <div className="p-6 space-y-4 text-xs">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-[#0F9D92]/10 text-[#0F9D92] flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#142B45]">Reset Your Password</h4>
              <p className="text-[#64748B] text-[11px]">
                Enter your registered email or phone number. We'll send an OTP recovery link.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verification code sent to {forgotEmail}. Redirecting...</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Registered Mobile or Email</label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="e.g. +91 98480 23456 or name@gmail.com"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] text-xs focus:outline-none focus:border-[#0F9D92]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-1/2 py-2 rounded-lg border border-[#E5EAF0] text-[#64748B] hover:bg-[#F8FAFC] font-semibold"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 rounded-lg bg-[#0F9D92] hover:bg-[#0A726A] text-white font-bold transition-colors"
                  >
                    Send OTP Link
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : activeTab === 'citizen' ? (
          /* Citizen Form */
          <div className="p-6 space-y-4 text-xs">
            {/* Mode switch: Sign In vs Register */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF0]">
              <span className="font-bold text-sm text-[#142B45]">
                {citizenMode === 'signin' ? 'Resident Sign In' : 'New Citizen Registration'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCitizenMode(citizenMode === 'signin' ? 'register' : 'signin');
                  setCitizenError('');
                }}
                className="text-[11px] font-bold text-[#0F9D92] hover:underline cursor-pointer"
              >
                {citizenMode === 'signin' ? 'Need an account? Register' : 'Existing resident? Sign In'}
              </button>
            </div>

            {citizenError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{citizenError}</span>
              </div>
            )}

            <form onSubmit={handleCitizenSubmit} className="space-y-3">
              {citizenMode === 'register' && (
                <div>
                  <label className="block font-semibold mb-1 text-[#142B45]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={e => setCitizenName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] text-xs text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
                  />
                </div>
              )}

              {citizenMode === 'register' ? (
                <div>
                  <label className="block font-semibold mb-1 text-[#142B45]">Mobile Number (+91) *</label>
                  <input
                    type="tel"
                    required
                    value={citizenPhone}
                    onChange={e => setCitizenPhone(e.target.value)}
                    placeholder="e.g. 98480 23456"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] text-xs text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold mb-1 text-[#142B45]">Mobile Number or Email *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={citizenIdentifier}
                      onChange={e => setCitizenIdentifier(e.target.value)}
                      placeholder="e.g. 98480 23456 or name@gmail.com"
                      className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] text-xs text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
                    />
                  </div>
                </div>
              )}

              {citizenMode === 'register' && (
                <div>
                  <label className="block font-semibold mb-1 text-[#142B45]">GVMC Locality & Ward *</label>
                  <select
                    value={citizenLocality}
                    onChange={e => setCitizenLocality(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] bg-white text-xs text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
                  >
                    {GVMC_LOCALITIES.map(l => (
                      <option key={l.name} value={l.name}>
                        {language === 'te' ? l.teluguName : l.name} (Ward {l.ward})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#142B45]">Password *</label>
                  {citizenMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] text-[#64748B] hover:text-[#0F9D92] underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showCitizenPassword ? 'text' : 'password'}
                    required
                    value={citizenPassword}
                    onChange={e => setCitizenPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] text-xs text-[#142B45] pr-9 focus:outline-none focus:border-[#0F9D92]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCitizenPassword(!showCitizenPassword)}
                    className="absolute right-2.5 top-2.5 text-[#64748B] hover:text-[#142B45]"
                    aria-label={showCitizenPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCitizenPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0F9D92] hover:bg-[#0A726A] text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{citizenMode === 'signin' ? 'Sign In to Citizen Portal' : 'Create Citizen Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Pre-fill Links for Testing */}
            <div className="pt-3 border-t border-[#E5EAF0] text-center">
              <span className="text-[11px] text-[#64748B] block mb-1.5 font-medium">Quick Demo Profiles:</span>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => quickFillCitizen('sujith')}
                  className="px-2.5 py-1 rounded bg-[#F8FAFC] border border-[#E5EAF0] text-[11px] font-semibold text-[#142B45] hover:bg-white transition-colors cursor-pointer"
                >
                  Sujith Kamesh (Ward 18)
                </button>
                <button
                  type="button"
                  onClick={() => quickFillCitizen('ramesh')}
                  className="px-2.5 py-1 rounded bg-[#F8FAFC] border border-[#E5EAF0] text-[11px] font-semibold text-[#142B45] hover:bg-white transition-colors cursor-pointer"
                >
                  Ramesh Varma (MVP Colony)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Municipal Authority Form */
          <div className="p-6 space-y-4 text-xs">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Restricted Municipal Staff Portal</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Administrative credentials are provisioned exclusively by the GVMC IT Directorate. Public registration is restricted.
              </p>
            </div>

            {authorityError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authorityError}</span>
              </div>
            )}

            <form onSubmit={handleAuthoritySubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-[#142B45]">Select Official Role / Officer *</label>
                <select
                  value={authorityEmail}
                  onChange={e => handleSelectAuthorityRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] bg-white text-xs text-[#142B45] focus:outline-none focus:border-[#142B45]"
                >
                  {AUTHORITY_ACCOUNTS.map(acc => (
                    <option key={acc.email} value={acc.email}>
                      {acc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#142B45]">Official Government Email ID</label>
                <input
                  type="email"
                  readOnly
                  value={authorityEmail}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] bg-[#F8FAFC] text-xs text-[#64748B] font-mono-tabular"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#142B45]">Officer Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthorityPassword('gvmc2026');
                      setAuthorityError('');
                    }}
                    className="text-[11px] text-[#0F9D92] hover:underline cursor-pointer"
                  >
                    Fill Demo Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAuthorityPassword ? 'text' : 'password'}
                    required
                    value={authorityPassword}
                    onChange={e => setAuthorityPassword(e.target.value)}
                    placeholder="Enter security passphrase"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] text-xs text-[#142B45] pr-9 focus:outline-none focus:border-[#142B45]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthorityPassword(!showAuthorityPassword)}
                    className="absolute right-2.5 top-2.5 text-[#64748B] hover:text-[#142B45]"
                    aria-label={showAuthorityPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAuthorityPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#142B45] hover:bg-[#1e3b5e] text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Authorize & Enter Command Centre</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
