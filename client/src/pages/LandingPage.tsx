import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const { schoolCode: paramSchoolCode } = useParams<{ schoolCode?: string }>();

  const [schoolInfo, setSchoolInfo] = useState<{
    name: string;
    schoolCode: string;
    motto: string;
    logoUrl: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  }>({
    name: 'Murthy High School',
    schoolCode: 'MHS',
    motto: 'Empowering Minds, Shaping Futures & Inspiring Leaders',
    logoUrl: '/pssr-logo.png',
    address: 'Sarpavaram police station road, near SRMT mall, Kakinada',
    city: 'Kakinada',
    phone: '9121454554',
    email: 'pssr0930@gmail.com'
  });

  const [language, setLanguage] = useState<'EN' | 'TE' | 'HI'>('EN');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const fetchPublicSchoolInfo = async () => {
      try {
        const activeCode = paramSchoolCode || localStorage.getItem('selected_school_code') || '';
        const url = activeCode ? `/schools/public-info?code=${encodeURIComponent(activeCode)}` : '/schools/public-info';
        const res = await api.get(url);
        if (res.data.success && res.data.school) {
          setSchoolInfo(prev => ({
            ...prev,
            ...res.data.school
          }));
        }
      } catch (err) {
        console.warn('Could not fetch public school info, using defaults', err);
      }
    };
    fetchPublicSchoolInfo();
  }, [paramSchoolCode]);

  return (
    <div className="min-h-screen h-screen w-full bg-slate-900 text-slate-900 flex flex-col justify-between overflow-hidden relative font-sans">
      {/* SOPHISTICATED FULL-SCREEN BACKGROUND WITH VERY SUBTLE GRADIENTS & SOFT GEOMETRIC SHAPES */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP MINIMAL UTILITIES HEADER */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Switch School</span>
          </button>
          
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/80 hidden sm:inline-block">
            OFFICIAL DIGITAL PORTAL
          </span>
        </div>

        {/* TOP-RIGHT MINIMAL UTILITIES */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Help</span>
          </button>

          <button
            onClick={() => setIsContactOpen(true)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>Contact</span>
          </button>

          {/* LANGUAGE SELECTOR */}
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/90 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-300">
            <Globe className="w-3 h-3 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="EN" className="bg-slate-900 text-white">English (EN)</option>
              <option value="TE" className="bg-slate-900 text-white">తెలుగు (TE)</option>
              <option value="HI" className="bg-slate-900 text-white">हिंदी (HI)</option>
            </select>
          </div>
        </div>
      </header>

      {/* MAIN TWO-COLUMN ENTRANCE COMPOSITION */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 flex-1 grid grid-cols-1 md:grid-cols-2 items-center gap-8 py-6 overflow-y-auto md:overflow-hidden">
        
        {/* LEFT SIDE — SCHOOL IDENTITY (~50% WIDTH) WITH 3D ANIMATIONS & GLOW ORBITS */}
        <div className="w-full h-full flex flex-col items-center justify-center relative p-6 sm:p-10 [perspective:1000px]">
          {/* Layer 1: Dual Pulsing Background Glow Aura */}
          <div className="absolute w-72 h-72 sm:w-[420px] sm:h-[420px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

          {/* Layer 2: 3D Orbiting Ring 1 (Forward Rotating) */}
          <div className="absolute w-80 h-80 sm:w-[440px] sm:h-[440px] border border-dashed border-blue-500/30 rounded-full pointer-events-none animate-spin-orbit flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_12px_#3b82f6] absolute -top-1.5" />
            <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#6366f1] absolute -bottom-1" />
          </div>

          {/* Layer 3: 3D Orbiting Ring 2 (Reverse Rotating) */}
          <div className="absolute w-72 h-72 sm:w-[380px] sm:h-[380px] border border-dashed border-indigo-400/20 rounded-full pointer-events-none animate-spin-orbit-reverse flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] absolute -right-1" />
          </div>

          <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-6">
            {/* 3D Floating Glass Logo Card */}
            <div className="relative group p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/10 via-white/5 to-slate-900/60 backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex items-center justify-center max-h-[48vh] max-w-[85%] transition-all duration-700 hover:border-blue-400/50 hover:shadow-blue-500/20 animate-float-3d [transform-style:preserve-3d]">
              {/* Shimmer Light Sweep Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none rounded-3xl" />

              {/* Logo Image */}
              <img
                src={schoolInfo.logoUrl}
                alt={schoolInfo.name}
                className="max-h-[38vh] max-w-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />

              {/* Floating Verified Campus Badge */}
              <div className="absolute -bottom-3 -right-3 bg-slate-900/90 border border-blue-500/40 text-blue-300 px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 shadow-xl backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>OFFICIAL DIGITAL HOME</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                CAMPUS ENTRANCE PORTAL
              </span>
              <p className="text-xs text-slate-400 font-mono font-bold">
                CODE: {schoolInfo.schoolCode}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — SCHOOL PORTAL CONTENT AREA */}
        <div className="w-full flex flex-col justify-center space-y-6 p-4 sm:p-8">
          <div className="space-y-3">
            {/* 1. Small Eyebrow Text */}
            <p className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">
              WELCOME TO
            </p>

            {/* 2. Large School Name */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
              {schoolInfo.name}
            </h1>

            {/* 3. School Motto / Tagline */}
            <p className="text-sm sm:text-base font-semibold text-slate-300 italic">
              "{schoolInfo.motto}"
            </p>

            {/* 4. Short Supporting Text */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
              Your school&apos;s official digital portal for students, parents, staff and administration.
            </p>
          </div>

          {/* 5. MAIN ACTION AREA: LOGIN PORTALS */}
          <div className="space-y-3.5 pt-2">
            {/* School Administrator Login (VISUALLY DOMINANT PRIMARY ACTION) */}
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-between transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-sm">School Administrator Login</span>
                  <span className="block text-[11px] text-blue-100 font-medium">Full school management, reports & controls</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Staff / Teacher Login (SECONDARY ACTION) */}
            <button
              onClick={() => navigate('/staff/login')}
              className="w-full py-3.5 px-6 bg-slate-800/90 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-emerald-500/50 font-bold text-xs rounded-2xl transition-all flex items-center justify-between group shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-xs text-white">Staff / Teacher Login</span>
                  <span className="block text-[10px] text-slate-400">Classroom attendance & teaching tools</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Agent Portal (BOTTOM UTILITY ACTION) */}
            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => navigate('/agent/login')}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-800/50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Agent Portal Access</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER — MINIMAL FOOTER UTILITY */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 h-14 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{schoolInfo.address}</span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span>Powered by <strong className="text-slate-200">School OS</strong></span>
          <span>•</span>
          <span>© 2026 {schoolInfo.name}</span>
        </div>
      </footer>

      {/* CONTACT MODAL */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-4 relative shadow-2xl">
            <button 
              onClick={() => setIsContactOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">{schoolInfo.name}</h3>
                <p className="text-xs text-slate-400">Campus Contact Details</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Address</span>
                <p className="font-semibold text-slate-200 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{schoolInfo.address}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Phone / Help Desk</span>
                <p className="font-mono font-bold text-slate-200 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{schoolInfo.phone}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Email Inquiry</span>
                <p className="font-mono font-bold text-slate-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{schoolInfo.email}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsContactOpen(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
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
