import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, ArrowRight, Lock, Mail, Eye, EyeOff, Home } from 'lucide-react';

interface LoginPageProps {
  defaultRole?: 'admin' | 'staff';
}

export const LoginPage: React.FC<LoginPageProps> = ({ defaultRole }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const detectedRole = defaultRole || 
    (location.pathname.includes('/staff') ? 'staff' : location.pathname.includes('/admin') ? 'admin' : (searchParams.get('role') === 'staff' ? 'staff' : 'admin'));
  
  const [activeTab, setActiveTab] = useState<'admin' | 'staff'>(detectedRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(detectedRole);
  }, [detectedRole]);

  useEffect(() => {
    if (user) {
      if (detectedRole === 'admin' && user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (detectedRole === 'staff' && (user.role === 'staff' || user.role === 'teacher')) {
        navigate('/staff/dashboard', { replace: true });
      }
    }
  }, [user, detectedRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetEmail = email.trim().toLowerCase();
    if (targetEmail === 'agent@pssr.com' || targetEmail === 'agent@schoolos.com' || targetEmail === 'agent') {
      setError('Invalid ID / Username or Password.');
      return;
    }

    setIsLoading(true);

    try {
      const currentRole = location.pathname.includes('/staff') ? 'staff' : activeTab;
      const success = await login(email, password, currentRole);
      if (success) {
        navigate(currentRole === 'admin' ? '/admin/dashboard' : '/staff/dashboard');
      } else {
        setError(currentRole === 'admin' ? 'Invalid Admin ID / Username or Password.' : 'Invalid Staff ID / Phone / Employee ID or Password.');
      }
    } catch (err: any) {
      setError('Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6 relative">
      {/* Top Home Navigation Bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 shadow-sm"
        >
          <Home className="w-4 h-4 text-blue-400" />
          <span>Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-xl shadow-blue-500/10 mb-3">
            <img 
              src="/pssr-logo.png" 
              alt="School OS Logo" 
              className="w-12 h-12 rounded-xl object-contain" 
            />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {activeTab === 'admin' ? 'School Administrator Sign In' : 'Teacher / Staff Sign In'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'admin' 
              ? 'School Management & Administrative Controls' 
              : 'School OS Classroom Operations & Staff Register'}
          </p>
        </div>

        {/* Tab Switcher - Only shown on generic /login route without specific role */}
        {!defaultRole && !location.pathname.includes('/staff') && !location.pathname.includes('/admin') && (
          <div className="bg-slate-800/80 p-1.5 rounded-2xl mb-6 grid grid-cols-2 gap-1 border border-slate-700/50">
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'staff'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Staff Portal</span>
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-slate-800/50 border border-slate-700/60 p-8 rounded-3xl shadow-xl backdrop-blur-sm">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl text-center mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {activeTab === 'admin' ? 'Admin ID / Username *' : 'Staff Phone / Email *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'admin@school.com or MHS01ADM' : 'staff@school.com, MHS01TCR, or 9876543210'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <Link to="/forgot-password" className="text-blue-400 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 text-white ${
                activeTab === 'admin' 
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <span>{isLoading ? 'Authenticating...' : `Sign In to ${activeTab === 'admin' ? 'Admin' : 'Staff'} Portal`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-500 border-t border-slate-700/60 pt-4 mt-6 uppercase tracking-wider font-semibold">
            Licensed Product • Contact Administrator for Account Access
          </div>
        </div>
      </div>
    </div>
  );
};
