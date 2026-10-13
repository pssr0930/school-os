import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { MobileNavCards } from '../../components/MobileNavCards';
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
  TrendingUp,
  AlertTriangle,
  Clock,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  PieChart as PieChartIcon,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// BRIGHT HIGH-CONTRAST SVG PIE/DONUT CHART COMPONENT
const ColorfulPieChart: React.FC<{ 
  present: number; 
  absent: number; 
  total: number; 
  primaryColor?: string;
  size?: number;
  fontSize?: string;
}> = ({ present, absent, total, primaryColor = '#10B981', size = 64, fontSize = 'text-[11px]' }) => {
  const radius = 20;
  const strokeWidth = 5.5;
  const circumference = 2 * Math.PI * radius;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  const presentOffset = circumference - (rate / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 50 50" className="transform -rotate-90 drop-shadow-md">
        {/* Background / Absent circle (Vibrant Red Accent) */}
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke="#EF4444"
          strokeWidth={strokeWidth}
        />
        {/* Present circle (Vibrant Emerald / Blue Accent Color) */}
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={presentOffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-black font-mono text-white ${fontSize}`}>{total > 0 ? `${rate}%` : '0%'}</span>
      </div>
    </div>
  );
};

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // AI Insights State
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const fetchDashboardData = async () => {
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
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

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

  const totalStudents = summary?.totalStudents ?? 0;
  const totalTeachers = summary?.totalTeachers ?? 0;
  const todayTotalCollection = summary?.todayCollection?.total ?? 0;
  const cashCollection = summary?.todayCollection?.cash ?? 0;
  const upiCollection = summary?.todayCollection?.upi ?? 0;
  const otherCollection = summary?.todayCollection?.other ?? 0;

  const totalPresentToday = attendanceData.reduce((acc, c) => acc + (c.present || 0), 0);
  const totalAbsentToday = attendanceData.reduce((acc, c) => acc + (c.absent || 0), 0);
  const trackedStudentsTotal = totalPresentToday + totalAbsentToday;
  const todayAttendancePct = trackedStudentsTotal > 0 
    ? Math.round((totalPresentToday / trackedStudentsTotal) * 100) 
    : (totalStudents > 0 ? 100 : 0);

  // Active Focus State for Big Pie Chart
  const activeClassObj = selectedClassFilter !== 'all' 
    ? attendanceData.find(c => c.classId === selectedClassFilter) 
    : null;

  const focusPresent = activeClassObj ? (activeClassObj.present || 0) : totalPresentToday;
  const focusAbsent = activeClassObj ? (activeClassObj.absent || 0) : totalAbsentToday;
  const focusTotal = activeClassObj ? (activeClassObj.totalStudents || 0) : (trackedStudentsTotal || totalStudents);
  const focusRate = focusTotal > 0 ? Math.round((focusPresent / focusTotal) * 100) : 0;
  const focusTitle = activeClassObj ? `${activeClassObj.className} Attendance` : 'School-Wide Attendance';

  const classesWithAbsentees = attendanceData.filter(c => c.absent > 0);
  const unmarkedClasses = attendanceData.filter(c => (c.totalStudents || 0) > 0 && (c.present || 0) === 0 && (c.absent || 0) === 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 relative">
      {/* AMBIENT BACKGROUND GLOW BEHIND DASHBOARD CONTENT */}
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* MOBILE APP LAUNCHER (< 768px) */}
      <div className="block md:hidden">
        <PageHeader
          title="School OS"
          subtitle="Mobile Command Launcher"
        />
        <MobileNavCards />
      </div>

      {/* DESKTOP HIGH-CONTRAST SLATE OS DASHBOARD WITH BACKDROP CONTAINER (md:) */}
      <div className="hidden md:block space-y-5 bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10">
        {/* 1. HIGH-CONTRAST HEADER BAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
              OS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">School Operations Center</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Operational
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-white focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleGenerateAiInsights}
              disabled={isAiLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>{isAiLoading ? 'Analyzing...' : 'AI Insights'}</span>
            </button>
          </div>
        </div>

        {/* 2. HIGH-CONTRAST 4 STAT CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Card 1: Total Students (Blue Accent) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/30 shadow-lg shadow-blue-500/5 flex items-center justify-between transition-all hover:border-blue-500/60">
            <div>
              <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">Total Students</p>
              <p className="text-2xl font-black font-mono text-white mt-0.5">{totalStudents}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Enrolled Headcount</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Teaching Staff (Purple Accent) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-lg shadow-purple-500/5 flex items-center justify-between transition-all hover:border-purple-500/60">
            <div>
              <p className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Teaching Staff</p>
              <p className="text-2xl font-black font-mono text-white mt-0.5">{totalTeachers}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Active Faculty</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/30 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Today's Fee Collection (Emerald Accent) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-lg shadow-emerald-500/5 flex items-center justify-between transition-all hover:border-emerald-500/60">
            <div>
              <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Today's Fees</p>
              <p className="text-2xl font-black font-mono text-emerald-400 mt-0.5">₹ {todayTotalCollection.toLocaleString('en-IN')}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Daily Receipts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/30 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Attendance Rate (Amber Accent) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-lg shadow-amber-500/5 flex items-center justify-between transition-all hover:border-amber-500/60">
            <div>
              <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Attendance Rate</p>
              <p className="text-2xl font-black font-mono text-white mt-0.5">{todayAttendancePct}%</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Overall Daily</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 3. PRIMARY HERO: BIG INTERACTIVE ATTENDANCE DONUT & FEE SNAPSHOT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* MAIN ATTENDANCE SNAPSHOT CARD (DARK SLATE CARD) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">{focusTitle}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* CLASS SELECTION DROPDOWN */}
                <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl text-xs font-bold">
                  <Filter className="w-3.5 h-3.5 text-blue-400" />
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="bg-transparent text-xs font-extrabold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900 text-white">School-Wide (All Classes)</option>
                    {attendanceData.map((c) => (
                      <option key={c.classId} value={c.classId} className="bg-slate-900 text-white">{c.className}</option>
                    ))}
                  </select>
                </div>

                {/* VIEW ATTENDANCE ACTION BUTTON */}
                <button
                  onClick={() => navigate('/admin/attendance')}
                  className="flex items-center gap-1.5 px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
                >
                  <span>View Attendance</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Split Layout: Big Donut + High Contrast Metric Cards */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-1">
              {/* Left: Prominent Big Donut Chart */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 shadow-inner">
                <ColorfulPieChart
                  present={focusPresent}
                  absent={focusAbsent}
                  total={focusTotal}
                  primaryColor={selectedClassFilter === 'all' ? '#2563EB' : '#10B981'}
                  size={135}
                  fontSize="text-2xl"
                />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-2">
                  {selectedClassFilter === 'all' ? 'School Attendance' : 'Class Attendance'}
                </span>
              </div>

              {/* Right: High-Contrast Metric Cards */}
              <div className="grid grid-cols-2 gap-3 flex-1 w-full">
                {/* Total Enrolled */}
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-blue-500/30">
                  <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">Total Enrolled</p>
                  <p className="text-2xl font-black font-mono text-white mt-0.5">{focusTotal}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Headcount</p>
                </div>

                {/* Present */}
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-emerald-500/30">
                  <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Present</p>
                  <p className="text-2xl font-black font-mono text-emerald-400 mt-0.5">{focusPresent}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">In Attendance</p>
                </div>

                {/* Absent */}
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-rose-500/30">
                  <p className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">Absent</p>
                  <p className="text-2xl font-black font-mono text-rose-400 mt-0.5">{focusAbsent}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Absentees</p>
                </div>

                {/* Percentage */}
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-purple-500/30">
                  <p className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Rate %</p>
                  <p className="text-2xl font-black font-mono text-white mt-0.5">{focusRate}%</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Performance</p>
                </div>
              </div>
            </div>

            {/* Attendance Progress Line */}
            <div className="space-y-1 border-t border-slate-800 pt-3">
              <div className="flex justify-between text-[11px] font-bold text-slate-300">
                <span>{selectedClassFilter === 'all' ? 'Overall School Attendance' : `${activeClassObj?.className} Progress`}</span>
                <span className="font-mono text-slate-200">{focusPresent} / {focusTotal} Present ({focusRate}%)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${focusRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* TODAY'S FEE COLLECTION SNAPSHOT CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">Today's Fee Collection</span>
              </div>
              <button
                onClick={() => navigate('/admin/payments')}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
              >
                <span>Logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Collected Today</p>
              <p className="text-3xl font-black text-emerald-400 font-mono mt-1">₹ {todayTotalCollection.toLocaleString('en-IN')}</p>
            </div>

            {/* Collection Method Cards */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between p-2.5 bg-slate-800/90 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-300 font-bold flex items-center gap-1.5 text-[11px]">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cash Receipts</span>
                </span>
                <span className="font-mono font-extrabold text-white">₹ {cashCollection.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-800/90 rounded-xl border border-blue-500/20">
                <span className="text-blue-300 font-bold flex items-center gap-1.5 text-[11px]">
                  <QrCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>UPI / QR</span>
                </span>
                <span className="font-mono font-extrabold text-white">₹ {upiCollection.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-800/90 rounded-xl border border-purple-500/20">
                <span className="text-purple-300 font-bold flex items-center gap-1.5 text-[11px]">
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  <span>Bank / Other</span>
                </span>
                <span className="font-mono font-extrabold text-white">₹ {otherCollection.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. WHAT NEEDS ATTENTION BANNER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>What Needs Attention Today</span>
            </h2>
            <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
              {classesWithAbsentees.length + unmarkedClasses.length} Items Require Review
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Absentees Alert */}
            <div className="p-3.5 bg-amber-950/40 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-xs">
                    {totalAbsentToday > 0 ? `${totalAbsentToday} Absent Student${totalAbsentToday > 1 ? 's' : ''} Today` : 'No Absentees Today'}
                  </p>
                  <p className="text-[11px] text-amber-300/80 font-medium">
                    {classesWithAbsentees.length > 0 
                      ? `Absentees reported in ${classesWithAbsentees.length} classes` 
                      : '100% attendance recorded across classes'}
                  </p>
                </div>
              </div>

              {totalAbsentToday > 0 && (
                <button
                  onClick={() => navigate('/admin/sms')}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all shrink-0 active:scale-95"
                >
                  Send Parent SMS
                </button>
              )}
            </div>

            {/* Pending Register Alert */}
            <div className="p-3.5 bg-blue-950/40 rounded-xl border border-blue-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-xs">
                    {unmarkedClasses.length > 0 ? `${unmarkedClasses.length} Unmarked Attendance Registers` : 'All Registers Marked'}
                  </p>
                  <p className="text-[11px] text-blue-300/80 font-medium">
                    {unmarkedClasses.length > 0 ? 'Teacher registers pending cutoff submit' : 'All class registers up to date'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/admin/attendance')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all shrink-0 active:scale-95"
              >
                Open Attendance
              </button>
            </div>
          </div>
        </div>

        {/* 5. AI INSIGHTS CARD (IF GENERATED) */}
        {aiInsights && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-extrabold text-xs text-slate-200">Gemini AI Executive Observations</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{aiInsights.summary}</p>
          </div>
        )}

        {/* 6. HIGH-CONTRAST QUICK ACTION COMMAND DOCK */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="font-black text-xs text-white uppercase tracking-wider">Quick Actions</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/admin/students/new')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-extrabold text-xs rounded-xl border border-blue-500/30 transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Student</span>
            </button>

            <button
              onClick={() => navigate('/admin/payments')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold text-xs rounded-xl border border-emerald-500/30 transition-all active:scale-95"
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>+ Record Fee</span>
            </button>

            <button
              onClick={() => navigate('/admin/attendance')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 font-extrabold text-xs rounded-xl border border-purple-500/30 transition-all active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mark Attendance</span>
            </button>

            <button
              onClick={() => navigate('/admin/sms')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-pink-400 font-extrabold text-xs rounded-xl border border-pink-500/30 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SMS Campaign</span>
            </button>

            <button
              onClick={() => navigate('/admin/staff/new')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs rounded-xl border border-amber-500/30 transition-all active:scale-95"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Add Staff</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
