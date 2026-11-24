import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  ArrowLeft,
  Globe, 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Sparkles,
  X,
  Building
} from 'lucide-react';
import api from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { schoolCode: paramSchoolCode } = useParams<{ schoolCode?: string }>();

  // Instant state recovery from navigation state or local cache
  const cachedSchool = (location.state as any)?.school || (() => {
    try {
      const raw = localStorage.getItem('selected_school_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!paramSchoolCode || (parsed.schoolCode || '').toUpperCase() === paramSchoolCode.toUpperCase()) {
          return parsed;
        }
      }
    } catch {}
    return null;
  })();

  const [schoolInfo, setSchoolInfo] = useState<{
    name: string;
    schoolCode: string;
    motto: string;
    logoUrl: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  }>(() => {
    const rawLogo = cachedSchool?.logoUrl || cachedSchool?.logo_url || '/pssr-logo.png';
    const cleanLogo = rawLogo.includes('murthy-school-website.vercel.app') ? '/pssr-logo.png' : rawLogo;
    return {
      name: cachedSchool?.name || 'Murthy High School',
      schoolCode: cachedSchool?.schoolCode || paramSchoolCode?.toUpperCase() || 'MHS',
      motto: cachedSchool?.motto || 'Empowering Minds, Shaping Futures & Inspiring Leaders',
      logoUrl: cleanLogo,
      address: cachedSchool?.address || 'Sarpavaram police station road, near SRMT mall, Kakinada',
      city: cachedSchool?.city || 'Kakinada',
      phone: cachedSchool?.phone || '9121454554',
      email: cachedSchool?.email || 'pssr0930@gmail.com'
    };
  });

  const [language, setLanguage] = useState<'EN' | 'TE' | 'HI'>('EN');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const fetchPublicSchoolInfo = async () => {
      // If we already have full cached school info matching this code, skip redundant network call
      if (cachedSchool && cachedSchool.name && (!paramSchoolCode || (cachedSchool.schoolCode || '').toUpperCase() === paramSchoolCode.toUpperCase())) {
        return;
      }

      try {
        const activeCode = paramSchoolCode || localStorage.getItem('selected_school_code') || '';
        const url = activeCode ? `/schools/public-info?code=${encodeURIComponent(activeCode)}` : '/schools/public-info';
        const res = await api.get(url);
        if (res.data.success && res.data.school) {
          const s = res.data.school;
          const rawLogo = s.logoUrl || s.logo_url || '/pssr-logo.png';
          const cleanLogo = rawLogo.includes('murthy-school-website.vercel.app') ? '/pssr-logo.png' : rawLogo;
          setSchoolInfo(prev => ({
            ...prev,
            ...s,
            logoUrl: cleanLogo
          }));
        }
      } catch (err) {
        console.warn('Could not fetch public school info, using defaults', err);
      }
    };
    fetchPublicSchoolInfo();
  }, [paramSchoolCode]);

  return (
    <div className="min-h-screen h-screen w-full bg-[#111827] text-[#F3F4F6] flex flex-col justify-between overflow-hidden relative font-sans">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[#111827] pointer-events-none" />

      {/* TOP MINIMAL UTILITIES HEADER */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors bg-[#1F2937] hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-[#303B4D]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Switch School</span>
          </button>
          
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF] bg-[#1F2937] px-2.5 py-0.5 rounded border border-[#303B4D] hidden sm:inline-block">
            OFFICIAL DIGITAL PORTAL
          </span>
        </div>

        {/* TOP-RIGHT MINIMAL UTILITIES */}
        <div className="flex items-center gap-4 text-xs font-medium text-[#9CA3AF]">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 hover:text-[#F3F4F6] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>Help</span>
          </button>

          <button
            onClick={() => setIsContactOpen(true)}
            className="flex items-center gap-1.5 hover:text-[#F3F4F6] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>Contact</span>
          </button>

          {/* LANGUAGE SELECTOR */}
          <div className="flex items-center gap-1 bg-[#1F2937] border border-[#303B4D] rounded-lg px-2 py-1 text-[11px] font-medium text-[#9CA3AF]">
            <Globe className="w-3 h-3 text-[#9CA3AF]" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-[#F3F4F6] focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="EN" className="bg-[#1F2937] text-white">English (EN)</option>
              <option value="TE" className="bg-[#1F2937] text-white">తెలుగు (TE)</option>
              <option value="HI" className="bg-[#1F2937] text-white">हिंदी (HI)</option>
            </select>
          </div>
        </div>
      </header>

      {/* MAIN TWO-COLUMN ENTRANCE COMPOSITION */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 flex-1 grid grid-cols-1 md:grid-cols-2 items-center gap-8 py-6 overflow-y-auto md:overflow-hidden">
        
        {/* LEFT SIDE — SCHOOL IDENTITY (~50% WIDTH) */}
        <div className="w-full h-full flex flex-col items-center justify-center relative p-6 sm:p-10">
          <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-6">
            {/* Logo Card */}
            <div className="relative p-8 sm:p-12 rounded-lg bg-[#1F2937] border border-[#303B4D] flex items-center justify-center max-h-[48vh] max-w-[85%]">
              <img
                src={schoolInfo.logoUrl}
                alt={schoolInfo.name}
                className="max-h-[38vh] max-w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.endsWith('/pssr-logo.png')) {
                    target.src = '/pssr-logo.png';
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />

              {/* Verified Campus Badge */}
              <div className="absolute -bottom-3 -right-3 bg-[#111827] border border-[#303B4D] text-blue-400 px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>OFFICIAL DIGITAL HOME</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">
                CAMPUS ENTRANCE PORTAL
              </span>
              <p className="text-xs text-[#9CA3AF] font-mono font-medium">
                CODE: {schoolInfo.schoolCode}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — SCHOOL PORTAL CONTENT AREA */}
        <div className="w-full flex flex-col justify-center space-y-6 p-4 sm:p-8">
          <div className="space-y-3">
            {/* 1. Small Eyebrow Text */}
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              WELCOME TO
            </p>

            {/* 2. Large School Name */}
            <h1 className="text-3xl sm:text-5xl font-semibold text-[#F3F4F6] tracking-tight leading-tight">
              {schoolInfo.name}
            </h1>

            {/* 3. School Motto / Tagline */}
            <p className="text-sm sm:text-base font-normal text-[#9CA3AF] italic">
              "{schoolInfo.motto}"
            </p>

            {/* 4. Short Supporting Text */}
            <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed pt-1">
              Your school&apos;s official digital portal for students, parents, staff and administration.
            </p>
          </div>

          {/* 5. MAIN ACTION AREA: LOGIN PORTALS */}
          <div className="space-y-3 pt-2">
            {/* School Administrator Login (VISUALLY DOMINANT PRIMARY ACTION) */}
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg flex items-center justify-between transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="block font-semibold text-sm">School Administrator Login</span>
                  <span className="block text-[11px] text-blue-100">Full school management, reports & controls</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80" />
            </button>

            {/* Staff / Teacher Login (SECONDARY ACTION) */}
            <button
              onClick={() => navigate('/staff/login')}
              className="w-full py-3 px-5 bg-[#1F2937] hover:bg-gray-700 text-[#F3F4F6] border border-[#303B4D] font-medium text-xs rounded-lg transition-colors flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#243244] text-blue-400 flex items-center justify-center shrink-0 border border-[#303B4D]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block font-medium text-xs text-[#F3F4F6]">Staff / Teacher Login</span>
                  <span className="block text-[10px] text-[#9CA3AF]">Classroom attendance & teaching tools</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#9CA3AF]" />
            </button>

            {/* Agent Portal (BOTTOM UTILITY ACTION) */}
            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => navigate('/agent/login')}
                className="text-[11px] font-medium text-[#9CA3AF] hover:text-[#F3F4F6] flex items-center gap-1.5 transition-colors py-1 px-2.5 rounded-lg hover:bg-[#1F2937]"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Agent Portal Access</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER — MINIMAL FOOTER UTILITY */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 h-14 border-t border-[#303B4D] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#9CA3AF] shrink-0">
        <div className="flex items-center gap-2 truncate">
          <Building className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
          <span className="truncate">{schoolInfo.address}</span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span>Powered by <strong className="text-[#F3F4F6]">School OS</strong></span>
          <span>•</span>
          <span>© 2026 {schoolInfo.name}</span>
        </div>
      </footer>

      {/* CONTACT MODAL */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-6 max-w-md w-full text-[#F3F4F6] space-y-4 relative shadow-xl">
            <button 
              onClick={() => setIsContactOpen(false)}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#F3F4F6] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#243244] border border-[#303B4D] text-blue-400 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{schoolInfo.name}</h3>
                <p className="text-xs text-[#9CA3AF]">Campus Contact Details</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D] space-y-1">
                <span className="text-[#9CA3AF] font-medium uppercase text-[10px] block">Address</span>
                <p className="font-medium text-[#F3F4F6] flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{schoolInfo.address}</span>
                </p>
              </div>

              <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D] space-y-1">
                <span className="text-[#9CA3AF] font-medium uppercase text-[10px] block">Phone / Help Desk</span>
                <p className="font-mono font-medium text-[#F3F4F6] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{schoolInfo.phone}</span>
                </p>
              </div>

              <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D] space-y-1">
                <span className="text-[#9CA3AF] font-medium uppercase text-[10px] block">Email Inquiry</span>
                <p className="font-mono font-medium text-[#F3F4F6] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{schoolInfo.email}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsContactOpen(false)}
              className="w-full py-2 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-lg border border-[#303B4D] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-4 relative shadow-2xl">
            <button 
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Portal Support</h3>
                <p className="text-xs text-slate-400">Login Assistance & FAQs</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 pt-1">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                <h4 className="font-bold text-white">How do I log in as a Parent or Student?</h4>
                <p className="text-slate-400 leading-relaxed">
                  Click on the "Student / Parent Portal" button on the main entrance page and enter your registered credentials or phone number.
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                <h4 className="font-bold text-white">Staff Login Credentials</h4>
                <p className="text-slate-400 leading-relaxed">
                  Faculty and staff members should use their authorized staff login email and password assigned by school administration.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
