import React from 'react';
import { AttendancePage } from '../admin/AttendancePage';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const StaffAttendancePage: React.FC = () => {
  const { hasPermission } = useAuth();

  if (!hasPermission('attendance.mark') && !hasPermission('attendance.view')) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto mt-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          You do not have permission to mark or view class attendance records. Please contact your school administrator.
        </p>
      </div>
    );
  }

  return <AttendancePage />;
};
