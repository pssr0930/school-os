import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PieChart,
  GraduationCap, 
  UserCheck, 
  User, 
  CreditCard, 
  Receipt, 
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StaffSidebar: React.FC = () => {
  const { hasPermission } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('staff_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('staff_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navItems = [
    { label: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard, perm: null },
    { label: 'Fee Dashboard', path: '/staff/fee-dashboard', icon: PieChart, perm: 'fees.view' },
    { label: 'Students List', path: '/staff/students', icon: GraduationCap, perm: 'students.view' },
    { label: 'Mark Attendance', path: '/staff/attendance', icon: UserCheck, perm: 'attendance.mark' },
    { label: 'Fee Structures', path: '/staff/fees/structure', icon: CreditCard, perm: 'fees.view' },
    { label: 'Record Payments', path: '/staff/payments', icon: Receipt, perm: 'payments.record' },
    { label: 'SMS & Broadcast', path: '/staff/sms', icon: MessageSquare, perm: 'sms.send' },
    { label: 'My Profile', path: '/staff/profile', icon: User, perm: null },
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
          className="w-9 h-9 rounded-xl object-contain bg-white p-1 shadow-md shadow-emerald-500/20 shrink-0" 
        />
        {!isCollapsed && (
          <div className="truncate">
            <h1 className="font-bold text-white tracking-wide text-base leading-none">STAFF PORTAL</h1>
            <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">Teacher Access</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Classroom Operations
          </div>
        )}

        {navItems.map((item) => {
          if (item.perm && !hasPermission(item.perm)) return null;

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
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
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
            <p className="mt-0.5">Staff Interface</p>
          </div>
        ) : (
          <button
            onClick={toggleCollapse}
            title="Expand Sidebar"
            className="w-full flex justify-center py-1 text-emerald-400 hover:text-white"
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
