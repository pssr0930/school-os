import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { StaffSidebar } from './StaffSidebar';
import { TopNavbar } from './TopNavbar';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, LogOut, School, ShieldCheck } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, school, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdmin = user?.role === 'admin';
  const logo = (school as any)?.logoUrl || (school as any)?.logo_url;

  const isDashboardRoute = location.pathname === '/admin/dashboard' || location.pathname === '/staff/dashboard';

  const handleBackToDashboard = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/staff/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 relative">
      {/* Ambient background lighting behind content */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Fixed Desktop Sidebar (HIDDEN ON MOBILE < 768px) */}
      <div className="hidden md:block shrink-0 h-screen sticky top-0 z-40">
        {isAdmin ? <AdminSidebar /> : <StaffSidebar />}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* Desktop Top Navbar (HIDDEN ON MOBILE < 768px) */}
        <div className="hidden md:block">
          <TopNavbar />
        </div>

        {/* Mobile Header (VISIBLE ONLY ON MOBILE < 768px) */}
        <header className="block md:hidden h-14 bg-slate-900 border-b border-slate-800 px-4 shrink-0 sticky top-0 z-50 text-white">
          <div className="h-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {logo ? (
                <img src={logo} alt="Logo" className="w-7 h-7 object-contain bg-white rounded-lg p-0.5" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <School className="w-4 h-4" />
                </div>
              )}
              <div>
                <h1 className="font-extrabold text-xs tracking-wide text-white leading-none">
                  {school?.name || 'SCHOOL OS'}
                </h1>
                <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider">
                  {isAdmin ? 'PSSR Admin Portal' : 'Staff Interface'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                {user?.role || 'admin'}
              </span>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-7xl mx-auto">
          {/* Mobile Back Button Bar for Sub-Pages */}
          {!isDashboardRoute && (
            <div className="block md:hidden mb-4">
              <button
                onClick={handleBackToDashboard}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
};
