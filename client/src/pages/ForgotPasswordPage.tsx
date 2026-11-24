import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          <h2 className="text-2xl font-semibold tracking-tight text-[#F3F4F6]">Reset Password</h2>
          <p className="text-xs text-[#9CA3AF] mt-1">Enter your registered email address</p>
        </div>

        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-6 sm:p-8">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-10 h-10 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#F3F4F6]">Instructions Dispatched</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                If an active account exists associated with <strong className="text-[#F3F4F6]">{email}</strong>, a secure password reset link has been dispatched to that inbox.
              </p>
              <p className="text-[11px] text-[#9CA3AF]">Please check your inbox or spam folder.</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-medium hover:underline mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login Page
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@school.com"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-9 pr-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition-colors"
              >
                Send Password Reset Link
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

export default ForgotPasswordPage;
