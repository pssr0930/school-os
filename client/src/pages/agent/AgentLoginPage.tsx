import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, Home } from 'lucide-react';

export const AgentLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAgentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/agent/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('agent_token', res.data.token || 'agent-token-superadmin');
        localStorage.setItem('school_os_token', res.data.token || 'agent-token-superadmin');
        localStorage.setItem('agent_data', JSON.stringify(res.data.agent));
        navigate('/agent/dashboard');
      } else {
        setError(res.data.message || 'Invalid Email or Password.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid Email or Password.');
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

      <div className="w-full max-w-md space-y-6">
        {/* Header Logo & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-2 rounded-lg bg-white shadow-md mb-1">
            <img 
              src="/pssr-logo.png" 
              alt="School OS Logo" 
              className="w-10 h-10 rounded object-contain" 
            />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-medium uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Reseller Agent & Operations Portal</span>
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-[#F3F4F6]">Agent SuperAdmin Sign In</h2>
            <p className="text-xs text-[#9CA3AF]">Provision buyer school licenses and manage registered client tenants.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#1F2937] border border-[#303B4D] p-6 sm:p-8 rounded-lg shadow-xl space-y-5">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-medium rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAgentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Agent Email / Authorized ID *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@pssr.com"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-9 pr-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500"
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
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-9 pr-9 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 text-white bg-blue-600 hover:bg-blue-500"
            >
              <span>{isLoading ? 'Verifying Authorization...' : 'Sign In as SuperAdmin Agent'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-[11px] text-[#9CA3AF] border-t border-[#303B4D] pt-4">
            Authorized Personnel Only • IP Address Logged
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLoginPage;
