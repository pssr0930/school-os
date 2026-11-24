import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  User, 
  Users, 
  GraduationCap, 
  Calendar, 
  CreditCard, 
  Receipt, 
  Edit, 
  ArrowLeft, 
  CheckCircle2, 
  Phone, 
  IndianRupee,
  ArrowUpRight,
  PieChart,
  MapPin,
  PlusCircle,
  Tag,
  Wallet,
  AlertTriangle,
  Printer,
  Loader2
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { PrintableReceipt } from '../../components/PrintableReceipt';

export const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === 'admin' ? '/admin' : '/staff';
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'parents' | 'academic' | 'attendance' | 'fees' | 'payments'>('fees');
  const [isLoading, setIsLoading] = useState(true);

  // Concession Modal State
  const [isConcessionOpen, setIsConcessionOpen] = useState(false);
  const [concessionAmount, setConcessionAmount] = useState('');
  const [concessionReason, setConcessionReason] = useState('');
  const [concessionStatusMsg, setConcessionStatusMsg] = useState('');

  // Update Previous Due Modal State
  const [isUpdateDueOpen, setIsUpdateDueOpen] = useState(false);
  const [previousDueAmount, setPreviousDueAmount] = useState('');

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [printingPaymentId, setPrintingPaymentId] = useState<string | null>(null);

  const handlePrintReceipt = async (paymentId: string) => {
    try {
      setPrintingPaymentId(paymentId);
      const res = await api.get(`/payments/${paymentId}/receipt`);
      if (res.data.success && res.data.data) {
        setReceiptData(res.data.data);
        setIsReceiptOpen(true);
      } else {
        alert('Could not find receipt details for this transaction.');
      }
    } catch (err: any) {
      console.error('Failed to load receipt:', err);
      alert(err.response?.data?.message || 'Failed to load receipt.');
    } finally {
      setPrintingPaymentId(null);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const res = await api.get(`/students/${studentId}`);
      if (res.data.success) {
        let studentData = res.data.data;
        try {
          const payRes = await api.get('/payments');
          if (payRes.data.success && Array.isArray(payRes.data.data)) {
            const studentPayments = payRes.data.data.filter(
              (p: any) => p.studentId === studentId || p.student_id === studentId
            );
            if (studentPayments.length > 0 || !studentData.payments) {
              studentData = { ...studentData, payments: studentPayments };
            }
          }
        } catch (pErr) {
          console.warn('Could not fetch payment logs', pErr);
        }
        setStudent(studentData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, [studentId]);

  const handleApplyConcession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/fees/student-fees/${studentId}/concession`, {
        amount: parseFloat(concessionAmount),
        reason: concessionReason
      });
      if (res.data.success) {
        setIsConcessionOpen(false);
        setConcessionAmount('');
        setConcessionReason('');
        setConcessionStatusMsg('Concession applied successfully! Fee balance updated.');
        setTimeout(() => setConcessionStatusMsg(''), 4000);
        fetchStudentProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePreviousDue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/fees/student-fees/${studentId}/previous-due`, {
        previousYearDue: parseFloat(previousDueAmount)
      });
      if (res.data.success) {
        setIsUpdateDueOpen(false);
        setPreviousDueAmount('');
        setConcessionStatusMsg('Previous year due updated successfully!');
        setTimeout(() => setConcessionStatusMsg(''), 4000);
        fetchStudentProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !student) {
    return <div className="p-8 text-center text-[#9CA3AF] text-xs">Loading student profile details...</div>;
  }

  const parentPhone = student.parentDetails?.fatherPhone || student.parentDetails?.motherPhone || 'N/A';
  const fee = student.feeSummary || {};
  const struct = student.feeStructure || {};

  const baseFee = fee.baseFee || struct.totalFee || 15000;
  const previousDue = fee.previousYearDue || 0;
  const concession = fee.concessionAmount || 0;
  const finalFee = fee.finalFee || (baseFee + previousDue - concession);
  const paid = fee.amountPaid || 0;
  const balance = fee.balance !== undefined ? fee.balance : (finalFee - paid);

  const paidPct = finalFee > 0 ? Math.min(100, Math.round((paid / finalFee) * 100)) : 100;

  return (
    <div className="space-y-5 text-[#F3F4F6]">
      {/* HEADER BAR */}
      <PageHeader
        title={student.fullName}
        subtitle={`Reg Number: ${student.registrationNumber} • Class: ${student.className} - ${student.sectionName}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-lg border border-[#303B4D] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => navigate(`${basePath}/students/${studentId}/edit`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        }
      />

      {concessionStatusMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{concessionStatusMsg}</span>
        </div>
      )}

      {/* TOP PROFILE HEADER SUMMARY CARD */}
      <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-semibold text-[#F3F4F6] truncate">{student.fullName}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
                {student.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Admission: <span className="font-medium text-[#F3F4F6]">{student.admissionDate}</span> • Reg: <span className="font-mono text-blue-400 font-medium">{student.registrationNumber}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center text-xs border-t md:border-t-0 md:border-l border-[#303B4D] pt-3 md:pt-0 md:pl-6">
          <div className="p-2.5 rounded-lg bg-[#243244] border border-[#303B4D]">
            <p className="text-[#9CA3AF] font-medium uppercase text-[10px] tracking-wider">Attendance</p>
            <p className="text-sm sm:text-base font-semibold text-[#F3F4F6] mt-0.5 font-mono">{student.attendancePercentage || 100}%</p>
          </div>

          <div className="p-2.5 rounded-lg bg-[#243244] border border-[#303B4D]">
            <p className="text-[#9CA3AF] font-medium uppercase text-[10px] tracking-wider">Due Balance</p>
            <p className={`text-sm sm:text-base font-semibold mt-0.5 font-mono tabular-nums ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ₹ {balance.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-[#243244] border border-[#303B4D]">
            <p className="text-[#9CA3AF] font-medium uppercase text-[10px] tracking-wider">Parent Phone</p>
            <p className="text-xs sm:text-sm font-semibold text-[#F3F4F6] mt-0.5 font-mono truncate">{parentPhone}</p>
          </div>
        </div>
      </div>

      {/* CLEAN NAVIGATION TABS */}
      <div className="flex items-center gap-1 border-b border-[#303B4D] overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'fees', label: 'Fees & Financials', icon: CreditCard },
          { key: 'overview', label: 'Overview', icon: User },
          { key: 'parents', label: 'Parent Details', icon: Users },
          { key: 'academic', label: 'Academic Placement', icon: GraduationCap },
          { key: 'attendance', label: 'Attendance', icon: Calendar },
          { key: 'payments', label: 'Payments', icon: Receipt },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1F2937]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* FEES & FINANCIAL DETAILS TAB */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-[#F3F4F6] text-sm">Student Fee Account Breakdown</h3>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Class: <span className="font-medium text-[#F3F4F6]">{student.className} - {student.sectionName}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => navigate(`${basePath}/payments?studentId=${student.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
              <button
                onClick={() => setIsUpdateDueOpen(true)}
                className="px-2.5 py-1.5 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] border border-[#303B4D] font-medium text-xs rounded-lg transition-colors"
              >
                + Update Due
              </button>
              <button
                onClick={() => setIsConcessionOpen(true)}
                className="px-2.5 py-1.5 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] border border-[#303B4D] font-medium text-xs rounded-lg transition-colors"
              >
                + Concession
              </button>
              
              <button
                onClick={() => navigate(`${basePath}/fees/structure`)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-lg border border-[#303B4D] transition-colors"
              >
                <span>Structure</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          </div>

          {/* FINANCIAL CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Card 1: Base Class Package */}
            <div className="p-4 rounded-lg bg-[#1F2937] border border-[#303B4D] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">Base Fee</span>
                <div className="p-1.5 rounded-md bg-[#243244] text-blue-400 border border-[#303B4D]">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-semibold text-[#F3F4F6] font-mono tabular-nums">₹ {baseFee.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-[10px] text-[#9CA3AF] border-t border-[#303B4D] pt-1.5">Standard class fee</p>
            </div>

            {/* Card 2: Previous Year Carried Due */}
            <div className="p-4 rounded-lg bg-[#1F2937] border border-[#303B4D] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400">+ Prev Due</span>
                <div className="p-1.5 rounded-md bg-[#243244] text-amber-400 border border-[#303B4D]">
                  <PlusCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-semibold text-amber-400 font-mono tabular-nums">₹ {previousDue.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-[10px] text-[#9CA3AF] border-t border-[#303B4D] pt-1.5">Carried over dues</p>
            </div>

            {/* Card 3: Approved Concession */}
            <div className="p-4 rounded-lg bg-[#1F2937] border border-[#303B4D] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-purple-400">- Concession</span>
                <div className="p-1.5 rounded-md bg-[#243244] text-purple-400 border border-[#303B4D]">
                  <Tag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-semibold text-purple-400 font-mono tabular-nums">₹ {concession.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-[10px] text-[#9CA3AF] border-t border-[#303B4D] pt-1.5">Approved discount</p>
            </div>

            {/* Card 4: Net Payable Fee */}
            <div className="p-4 rounded-lg bg-[#1F2937] border border-[#303B4D] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">Net Fee</span>
                <div className="p-1.5 rounded-md bg-[#243244] text-blue-400 border border-[#303B4D]">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-semibold text-[#F3F4F6] font-mono tabular-nums">₹ {finalFee.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-[10px] text-[#9CA3AF] border-t border-[#303B4D] pt-1.5">Calculated payable</p>
            </div>

            {/* Card 5: Amount Paid */}
            <div className="p-4 rounded-lg bg-[#1F2937] border border-[#303B4D] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">Paid Amount</span>
                <div className="p-1.5 rounded-md bg-[#243244] text-emerald-400 border border-[#303B4D]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-semibold text-emerald-400 font-mono tabular-nums">₹ {paid.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-[10px] text-[#9CA3AF] border-t border-[#303B4D] pt-1.5">Total collected</p>
            </div>

            {/* Card 6: Outstanding Due Balance */}
            <div className="p-4 rounded-lg bg-[#1F2937] border border-[#303B4D] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium uppercase tracking-wider ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  Due Balance
                </span>
                <div className={`p-1.5 rounded-md bg-[#243244] border border-[#303B4D] ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {balance > 0 ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
              <div className="my-2">
                <p className={`text-lg sm:text-xl font-semibold font-mono tabular-nums ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹ {balance.toLocaleString('en-IN')}
                </p>
              </div>
              <p className="text-[10px] text-[#9CA3AF] border-t border-[#303B4D] pt-1.5">
                {balance > 0 ? 'Pending collection' : 'Fully cleared ✓'}
              </p>
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#F3F4F6] flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-blue-400" />
                Fee Payment Completion
              </span>
              <span className="font-mono font-medium text-[#F3F4F6] text-xs">
                {paidPct}% Paid
              </span>
            </div>
            <div className="w-full bg-[#243244] rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${paidPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#303B4D] pb-3">
              <h3 className="font-semibold text-xs text-[#F3F4F6] flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span>Student Personal Info</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D]">
                <p className="text-[#9CA3AF] font-medium uppercase text-[10px]">Full Name</p>
                <p className="font-semibold text-[#F3F4F6] text-xs mt-1">{student.fullName}</p>
              </div>

              <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D]">
                <p className="text-[#9CA3AF] font-medium uppercase text-[10px]">Reg Number</p>
                <p className="font-mono font-medium text-blue-400 text-xs mt-1">{student.registrationNumber}</p>
              </div>

              <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D]">
                <p className="text-[#9CA3AF] font-medium uppercase text-[10px]">Date of Birth</p>
                <p className="font-medium text-[#F3F4F6] text-xs mt-1">{student.dateOfBirth || 'N/A'}</p>
              </div>

              <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D]">
                <p className="text-[#9CA3AF] font-medium uppercase text-[10px]">Gender</p>
                <p className="font-medium text-[#F3F4F6] capitalize text-xs mt-1">{student.gender || 'N/A'}</p>
              </div>

              <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D]">
                <p className="text-[#9CA3AF] font-medium uppercase text-[10px]">Aadhaar Number</p>
                <p className="font-mono font-medium text-[#F3F4F6] text-xs mt-1">{student.studentAadhaar || 'N/A'}</p>
              </div>

              <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D]">
                <p className="text-[#9CA3AF] font-medium uppercase text-[10px]">Admission Date</p>
                <p className="font-medium text-[#F3F4F6] text-xs mt-1">{student.admissionDate}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#303B4D] pb-3">
              <h3 className="font-semibold text-xs text-[#F3F4F6] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Residential Address</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D]">
                <p className="text-[#9CA3AF] font-medium uppercase text-[10px]">Address</p>
                <p className="font-medium text-[#F3F4F6] mt-1 text-xs">{student.address || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D]">
                  <p className="text-[#9CA3AF] font-medium uppercase text-[10px]">City</p>
                  <p className="font-medium text-[#F3F4F6] mt-1 text-xs">{student.city || 'N/A'}</p>
                </div>

                <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D]">
                  <p className="text-[#9CA3AF] font-medium uppercase text-[10px]">District</p>
                  <p className="font-medium text-[#F3F4F6] mt-1 text-xs">{student.district || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PARENT DETAILS TAB */}
      {activeTab === 'parents' && (
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#303B4D] pb-3">
            <h3 className="font-semibold text-xs text-[#F3F4F6] flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Parent Contact Roster</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-[#243244] rounded-lg border border-[#303B4D] space-y-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400 block">Father</span>
              <p className="font-semibold text-[#F3F4F6] text-sm">{student.parentDetails?.fatherName || 'N/A'}</p>
              <p className="text-[#9CA3AF] flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {student.parentDetails?.fatherPhone || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-[#243244] rounded-lg border border-[#303B4D] space-y-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-purple-400 block">Mother</span>
              <p className="font-semibold text-[#F3F4F6] text-sm">{student.parentDetails?.motherName || 'N/A'}</p>
              <p className="text-[#9CA3AF] flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                {student.parentDetails?.motherPhone || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMIC DETAILS TAB */}
      {activeTab === 'academic' && (
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#303B4D] pb-3">
            <h3 className="font-semibold text-xs text-[#F3F4F6] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Academic Grade Placement</span>
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-4 bg-[#243244] rounded-lg border border-[#303B4D] flex flex-col items-center justify-center">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF] block">Grade Class</span>
              <p className="font-semibold text-[#F3F4F6] text-base sm:text-lg mt-1">{student.className}</p>
            </div>

            <div className="p-4 bg-[#243244] rounded-lg border border-[#303B4D] flex flex-col items-center justify-center">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF] block">Section</span>
              <p className="font-semibold text-[#F3F4F6] text-base sm:text-lg mt-1">Sec {student.sectionName}</p>
            </div>

            <div className="p-4 bg-[#243244] rounded-lg border border-[#303B4D] flex flex-col items-center justify-center">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF] block">Status</span>
              <span className="font-medium text-emerald-400 text-xs sm:text-sm capitalize mt-1 px-2.5 py-0.5 bg-emerald-950/40 rounded border border-emerald-800/50">
                {student.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] overflow-hidden">
          <div className="p-4 border-b border-[#303B4D] flex items-center justify-between">
            <h3 className="font-semibold text-xs text-[#F3F4F6] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Attendance History</span>
            </h3>
            <span className="font-mono font-medium text-emerald-400 text-xs">{student.attendancePercentage || 100}% Cumulative Rate</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#243244] border-b border-[#303B4D] text-[#9CA3AF] font-medium uppercase text-[10px]">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303B4D]">
                {student.attendance?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-[#9CA3AF]">No specific attendance records marked yet.</td>
                  </tr>
                ) : (
                  student.attendance?.map((a: any) => (
                    <tr key={a.id} className="hover:bg-[#243244]/60 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-[#F3F4F6]">{a.attendanceDate}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                          a.status === 'present' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50' : 'bg-red-950/40 text-red-400 border border-red-800/50'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-[#9CA3AF]">{a.remarks || 'Standard'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY TAB */}
      {activeTab === 'payments' && (
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] overflow-hidden">
          <div className="p-3.5 border-b border-[#303B4D] flex items-center justify-between">
            <h3 className="font-semibold text-xs text-[#F3F4F6]">Payment History Logs</h3>
            <button
              onClick={() => navigate(`${basePath}/payments?studentId=${student.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Record New Payment</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#243244] border-b border-[#303B4D] text-[#9CA3AF] font-medium uppercase text-[10px]">
                  <th className="py-2.5 px-4">Receipt No</th>
                  <th className="py-2.5 px-4">Payment Date</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4 text-right">Amount Paid</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303B4D]">
                {!student.payments || student.payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#9CA3AF]">No payment history recorded yet.</td>
                  </tr>
                ) : (
                  student.payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#243244]/60 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-blue-400">{p.receiptNumber || p.receipt_number || p.id}</td>
                      <td className="py-2.5 px-4 text-[#9CA3AF]">{p.paymentDate || p.payment_date || p.createdAt?.split('T')[0]}</td>
                      <td className="py-2.5 px-4 font-medium uppercase text-[#F3F4F6]">{p.paymentMethod || p.payment_method || 'CASH'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-emerald-400">₹ {(p.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handlePrintReceipt(p.id)}
                          disabled={printingPaymentId === p.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] rounded text-xs border border-[#303B4D] transition-colors"
                        >
                          {printingPaymentId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Printer className="w-3 h-3 text-blue-400" />}
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Concession Modal */}
      <Modal
        isOpen={isConcessionOpen}
        onClose={() => setIsConcessionOpen(false)}
        title="Apply Student Fee Concession / Discount"
      >
        <form onSubmit={handleApplyConcession} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Concession Amount (INR) *</label>
            <input
              type="number"
              required
              min="1"
              value={concessionAmount}
              onChange={(e) => setConcessionAmount(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Reason / Category *</label>
            <input
              type="text"
              required
              value={concessionReason}
              onChange={(e) => setConcessionReason(e.target.value)}
              placeholder="e.g. Merit Scholarship, Staff Ward Discount"
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Apply Concession
          </button>
        </form>
      </Modal>

      {/* Update Previous Due Modal */}
      <Modal
        isOpen={isUpdateDueOpen}
        onClose={() => setIsUpdateDueOpen(false)}
        title="Update Carried-Over Previous Year Due"
      >
        <form onSubmit={handleUpdatePreviousDue} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Previous Year Due Amount (INR) *</label>
            <input
              type="number"
              required
              min="0"
              value={previousDueAmount}
              onChange={(e) => setPreviousDueAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Save Previous Due Amount
          </button>
        </form>
      </Modal>

      {/* Receipt Modal */}
      {receiptData && (
        <Modal
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setReceiptData(null);
          }}
          title="Official Fee Receipt Print Preview"
        >
          <PrintableReceipt
            receipt={receiptData}
            onClose={() => {
              setIsReceiptOpen(false);
              setReceiptData(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default StudentProfilePage;
