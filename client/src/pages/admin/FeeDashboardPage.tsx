import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
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
      setStatusMsg(`Successfully dispatched ${sentCount} fee reminder SMS notifications to parents.`);
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

  const formatMethodName = (key: string) => {
    switch (key.toLowerCase()) {
      case 'cash': return 'Cash';
      case 'upi': return 'UPI / Digital';
      case 'bank_transfer':
      case 'bank': return 'Bank Transfer';
      case 'cheque': return 'Cheque';
      case 'other': return 'Other';
      default: return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  const todayFormattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const methodEntries = Object.entries(paymentMethodBreakdown || {});
  const totalMethodAmount = methodEntries.reduce((sum, [_, data]: any) => sum + (data?.amount || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-[#F3F4F6]">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F3F4F6] tracking-tight">Fee Dashboard</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Fee collection, outstanding balances and revenue analytics.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate(`${basePath}/fees/structure`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1F2937] hover:bg-gray-700 text-[#F3F4F6] text-xs font-medium rounded-lg border border-[#303B4D] transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>Fee Structures</span>
          </button>

          <button
            onClick={() => navigate(`${basePath}/payments`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Record Fee Payment</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-[#1F2937] border border-[#303B4D] text-xs text-[#F3F4F6] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 2. Four Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue Collected */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#9CA3AF]">Total Revenue Collected</span>
              <Receipt className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <div className="text-2xl font-semibold text-[#F3F4F6] font-mono mt-2">
              ₹ {isLoading ? '...' : (metrics?.totalCollected || 0).toLocaleString()}
            </div>
          </div>
          <div className="mt-3 text-xs text-[#9CA3AF] flex items-center justify-between">
            <span className="text-[#22C55E] flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {metrics?.overallCollectionPercentage || 0}% collected
            </span>
            <span>{metrics?.totalPaymentsCount || 0} transactions</span>
          </div>
        </div>

        {/* Card 2: Outstanding Dues */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#9CA3AF]">Outstanding Dues</span>
              <AlertCircle className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div className="text-2xl font-semibold text-[#EF4444] font-mono mt-2">
              ₹ {isLoading ? '...' : (metrics?.totalOutstanding || 0).toLocaleString()}
            </div>
          </div>
          <div className="mt-3 text-xs text-[#9CA3AF]">
            {metrics?.defaultersCount || 0} pending defaulters
          </div>
        </div>

        {/* Card 3: Total School Fee Target */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#9CA3AF]">Total School Fee Target</span>
              <PieChart className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <div className="text-2xl font-semibold text-[#F3F4F6] font-mono mt-2">
              ₹ {isLoading ? '...' : (metrics?.totalPackageDue || 0).toLocaleString()}
            </div>
          </div>
          <div className="mt-3 text-xs text-[#9CA3AF] flex items-center justify-between">
            <span>Base: ₹ {(metrics?.totalBaseFee || 0).toLocaleString()}</span>
            <span>Prev: ₹ {(metrics?.totalPreviousYearDue || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Card 4: Fee Concessions Granted */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#9CA3AF]">Total Concessions</span>
              <Users className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <div className="text-2xl font-semibold text-[#F3F4F6] font-mono mt-2">
              ₹ {isLoading ? '...' : (metrics?.totalConcessions || 0).toLocaleString()}
            </div>
          </div>
          <div className="mt-3 text-xs text-[#9CA3AF]">
            Approved scholarships & discounts
          </div>
        </div>
      </div>

      {/* 3. Today's Fee Collection Analysis */}
      <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#303B4D] pb-3">
          <div>
            <h2 className="text-sm font-semibold text-[#F3F4F6] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Today&apos;s Fee Collection Analysis</span>
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{todayFormattedDate}</p>
          </div>

          <button
            onClick={() => navigate(`${basePath}/payments`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors self-start sm:self-auto"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Record New Payment Today</span>
          </button>
        </div>

        {/* 3 Today's Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-[#111827] border border-[#303B4D]">
            <span className="text-xs font-medium text-[#9CA3AF] block">Today&apos;s Collection Total</span>
            <div className="text-xl font-semibold text-[#22C55E] font-mono mt-1">
              ₹ {(todaysAnalysis?.todaysTotal || 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#9CA3AF] block mt-0.5">Sum of all receipts recorded today</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111827] border border-[#303B4D]">
            <span className="text-xs font-medium text-[#9CA3AF] block">Today&apos;s Receipts Issued</span>
            <div className="text-xl font-semibold text-[#F3F4F6] font-mono mt-1">
              {todaysAnalysis?.todaysCount || 0} Receipts
            </div>
            <span className="text-[11px] text-[#9CA3AF] block mt-0.5">Completed payment transactions</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111827] border border-[#303B4D]">
            <span className="text-xs font-medium text-[#9CA3AF] block">Today&apos;s Average Receipt</span>
            <div className="text-xl font-semibold text-[#F3F4F6] font-mono mt-1">
              ₹ {(todaysAnalysis?.todaysAvg || 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#9CA3AF] block mt-0.5">Average transaction value</span>
          </div>
        </div>

        {/* Today's Payment Activity Ledger */}
        <div className="space-y-2 pt-2 border-t border-[#303B4D]">
          <h3 className="text-xs font-medium text-[#9CA3AF] flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>Today&apos;s Payment Activity Ledger</span>
          </h3>

          {!todaysAnalysis?.todaysTransactionsList || todaysAnalysis.todaysTransactionsList.length === 0 ? (
            <div className="p-4 bg-[#111827] border border-[#303B4D] rounded-lg text-center text-xs text-[#9CA3AF]">
              No payments recorded today yet. Click &quot;Record New Payment Today&quot; to issue a receipt.
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#303B4D] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#243244] border-b border-[#303B4D] text-[#9CA3AF] text-xs font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Receipt No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Payment Mode</th>
                    <th className="py-2.5 px-3 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#303B4D] bg-[#111827]">
                  {todaysAnalysis.todaysTransactionsList.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-400">{tx.receiptNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-[#F3F4F6]">{tx.studentName}</td>
                      <td className="py-2.5 px-3 text-[#9CA3AF]">{tx.className}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 bg-[#1F2937] text-[#9CA3AF] border border-[#303B4D] rounded text-[11px] font-medium capitalize">
                          {formatMethodName(tx.paymentMethod || 'cash')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#22C55E]">
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

      {/* 4. Payment Method Distribution */}
      <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#303B4D] pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm text-[#F3F4F6]">Payment Method Distribution</h3>
          </div>
          {totalMethodAmount > 0 && (
            <span className="text-xs text-[#9CA3AF]">Total Collection: ₹ {totalMethodAmount.toLocaleString()}</span>
          )}
        </div>

        {methodEntries.length === 0 || totalMethodAmount === 0 ? (
          <div className="p-8 text-center bg-[#111827] border border-[#303B4D] rounded-lg">
            <Receipt className="w-6 h-6 mx-auto text-[#9CA3AF] mb-2" />
            <p className="text-xs font-medium text-[#F3F4F6]">No payment method distribution data available</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Recorded transaction channels will automatically appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {methodEntries.map(([method, data]: any) => {
              const amount = data?.amount || 0;
              const count = data?.count || 0;
              const pct = totalMethodAmount > 0 ? Math.round((amount / totalMethodAmount) * 100) : 0;

              return (
                <div key={method} className="p-3.5 rounded-lg bg-[#111827] border border-[#303B4D] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#9CA3AF]">{formatMethodName(method)}</span>
                    <span className="text-[11px] text-[#9CA3AF]">{count} transaction{count === 1 ? '' : 's'}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="font-semibold text-lg text-[#F3F4F6] font-mono">₹ {amount.toLocaleString()}</span>
                    <span className="text-xs font-medium text-blue-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-[#1F2937] h-1.5 rounded-full overflow-hidden border border-[#303B4D] mt-2.5">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Class-Wise Fee Collection */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-sm text-[#F3F4F6] flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Class-Wise Fee Collection</span>
          </h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Breakdown of fees collected versus outstanding balances per academic grade.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classBreakdown.map((cb) => (
            <div key={cb.classId} className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#303B4D] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-md bg-[#111827] border border-[#303B4D] text-[#F3F4F6] text-xs font-semibold flex items-center justify-center shrink-0 font-mono">
                    {getClassBadgeLabel(cb.className)}
                  </span>
                  <div>
                    <h4 className="font-medium text-xs text-[#F3F4F6]">{cb.className}</h4>
                    <span className="text-[10px] text-[#9CA3AF]">{cb.studentCount} students</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  cb.collectionPercentage >= 80 
                    ? 'bg-emerald-950/40 text-[#22C55E] border border-emerald-800/40' 
                    : cb.collectionPercentage >= 50 
                    ? 'bg-amber-950/40 text-[#F59E0B] border border-amber-800/40' 
                    : 'bg-red-950/40 text-[#EF4444] border border-red-800/40'
                }`}>
                  {cb.collectionPercentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#111827] rounded-full overflow-hidden border border-[#303B4D]">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, cb.collectionPercentage)}%` }} 
                />
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#111827] p-2 rounded-md border border-[#303B4D]">
                  <span className="text-[10px] font-medium text-[#9CA3AF] block">Collected</span>
                  <span className="font-semibold text-[#22C55E] font-mono text-xs mt-0.5 block">₹ {cb.totalPaid.toLocaleString()}</span>
                </div>

                <div className="bg-[#111827] p-2 rounded-md border border-[#303B4D]">
                  <span className="text-[10px] font-medium text-[#9CA3AF] block">Outstanding</span>
                  <span className="font-semibold text-[#EF4444] font-mono text-xs mt-0.5 block">₹ {cb.totalOutstanding.toLocaleString()}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-[#9CA3AF]">
                  Defaulters: <span className="text-[#F3F4F6] font-medium">{cb.defaultersCount}</span>
                </span>

                <button
                  onClick={() => {
                    setSelectedClassFilter(cb.className);
                    const el = document.getElementById('defaulters-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
                >
                  <span>View Defaulters</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Pending Fee Defaulters Roster */}
      <div id="defaulters-section" className="bg-[#1F2937] rounded-lg border border-[#303B4D] space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#303B4D] pb-3">
          <div>
            <h3 className="font-semibold text-sm text-[#F3F4F6] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Pending Fee Defaulters ({filteredDefaulters.length})</span>
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Students with outstanding fee balances requiring parent payment reminder notifications.</p>
          </div>

          <button
            onClick={handleSendBulkReminder}
            disabled={bulkSmsLoading || defaulters.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{bulkSmsLoading ? "Sending SMS Reminders..." : "Send Bulk Fee SMS to Defaulters"}</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827] p-2.5 rounded-lg border border-[#303B4D]">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchDefaulter}
              onChange={(e) => setSearchDefaulter(e.target.value)}
              placeholder="Search student, Reg No, or parent..."
              className="w-full bg-[#1F2937] border border-[#303B4D] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#9CA3AF]">Class:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-[#1F2937] border border-[#303B4D] text-xs text-[#F3F4F6] rounded-md px-3 py-1.5 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="">All Defaulter Classes</option>
              {classBreakdown.map(c => (
                <option key={c.classId} value={c.className}>{c.className}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Defaulters Table */}
        <div className="overflow-x-auto border border-[#303B4D] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#243244] border-b border-[#303B4D] text-[#9CA3AF] font-medium text-xs">
              <tr>
                <th className="py-2.5 px-3">Reg No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Class & Section</th>
                <th className="py-2.5 px-3">Parent / Contact</th>
                <th className="py-2.5 px-3 text-right">Total Package</th>
                <th className="py-2.5 px-3 text-right">Amount Paid</th>
                <th className="py-2.5 px-3 text-right">Pending Balance</th>
                <th className="py-2.5 px-3 text-center">SMS Reminder Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303B4D] bg-[#111827]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#9CA3AF]">Loading fee records...</td>
                </tr>
              ) : filteredDefaulters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-[#22C55E] mb-2" />
                    <p className="text-xs font-medium text-[#F3F4F6]">No pending fee records found.</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                      {searchDefaulter || selectedClassFilter 
                        ? "No records match the active search and filter criteria." 
                        : "All students are up to date with their fee payments."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDefaulters.map((st) => (
                  <tr key={st.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-blue-400">{st.registrationNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-[#F3F4F6]">{st.fullName}</td>
                    <td className="py-2.5 px-3 text-[#9CA3AF]">{st.className} - {st.sectionName}</td>
                    <td className="py-2.5 px-3 text-[#9CA3AF]">
                      <div>
                        <p className="font-medium text-[#F3F4F6]">{st.fatherName}</p>
                        <p className="text-[10px] font-mono text-[#9CA3AF]">{st.fatherPhone}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#9CA3AF]">₹ {st.totalDue.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[#22C55E]">₹ {st.amountPaid.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#EF4444]">₹ {st.balance.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleSendSingleReminder(st)}
                        disabled={sendingSmsId === st.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1F2937] hover:bg-gray-700 text-blue-400 font-medium text-xs rounded-md border border-[#303B4D] transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 text-blue-400" />
                        <span>{sendingSmsId === st.id ? "Sending..." : "Send Reminder"}</span>
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

export default FeeDashboardPage;
