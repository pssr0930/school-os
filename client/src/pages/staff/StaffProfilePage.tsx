import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, Mail } from 'lucide-react';

export const StaffProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-5 max-w-2xl mx-auto text-[#F3F4F6]">
      <PageHeader
        title="Teacher Profile & Authorization"
        subtitle="Your authenticated staff profile and assigned role permissions."
      />

      <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 sm:p-6 space-y-4 text-xs">
        <div className="flex items-center gap-3.5 border-b border-[#303B4D] pb-4">
          <div className="w-12 h-12 rounded-lg bg-blue-600 text-white font-semibold text-lg flex items-center justify-center">
            {user?.fullName.charAt(0) || 'T'}
          </div>
          <div>
            <h3 className="font-semibold text-[#F3F4F6] text-sm">{user?.fullName}</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-[#303B4D]/60">
            <span className="text-[#9CA3AF]">Role:</span>
            <span className="font-medium uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{user?.role}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[#9CA3AF]">User ID:</span>
            <span className="font-mono text-[#F3F4F6]">{user?.userId}</span>
          </div>
        </div>

        <div className="border-t border-[#303B4D] pt-3.5">
          <p className="font-medium text-[#F3F4F6] mb-2.5 uppercase tracking-wider text-[10px]">Granted System Permissions</p>
          <div className="flex flex-wrap gap-2">
            {user?.permissions.map((p) => (
              <span key={p} className="px-2.5 py-1 rounded bg-[#243244] text-[#F3F4F6] font-medium text-[11px] border border-[#303B4D]">
                ✓ {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfilePage;
