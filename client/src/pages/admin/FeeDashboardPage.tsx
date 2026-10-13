import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CreditCard, 
  Receipt, 
  Users, 
  PieChart, 
  CheckCircle2, 
  Search, 
  ArrowUpRight,
  Layers,
  Send,
  MessageSquare,
  Sparkles,
  Zap,
  Calendar,
  Wallet
} from 'lucide-react';

export const FeeDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const basePath = isAdmin ? '/admin' : '/staff';

  const [metrics, setMetrics] = useState<any>(null);
  const [todaysAnalysis, setTodaysAnalysis] = useState<any>(null);
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState<any>({});
  const [classBreakdown, setClassBreakdown] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchDefaulter, setSearchDefaulter] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
  const [bulkSmsLoading, setBulkSmsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/fees/dashboard');
      if (res.data.success) {
        setMetrics(res.data.metrics);
        setTodaysAnalysis(res.data.todaysAnalysis || null);
        setPaymentMethodBreakdown(res.data.paymentMethodBreakdown || {});
        setClassBreakdown(res.data.classBreakdown || []);
        setDefaulters(res.data.defaulters || []);
      }
    } catch (err) {
      console.error('Failed to fetch fee dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSendSingleReminder = async (student: any) => {
    setSendingSmsId(student.id);
    setStatusMsg('');
    try {
      const message = `Dear ${student.fatherName || 'Parent'}, this is a reminder from School Administration regarding pending fee balance of Rs. ${student.balance.toLocaleString()} for ${student.fullName} (${student.className}-${student.sectionName}). Please clear the dues at your earliest convenience. Thank you.`;
      const res = await api.post('/sms/send', {
        recipient: student.fatherPhone,
        message,
        studentName: student.fullName,
        studentId: student.id,
        category: 'fee_reminder'
      });
      if (res.data.success) {
        setStatusMsg(`SMS fee reminder sent to ${student.fatherName} (${student.fatherPhone})`);
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to dispatch fee reminder SMS');
    } finally {
      setSendingSmsId(null);
    }
  };

  const handleSendBulkReminder = async () => {
    if (!window.confirm(`Are you sure you want to send automated Fee Reminder SMS to all ${defaulters.length} pending balance parents?`)) {
      return;
    }
    setBulkSmsLoading(true);
    setStatusMsg('');
    try {
      let sentCount = 0;
      for (const st of defaulters) {
        if (st.fatherPhone && st.fatherPhone !== 'N/A') {
          const message = `Dear ${st.fatherName || 'Parent'}, fee reminder: Pending balance for ${st.fullName} (${st.className}) is Rs. ${st.balance.toLocaleString()}. Please remit payment at school office. Thank you.`;
          await api.post('/sms/send', {
            recipient: st.fatherPhone,
            message,
            studentName: st.fullName,
            studentId: st.id,
            category: 'fee_reminder'
          }).catch(e => console.warn(e));
          sentCount++;
        }
      }
      setStatusMsg(`🎉 Successfully dispatched ${sentCount} fee reminder SMS notifications to parents!`);
      setTimeout(() => setStatusMsg(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setBulkSmsLoading(false);
    }
  };

  const filteredDefaulters = defaulters.filter(st => {
    const matchesSearch = st.fullName.toLowerCase().includes(searchDefaulter.toLowerCase()) || 
                          st.registrationNumber.toLowerCase().includes(searchDefaulter.toLowerCase()) ||
                          st.fatherName.toLowerCase().includes(searchDefaulter.toLowerCase());
    const matchesClass = selectedClassFilter ? st.className === selectedClassFilter : true;
    return matchesSearch && matchesClass;
  });

  const getClassBadgeLabel = (name: string) => {
    if (!name) return 'C';
    return name.replace(/^Class\s+/i, '').trim() || name;
  };

  // Class Color Palette Generator
  const getClassColorPalette = (index: number) => {
    const palettes = [
      { bg: 'from-blue-600 to-indigo-700', badge: 'bg-blue-600', border: 'border-blue-200', text: 'text-blue-700' },
      { bg: 'from-emerald-600 to-teal-700', badge: 'bg-emerald-600', border: 'border-emerald-200', text: 'text-emerald-700' },
      { bg: 'from-purple-600 to-violet-700', badge: 'bg-purple-600', border: 'border-purple-200', text: 'text-purple-700' },
      { bg: 'from-amber-500 to-orange-600', badge: 'bg-amber-600', border: 'border-amber-200', text: 'text-amber-700' },
      { bg: 'from-rose-600 to-pink-700', badge: 'bg-rose-600', border: 'border-rose-200', text: 'text-rose-700' },
      { bg: 'from-cyan-600 to-blue-700', badge: 'bg-cyan-600', border: 'border-cyan-200', text: 'text-cyan-700' }
    ];
    return palettes[index % palettes.length];
  };

  const todayFormattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Actions */}
      <PageHeader
        title="Fee Executive Dashboard & Revenue Analytics"
        subtitle="Real-time collection metrics, class-wise revenue targets, pending balance tracking, and bulk SMS reminder triggers."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate(`${basePath}/fees/structure`)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Fee Structures</span>
            </button>

            <button
              onClick={() => navigate(`${basePath}/payments`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>Record Fee Payment</span>
            </button>
          </div>
        }
      />

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 4 Executive VIBRANT COLOR KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue Collected (EMERALD GRADIENT THEME) */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white rounded-2xl p-5 shadow-lg shadow-emerald-600/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Total Revenue Collected</span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-mono tracking-tight">
              ₹ {isLoading ? '...' : (metrics?.totalCollected || 0).toLocaleString()}
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-emerald-100">
              <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                {metrics?.overallCollectionPercentage || 0}% Collected
              </span>
              <span>{metrics?.totalPaymentsCount || 0} Transactions</span>
            </div>
          </div>
        </div>

        {/* Card 2: Outstanding Fee Balance (WARM AMBER / ROSE THEME) */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white rounded-2xl p-5 shadow-lg shadow-amber-500/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">Outstanding Dues</span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-mono tracking-tight">
              ₹ {isLoading ? '...' : (metrics?.totalOutstanding || 0).toLocaleString()}
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-amber-100">
              <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                {metrics?.defaultersCount || 0} Defaulters Pending
              </span>
              <span>Target Dues</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Net Fee Package (ROYAL BLUE THEME) */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white rounded-2xl p-5 shadow-lg shadow-blue-600/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Total School Fee Target</span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-mono tracking-tight">
              ₹ {isLoading ? '...' : (metrics?.totalPackageDue || 0).toLocaleString()}
            </div>
            <div className="mt-2.5 text-[11px] text-blue-100 flex justify-between font-semibold">
              <span>Base: ₹ {(metrics?.totalBaseFee || 0).toLocaleString()}</span>
              <span>Prev: ₹ {(metrics?.totalPreviousYearDue || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Fee Concessions Granted (PURPLE / VIOLET THEME) */}
        <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800 text-white rounded-2xl p-5 shadow-lg shadow-purple-600/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-100 uppercase tracking-wider">Total Concessions</span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-mono tracking-tight">
              ₹ {isLoading ? '...' : (metrics?.totalConcessions || 0).toLocaleString()}
            </div>
            <div className="mt-2.5 text-[11px] text-purple-100 font-semibold">
              Approved Fee Scholarships & Discounts
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S PAYMENT ANALYSIS SECTION (BEFORE CLASSWISE FEE COLLECTION) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-6 border border-slate-800 relative overflow-hidden">
        {/* Glowing Background Circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Real-Time Today&apos;s Fee Collection Analysis</span>
            </div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>{todayFormattedDate}</span>
            </h2>
          </div>

          <button
            onClick={() => navigate('/admin/payments')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>Record New Payment Today</span>
          </button>
        </div>

        {/* 3 Today's Key Executive Metrics */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today&apos;s Collection Total</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              ₹ {(todaysAnalysis?.todaysTotal || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">Sum of all receipts recorded today</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today&apos;s Receipts Issued</span>
            <div className="text-2xl font-extrabold text-blue-400 font-mono">
              {todaysAnalysis?.todaysCount || 0} Receipts
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">Completed payment transactions</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today&apos;s Average Receipt</span>
            <div className="text-2xl font-extrabold text-purple-400 font-mono">
              ₹ {(todaysAnalysis?.todaysAvg || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">Average transaction value</span>
          </div>
        </div>

        {/* TODAY'S PAYMENT METHOD BREAKDOWN (CASH, UPI, BANK / OTHER) */}
        <div className="relative z-10 space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            <span>Today&apos;s Payment Method Distribution</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Today's Cash Collection */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cash Collection Today</span>
                </span>
                <div className="text-xl font-extrabold text-white font-mono mt-1">
                  ₹ {(todaysAnalysis?.todaysMethodBreakdown?.cash || 0).toLocaleString()}
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase">
                Physical Cash
              </span>
            </div>

            {/* Today's UPI / Online Collection */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span>UPI / Digital Today</span>
                </span>
                <div className="text-xl font-extrabold text-white font-mono mt-1">
                  ₹ {(todaysAnalysis?.todaysMethodBreakdown?.upi || 0).toLocaleString()}
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-bold uppercase">
                Instant UPI
              </span>
            </div>

            {/* Today's Bank Transfer / Other Collection */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  <span>Bank / Cheque / Other</span>
                </span>
                <div className="text-xl font-extrabold text-white font-mono mt-1">
                  ₹ {((todaysAnalysis?.todaysMethodBreakdown?.bank_transfer || 0) + (todaysAnalysis?.todaysMethodBreakdown?.cheque || 0) + (todaysAnalysis?.todaysMethodBreakdown?.other || 0)).toLocaleString()}
                </div>
              </div>
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-bold uppercase">
                Bank / Cheque
              </span>
            </div>
          </div>
        </div>

        {/* Today's Recent Transactions Table */}
        <div className="relative z-10 space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Today&apos;s Payment Activity Ledger</span>
          </h4>

          {!todaysAnalysis?.todaysTransactionsList || todaysAnalysis.todaysTransactionsList.length === 0 ? (
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center text-slate-400 text-xs font-semibold">
              No payments recorded today yet. Click &quot;Record New Payment Today&quot; to issue a receipt.
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/10 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/10 text-slate-300 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-4">Receipt No</th>
                    <th className="py-2.5 px-4">Student Name</th>
                    <th className="py-2.5 px-4">Class</th>
                    <th className="py-2.5 px-4">Payment Mode</th>
                    <th className="py-2.5 px-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {todaysAnalysis.todaysTransactionsList.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-300">{tx.receiptNumber}</td>
                      <td className="py-2.5 px-4 font-bold text-white">{tx.studentName}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-300">{tx.className}</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md font-bold uppercase text-[10px]">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-extrabold text-emerald-400 text-sm">
                        ₹ {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Class-Wise Collection Performance Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Class-Wise Fee Collection & Target Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500">Real-time breakdown of fees collected vs outstanding balance per academic grade.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classBreakdown.map((cb, idx) => {
            const palette = getClassColorPalette(idx);

            return (
              <div key={cb.classId} className={`bg-white rounded-2xl border ${palette.border} p-5 shadow-sm space-y-3 hover:shadow-md transition-all relative overflow-hidden`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-3">
                    {/* Display Picture Badge with JUST Number / Short Code */}
                    <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${palette.bg} text-white font-extrabold text-sm flex items-center justify-center shadow-md shrink-0 font-mono`}>
                      {getClassBadgeLabel(cb.className)}
                    </span>
                    <div>
                      <h4 className="font-bold text-base text-slate-900">{cb.className}</h4>
                      <span className="text-[10px] font-bold text-slate-500">{cb.studentCount} Students Enrolled</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    cb.collectionPercentage >= 80 ? 'bg-emerald-100 text-emerald-800' : cb.collectionPercentage >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {cb.collectionPercentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full bg-gradient-to-r ${palette.bg} rounded-full transition-all duration-500`} 
                      style={{ width: `${Math.min(100, cb.collectionPercentage)}%` }} 
                    />
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Collected</span>
                    <span className="font-extrabold text-emerald-800 font-mono text-sm">₹ {cb.totalPaid.toLocaleString()}</span>
                  </div>

                  <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Outstanding</span>
                    <span className="font-extrabold text-amber-800 font-mono text-sm">₹ {cb.totalOutstanding.toLocaleString()}</span>
                  </div>
                </div>

                {/* Defaulter Badge Footer */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-600 font-semibold">
                    Defaulters: <strong className="text-amber-700">{cb.defaultersCount}</strong>
                  </span>

                  <button
                    onClick={() => {
                      setSelectedClassFilter(cb.className);
                      const el = document.getElementById('defaulters-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`${palette.text} hover:underline font-extrabold text-xs inline-flex items-center gap-1`}
                  >
                    <span>View Defaulters</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Receipt className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-base text-slate-900">Payment Modes & Channel Volume</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {Object.entries(paymentMethodBreakdown).map(([method, data]: any) => (
            <div key={method} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <span className="uppercase font-extrabold text-slate-600 tracking-wider text-[11px] block">{method}</span>
                <span className="font-extrabold text-lg text-slate-900 font-mono mt-1 block">₹ {data.amount.toLocaleString()}</span>
              </div>
              <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl font-bold">
                {data.count} Payments
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Defaulters Roster & Reminder Trigger Table */}
      <div id="defaulters-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>Pending Fee Defaulters ({filteredDefaulters.length})</span>
            </h3>
            <p className="text-xs text-slate-500">Students with outstanding fee balances requiring parent payment reminder notifications.</p>
          </div>

          <button
            onClick={handleSendBulkReminder}
            disabled={bulkSmsLoading || defaulters.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>{bulkSmsLoading ? "Dispatched Reminders..." : "Send Bulk Fee SMS to Defaulters"}</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchDefaulter}
              onChange={(e) => setSearchDefaulter(e.target.value)}
              placeholder="Search student or Reg No..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class Filter:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none"
            >
              <option value="">All Defaulter Classes</option>
              {classBreakdown.map(c => (
                <option key={c.classId} value={c.className}>{c.className}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Defaulters Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Reg No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Father / Parent</th>
                <th className="py-3 px-4 text-right">Total Package</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Pending Balance</th>
                <th className="py-3 px-4 text-center">SMS Reminder Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading defaulters...</td>
                </tr>
              ) : filteredDefaulters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    🎉 Excellent! No pending fee defaulters found matching filters.
                  </td>
                </tr>
              ) : (
                filteredDefaulters.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{st.registrationNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{st.fullName}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{st.className} - {st.sectionName}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-900">{st.fatherName}</p>
                        <p className="text-[10px] font-mono text-slate-500">{st.fatherPhone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">₹ {st.totalDue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">₹ {st.amountPaid.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-700">₹ {st.balance.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleSendSingleReminder(st)}
                        disabled={sendingSmsId === st.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-200 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        <span>{sendingSmsId === st.id ? "Sending..." : "Send Reminder SMS"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
