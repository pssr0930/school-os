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

    // High-speed Instant Path: If school is already in loaded public list or matches standard default
    const localMatch = registeredSchools.find(s => (s.schoolCode || '').toUpperCase() === targetCode);
    if (localMatch && (targetCode === 'MHS' || localMatch.id)) {
      const fastSchoolData = {
        id: localMatch.id || 'ec18034a-1640-4e97-a5c2-097a36152a8b',
        name: localMatch.name || 'Murthy High School',
        schoolCode: targetCode,
        logoUrl: localMatch.logoUrl || '/pssr-logo.png',
        city: localMatch.city || 'Kakinada',
        motto: 'Empowering Minds, Shaping Futures & Inspiring Leaders'
      };
      localStorage.setItem('selected_school_code', targetCode);
      localStorage.setItem('selected_school_id', fastSchoolData.id);
      localStorage.setItem('selected_school_data', JSON.stringify(fastSchoolData));
      navigate(`/school/${targetCode}`, { state: { school: fastSchoolData } });
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.get(`/schools/lookup/${targetCode}`);
      if (res.data.success && res.data.school) {
        // Store selected school data for instant zero-latency entrance portal rendering
        localStorage.setItem('selected_school_code', targetCode);
        localStorage.setItem('selected_school_id', res.data.school.id);
        localStorage.setItem('selected_school_data', JSON.stringify(res.data.school));
        
        // Navigate directly to the school's tailored digital entrance portal with preloaded state
        navigate(`/school/${targetCode}`, { state: { school: res.data.school } });
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
    <div className="min-h-screen h-screen w-full bg-[#111827] text-[#F3F4F6] flex flex-col justify-between overflow-hidden relative font-sans">
      {/* TOP MINIMAL BRAND HEADER */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between shrink-0 border-b border-[#303B4D]/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center p-1.5 shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-[#F3F4F6] tracking-wider">SCHOOL OS</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                GATEWAY
              </span>
            </div>
            <p className="text-[10px] text-[#9CA3AF]">Enterprise Institutional Operating System</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-[#9CA3AF]">
          <button
            onClick={() => navigate('/agent/login')}
            className="hidden sm:flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#1F2937]"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Agent Portal</span>
          </button>

          <button
            onClick={() => navigate('/register-school')}
            className="flex items-center gap-1.5 bg-[#1F2937] hover:bg-gray-700 text-[#F3F4F6] border border-[#303B4D] px-3.5 py-1.5 rounded-lg transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Register School</span>
          </button>
        </div>
      </header>

      {/* CENTRAL HERO & SCHOOL CODE ENTRY SECTION */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 flex-1 flex flex-col items-center justify-center text-center space-y-6 my-auto">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>CONNECT TO YOUR CAMPUS</span>
        </div>

        {/* Grand Headline & Supporting Copy */}
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-semibold text-[#F3F4F6] tracking-tight leading-tight">
            Enter Your School Code
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-lg mx-auto leading-relaxed">
            Connect to your institution&apos;s tailored digital entrance portal for student attendance, fee receipts, parent notifications, and academic operations.
          </p>
        </div>

        {/* Code Entry Card */}
        <div className="w-full max-w-md bg-[#1F2937] border border-[#303B4D] rounded-lg p-6 sm:p-7 shadow-lg space-y-4 text-left">
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Institution Code
              </label>
              
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Building2 className="w-4 h-4" />
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
                  className="w-full h-11 bg-[#243244] border border-[#303B4D] rounded-lg pl-10 pr-10 text-base font-mono font-semibold text-[#F3F4F6] uppercase tracking-widest placeholder:text-[#9CA3AF] focus:outline-none focus:border-blue-500 transition-colors"
                />

                {schoolCode && (
                  <button
                    type="button"
                    onClick={() => setSchoolCode('')}
                    className="absolute right-3 text-[#9CA3AF] hover:text-[#F3F4F6] p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading || !schoolCode.trim()}
              className="w-full h-10 py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
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
          <div className="pt-3 border-t border-[#303B4D] space-y-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF] block">
              Quick Access Campuses:
            </span>
            <div className="flex flex-wrap gap-2">
              {registeredSchools.map((s) => (
                <button
                  key={s.id || s.schoolCode}
                  type="button"
                  onClick={() => handleQuickSelect(s.schoolCode)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] text-xs font-medium rounded-md border border-[#303B4D] transition-colors"
                >
                  <span className="font-mono text-blue-400">{s.schoolCode}</span>
                  <span className="text-[#9CA3AF]">•</span>
                  <span className="text-[#9CA3AF] truncate max-w-[150px]">{s.name}</span>
                  <ArrowRight className="w-3 h-3 text-[#9CA3AF]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights Strip */}
        <div className="flex items-center justify-center gap-6 text-[11px] font-medium text-[#9CA3AF] flex-wrap pt-2">
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
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 h-12 border-t border-[#303B4D] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#9CA3AF] shrink-0">
        <div className="flex items-center gap-3">
          <span>Need help finding your code? Contact your principal&apos;s office.</span>
        </div>

        <div className="flex items-center gap-4">
          <span>Powered by <strong className="text-[#F3F4F6]">School OS</strong></span>
          <span>•</span>
          <span>© 2026 PSSR Technologies</span>
        </div>
      </footer>
    </div>
  );
};

export default SchoolCodeEntryPage;
