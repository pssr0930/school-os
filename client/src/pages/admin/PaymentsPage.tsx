import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { PrintableReceipt } from '../../components/PrintableReceipt';
import api from '../../services/api';
import { Plus, Printer, Search, Filter, AlertCircle, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/Modal';

export const PaymentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlStudentId = searchParams.get('studentId');
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  // Ledger Filter State
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerClassFilter, setLedgerClassFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [modalClassFilter, setModalClassFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(urlStudentId || '');
  const [selectedStudentFeeSummary, setSelectedStudentFeeSummary] = useState<any>(null);
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'UPI' | 'bank_transfer' | 'cheque' | 'other'>('UPI');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [printingPaymentId, setPrintingPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (urlStudentId) {
      setSelectedStudentId(urlStudentId);
      setIsRecordModalOpen(true);
    }
  }, [urlStudentId]);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const [payRes, stuRes, clsRes] = await Promise.all([
        api.get('/payments'),
        api.get('/students'),
        api.get('/classes')
      ]);

      if (payRes.data?.success) setPayments(payRes.data.data);
      if (stuRes.data?.success) {
        setStudents(stuRes.data.data);
      }
      if (clsRes.data?.success) setClasses(clsRes.data.data);
    } catch (err) {
      console.warn('Failed to load payments page data:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  // Initial Data Load
  useEffect(() => {
    fetchData();
  }, []);

  // Real-Time Background Auto-Sync (silent polling paused while modal or receipt is open)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRecordModalOpen && !isReceiptOpen) {
        fetchData(true);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isRecordModalOpen, isReceiptOpen]);

  // Memoized Filtered Students for Modal Selection
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = studentSearch.trim().toLowerCase();
      const matchesSearch = !q || 
        (s.fullName && s.fullName.toLowerCase().includes(q)) ||
        (s.registrationNumber && s.registrationNumber.toLowerCase().includes(q));
      
      const matchesClass = !modalClassFilter || 
        s.classId === modalClassFilter || 
        s.class_id === modalClassFilter ||
        s.className === modalClassFilter ||
        s.className === classes.find(c => c.id === modalClassFilter)?.name;

      return matchesSearch && matchesClass;
    });
  }, [students, studentSearch, modalClassFilter, classes]);

  // Default select first student if none selected or if selection fell out of filtered list
  useEffect(() => {
    if (isRecordModalOpen && filteredStudents.length > 0) {
      const currentExists = filteredStudents.some(s => s.id === selectedStudentId);
      if (!currentExists) {
        setSelectedStudentId(filteredStudents[0].id);
        setSelectedStudentFeeSummary(null);
      }
    }
  }, [filteredStudents, isRecordModalOpen]);

  // Find Current Selected Student Record
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Derived Real-Time Balance
  const activeFeeSummary = selectedStudentFeeSummary || currentStudent?.feeSummary;
  const currentBalance = useMemo(() => {
    if (activeFeeSummary && activeFeeSummary.balance !== undefined) {
      return Number(activeFeeSummary.balance);
    }
    return 0;
  }, [activeFeeSummary]);

  // Auto-Fill Amount on Modal Open or Student Change
  useEffect(() => {
    if (currentBalance > 0) {
      setAmount(String(currentBalance));
    } else {
      setAmount('');
    }
  }, [currentBalance, selectedStudentId]);

  // Real-Time Fresh Balance Fetch on Student Selection Change
  useEffect(() => {
    if (!selectedStudentId) {
      setSelectedStudentFeeSummary(null);
      return;
    }

    let isMounted = true;
    setIsFeeLoading(true);

    api.get(`/fees/student-fees/${selectedStudentId}/summary`)
      .then(res => {
        if (isMounted) {
          if (res.data?.success && res.data?.feeSummary) {
            setSelectedStudentFeeSummary(res.data.feeSummary);
          }
        }
      })
      .catch(err => {
        console.warn('Fee summary fetch error:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsFeeLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedStudentId]);

  // Filtered Payments for Main Ledger Table
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const q = ledgerSearch.toLowerCase().trim();
      const matchesSearch = !ledgerSearch || 
        (p.receiptNumber && p.receiptNumber.toLowerCase().includes(q)) ||
        (p.studentName && p.studentName.toLowerCase().includes(q)) ||
        (p.registrationNumber && p.registrationNumber.toLowerCase().includes(q));

      const matchesClass = !ledgerClassFilter || 
        p.classId === ledgerClassFilter || 
        p.class_id === ledgerClassFilter || 
        p.className === classes.find(c => c.id === ledgerClassFilter)?.name;

      return matchesSearch && matchesClass;
    });
  }, [payments, ledgerSearch, ledgerClassFilter, classes]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    const targetStudentId = selectedStudentId || (filteredStudents.length > 0 ? filteredStudents[0].id : '');
    if (!targetStudentId) {
      setModalError('Please select a student from the dropdown list.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setModalError('Please enter a valid payment amount greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/payments', {
        studentId: targetStudentId,
        amount: numericAmount,
        paymentMethod,
        transactionReference: transactionReference?.trim() || undefined,
        notes: notes?.trim() || undefined
      });

      if (res.data.success) {
        setIsRecordModalOpen(false);
        setAmount('');
        setTransactionReference('');
        setNotes('');
        setModalError('');
        
        // Fetch generated printable receipt details instantly
        const receiptRes = await api.get(`/payments/${res.data.data.payment.id}/receipt`);
        if (receiptRes.data.success) {
          setReceiptData(receiptRes.data.data);
          setIsReceiptOpen(true);
        }
        await fetchData(true);
      }
    } catch (err: any) {
      console.error('Record Payment Error:', err);
      setModalError(err.response?.data?.message || 'Failed to record payment. Please check student and amount details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReceipt = async (paymentId: string) => {
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
      alert(err.response?.data?.message || 'Failed to load receipt details. Please try again.');
    } finally {
      setPrintingPaymentId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-[#F3F4F6]">
      <PageHeader
        title="Fee Payments & Receipt Register"
        subtitle="Record student fee payments, generate printable dual receipts (School & Student Copy), and manage history."
        action={
          <button
            onClick={() => {
              setModalError('');
              setIsRecordModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          <input
            type="text"
            value={ledgerSearch}
            onChange={(e) => setLedgerSearch(e.target.value)}
            placeholder="Search receipt, student name, reg no..."
            className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-10 pr-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
          <div className="relative w-full md:w-52">
            <select
              value={ledgerClassFilter}
              onChange={(e) => setLedgerClassFilter(e.target.value)}
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="" className="bg-[#1F2937] text-[#F3F4F6]">-- All Classes --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#1F2937] text-[#F3F4F6]">{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MOBILE RECEIPTS STACK (< 768px) */}
      <div className="block md:hidden space-y-2.5">
        {isLoading ? (
          <div className="p-6 text-center text-[#9CA3AF] bg-[#1F2937] rounded-lg border border-[#303B4D] text-xs font-medium">
            Loading payments ledger...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-6 text-center text-[#9CA3AF] bg-[#1F2937] rounded-lg border border-[#303B4D] text-xs font-medium">
            No payments recorded yet.
          </div>
        ) : (
          filteredPayments.map((p) => (
            <div key={p.id} className="p-3.5 bg-[#1F2937] hover:bg-[#243244]/60 rounded-lg border border-[#303B4D] space-y-2 transition-colors">
              <div className="flex items-center justify-between border-b border-[#303B4D] pb-2">
                <div>
                  <span className="font-mono font-medium text-blue-400 text-xs">{p.receiptNumber}</span>
                  <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">{p.paymentDate || p.createdAt?.split('T')[0]}</p>
                </div>
                <span className="font-mono font-semibold text-[#22C55E] text-sm">
                  ₹ {p.amount?.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-medium text-[#F3F4F6] leading-tight">{p.studentName}</h4>
                  <span className="text-[11px] text-[#9CA3AF]">{p.className} {p.sectionName ? `- ${p.sectionName}` : ''}</span>
                </div>

                <span className="px-2 py-0.5 bg-[#243244] text-[#9CA3AF] uppercase text-[10px] rounded border border-[#303B4D]">
                  {p.paymentMethod}
                </span>
              </div>

              <div className="pt-2 border-t border-[#303B4D] flex justify-end">
                <button
                  disabled={printingPaymentId === p.id}
                  onClick={() => handleViewReceipt(p.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#243244] hover:bg-gray-700 text-blue-400 border border-[#303B4D] font-medium text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  {printingPaymentId === p.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  ) : (
                    <Printer className="w-3.5 h-3.5" />
                  )}
                  <span>{printingPaymentId === p.id ? 'Loading...' : 'Print A4 Receipt'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP PAYMENTS TABLE (>= 768px) */}
      <div className="hidden md:block bg-[#1F2937] rounded-lg border border-[#303B4D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#243244] border-b border-[#303B4D] text-[#9CA3AF] font-medium text-xs">
                <th className="py-2.5 px-5 w-32">Receipt No</th>
                <th className="py-2.5 px-5">Student Name</th>
                <th className="py-2.5 px-5 w-36">Class & Section</th>
                <th className="py-2.5 px-5 w-32">Payment Date</th>
                <th className="py-2.5 px-5 text-center w-28">Method</th>
                <th className="py-2.5 px-5 text-right w-36">Amount Paid</th>
                <th className="py-2.5 px-5 text-center w-36">Receipt Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303B4D] bg-[#1F2937]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[#9CA3AF]">Loading payments ledger...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#9CA3AF]">No payment receipts found matching your search.</td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#243244]/60 transition-colors">
                    <td className="py-2.5 px-5 font-mono font-medium text-blue-400 tabular-nums">{p.receiptNumber}</td>
                    <td className="py-2.5 px-5 font-medium text-[#F3F4F6]">{p.studentName}</td>
                    <td className="py-2.5 px-5">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#243244] text-[#F3F4F6] border border-[#303B4D]">
                        {p.className} {p.sectionName ? `- ${p.sectionName}` : ''}
                      </span>
                    </td>
                    <td className="py-2.5 px-5 font-mono text-[#9CA3AF] tabular-nums">{p.paymentDate || p.createdAt?.split('T')[0]}</td>
                    <td className="py-2.5 px-5 text-center">
                      <span className="inline-block px-2 py-0.5 bg-[#243244] text-[#9CA3AF] uppercase text-[10px] rounded border border-[#303B4D]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-5 text-right font-mono font-semibold text-[#22C55E] tabular-nums">
                      ₹ {p.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-5 text-center">
                      <button
                        disabled={printingPaymentId === p.id}
                        onClick={() => handleViewReceipt(p.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#243244] hover:bg-gray-700 text-blue-400 border border-[#303B4D] font-medium text-xs rounded-lg transition-colors disabled:opacity-50"
                      >
                        {printingPaymentId === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        ) : (
                          <Printer className="w-3.5 h-3.5" />
                        )}
                        <span>{printingPaymentId === p.id ? 'Loading...' : 'Print A4 Receipt'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#1F2937] border-t border-[#303B4D] flex items-center justify-between text-xs text-[#9CA3AF]">
          <span>
            Total Transactions: <strong className="text-[#F3F4F6] font-medium">{filteredPayments.length}</strong> {filteredPayments.length === 1 ? 'receipt' : 'receipts'} recorded
          </span>
        </div>
      </div>

      {/* RECORD FEE PAYMENT MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Student Fee Payment"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-red-950/40 border border-red-800/40 text-[#EF4444] rounded-lg text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Class Filter & Search for Student */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">
                Filter by Class
              </label>
              <select
                value={modalClassFilter}
                onChange={(e) => setModalClassFilter(e.target.value)}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 pr-8 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-[#1F2937] text-[#F3F4F6]">-- All Classes --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#1F2937] text-[#F3F4F6]">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">
                Search Student Name
              </label>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search name or Reg No..."
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none placeholder-[#9CA3AF]"
              />
            </div>
          </div>

          {/* Student Selection Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">
              Select Student * ({filteredStudents.length} available)
            </label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setSelectedStudentFeeSummary(null);
              }}
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 pr-8 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {filteredStudents.length === 0 ? (
                <option value="" className="bg-[#1F2937] text-[#9CA3AF]">No students available for filter</option>
              ) : (
                filteredStudents.map(s => {
                  const bal = s.feeSummary?.balance !== undefined ? Number(s.feeSummary.balance) : 0;
                  const balLabel = bal <= 0 ? 'PAID IN FULL ✓' : `Bal: ₹ ${bal.toLocaleString('en-IN')}`;
                  return (
                    <option key={s.id} value={s.id} className="bg-[#1F2937] text-[#F3F4F6]">
                      {s.fullName} ({s.registrationNumber}) — {s.className || 'Class'} ({balLabel})
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Real-time Outstanding Balance Banner */}
          <div className="p-3 bg-[#243244] border border-[#303B4D] rounded-lg flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">
                Current Outstanding Balance:
              </span>
              {currentStudent && (
                <span className="text-xs text-[#F3F4F6] font-medium mt-0.5">
                  {currentStudent.fullName} ({currentStudent.className || 'Class'})
                </span>
              )}
            </div>
            <div className="text-right">
              {isFeeLoading && !activeFeeSummary ? (
                <span className="text-[#9CA3AF] text-xs flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /> Fetching...
                </span>
              ) : currentBalance <= 0 ? (
                <span className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/40 text-[#22C55E] font-medium text-xs rounded-md inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PAID IN FULL
                </span>
              ) : (
                <span className="font-mono font-semibold text-[#F59E0B] text-base tabular-nums">
                  ₹ {currentBalance.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Payment Amount & Method Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider">
                  Payment Amount (INR) *
                </label>
                {currentBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(String(currentBalance))}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium underline cursor-pointer transition-colors"
                  >
                    Full Due
                  </button>
                )}
              </div>
              <input
                required
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] focus:border-blue-500 focus:outline-none placeholder-[#9CA3AF] tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 pr-8 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="UPI" className="bg-[#1F2937] text-[#F3F4F6]">UPI / GPay / PhonePe</option>
                <option value="cash" className="bg-[#1F2937] text-[#F3F4F6]">Cash</option>
                <option value="bank_transfer" className="bg-[#1F2937] text-[#F3F4F6]">Bank Transfer / NEFT</option>
                <option value="cheque" className="bg-[#1F2937] text-[#F3F4F6]">Cheque</option>
                <option value="other" className="bg-[#1F2937] text-[#F3F4F6]">Other</option>
              </select>
            </div>
          </div>

          {/* Reference Number & Remarks Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">
                Transaction Ref / Cheque No
              </label>
              <input
                type="text"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="e.g. UPI-9876543210 or Cheque #000123"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] focus:border-blue-500 focus:outline-none placeholder-[#9CA3AF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">
                Notes / Remarks (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Paid at administrative desk"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none placeholder-[#9CA3AF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting ? 'Recording Payment...' : 'Record Payment & Generate A4 Receipt'}</span>
          </button>
        </form>
      </Modal>

      {/* PRINTABLE A4 DUAL RECEIPT PREVIEW MODAL */}
      {isReceiptOpen && receiptData && (
        <Modal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          title={`Printable A4 Dual Receipt Preview — ${receiptData.payment?.receiptNumber}`}
          maxWidth="5xl"
        >
          <PrintableReceipt receipt={receiptData} onClose={() => setIsReceiptOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default PaymentsPage;
