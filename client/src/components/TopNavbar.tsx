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
    <header className="h-16 shrink-0 bg-slate-900/95 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xl backdrop-blur-md text-white">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-800/80 rounded-xl text-white text-xs font-extrabold border border-slate-700/80 shadow-xs">
          {logo ? (
            <img src={logo} alt="Logo" className="w-5 h-5 object-contain rounded-md bg-white/10 p-0.5" />
          ) : (
            <School className="w-4 h-4 text-blue-400" />
          )}
          <span>{school?.name || 'Murthy High School'}</span>
          <span className="text-[10px] text-blue-400 font-mono font-bold">({school?.schoolCode || 'MHS'})</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full font-extrabold uppercase tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            {user?.role || 'admin'}
          </span>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-black text-white leading-none">{user?.fullName || 'School Admin'}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
