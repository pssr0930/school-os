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
        isCollapsed ? 'w-16' : 'w-60'
      } bg-[#111827] text-[#9CA3AF] flex flex-col min-h-screen border-r border-[#303B4D] transition-all duration-200 ease-in-out relative group`}
    >
      {/* Header Logo & Caption */}
      <div className={`h-14 flex items-center border-b border-[#303B4D] gap-2.5 ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}>
        <img 
          src="/pssr-logo.png" 
          alt="School OS Logo" 
          className="w-7 h-7 rounded-md object-contain bg-white p-0.5 shrink-0" 
        />
        {!isCollapsed && (
          <div className="truncate">
            <h1 className="font-semibold text-[#F3F4F6] tracking-tight text-sm leading-none">STAFF PORTAL</h1>
            <span className="text-[10px] text-[#9CA3AF]">Teacher Access</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-2.5 mb-2 text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">
            Menu
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
                `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                  isCollapsed ? 'justify-center py-2.5' : ''
                } ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 font-medium'
                    : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1F2937]'
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
      <div className="p-3 border-t border-[#303B4D] flex items-center justify-between text-[11px] text-[#9CA3AF]">
        {!isCollapsed ? (
          <div>
            <p className="font-medium text-slate-300">Staff Portal</p>
            <p className="text-[10px] text-[#9CA3AF]">v2.5</p>
          </div>
        ) : (
          <button
            onClick={toggleCollapse}
            title="Expand Sidebar"
            className="w-full flex justify-center py-1 text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            title="Collapse Sidebar"
            className="p-1 rounded-md text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
