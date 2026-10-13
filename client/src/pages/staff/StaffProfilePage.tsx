import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, Mail } from 'lucide-react';

export const StaffProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Teacher Profile & Authorization"
        subtitle="Your authenticated staff profile and assigned role permissions."
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
            {user?.fullName.charAt(0) || 'T'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{user?.fullName}</h3>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="flex justify-between"><span className="text-slate-500 font-semibold">Role:</span> <span className="font-bold uppercase text-emerald-600">{user?.role}</span></p>
          <p className="flex justify-between"><span className="text-slate-500 font-semibold">User ID:</span> <span className="font-mono text-slate-700">{user?.userId}</span></p>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <p className="font-bold text-slate-900 mb-2 uppercase text-[10px]">Granted System Permissions</p>
          <div className="flex flex-wrap gap-2">
            {user?.permissions.map((p) => (
              <span key={p} className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                ✓ {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
