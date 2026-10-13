import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PieChart,
  Users, 
  UserCheck, 
  CreditCard, 
  Receipt, 
  MessageSquare, 
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Fee Dashboard', path: '/admin/fee-dashboard', icon: PieChart },
    { label: 'Students', path: '/admin/students', icon: GraduationCap },
    { label: 'Attendance', path: '/admin/attendance', icon: UserCheck },
    { label: 'Fee Structures', path: '/admin/fees/structure', icon: CreditCard },
    { label: 'Payments', path: '/admin/payments', icon: Receipt },
    { label: 'SMS & Broadcast', path: '/admin/sms', icon: MessageSquare },
    { label: 'Staff / Teachers', path: '/admin/staff', icon: Users },
    { label: 'School Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800 transition-all duration-300 ease-in-out relative group`}
    >
      {/* Original Header Logo & Caption */}
      <div className={`h-16 flex items-center border-b border-slate-800 gap-3 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
        <img 
          src="/pssr-logo.png" 
          alt="School OS Logo" 
          className="w-9 h-9 rounded-xl object-contain bg-white p-1 shadow-md shadow-blue-500/20 shrink-0" 
        />
        {!isCollapsed && (
          <div className="truncate">
            <h1 className="font-bold text-white tracking-wide text-base leading-none">SCHOOL OS</h1>
            <span className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">PSSR Technologies</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            School Administration
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isCollapsed ? 'justify-center py-3' : ''
                } ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer & Collapse Toggle Action */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
        {!isCollapsed ? (
          <div>
            <p className="font-medium text-slate-400">School Operating System</p>
            <p className="mt-0.5">Version 2.5 • Multi-Tenant</p>
          </div>
        ) : (
          <button
            onClick={toggleCollapse}
            title="Expand Sidebar"
            className="w-full flex justify-center py-1 text-blue-400 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            title="Collapse Sidebar to icons"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
