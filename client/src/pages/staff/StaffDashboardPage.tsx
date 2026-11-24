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
    <div className="w-full max-w-7xl mx-auto space-y-5 text-[#F3F4F6]">
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
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Mark Attendance</span>
                </button>
              )}

              {hasPermission('payments.record') && (
                <button
                  onClick={() => navigate('/staff/payments')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-lg border border-[#303B4D] transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Record Fee</span>
                </button>
              )}
            </div>
          }
        />

        {/* 2. METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Assigned Role */}
          <div className="bg-[#1F2937] p-4 rounded-lg border border-[#303B4D] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Role</p>
              <p className="text-xl font-semibold text-[#F3F4F6] font-mono mt-0.5 uppercase">{user?.role || 'TEACHER'}</p>
            </div>
            <div className="w-9 h-9 rounded-md bg-[#243244] border border-[#303B4D] text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Enrolled Students */}
          <div className="bg-[#1F2937] p-4 rounded-lg border border-[#303B4D] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Students</p>
              <p className="text-2xl font-semibold text-[#F3F4F6] font-mono mt-0.5 tabular-nums">{totalStudentsCount}</p>
            </div>
            <div className="w-9 h-9 rounded-md bg-[#243244] border border-[#303B4D] text-blue-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          {/* Active Teaching Staff */}
          <div className="bg-[#1F2937] p-4 rounded-lg border border-[#303B4D] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Teachers</p>
              <p className="text-2xl font-semibold text-[#F3F4F6] font-mono mt-0.5 tabular-nums">{totalTeachersCount}</p>
            </div>
            <div className="w-9 h-9 rounded-md bg-[#243244] border border-[#303B4D] text-purple-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

          {/* Attendance Cutoff */}
          <div className="bg-[#1F2937] p-4 rounded-lg border border-[#303B4D] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Cutoff Time</p>
              <p className="text-xl font-semibold text-[#F3F4F6] font-mono mt-0.5">{school?.attendanceCutoffTime || '10:30 AM'}</p>
            </div>
            <div className="w-9 h-9 rounded-md bg-[#243244] border border-[#303B4D] text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 3. QUICK ATTENDANCE ACTION BANNER */}
        {hasPermission('attendance.mark') && (
          <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="font-semibold text-sm text-[#F3F4F6] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Daily Classroom Attendance Register</span>
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                Mark student attendance and trigger automatic parent notifications.
              </p>
            </div>

            <button
              onClick={() => navigate('/staff/attendance')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors shrink-0"
            >
              <span>Open Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 4. CLASSROOM DAILY ATTENDANCE TABLE */}
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] overflow-hidden">
          <div className="p-4 border-b border-[#303B4D] flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Classroom Daily Attendance</span>
              </h2>
            </div>

            <div className="flex items-center gap-1.5 bg-[#243244] border border-[#303B4D] px-2.5 py-1 rounded-lg text-xs text-[#F3F4F6]">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs text-[#F3F4F6] focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#243244] border-b border-[#303B4D] text-[#9CA3AF] font-medium uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-5">Class Name</th>
                  <th className="py-2.5 px-5 text-center">Total Students</th>
                  <th className="py-2.5 px-5 text-center">Present</th>
                  <th className="py-2.5 px-5 text-center">Absent</th>
                  <th className="py-2.5 px-5 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303B4D]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#9CA3AF]">Syncing live attendance metrics...</td>
                  </tr>
                ) : attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#9CA3AF]">No attendance records found.</td>
                  </tr>
                ) : (
                  attendanceData.map((row) => {
                    const total = row.totalStudents || 0;
                    const present = row.present || 0;
                    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

                    return (
                      <tr key={row.classId} className="hover:bg-[#243244]/60 transition-colors">
                        <td className="py-2.5 px-5 font-medium text-[#F3F4F6]">{row.className}</td>
                        <td className="py-2.5 px-5 text-center font-mono text-[#F3F4F6]">{total}</td>
                        <td className="py-2.5 px-5 text-center">
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {present}
                          </span>
                        </td>
                        <td className="py-2.5 px-5 text-center">
                          <span className="inline-flex items-center gap-1 font-medium text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/50 text-[11px]">
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                            {row.absent}
                          </span>
                        </td>
                        <td className="py-2.5 px-5 text-right">
                          {total > 0 ? (
                            <div className="flex items-center justify-end gap-2.5">
                              <div className="w-16 bg-[#243244] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    rate >= 90 ? 'bg-emerald-500' : rate >= 75 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className={`font-mono font-medium ${
                                rate >= 90 ? 'text-emerald-400' : rate >= 75 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                {rate}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#9CA3AF] text-[11px]">Unmarked</span>
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
