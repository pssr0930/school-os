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
    <div className="flex h-screen w-screen overflow-hidden bg-[#111827] text-[#F3F4F6]">
      {/* Fixed Desktop Sidebar (HIDDEN ON MOBILE < 768px) */}
      <div className="hidden md:block shrink-0 h-screen sticky top-0 z-40">
        {isAdmin ? <AdminSidebar /> : <StaffSidebar />}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Desktop Top Navbar (HIDDEN ON MOBILE < 768px) */}
        <div className="hidden md:block">
          <TopNavbar />
        </div>

        {/* Mobile Header (VISIBLE ONLY ON MOBILE < 768px) */}
        <header className="block md:hidden h-14 bg-[#1F2937] border-b border-[#303B4D] px-4 shrink-0 sticky top-0 z-50 text-[#F3F4F6]">
          <div className="h-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {logo ? (
                <img src={logo} alt="Logo" className="w-7 h-7 object-contain bg-white rounded-md p-0.5" />
              ) : (
                <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white">
                  <School className="w-4 h-4" />
                </div>
              )}
              <div>
                <h1 className="font-semibold text-xs tracking-tight text-[#F3F4F6] leading-none">
                  {school?.name || 'School OS'}
                </h1>
                <span className="text-[10px] text-[#9CA3AF]">
                  {isAdmin ? 'Admin Portal' : 'Staff Interface'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium capitalize bg-[#111827] text-slate-300 border border-[#303B4D] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                {user?.role || 'admin'}
              </span>

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

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {/* Mobile Back Button Bar for Sub-Pages */}
          {!isDashboardRoute && (
            <div className="block md:hidden mb-4">
              <button
                onClick={handleBackToDashboard}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F2937] border border-[#303B4D] text-[#F3F4F6] font-medium text-xs rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
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
