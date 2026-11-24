import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, School, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopNavbar: React.FC = () => {
  const { user, school, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const logo = (school as any)?.logoUrl || (school as any)?.logo_url;

  return (
    <header className="h-14 shrink-0 bg-[#1F2937] border-b border-[#303B4D] px-6 flex items-center justify-between sticky top-0 z-30 text-[#F3F4F6]">
      <div className="flex items-center gap-3">
        {logo ? (
          <img src={logo} alt="Logo" className="w-6 h-6 object-contain rounded bg-white p-0.5" />
        ) : (
          <School className="w-4 h-4 text-blue-400" />
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#F3F4F6]">{school?.name || 'Murthy High School'}</span>
          <span className="text-xs text-[#9CA3AF] font-mono">({school?.schoolCode || 'MHS'})</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <span className="text-xs px-2.5 py-0.5 rounded-md font-medium capitalize bg-[#111827] text-slate-300 border border-[#303B4D] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          {user?.role || 'admin'}
        </span>

        <div className="h-5 w-px bg-[#303B4D]" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-[#F3F4F6] leading-none">{user?.fullName || 'School Admin'}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#111827] rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
