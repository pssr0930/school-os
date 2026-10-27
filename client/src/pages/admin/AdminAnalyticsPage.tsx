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
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="School Dashboard Analytics & Metrics"
        subtitle="Detailed statistics, financial collections breakdown, class attendance tables, and AI insights."
        action={
          <button
            onClick={handleGenerateAiInsights}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>{isAiLoading ? 'Analyzing...' : 'AI Insights'}</span>
          </button>
        }
      />

      {/* QUICK ACTIONS ACTION BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          onClick={() => navigate('/admin/students/new')}
          className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center justify-between font-bold text-xs active:scale-95"
        >
          <div className="flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enrol Student</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        <button
          onClick={() => navigate('/admin/payments')}
          className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-between font-bold text-xs active:scale-95"
        >
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Record Fee</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        <button
          onClick={() => navigate('/admin/sms')}
          className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-md shadow-purple-500/20 hover:scale-[1.02] transition-all flex items-center justify-between font-bold text-xs active:scale-95"
        >
          <div className="flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>Bulk SMS</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        <button
          onClick={() => navigate('/admin/staff/new')}
          className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-md shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-between font-bold text-xs active:scale-95"
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Add Staff</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>

      {/* TOP VIBRANT METRIC KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Enrolled Students Card */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 border border-blue-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Enrolled Students</span>
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{totalStudentsCount}</h3>
            <p className="text-[10px] text-blue-600/80 font-semibold mt-0.5">LKG through Class 10</p>
          </div>
          <div className="mt-2 w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full w-full"></div>
          </div>
        </div>

        {/* Teaching Staff Card */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-pink-50/50 border border-purple-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Teaching Staff</span>
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{totalTeachersCount}</h3>
            <p className="text-[10px] text-purple-600/80 font-semibold mt-0.5">Assigned staff</p>
          </div>
          <div className="mt-2 w-full bg-purple-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full w-[85%]"></div>
          </div>
        </div>

        {/* Today's Fee Collection Card */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Today's Fees</span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/30">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-900">₹ {todayTotalCollection.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-600/80 font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" /> Daily receipts
            </p>
          </div>
          <div className="mt-2 w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full w-full"></div>
          </div>
        </div>

        {/* Classes Monitored Card */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-orange-50/50 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Active Classes</span>
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{attendanceData.length}</h3>
            <p className="text-[10px] text-amber-600/80 font-semibold mt-0.5">Classes monitored</p>
          </div>
          <div className="mt-2 w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full w-[90%]"></div>
          </div>
        </div>
      </div>

      {/* TODAY'S FINANCIAL COLLECTION BREAKDOWN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Today's Collection Breakdown</span>
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Cash Receipts</p>
                <p className="text-base sm:text-lg font-black text-emerald-950 mt-0.5">
                  ₹ {cashCollection.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">UPI / QR Collection</p>
                <p className="text-base sm:text-lg font-black text-blue-950 mt-0.5">
                  ₹ {upiCollection.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-purple-800 font-bold uppercase tracking-wider">Other / Bank</p>
                <p className="text-base sm:text-lg font-black text-purple-950 mt-0.5">
                  ₹ {otherCollection.toLocaleString()}
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

      {/* ULTRA-COMPACT CLASS-WISE DAILY ATTENDANCE (< 768px) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">Class-wise Daily Attendance</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Metrics for LKG to Class 10</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-[11px] font-bold text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Mobile View: High-Density Ultra-Compact Attendance Rows (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-100 p-1.5">
          {attendanceData.map((row) => {
            const total = row.totalStudents || 0;
            const present = row.present || 0;
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;

            return (
              <div key={row.classId} className="py-2 px-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-black text-xs text-slate-900 w-16 truncate">{row.className}</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500">
                    <span>Tot: <strong className="text-slate-800">{total}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-700 font-black">P: {present}</span>
                    <span>•</span>
                    <span className="text-red-700 font-black">A: {row.absent}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 ${
                  total === 0 ? 'bg-slate-100 text-slate-500' : rate >= 90 ? 'bg-emerald-100 text-emerald-800' : rate >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  {total > 0 ? `${rate}%` : 'Unmarked'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Attendance Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3.5 px-6">Class Name</th>
                <th className="py-3.5 px-6 text-center">Total Students</th>
                <th className="py-3.5 px-6 text-center">Present</th>
                <th className="py-3.5 px-6 text-center">Absent</th>
                <th className="py-3.5 px-6 text-right">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceData.map((row) => {
                const total = row.totalStudents || 0;
                const present = row.present || 0;
                const rate = total > 0 ? Math.round((present / total) * 100) : 0;

                return (
                  <tr key={row.classId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{row.className}</td>
                    <td className="py-3.5 px-6 text-center font-semibold text-slate-700">{total}</td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {present}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        {row.absent}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
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
                        <span className="text-slate-400 font-semibold">Unmarked</span>
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
