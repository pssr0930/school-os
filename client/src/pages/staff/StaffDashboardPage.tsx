import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { MobileNavCards } from '../../components/MobileNavCards';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  UserCheck, 
  GraduationCap, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Clock,
  Receipt,
  Layers,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StaffDashboardPage: React.FC = () => {
  const { user, school, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStaffDashboardData = async () => {
    setIsLoading(true);
    try {
      const summaryRes = await api.get('/dashboard/summary');
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }

      const attRes = await api.get(`/dashboard/attendance?date=${selectedDate}`);
      if (attRes.data.success) {
        setAttendanceData(attRes.data.data);
      }
    } catch (err) {
      console.error('Failed to sync staff dashboard statistics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffDashboardData();
  }, [selectedDate]);

  const totalStudentsCount = summary?.totalStudents ?? 0;
  const totalTeachersCount = summary?.totalTeachers ?? 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5">
      {/* MOBILE APP LAUNCHER (< 768px) */}
      <div className="block md:hidden">
        <PageHeader
          title="Staff Portal"
          subtitle="Quick operations launcher"
        />
        <MobileNavCards />
      </div>

      {/* DESKTOP STAFF DASHBOARD CONTENT (md:) */}
      <div className="hidden md:block space-y-5">
        {/* 1. HEADER BAR */}
        <PageHeader
          title={`Welcome, ${user?.fullName || 'Teacher'}`}
          subtitle="Staff Portal • Manage attendance, fee collection, and student details."
          action={
            <div className="flex items-center gap-2">
              {hasPermission('attendance.mark') && (
                <button
                  onClick={() => navigate('/staff/attendance')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Mark Attendance</span>
                </button>
              )}

              {hasPermission('payments.record') && (
                <button
                  onClick={() => navigate('/staff/payments')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Record Fee</span>
                </button>
              )}
            </div>
          }
        />

        {/* 2. MINIMAL VIBRANT METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Assigned Role */}
          <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white p-4 rounded-2xl border border-emerald-100/90 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:border-emerald-200">
            <div>
              <p className="text-[10px] font-extrabold text-emerald-700/80 uppercase tracking-wider">Role</p>
              <p className="text-xl font-black text-slate-900 font-mono mt-0.5 uppercase">{user?.role || 'TEACHER'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Enrolled Students */}
          <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white p-4 rounded-2xl border border-blue-100/90 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:border-blue-200">
            <div>
              <p className="text-[10px] font-extrabold text-blue-600/80 uppercase tracking-wider">Students</p>
              <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{totalStudentsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          {/* Active Teaching Staff */}
          <div className="bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white p-4 rounded-2xl border border-purple-100/90 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:border-purple-200">
            <div>
              <p className="text-[10px] font-extrabold text-purple-600/80 uppercase tracking-wider">Teachers</p>
              <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{totalTeachersCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Attendance Cutoff */}
          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white p-4 rounded-2xl border border-amber-100/90 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:border-amber-200">
            <div>
              <p className="text-[10px] font-extrabold text-amber-700/80 uppercase tracking-wider">Cutoff Time</p>
              <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{school?.attendanceCutoffTime || '10:30 AM'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 3. QUICK ATTENDANCE ACTION BANNER */}
        {hasPermission('attendance.mark') && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800">
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Daily Classroom Attendance Register</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Mark student attendance and trigger automatic parent notifications.
              </p>
            </div>

            <button
              onClick={() => navigate('/staff/attendance')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all shrink-0 active:scale-95"
            >
              <span>Open Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4. CLASSROOM DAILY ATTENDANCE TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Classroom Daily Attendance</span>
              </h2>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-5">Class Name</th>
                  <th className="py-3 px-5 text-center">Total Students</th>
                  <th className="py-3 px-5 text-center">Present</th>
                  <th className="py-3 px-5 text-center">Absent</th>
                  <th className="py-3 px-5 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">Syncing live attendance metrics...</td>
                  </tr>
                ) : attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">No attendance records found.</td>
                  </tr>
                ) : (
                  attendanceData.map((row) => {
                    const total = row.totalStudents || 0;
                    const present = row.present || 0;
                    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

                    return (
                      <tr key={row.classId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-5 font-extrabold text-slate-900">{row.className}</td>
                        <td className="py-3 px-5 text-center font-bold font-mono text-slate-700">{total}</td>
                        <td className="py-3 px-5 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {present}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 text-[11px]">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            {row.absent}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          {total > 0 ? (
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    rate >= 90 ? 'bg-emerald-500' : rate >= 75 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className={`font-mono font-bold ${
                                rate >= 90 ? 'text-emerald-700' : rate >= 75 ? 'text-amber-700' : 'text-red-600'
                              }`}>
                                {rate}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium text-[11px]">Unmarked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardPage;
