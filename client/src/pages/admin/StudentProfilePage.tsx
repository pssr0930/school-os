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
  Mail,
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
    return <div className="p-8 text-center text-slate-400 font-semibold">Loading student profile details...</div>;
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
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER BAR */}
      <PageHeader
        title={student.fullName}
        subtitle={`Reg Number: ${student.registrationNumber} • Class: ${student.className} - ${student.sectionName}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => navigate(`${basePath}/students/${studentId}/edit`)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors active:scale-95"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        }
      />

      {concessionStatusMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{concessionStatusMsg}</span>
        </div>
      )}

      {/* TOP PROFILE HEADER SUMMARY CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate">{student.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                {student.status || 'Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
              Admission: <span className="font-semibold text-slate-800">{student.admissionDate}</span> • Reg: <span className="font-mono text-blue-600 font-bold">{student.registrationNumber}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100">
            <p className="text-blue-700 font-extrabold uppercase text-[9px] tracking-wider">Attendance</p>
            <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">{student.attendancePercentage || 100}%</p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100">
            <p className="text-amber-800 font-extrabold uppercase text-[9px] tracking-wider">Due Balance</p>
            <p className="text-sm sm:text-base font-black text-amber-950 mt-0.5 font-mono">₹ {balance.toLocaleString()}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100">
            <p className="text-purple-700 font-extrabold uppercase text-[9px] tracking-wider">Parent Phone</p>
            <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 font-mono truncate">{parentPhone}</p>
          </div>
        </div>
      </div>

      {/* COLORFUL NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1.5 scrollbar-none">
        {[
          { key: 'fees', label: 'Fees & Financials', icon: CreditCard, color: 'text-blue-600' },
          { key: 'overview', label: 'Overview', icon: User, color: 'text-indigo-600' },
          { key: 'parents', label: 'Parent Details', icon: Users, color: 'text-emerald-600' },
          { key: 'academic', label: 'Academic Placement', icon: GraduationCap, color: 'text-purple-600' },
          { key: 'attendance', label: 'Attendance', icon: Calendar, color: 'text-amber-600' },
          { key: 'payments', label: 'Payments', icon: Receipt, color: 'text-teal-600' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* FEES & FINANCIAL DETAILS TAB */}
      {activeTab === 'fees' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Student Fee Account Breakdown</h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Class: <span className="font-semibold text-slate-800">{student.className} - {student.sectionName}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setIsUpdateDueOpen(true)}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl transition-colors"
              >
                + Update Due
              </button>
              <button
                onClick={() => setIsConcessionOpen(true)}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition-colors"
              >
                + Concession
              </button>
              
              <button
                onClick={() => navigate(`${basePath}/fees/structure`)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>Structure</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          </div>

          {/* PERFECT FIT FINANCIAL CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Card 1: Base Class Package */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Base Fee</span>
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-black text-slate-900 font-mono">₹ {baseFee.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-1.5">Standard class fee</p>
            </div>

            {/* Card 2: Previous Year Carried Due */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border border-amber-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">+ Prev Due</span>
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <PlusCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-black text-amber-950 font-mono">₹ {previousDue.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-amber-700 font-semibold border-t border-amber-100 pt-1.5">Carried over dues</p>
            </div>

            {/* Card 3: Approved Concession */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-purple-50/30 border border-purple-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800">- Concession</span>
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                  <Tag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-black text-purple-950 font-mono">₹ {concession.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-purple-700 font-semibold border-t border-purple-100 pt-1.5">Approved discount</p>
            </div>

            {/* Card 4: Net Payable Fee */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 border border-blue-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">Net Fee</span>
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-black text-blue-950 font-mono">₹ {finalFee.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-blue-700 font-semibold border-t border-blue-100 pt-1.5">Calculated payable</p>
            </div>

            {/* Card 5: Amount Paid */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border border-emerald-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">Paid Amount</span>
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-black text-emerald-950 font-mono">₹ {paid.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold border-t border-emerald-100 pt-1.5">Total collected</p>
            </div>

            {/* Card 6: Outstanding Due Balance */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 border border-rose-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">Due Balance</span>
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <p className="text-lg sm:text-xl font-black text-rose-950 font-mono">₹ {balance.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-rose-700 font-semibold border-t border-rose-100 pt-1.5">{balance > 0 ? 'Pending due' : 'Fully cleared ✓'}</p>
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-blue-600" />
                Fee Payment Completion
              </span>
              <span className="font-mono font-bold text-slate-900 text-xs">
                {paidPct}% Paid
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${paidPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Student Personal Info</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Full Name</p>
                <p className="font-extrabold text-slate-900 text-xs mt-0.5">{student.fullName}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Reg Number</p>
                <p className="font-mono font-bold text-blue-600 text-xs mt-0.5">{student.registrationNumber}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Date of Birth</p>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{student.dateOfBirth || 'N/A'}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Gender</p>
                <p className="font-bold text-slate-800 capitalize text-xs mt-0.5">{student.gender || 'N/A'}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Aadhaar Number</p>
                <p className="font-mono font-bold text-slate-800 text-xs mt-0.5">{student.studentAadhaar || 'N/A'}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Admission Date</p>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{student.admissionDate}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Residential Address</span>
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                <p className="text-amber-800 font-bold uppercase text-[9px]">Address</p>
                <p className="font-bold text-slate-900 mt-0.5 text-xs">{student.address || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase text-[9px]">City</p>
                  <p className="font-bold text-slate-800 mt-0.5 text-xs">{student.city || 'N/A'}</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase text-[9px]">District</p>
                  <p className="font-bold text-slate-800 mt-0.5 text-xs">{student.district || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PARENT DETAILS TAB */}
      {activeTab === 'parents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Parent Contact Roster</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 block">Father</span>
              <p className="font-black text-slate-900 text-sm">{student.parentDetails?.fatherName || 'N/A'}</p>
              <p className="text-slate-700 flex items-center gap-1 font-bold">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {student.parentDetails?.fatherPhone || 'N/A'}
              </p>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-800 block">Mother</span>
              <p className="font-black text-slate-900 text-sm">{student.parentDetails?.motherName || 'N/A'}</p>
              <p className="text-slate-700 flex items-center gap-1 font-bold">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                {student.parentDetails?.motherPhone || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMIC DETAILS TAB (PERFECT FIT CARDS) */}
      {activeTab === 'academic' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Academic Grade Placement</span>
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 flex flex-col items-center justify-center">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-700 block">Grade Class</span>
              <p className="font-black text-purple-950 text-base sm:text-lg mt-0.5">{student.className}</p>
            </div>

            <div className="p-3 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border border-blue-200 flex flex-col items-center justify-center">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-700 block">Section</span>
              <p className="font-black text-blue-950 text-base sm:text-lg mt-0.5">Sec {student.sectionName}</p>
            </div>

            <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 flex flex-col items-center justify-center">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 block">Status</span>
              <span className="font-black text-emerald-800 text-xs sm:text-sm capitalize mt-0.5 px-2 py-0.5 bg-emerald-100 rounded-full border border-emerald-300">
                {student.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Attendance History</span>
            </h3>
            <span className="font-mono font-black text-emerald-600 text-xs">{student.attendancePercentage || 100}% Cumulative Rate</span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {student.attendance?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">No specific attendance records marked yet.</td>
                </tr>
              ) : (
                student.attendance?.map((a: any) => (
                  <tr key={a.id}>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{a.attendanceDate}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        a.status === 'present' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-500">{a.remarks || 'Standard'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAYMENT HISTORY TAB */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200">
            <h3 className="font-bold text-xs text-slate-900">Payment History Logs</h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-4">Receipt No</th>
                <th className="py-2.5 px-4">Payment Date</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!student.payments || student.payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">No payment history recorded yet.</td>
                </tr>
              ) : (
                student.payments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{p.receiptNumber || p.receipt_number || p.id}</td>
                    <td className="py-2.5 px-4 text-slate-700">{p.paymentDate || p.payment_date || p.createdAt?.split('T')[0]}</td>
                    <td className="py-2.5 px-4 font-semibold uppercase text-slate-800">{p.paymentMethod || p.payment_method || 'CASH'}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">₹ {(p.amount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Concession Amount (INR) *</label>
            <input
              type="number"
              required
              min="1"
              value={concessionAmount}
              onChange={(e) => setConcessionAmount(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Reason / Category *</label>
            <input
              type="text"
              required
              value={concessionReason}
              onChange={(e) => setConcessionReason(e.target.value)}
              placeholder="e.g. Merit Scholarship, Staff Ward Discount"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Previous Year Due Amount (INR) *</label>
            <input
              type="number"
              required
              min="0"
              value={previousDueAmount}
              onChange={(e) => setPreviousDueAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Save Previous Due Amount
          </button>
        </form>
      </Modal>
    </div>
  );
};
