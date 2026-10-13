import React, { useRef, useState, useEffect } from 'react';
import { Printer, Download, X, Scissors } from 'lucide-react';

export interface ReceiptDataProps {
  receipt: {
    payment: {
      id?: string;
      receiptNumber: string;
      paymentDate: string;
      amount: number;
      paymentMethod: string;
      transactionReference?: string;
      notes?: string;
    };
    school: {
      name: string;
      address: string;
      city?: string;
      state?: string;
      phone: string;
      email?: string;
      defaultCurrency?: string;
      logoUrl?: string;
      logo_url?: string;
    };
    student: {
      id?: string;
      fullName: string;
      registrationNumber: string;
      studentCode?: string;
      className: string;
      sectionName: string;
      fatherName?: string;
      fatherPhone?: string;
      motherPhone?: string;
    };
    feeSummary?: {
      previousYearDue?: number;
      previous_year_due?: number;
      baseFee?: number;
      base_fee?: number;
      concessionAmount?: number;
      concession_amount?: number;
      finalFee?: number;
      final_fee?: number;
      amountPaid?: number;
      amount_paid?: number;
      balance?: number;
    };
    recordedByName?: string;
  };
  onClose?: () => void;
}

interface ReceiptHalfProps {
  copyType: 'PARENT COPY' | 'SCHOOL COPY';
  school: any;
  student: any;
  payment: any;
  feeSummary: any;
}

