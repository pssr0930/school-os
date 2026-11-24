import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { AiInsightsWidget } from '../../components/AiInsightsWidget';
import api from '../../services/api';
import { 
  GraduationCap, 
  Users, 
  IndianRupee, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  QrCode, 
  Banknote,
  UserPlus,
  Send,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  
  // AI Insights State
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await api.get('/dashboard/summary');
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }

      const attRes = await api.get(`/dashboard/attendance?date=${selectedDate}&sectionId=${selectedSection}`);
      if (attRes.data.success) {
        setAttendanceData(attRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    handleGenerateAiInsights();
  }, [selectedDate, selectedSection]);

  const handleGenerateAiInsights = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.get('/ai/insights');
      if (res.data.success) {
        setAiInsights(res.data.data);
      }
    } catch (err) {
      console.error('AI Insights error', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const totalStudentsCount = summary?.totalStudents ?? 0;
  const totalTeachersCount = summary?.totalTeachers ?? 0;
  const todayTotalCollection = summary?.todayCollection?.total ?? 0;
  const cashCollection = summary?.todayCollection?.cash ?? 0;
  const upiCollection = summary?.todayCollection?.upi ?? 0;
  const otherCollection = summary?.todayCollection?.other ?? 0;

  return (
    <div className="space-y-5 text-[#F3F4F6]">
      <PageHeader
        title="School Dashboard Analytics & Metrics"
        subtitle="Detailed statistics, financial collections breakdown, class attendance tables, and AI insights."
        action={
          <button
            onClick={handleGenerateAiInsights}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiLoading ? 'Analyzing...' : 'Refresh AI Insights'}</span>
          </button>
        }
      />

      {/* QUICK ACTIONS ACTION BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          onClick={() => navigate('/admin/students/new')}
          className="p-3 bg-[#1F2937] hover:bg-gray-700/60 border border-[#303B4D] text-[#F3F4F6] rounded-lg transition-colors flex items-center justify-between font-medium text-xs"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#243244] border border-[#303B4D] text-blue-400">
              <UserPlus className="w-3.5 h-3.5" />
            </div>
            <span>Enrol Student</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
        </button>

        <button
          onClick={() => navigate('/admin/payments')}
          className="p-3 bg-[#1F2937] hover:bg-gray-700/60 border border-[#303B4D] text-[#F3F4F6] rounded-lg transition-colors flex items-center justify-between font-medium text-xs"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#243244] border border-[#303B4D] text-emerald-400">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
            <span>Record Fee</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
        </button>

        <button
          onClick={() => navigate('/admin/sms')}
          className="p-3 bg-[#1F2937] hover:bg-gray-700/60 border border-[#303B4D] text-[#F3F4F6] rounded-lg transition-colors flex items-center justify-between font-medium text-xs"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#243244] border border-[#303B4D] text-purple-400">
              <Send className="w-3.5 h-3.5" />
            </div>
            <span>Bulk SMS</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
        </button>

        <button
          onClick={() => navigate('/admin/staff/new')}
          className="p-3 bg-[#1F2937] hover:bg-gray-700/60 border border-[#303B4D] text-[#F3F4F6] rounded-lg transition-colors flex items-center justify-between font-medium text-xs"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#243244] border border-[#303B4D] text-amber-400">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span>Add Staff</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
        </button>
      </div>

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Enrolled Students Card */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#1F2937] border border-[#303B4D] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">Enrolled Students</span>
            <div className="p-1.5 rounded-md bg-[#243244] border border-[#303B4D] text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#F3F4F6] font-mono tabular-nums">{totalStudentsCount}</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">LKG through Class 10</p>
          </div>
          <div className="mt-3 w-full bg-[#243244] rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full w-full"></div>
          </div>
        </div>

        {/* Teaching Staff Card */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#1F2937] border border-[#303B4D] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">Teaching Staff</span>
            <div className="p-1.5 rounded-md bg-[#243244] border border-[#303B4D] text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#F3F4F6] font-mono tabular-nums">{totalTeachersCount}</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Assigned staff roster</p>
          </div>
          <div className="mt-3 w-full bg-[#243244] rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-1.5 rounded-full w-[85%]"></div>
          </div>
        </div>

        {/* Today's Fee Collection Card */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#1F2937] border border-[#303B4D] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">Today's Fees</span>
            <div className="p-1.5 rounded-md bg-[#243244] border border-[#303B4D] text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-semibold text-emerald-400 font-mono tabular-nums">₹ {todayTotalCollection.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Daily collections
            </p>
          </div>
          <div className="mt-3 w-full bg-[#243244] rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
          </div>
        </div>

        {/* Classes Monitored Card */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#1F2937] border border-[#303B4D] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">Active Classes</span>
            <div className="p-1.5 rounded-md bg-[#243244] border border-[#303B4D] text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#F3F4F6] font-mono tabular-nums">{attendanceData.length}</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Classes monitored</p>
          </div>
          <div className="mt-3 w-full bg-[#243244] rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full w-[90%]"></div>
          </div>
        </div>
      </div>

      {/* TODAY'S FINANCIAL COLLECTION BREAKDOWN */}
      <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#303B4D] pb-3">
          <h2 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <span>Today's Collection Breakdown</span>
          </h2>
          <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-[#243244] text-[#9CA3AF] border border-[#303B4D]">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#243244] border border-[#303B4D]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#111827] border border-[#303B4D] text-emerald-400 rounded-md">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wider">Cash Receipts</p>
                <p className="text-base sm:text-lg font-semibold text-[#F3F4F6] mt-0.5 font-mono tabular-nums">
                  ₹ {cashCollection.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#243244] border border-[#303B4D]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#111827] border border-[#303B4D] text-blue-400 rounded-md">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wider">UPI / QR Collection</p>
                <p className="text-base sm:text-lg font-semibold text-[#F3F4F6] mt-0.5 font-mono tabular-nums">
                  ₹ {upiCollection.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#243244] border border-[#303B4D]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#111827] border border-[#303B4D] text-purple-400 rounded-md">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wider">Other / Bank</p>
                <p className="text-base sm:text-lg font-semibold text-[#F3F4F6] mt-0.5 font-mono tabular-nums">
                  ₹ {otherCollection.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI DASHBOARD INSIGHTS WIDGET */}
      <AiInsightsWidget
        insights={aiInsights}
        isLoading={isAiLoading}
        onRefresh={handleGenerateAiInsights}
      />

      {/* CLASS-WISE DAILY ATTENDANCE */}
      <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#303B4D] flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#F3F4F6]">Class-wise Daily Attendance</h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Metrics for LKG to Class 10</p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#243244] border border-[#303B4D] px-2.5 py-1 rounded-lg text-xs text-[#F3F4F6]">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs text-[#F3F4F6] focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-[#303B4D] p-1.5">
          {attendanceData.map((row) => {
            const total = row.totalStudents || 0;
            const present = row.present || 0;
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;

            return (
              <div key={row.classId} className="py-2.5 px-3 flex items-center justify-between gap-2 hover:bg-[#243244]/60 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-xs text-[#F3F4F6] w-16 truncate">{row.className}</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9CA3AF]">
                    <span>Tot: <strong className="text-[#F3F4F6]">{total}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">P: {present}</span>
                    <span>•</span>
                    <span className="text-red-400 font-semibold">A: {row.absent}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 border ${
                  total === 0 
                    ? 'bg-[#243244] text-[#9CA3AF] border-[#303B4D]' 
                    : rate >= 90 
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50' 
                    : rate >= 75 
                    ? 'bg-amber-950/40 text-amber-400 border-amber-800/50' 
                    : 'bg-red-950/40 text-red-400 border-red-800/50'
                }`}>
                  {total > 0 ? `${rate}%` : 'Unmarked'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#243244] border-b border-[#303B4D] text-[#9CA3AF] font-medium uppercase text-[10px]">
                <th className="py-3 px-6">Class Name</th>
                <th className="py-3 px-6 text-center">Total Students</th>
                <th className="py-3 px-6 text-center">Present</th>
                <th className="py-3 px-6 text-center">Absent</th>
                <th className="py-3 px-6 text-right">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303B4D]">
              {attendanceData.map((row) => {
                const total = row.totalStudents || 0;
                const present = row.present || 0;
                const rate = total > 0 ? Math.round((present / total) * 100) : 0;

                return (
                  <tr key={row.classId} className="hover:bg-[#243244]/60 transition-colors">
                    <td className="py-3 px-6 font-medium text-[#F3F4F6]">{row.className}</td>
                    <td className="py-3 px-6 text-center font-mono text-[#F3F4F6]">{total}</td>
                    <td className="py-3 px-6 text-center">
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-800/50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {present}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className="inline-flex items-center gap-1 font-medium text-red-400 bg-red-950/40 px-2.5 py-0.5 rounded border border-red-800/50">
                        <XCircle className="w-3.5 h-3.5" />
                        {row.absent}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
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
                        <span className="text-[#9CA3AF]">Unmarked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
