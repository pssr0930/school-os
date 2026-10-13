import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  GraduationCap, 
  UserCheck, 
  CreditCard, 
  Receipt, 
  MessageSquare, 
  Users,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileNavCards: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const isAdmin = user?.role === 'admin';

  const allCards = [
    {
      id: 'analytics',
      label: 'Dashboard Analytics',
      description: 'KPI stats, financial & reports',
      path: isAdmin ? '/admin/analytics' : '/staff/fee-dashboard',
      icon: LayoutDashboard,
      color: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      bgLight: 'bg-blue-50/80 border-blue-200 text-blue-900',
      perm: null
    },
    {
      id: 'students',
      label: 'Students',
      description: 'View & manage students',
      path: isAdmin ? '/admin/students' : '/staff/students',
      icon: GraduationCap,
      color: 'from-purple-600 to-indigo-600',
      shadow: 'shadow-purple-500/20',
      bgLight: 'bg-purple-50/80 border-purple-200 text-purple-900',
      perm: 'students.view'
    },
    {
      id: 'attendance',
      label: 'Attendance',
      description: 'Mark daily attendance',
      path: isAdmin ? '/admin/attendance' : '/staff/attendance',
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      bgLight: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      perm: 'attendance.mark'
    },
    {
      id: 'fees',
      label: 'Fee Details',
      description: 'Class-wise fee setup',
      path: isAdmin ? '/admin/fees/structure' : '/staff/fees/structure',
      icon: CreditCard,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      bgLight: 'bg-amber-50/80 border-amber-200 text-amber-900',
      perm: 'fees.view'
    },
    {
      id: 'payments',
      label: 'Payments',
      description: 'Record fees & receipts',
      path: isAdmin ? '/admin/payments' : '/staff/payments',
      icon: Receipt,
      color: 'from-teal-600 to-cyan-600',
      shadow: 'shadow-teal-500/20',
      bgLight: 'bg-teal-50/80 border-teal-200 text-teal-900',
      perm: 'payments.record'
    },
    {
      id: 'sms',
      label: 'Bulk SMS',
      description: 'Send notifications & alerts',
      path: isAdmin ? '/admin/sms' : '/staff/sms',
      icon: MessageSquare,
      color: 'from-pink-600 to-rose-600',
      shadow: 'shadow-pink-500/20',
      bgLight: 'bg-pink-50/80 border-pink-200 text-pink-900',
      perm: 'sms.send'
    },
    {
      id: 'staff',
      label: isAdmin ? 'Staff / Users' : 'My Profile',
      description: isAdmin ? 'Manage teachers & staff' : 'View staff profile',
      path: isAdmin ? '/admin/staff' : '/staff/profile',
      icon: Users,
      color: 'from-slate-700 to-slate-900',
      shadow: 'shadow-slate-500/20',
      bgLight: 'bg-slate-100 border-slate-300 text-slate-900',
      perm: null
    }
  ];

  const visibleCards = allCards.filter(card => {
    if (isAdmin) return true;
    if (!card.perm) return true;
    return hasPermission(card.perm);
  });

  return (
    <div className="block md:hidden mb-6 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Mobile App Launcher
        </h2>
        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          Tap Card to Open
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => navigate(card.path)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 active:scale-95 shadow-sm hover:shadow-md ${card.bgLight} min-h-[100px]`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${card.color} text-white shadow-md ${card.shadow}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 opacity-40 text-slate-600" />
              </div>

              <div className="mt-2.5">
                <h3 className="font-extrabold text-sm leading-tight text-slate-900">{card.label}</h3>
                <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{card.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
