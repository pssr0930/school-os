import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight, 
  Search, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Layers, 
  GraduationCap,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

export const SchoolCodeEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [schoolCode, setSchoolCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredSchools, setRegisteredSchools] = useState<Array<{
    id: string;
    name: string;
    schoolCode: string;
    city?: string;
    logoUrl?: string;
  }>>([
    {
      id: 'default',
      name: 'Murthy High School',
      schoolCode: 'MHS',
      city: 'Kakinada',
      logoUrl: '/pssr-logo.png'
    }
  ]);

  // Fetch available schools for quick selection discovery
  useEffect(() => {
    const fetchSchoolsList = async () => {
      try {
        const res = await api.get('/schools/public-list');
        if (res.data.success && res.data.schools?.length > 0) {
          setRegisteredSchools(res.data.schools);
        }
      } catch (err) {
        console.warn('Could not fetch schools list, using defaults:', err);
      }
    };
    fetchSchoolsList();
  }, []);

  const handleLookupSchool = async (codeToSearch?: string) => {
    const targetCode = (codeToSearch || schoolCode).trim().toUpperCase();
    setErrorMessage('');

    if (!targetCode) {
      setErrorMessage('Please enter your school code to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.get(`/schools/lookup/${targetCode}`);
      if (res.data.success && res.data.school) {
        // Store selected school code for session persistence
        localStorage.setItem('selected_school_code', targetCode);
        localStorage.setItem('selected_school_id', res.data.school.id);
        
        // Navigate directly to the school's tailored digital entrance portal
        navigate(`/school/${targetCode}`);
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      setErrorMessage(
        serverMsg || `No active institution found for code "${targetCode}". Please verify with your school administration.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookupSchool();
  };

  const handleQuickSelect = (code: string) => {
    setSchoolCode(code);
    handleLookupSchool(code);
  };

  return (
    <div className="min-h-screen h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden relative font-sans selection:bg-blue-600 selection:text-white">
      {/* SOPHISTICATED AMBIENT GLOW BACKDROPS */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-black pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* TOP MINIMAL BRAND HEADER */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-2 shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white tracking-wider">SCHOOL OS</span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                GATEWAY
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Enterprise Institutional Operating System</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
          <button
            onClick={() => navigate('/agent/login')}
            className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Agent Portal</span>
          </button>

          <button
            onClick={() => navigate('/register-school')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 border border-slate-800 hover:border-blue-500/30 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Register School</span>
          </button>
        </div>
      </header>

      {/* CENTRAL HERO & SCHOOL CODE ENTRY SECTION */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 flex-1 flex flex-col items-center justify-center text-center space-y-8 my-auto">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide shadow-sm animate-pulse-glow">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>CONNECT TO YOUR CAMPUS</span>
        </div>

        {/* Grand Headline & Supporting Copy */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Enter Your <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">School Code</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
            Connect to your institution&apos;s tailored digital entrance portal for student attendance, fee receipts, parent notifications, and academic operations.
          </p>
        </div>

        {/* High-Contrast Code Entry Card */}
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-5 text-left relative group hover:border-slate-700/80 transition-all">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-300 mb-2">
                Institution Code
              </label>
              
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>

                <input
                  type="text"
                  autoFocus
                  required
                  value={schoolCode}
                  onChange={(e) => {
                    setSchoolCode(e.target.value.toUpperCase());
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. MHS"
                  className="w-full h-14 bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-12 text-lg font-mono font-black text-white uppercase tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-inner"
                />

                {schoolCode && (
                  <button
                    type="button"
                    onClick={() => setSchoolCode('')}
                    className="absolute right-4 text-slate-500 hover:text-white p-1 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading || !schoolCode.trim()}
              className="w-full h-13 py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting to Campus...</span>
                </>
              ) : (
                <>
                  <span>Access School Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Select Chips */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
              Quick Access Campuses:
            </span>
            <div className="flex flex-wrap gap-2">
              {registeredSchools.map((s) => (
                <button
                  key={s.id || s.schoolCode}
                  type="button"
                  onClick={() => handleQuickSelect(s.schoolCode)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all group"
                >
                  <span className="font-mono text-blue-400 font-black">{s.schoolCode}</span>
                  <span>•</span>
                  <span className="text-slate-300 font-medium truncate max-w-[200px]">{s.name}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights Minimal Strip */}
        <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-slate-400 flex-wrap pt-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dedicated Campus Entrance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Role-Based Secure Auth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Dual-Copy Fee Receipts</span>
          </div>
        </div>
      </main>

      {/* MINIMAL FOOTER */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 h-14 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 shrink-0">
        <div className="flex items-center gap-3">
          <span>Need help finding your code? Contact your principal&apos;s office.</span>
        </div>

        <div className="flex items-center gap-4">
          <span>Powered by <strong className="text-slate-300">School OS</strong></span>
          <span>•</span>
          <span>© 2026 PSSR Technologies</span>
        </div>
      </footer>
    </div>
  );
};

export default SchoolCodeEntryPage;
