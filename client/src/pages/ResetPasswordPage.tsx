import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#111827] text-[#F3F4F6] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 rounded-lg bg-white shadow-md mb-3">
            <img 
              src="/pssr-logo.png" 
              alt="School OS Logo" 
              className="w-10 h-10 rounded object-contain" 
            />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#F3F4F6]">Create New Password</h2>
          <p className="text-xs text-[#9CA3AF] mt-1">Set a secure password for your School OS profile.</p>
        </div>

        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-10 h-10 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#F3F4F6]">Password Updated Successfully</h3>
              <p className="text-xs text-[#9CA3AF]">Redirecting to login portal...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-9 pr-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-9 pr-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition-colors"
              >
                Reset Password & Sign In
              </button>

              <div className="text-center mt-4">
                <Link to="/login" className="text-xs text-[#9CA3AF] hover:text-[#F3F4F6] inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
