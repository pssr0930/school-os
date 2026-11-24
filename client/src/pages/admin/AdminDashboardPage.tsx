import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { MobileNavCards } from '../../components/MobileNavCards';
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

// CLEAN SVG DONUT CHART COMPONENT
const AttendanceDonutChart: React.FC<{ 
  present: number; 
  absent: number; 
  total: number; 
  primaryColor?: string;
  size?: number;
}> = ({ present, absent, total, primaryColor = '#3B82F6', size = 84 }) => {
  const radius = 22;
  const strokeWidth = 4.5;
  const circumference = 2 * Math.PI * radius;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  const presentOffset = circumference - (rate / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 54 54" className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx="27"
          cy="27"
          r={radius}
          fill="none"
          stroke={absent > 0 ? '#EF4444' : '#374151'}
          strokeWidth={strokeWidth}
          opacity={absent > 0 ? 0.35 : 0.6}
        />
        {/* Present circle */}
        <circle
          cx="27"
          cy="27"
          r={radius}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={presentOffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-semibold text-sm text-[#F3F4F6]">{total > 0 ? `${rate}%` : '0%'}</span>
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
    handleGenerateAiInsights();
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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* MOBILE APP LAUNCHER (< 768px) */}
      <div className="block md:hidden space-y-4">
        <PageHeader
          title="Dashboard"
          subtitle="School overview"
        />
        <AiInsightsWidget
          insights={aiInsights}
          isLoading={isAiLoading}
          onRefresh={handleGenerateAiInsights}
        />
        <MobileNavCards />
      </div>

      {/* DESKTOP DASHBOARD (md:) */}
      <div className="hidden md:block space-y-6">
        {/* 1. HEADER BAR */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h1 className="text-xl font-semibold text-[#F3F4F6] tracking-tight">Dashboard</h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1F2937] border border-[#303B4D] px-3 py-1.5 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs text-[#F3F4F6] font-medium focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleGenerateAiInsights}
              disabled={isAiLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1F2937] hover:bg-gray-700 border border-[#303B4D] text-[#F3F4F6] text-xs font-medium rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAiLoading ? 'Analyzing...' : 'AI Insights'}</span>
            </button>
          </div>
        </div>

        {/* 2. FOUR UNIFORM SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Students */}
          <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#9CA3AF]">Total Students</p>
              <GraduationCap className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <p className="text-2xl font-semibold text-[#F3F4F6] mt-2">{totalStudents}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Enrolled headcount</p>
          </div>

          {/* Card 2: Teaching Staff */}
          <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#9CA3AF]">Teaching Staff</p>
              <Users className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <p className="text-2xl font-semibold text-[#F3F4F6] mt-2">{totalTeachers}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Active faculty</p>
          </div>

          {/* Card 3: Today's Fee Collection */}
          <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#9CA3AF]">Today's Collection</p>
              <IndianRupee className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <p className="text-2xl font-semibold text-[#F3F4F6] mt-2">₹ {todayTotalCollection.toLocaleString('en-IN')}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Daily receipts</p>
          </div>

          {/* Card 4: Attendance Rate */}
          <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#9CA3AF]">Attendance Rate</p>
              <TrendingUp className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <p className="text-2xl font-semibold text-[#F3F4F6] mt-2">{todayAttendancePct}%</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Overall daily</p>
          </div>
        </div>

        {/* 3. PRIMARY HERO: ATTENDANCE & FEE SNAPSHOT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN ATTENDANCE CARD */}
          <div className="lg:col-span-2 bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-[#303B4D] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-[#F3F4F6]">{focusTitle}</span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Class Selection Dropdown */}
                <div className="flex items-center gap-1.5 bg-[#111827] border border-[#303B4D] px-2.5 py-1 rounded-md text-xs">
                  <Filter className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="bg-transparent text-xs text-[#F3F4F6] font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#1F2937] text-[#F3F4F6]">School-Wide (All Classes)</option>
                    {attendanceData.map((c) => (
                      <option key={c.classId} value={c.classId} className="bg-[#1F2937] text-[#F3F4F6]">{c.className}</option>
                    ))}
                  </select>
                </div>

                {/* View Attendance Action Link */}
                <button
                  onClick={() => navigate('/admin/attendance')}
                  className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>View Attendance</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Attendance Split Layout: Donut + 4 Metric Tiles */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-1">
              {/* Donut Chart */}
              <div className="flex flex-col items-center justify-center p-3">
                <AttendanceDonutChart
                  present={focusPresent}
                  absent={focusAbsent}
                  total={focusTotal}
                  primaryColor={selectedClassFilter === 'all' ? '#3B82F6' : '#10B981'}
                  size={84}
                />
                <span className="text-[11px] text-[#9CA3AF] mt-1.5">
                  Daily Rate
                </span>
              </div>

              {/* 4 Metric Tiles in uniform grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 w-full">
                {/* Total Enrolled */}
                <div className="p-3 bg-[#111827] border border-[#303B4D] rounded-md">
                  <p className="text-xs font-medium text-[#9CA3AF]">Enrolled</p>
                  <p className="text-xl font-semibold text-[#F3F4F6] mt-1">{focusTotal}</p>
                </div>

                {/* Present */}
                <div className="p-3 bg-[#111827] border border-[#303B4D] rounded-md">
                  <p className="text-xs font-medium text-[#9CA3AF]">Present</p>
                  <p className="text-xl font-semibold text-[#10B981] mt-1">{focusPresent}</p>
                </div>

                {/* Absent */}
                <div className="p-3 bg-[#111827] border border-[#303B4D] rounded-md">
                  <p className="text-xs font-medium text-[#9CA3AF]">Absent</p>
                  <p className="text-xl font-semibold text-[#EF4444] mt-1">{focusAbsent}</p>
                </div>

                {/* Rate % */}
                <div className="p-3 bg-[#111827] border border-[#303B4D] rounded-md">
                  <p className="text-xs font-medium text-[#9CA3AF]">Rate</p>
                  <p className="text-xl font-semibold text-[#F3F4F6] mt-1">{focusRate}%</p>
                </div>
              </div>
            </div>

            {/* Attendance Progress Line */}
            <div className="space-y-1.5 border-t border-[#303B4D] pt-3">
              <div className="flex justify-between text-xs text-[#9CA3AF]">
                <span>{selectedClassFilter === 'all' ? 'School-wide attendance progress' : `${activeClassObj?.className} progress`}</span>
                <span className="text-[#F3F4F6] font-medium">{focusPresent} / {focusTotal} ({focusRate}%)</span>
              </div>
              <div className="w-full bg-[#111827] rounded-full h-1.5 overflow-hidden border border-[#303B4D]">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${focusRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* TODAY'S FEE COLLECTION CARD */}
          <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-[#303B4D] pb-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-[#9CA3AF]" />
                <span className="text-sm font-semibold text-[#F3F4F6]">Today's Collection</span>
              </div>
              <button
                onClick={() => navigate('/admin/payments')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors"
              >
                <span>Logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-[#9CA3AF]">Total collected today</p>
              <p className="text-2xl font-semibold text-[#F3F4F6] mt-1">₹ {todayTotalCollection.toLocaleString('en-IN')}</p>
            </div>

            {/* Collection Methods */}
            <div className="space-y-2 border-t border-[#303B4D] pt-3">
              <div className="flex items-center justify-between p-2.5 bg-[#111827] border border-[#303B4D] rounded-md text-xs">
                <span className="text-[#9CA3AF] flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>Cash</span>
                </span>
                <span className="font-medium text-[#F3F4F6]">₹ {cashCollection.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#111827] border border-[#303B4D] rounded-md text-xs">
                <span className="text-[#9CA3AF] flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>UPI / QR</span>
                </span>
                <span className="font-medium text-[#F3F4F6]">₹ {upiCollection.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#111827] border border-[#303B4D] rounded-md text-xs">
                <span className="text-[#9CA3AF] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>Bank / Other</span>
                </span>
                <span className="font-medium text-[#F3F4F6]">₹ {otherCollection.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. ITEMS REQUIRING ATTENTION */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#303B4D] pb-3">
            <h2 className="text-sm font-semibold text-[#F3F4F6] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Items Requiring Attention</span>
            </h2>
            <span className="text-xs text-[#9CA3AF] bg-[#111827] px-2 py-0.5 rounded border border-[#303B4D]">
              {classesWithAbsentees.length + unmarkedClasses.length} items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Absentees Alert */}
            <div className="p-3.5 bg-[#111827] border border-[#303B4D] rounded-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#1F2937] text-amber-400 border border-[#303B4D] flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-[#F3F4F6] text-xs">
                    {totalAbsentToday > 0 ? `${totalAbsentToday} absent students today` : 'No absentees reported today'}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    {classesWithAbsentees.length > 0 
                      ? `Reported in ${classesWithAbsentees.length} classes` 
                      : 'All present across tracked classes'}
                  </p>
                </div>
              </div>

              {totalAbsentToday > 0 && (
                <button
                  onClick={() => navigate('/admin/sms')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors shrink-0"
                >
                  Send SMS
                </button>
              )}
            </div>

            {/* Pending Register Alert */}
            <div className="p-3.5 bg-[#111827] border border-[#303B4D] rounded-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#1F2937] text-[#9CA3AF] border border-[#303B4D] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-[#F3F4F6] text-xs">
                    {unmarkedClasses.length > 0 ? `${unmarkedClasses.length} unmarked registers` : 'All registers marked'}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    {unmarkedClasses.length > 0 ? 'Teacher registers pending submission' : 'All registers up to date'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/admin/attendance')}
                className="px-3 py-1.5 bg-[#1F2937] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-md border border-[#303B4D] transition-colors shrink-0"
              >
                Open Registers
              </button>
            </div>
          </div>
        </div>

        {/* 5. AI EXECUTIVE INSIGHTS WIDGET */}
        <AiInsightsWidget
          insights={aiInsights}
          isLoading={isAiLoading}
          onRefresh={handleGenerateAiInsights}
        />

        {/* 6. QUICK ACTIONS TOOLBAR */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-xs text-[#9CA3AF]">Quick Actions</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/admin/students/new')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>

            <button
              onClick={() => navigate('/admin/payments')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-md border border-[#303B4D] transition-colors"
            >
              <IndianRupee className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>Record Fee</span>
            </button>

            <button
              onClick={() => navigate('/admin/attendance')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-md border border-[#303B4D] transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>Mark Attendance</span>
            </button>

            <button
              onClick={() => navigate('/admin/sms')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-md border border-[#303B4D] transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>SMS Broadcast</span>
            </button>

            <button
              onClick={() => navigate('/admin/staff/new')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-md border border-[#303B4D] transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>Add Staff</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
