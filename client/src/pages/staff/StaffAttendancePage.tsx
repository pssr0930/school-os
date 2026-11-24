import React from 'react';
import { AttendancePage } from '../admin/AttendancePage';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const StaffAttendancePage: React.FC = () => {
  const { hasPermission } = useAuth();

  if (!hasPermission('attendance.mark') && !hasPermission('attendance.view')) {
    return (
      <div className="p-8 text-center bg-[#1F2937] rounded-lg border border-[#303B4D] max-w-md mx-auto mt-12 space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-950/40 text-[#EF4444] border border-red-800/40 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-semibold text-[#F3F4F6]">Access Restricted</h2>
        <p className="text-xs text-[#9CA3AF]">
          You do not have permission to mark or view class attendance records. Please contact your school administrator.
        </p>
      </div>
    );
  }

  return <AttendancePage />;
};

export default StaffAttendancePage;
