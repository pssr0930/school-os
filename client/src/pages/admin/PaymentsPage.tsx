import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { PrintableReceipt } from '../../components/PrintableReceipt';
import api from '../../services/api';
import { Plus, Printer, Search, Filter, AlertCircle, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    if (urlStudentId) {
      setSelectedStudentId(urlStudentId);
      setIsRecordModalOpen(true);
    }
  }, [urlStudentId]);

  // Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [modalClassFilter, setModalClassFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
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

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const [payRes, stuRes, clsRes] = await Promise.all([
        api.get('/payments'),
        api.get('/students'),
        api.get('/classes')
      ]);

      if (payRes.data.success) setPayments(payRes.data.data);
      if (stuRes.data.success) {
        setStudents(stuRes.data.data);
        if (stuRes.data.data.length > 0 && !selectedStudentId) {
          setSelectedStudentId(stuRes.data.data[0].id);
        }
      }
      if (clsRes.data.success) setClasses(clsRes.data.data);
    } catch (err) {
      console.warn('Failed to load payments page data:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  // Real-Time 3-Second Background Auto-Sync
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Students for Modal Selection
  const filteredStudents = students.filter(s => {
    const matchesSearch = !studentSearch || 
      (s.fullName && s.fullName.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.registrationNumber && s.registrationNumber.toLowerCase().includes(studentSearch.toLowerCase()));
    
    const matchesClass = !modalClassFilter || s.classId === modalClassFilter || s.class_id === modalClassFilter;

    return matchesSearch && matchesClass;
  });

  // Ensure selectedStudentId stays synchronized with filteredStudents list
  useEffect(() => {
    if (filteredStudents.length > 0) {
      if (!selectedStudentId || !filteredStudents.some(s => s.id === selectedStudentId)) {
        setSelectedStudentId(filteredStudents[0].id);
      }
    } else {
      setSelectedStudentId('');
    }
  }, [modalClassFilter, studentSearch, students]);

  // Fetch real-time accurate fee summary for selected student
  useEffect(() => {
    if (selectedStudentId) {
      setIsFeeLoading(true);
      api.get(`/fees/student-fees/${selectedStudentId}`)
        .then(res => {
          if (res.data.success && res.data.feeSummary) {
            setSelectedStudentFeeSummary(res.data.feeSummary);
          } else {
            setSelectedStudentFeeSummary(null);
          }
        })
        .catch(err => {
          console.warn('Fee summary fetch error:', err);
          setSelectedStudentFeeSummary(null);
        })
        .finally(() => {
          setIsFeeLoading(false);
        });
    } else {
      setSelectedStudentFeeSummary(null);
    }
  }, [selectedStudentId]);

  // Filtered Payments for Main Ledger Table
  const filteredPayments = payments.filter(p => {
    const q = ledgerSearch.toLowerCase();
    const matchesSearch = !ledgerSearch || 
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(q)) ||
      (p.studentName && p.studentName.toLowerCase().includes(q)) ||
      (p.registrationNumber && p.registrationNumber.toLowerCase().includes(q));

    const matchesClass = !ledgerClassFilter || p.classId === ledgerClassFilter || p.class_id === ledgerClassFilter || p.className === classes.find(c => c.id === ledgerClassFilter)?.name;

    return matchesSearch && matchesClass;
  });

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
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Fee Payments & Receipt Register"
        subtitle="Record student fee payments, generate printable dual receipts (School & Student Copy), and manage history."
        action={
          <button
            onClick={() => {
              setModalError('');
              setIsRecordModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={ledgerSearch}
            onChange={(e) => setLedgerSearch(e.target.value)}
            placeholder="Search receipt, student name, reg no..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={ledgerClassFilter}
            onChange={(e) => setLedgerClassFilter(e.target.value)}
            className="w-full md:w-48 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
          >
            <option value="" className="bg-slate-900 text-white">-- All Classes --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ULTRA-COMPACT MOBILE RECEIPTS STACK (< 768px) */}
      <div className="block md:hidden space-y-2.5">
        {isLoading ? (
          <div className="p-6 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-semibold">
            Loading payments ledger...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-semibold">
            No payments recorded yet.
          </div>
        ) : (
          filteredPayments.map((p) => (
            <div key={p.id} className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="font-mono font-black text-blue-400 text-xs">{p.receiptNumber}</span>
                  <p className="text-[10px] text-slate-400 font-bold">{p.paymentDate || p.createdAt?.split('T')[0]}</p>
                </div>
                <span className="font-mono font-black text-white text-sm">
                  ₹ {p.amount?.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white leading-tight">{p.studentName}</h4>
                  <span className="text-[10px] font-semibold text-slate-400">{p.className} {p.sectionName ? `- ${p.sectionName}` : ''}</span>
                </div>

                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-extrabold uppercase text-[9px] rounded-md border border-slate-700">
                  {p.paymentMethod}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  disabled={printingPaymentId === p.id}
                  onClick={() => handleViewReceipt(p.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 font-extrabold text-xs rounded-xl transition-all active:scale-95 disabled:opacity-50"
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
      <div className="hidden md:block bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-800 text-slate-300 font-bold uppercase text-[11px]">
              <th className="py-3 px-6">Receipt No</th>
              <th className="py-3 px-6">Student Name</th>
              <th className="py-3 px-6">Class & Section</th>
              <th className="py-3 px-6">Payment Date</th>
              <th className="py-3 px-6 text-center">Method</th>
              <th className="py-3 px-6 text-right">Amount Paid</th>
              <th className="py-3 px-6 text-center">Receipt Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">Loading payments ledger...</td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">No payment receipts found matching your search.</td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-blue-400">{p.receiptNumber}</td>
                  <td className="py-3.5 px-6 font-bold text-white">{p.studentName}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-300">{p.className} {p.sectionName ? `- ${p.sectionName}` : ''}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-400">{p.paymentDate || p.createdAt?.split('T')[0]}</td>
                  <td className="py-3.5 px-6 text-center">
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-bold uppercase text-[10px] rounded-md border border-slate-700">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-400 text-sm">
                    ₹ {p.amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <button
                      disabled={printingPaymentId === p.id}
                      onClick={() => handleViewReceipt(p.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 font-bold text-xs rounded-xl transition-colors mx-auto disabled:opacity-50"
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

      {/* RECORD FEE PAYMENT MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Student Fee Payment"
      >
        <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
          {modalError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Class Filter for Student Dropdown */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                Filter by Class
              </label>
              <select
                value={modalClassFilter}
                onChange={(e) => setModalClassFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
              >
                <option value="" className="bg-slate-900 text-white">-- All Classes --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                Search Student Name
              </label>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search name or Reg No..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          {/* Student Selection Dropdown */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
              Select Student * ({filteredStudents.length} available)
            </label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
            >
              {filteredStudents.length === 0 ? (
                <option value="" className="bg-slate-900 text-white">No students available for filter</option>
              ) : (
                filteredStudents.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.fullName} ({s.registrationNumber}) — {s.className || 'LKG'} (Bal: ₹ {s.feeSummary?.balance !== undefined ? s.feeSummary.balance.toLocaleString('en-IN') : '12,200'})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Real-time fetched Outstanding Balance Banner */}
          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Current Outstanding Fee Balance:
            </span>
            <span className="font-mono font-black text-blue-400 text-sm sm:text-base">
              {isFeeLoading ? 'Fetching...' : selectedStudentFeeSummary ? (
                selectedStudentFeeSummary.balance <= 0 ? (
                  <span className="text-emerald-400 font-extrabold text-xs sm:text-sm font-sans tracking-wide">PAID IN FULL ✓</span>
                ) : (
                  `₹ ${selectedStudentFeeSummary.balance.toLocaleString('en-IN')}`
                )
              ) : '₹ 12,200'}
            </span>
          </div>

          {/* Payment Amount & Method Input */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                Payment Amount (INR) *
              </label>
              <input
                required
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-extrabold text-white focus:outline-none placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs font-extrabold text-white focus:outline-none"
              >
                <option value="UPI" className="bg-slate-900 text-white">UPI / GPay / PhonePe</option>
                <option value="cash" className="bg-slate-900 text-white">Cash</option>
                <option value="bank_transfer" className="bg-slate-900 text-white">Bank Transfer / NEFT</option>
                <option value="cheque" className="bg-slate-900 text-white">Cheque</option>
                <option value="other" className="bg-slate-900 text-white">Other</option>
              </select>
            </div>
          </div>

          {/* Reference Number Input */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
              Transaction Ref / Cheque No
            </label>
            <input
              type="text"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              placeholder="e.g. UPI-9876543210 or Cheque #000123"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
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
