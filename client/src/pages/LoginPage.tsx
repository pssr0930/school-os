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
    <div className="min-h-screen bg-[#111827] text-[#F3F4F6] flex flex-col justify-center items-center p-6 relative">
      {/* Top Home Navigation Bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1F2937] hover:bg-gray-700 text-[#9CA3AF] hover:text-[#F3F4F6] text-xs font-medium transition-colors border border-[#303B4D]"
        >
          <Home className="w-4 h-4 text-blue-400" />
          <span>Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 rounded-lg bg-white shadow-md mb-3">
            <img 
              src="/pssr-logo.png" 
              alt="School OS Logo" 
              className="w-10 h-10 rounded object-contain" 
            />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#F3F4F6]">
            {activeTab === 'admin' ? 'School Administrator Sign In' : 'Teacher / Staff Sign In'}
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            {activeTab === 'admin' 
              ? 'School Management & Administrative Controls' 
              : 'School OS Classroom Operations & Staff Register'}
          </p>
        </div>

        {/* Tab Switcher - Only shown on generic /login route without specific role */}
        {!defaultRole && !location.pathname.includes('/staff') && !location.pathname.includes('/admin') && (
          <div className="bg-[#1F2937] p-1 rounded-lg mb-6 grid grid-cols-2 gap-1 border border-[#303B4D]">
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'staff'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Staff Portal</span>
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-[#1F2937] border border-[#303B4D] p-6 sm:p-8 rounded-lg">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-medium rounded-lg text-center mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                {activeTab === 'admin' ? 'Admin ID / Username *' : 'Staff Phone / Email *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'admin@school.com or MHS01ADM' : 'staff@school.com, MHS01TCR, or 9876543210'}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-9 pr-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-9 pr-9 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#9CA3AF] hover:text-[#F3F4F6]"
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
              className="w-full py-2.5 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 text-white bg-blue-600 hover:bg-blue-500"
            >
              <span>{isLoading ? 'Authenticating...' : `Sign In to ${activeTab === 'admin' ? 'Admin' : 'Staff'} Portal`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-[11px] text-[#9CA3AF] border-t border-[#303B4D] pt-4 mt-6">
            Licensed Product • Contact Administrator for Account Access
          </div>
        </div>
      </div>
    </div>
  );
};