const ReceiptHalf: React.FC<ReceiptHalfProps> = ({ copyType, school, student, payment, feeSummary }) => {
  const logoUrl = school.logoUrl || school.logo_url || '/pssr-logo.png';
  
  // Calculate Fee Components for Clean Particulars Breakdown
  const baseFee = feeSummary?.baseFee || feeSummary?.base_fee || 15000;
  const previousDue = feeSummary?.previousYearDue || feeSummary?.previous_year_due || 0;
  const concession = feeSummary?.concessionAmount || feeSummary?.concession_amount || 0;
  
  const tuitionFee = Math.round(baseFee * 0.75);
  const transportFee = Math.round(baseFee * 0.15);
  const otherFee = baseFee - tuitionFee - transportFee;

  const totalPayable = feeSummary?.finalFee || feeSummary?.final_fee || (baseFee + previousDue - concession);
  const amountPaid = payment?.amount || 0;
  const balanceDue = feeSummary?.balance !== undefined ? feeSummary.balance : Math.max(0, totalPayable - (feeSummary?.amountPaid || feeSummary?.amount_paid || amountPaid));

  const formattedDate = payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-white p-4 text-slate-900 border border-slate-300 rounded-lg shadow-none flex flex-col justify-between h-[495px] box-border relative">
      {/* 1. RECEIPT HEADER */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-300">
        {/* Left: School Logo & Info */}
        <div className="flex items-center gap-3">
          <img 
            src={logoUrl} 
            alt="School Logo" 
            className="w-11 h-11 object-contain rounded bg-white p-0.5 border border-slate-200 shrink-0" 
          />
          <div>
            <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-tight uppercase">
              {school.name || 'Murthy High School'}
            </h1>
            <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
              {school.address || 'Kakinada, Andhra Pradesh'} {school.phone ? `• Ph: ${school.phone}` : ''}
            </p>
          </div>
        </div>

        {/* Right: Receipt Title & Meta */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <h2 className="font-black text-base uppercase tracking-wider text-slate-900">FEE RECEIPT</h2>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-900 font-black text-[10px] uppercase rounded border border-slate-300 tracking-wide">
              {copyType}
            </span>
          </div>
          <p className="text-xs font-mono font-extrabold text-slate-900 mt-1">
            Receipt No: <span className="font-black">{payment.receiptNumber || 'REC-00001'}</span>
          </p>
          <p className="text-[10px] text-slate-600 font-medium mt-0.5">
            Date: {formattedDate}
          </p>
        </div>
      </div>

      {/* 2. STUDENT INFORMATION BAR */}
      <div className="my-2.5 py-2 px-3 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-800 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
        <div>Student: <span className="font-extrabold text-slate-900">{student.fullName || 'Rahul Sharma'}</span></div>
        <div>Reg. No: <span className="font-mono font-bold text-slate-900">{student.registrationNumber || 'STU-1025'}</span></div>
        <div>Class: <span className="font-bold text-slate-900">{student.className || '7'}-{student.sectionName || 'A'}</span></div>
        <div>Year: <span className="font-bold text-slate-900">2026-27</span></div>
      </div>

      {/* 3. FEE DETAILS & PAYMENT SUMMARY */}
      <div className="space-y-2.5 my-1.5 flex-1">
        {/* Particulars Table */}
        <table className="w-full text-left border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-300">
              <th className="py-1.5 px-3 border-r border-slate-300">Particulars</th>
              <th className="py-1.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
            <tr>
              <td className="py-1.5 px-3 border-r border-slate-200">Tuition Fee</td>
              <td className="py-1.5 px-3 text-right font-mono font-bold">₹{tuitionFee.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td className="py-1.5 px-3 border-r border-slate-200">Transport Fee</td>
              <td className="py-1.5 px-3 text-right font-mono font-bold">₹{transportFee.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td className="py-1.5 px-3 border-r border-slate-200">Other Fee</td>
              <td className="py-1.5 px-3 text-right font-mono font-bold">₹{otherFee.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        {/* Payment Summary Grid */}
        <div className="bg-slate-50 border border-slate-300 rounded p-3 text-xs space-y-1.5">
          <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium text-[11px]">
            <div className="flex items-center justify-between border-r border-slate-200 pr-3">
              <span>Previous Due:</span>
              <span className="font-mono font-bold text-slate-900">₹{previousDue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between pl-1">
              <span>Total Payable:</span>
              <span className="font-mono font-bold text-slate-900">₹{totalPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
              <span>Amount Paid:</span>
              <span className="font-mono font-black text-sm text-slate-900">₹{amountPaid.toLocaleString('en-IN')}</span>
            </div>

            <div>
              {balanceDue <= 0 ? (
                <span className="font-black text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded tracking-wide uppercase">
                  BALANCE DUE: ₹0 — PAID IN FULL
                </span>
              ) : (
                <span className="font-black text-xs text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded inline-flex items-center gap-2 font-mono">
                  <span className="font-sans font-bold text-[10px] uppercase text-red-600">Balance Due:</span>
                  <span>₹{balanceDue.toLocaleString('en-IN')}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. PAYMENT INFORMATION & FOOTER */}
      <div className="pt-3 border-t border-slate-300 flex items-end justify-between text-xs">
        <div>
          <p className="font-bold text-slate-800 text-[11px]">
            Payment Mode: <span className="font-extrabold text-slate-900 uppercase">{payment.paymentMethod || 'Cash'}</span>
            {payment.transactionReference ? (
              <span className="font-mono font-normal text-slate-600 ml-1">({payment.transactionReference})</span>
            ) : null}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-5">Authorized Signature</p>
          <div className="w-36 border-b border-slate-400 inline-block" />
        </div>
      </div>
    </div>
  );
};

export const PrintableReceipt: React.FC<ReceiptDataProps> = ({ receipt, onClose }) => {
  const { payment, school, student, feeSummary } = receipt;
  const printRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  // Auto-fit scale factor for A4 Portrait preview in desktop & laptop viewports
  useEffect(() => {
    const handleResize = () => {
      const maxH = Math.min(window.innerHeight - 160, 1050);
      const scaleH = maxH / 1080;
      const maxW = Math.min(window.innerWidth - 64, 794);
      const scaleW = maxW / 794;
      
      const fitScale = Math.min(scaleW, scaleH, 1);
      setScale(Math.max(fitScale, 0.45));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* 1. ACTION BUTTONS BAR (HIDDEN IN PRINT) */}
      <div className="no-print bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between gap-4 shadow-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-wider">
            A4 Portrait
          </span>
          <span className="text-xs text-slate-300 font-medium">Dual Copy Printable Receipt (Parent & School Copy)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. PRINTABLE A4 PORTRAIT TWO-COPY CONTAINER */}
      <div className="overflow-x-auto flex justify-center bg-slate-100 p-4 rounded-2xl border border-slate-200">
        <div 
          ref={printRef}
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          className="print-area w-[760px] min-h-[1050px] bg-white p-6 shadow-xl border border-slate-300 space-y-4 box-border font-sans transition-transform duration-200"
        >
          {/* TOP COPY: PARENT COPY */}
          <ReceiptHalf 
            copyType="PARENT COPY"
            school={school}
            student={student}
            payment={payment}
            feeSummary={feeSummary}
          />

          {/* PERFORATION LINE */}
          <div className="my-2 border-b-2 border-dashed border-slate-400 relative flex items-center justify-center">
            <span className="bg-white px-4 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5 border border-slate-200 rounded-full py-0.5">
              <Scissors className="w-3.5 h-3.5 text-slate-600" />
              <span>PERFORATION LINE — CUT HERE</span>
            </span>
          </div>

          {/* BOTTOM COPY: SCHOOL COPY */}
          <ReceiptHalf 
            copyType="SCHOOL COPY"
            school={school}
            student={student}
            payment={payment}
            feeSummary={feeSummary}
          />
        </div>
      </div>

      {/* 3. STRICT A4 PORTRAIT PRINT MEDIA STYLES */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 8mm 10mm !important;
            box-sizing: border-box !important;
            border: none !important;
            box-shadow: none !important;
            transform: scale(1) !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintableReceipt;
