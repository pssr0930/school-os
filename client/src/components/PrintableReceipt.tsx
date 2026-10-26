import React, { useRef, useState, useEffect } from 'react';
import { Printer, Download, X, Scissors, Loader2, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { numberToWordsIndian } from '../utils/numberToWords';

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
  recordedByName?: string;
}

const ReceiptHalf: React.FC<ReceiptHalfProps> = ({ copyType, school = {}, student = {}, payment = {}, feeSummary = {}, recordedByName }) => {
  const logoUrl = school.logoUrl || school.logo_url || '/pssr-logo.png';
  
  // Fee Breakdown calculations
  const baseFee = feeSummary?.baseFee || feeSummary?.base_fee || 17200;
  const previousDue = feeSummary?.previousYearDue || feeSummary?.previous_year_due || 0;
  const concession = feeSummary?.concessionAmount || feeSummary?.concession_amount || 0;
  
  const tuitionFee = Math.round(baseFee * 0.75);
  const termExamFee = Math.round(baseFee * 0.15);
  const otherFee = baseFee - tuitionFee - termExamFee;

  const totalPayable = feeSummary?.finalFee || feeSummary?.final_fee || (baseFee + previousDue - concession);
  const amountPaid = payment?.amount || 0;
  const balanceDue = feeSummary?.balance !== undefined 
    ? feeSummary.balance 
    : Math.max(0, totalPayable - (feeSummary?.amountPaid || feeSummary?.amount_paid || amountPaid));

  const formattedDate = payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const amountInWords = numberToWordsIndian(amountPaid);

  return (
    <div className="receipt-half bg-white p-3.5 text-slate-900 border border-slate-300 rounded-md shadow-none flex flex-col justify-between h-[480px] box-border relative overflow-hidden">
      {/* 1. HEADER: SCHOOL IDENTITY & RECEIPT TITLE */}
      <div className="flex items-start justify-between pb-2.5 border-b border-slate-300">
        {/* Left: School Logo & Info */}
        <div className="flex items-center gap-2.5">
          <img 
            src={logoUrl} 
            alt="School Logo" 
            crossOrigin="anonymous"
            onError={(e) => {
              // Fallback to local logo if cross-origin or broken
              (e.currentTarget as HTMLImageElement).src = '/pssr-logo.png';
            }}
            className="w-10 h-10 object-contain rounded bg-white p-0.5 border border-slate-200 shrink-0" 
          />
          <div>
            <h1 className="font-extrabold text-[13px] text-slate-900 tracking-tight leading-tight uppercase">
              {school.name || 'Murthy High School'}
            </h1>
            <p className="text-[9.5px] text-slate-600 font-medium leading-tight mt-0.5">
              {school.address || 'Sarpavaram police station road, near SRMT mall, Kakinada'} {school.phone ? `• Ph: ${school.phone}` : ''}
            </p>
          </div>
        </div>

        {/* Right: Receipt Meta */}
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1.5">
            <h2 className="font-black text-sm uppercase tracking-wider text-slate-900">FEE RECEIPT</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-900 font-black text-[9px] uppercase rounded border border-slate-300 tracking-wide">
              {copyType}
            </span>
          </div>
          <p className="text-[11px] font-mono font-extrabold text-slate-900 mt-0.5">
            Receipt No: <span className="font-black">{payment.receiptNumber || 'REC-00001'}</span>
          </p>
          <p className="text-[9.5px] text-slate-600 font-medium">
            Date: {formattedDate}
          </p>
        </div>
      </div>

      {/* 2. STUDENT DETAILS STRIP */}
      <div className="my-1.5 py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded text-[10.5px] font-semibold text-slate-800 flex items-center justify-between flex-wrap gap-x-2 gap-y-0.5">
        <div>Student: <span className="font-extrabold text-slate-900">{student.fullName || 'Student'}</span></div>
        <div>Reg. No: <span className="font-mono font-bold text-slate-900">{student.registrationNumber || 'N/A'}</span></div>
        <div>Class: <span className="font-bold text-slate-900">{student.className || 'LKG'}{student.sectionName ? ` - ${student.sectionName}` : ''}</span></div>
        <div>Father: <span className="font-bold text-slate-900">{student.fatherName || 'Parent'}</span></div>
      </div>

      {/* 3. FEE PARTICULARS TABLE & PAYMENT LEDGER */}
      <div className="space-y-1.5 my-1 flex-1">
        <table className="w-full text-left border-collapse border border-slate-300 text-[10.5px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px] border-b border-slate-300">
              <th className="py-1 px-2.5 border-r border-slate-300">Fee Particulars</th>
              <th className="py-1 px-2.5 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
            <tr>
              <td className="py-1 px-2.5 border-r border-slate-200">Tuition & Term Fee</td>
              <td className="py-1 px-2.5 text-right font-mono font-bold">₹{tuitionFee.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td className="py-1 px-2.5 border-r border-slate-200">Exam & Lab Fee</td>
              <td className="py-1 px-2.5 text-right font-mono font-bold">₹{termExamFee.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td className="py-1 px-2.5 border-r border-slate-200">Activity & Development Fee</td>
              <td className="py-1 px-2.5 text-right font-mono font-bold">₹{otherFee.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        {/* Ledger & Outstanding Summary */}
        <div className="bg-slate-50 border border-slate-300 rounded p-2 text-[10.5px] space-y-1">
          <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium text-[10px]">
            <div className="flex items-center justify-between border-r border-slate-200 pr-2">
              <span>Previous Due:</span>
              <span className="font-mono font-bold text-slate-900">₹{previousDue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between pl-1">
              <span>Total Payable:</span>
              <span className="font-mono font-bold text-slate-900">₹{totalPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-[11px]">
              <span>Amount Paid:</span>
              <span className="font-mono font-black text-xs text-slate-900 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                ₹{amountPaid.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              {balanceDue <= 0 ? (
                <span className="font-black text-[9.5px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded tracking-wide uppercase">
                  BALANCE DUE: ₹0 — PAID IN FULL
                </span>
              ) : (
                <span className="font-black text-[10.5px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded inline-flex items-center gap-1 font-mono">
                  <span className="font-sans font-bold text-[9px] uppercase text-red-600">Balance Due:</span>
                  <span>₹{balanceDue.toLocaleString('en-IN')}</span>
                </span>
              )}
            </div>
          </div>

          {/* Amount in Words */}
          <div className="pt-1 border-t border-slate-200 text-[9.5px] text-slate-600 font-medium italic">
            In Words: <span className="font-bold text-slate-800 not-italic">{amountInWords}</span>
          </div>
        </div>
      </div>

      {/* 4. FOOTER: PAYMENT MODE & SIGNATURE */}
      <div className="pt-2 border-t border-slate-300 flex items-end justify-between text-[10px]">
        <div>
          <p className="font-bold text-slate-800 text-[10px]">
            Mode: <span className="font-extrabold text-slate-900 uppercase">{payment.paymentMethod || 'Cash'}</span>
            {payment.transactionReference ? (
              <span className="font-mono font-normal text-slate-600 ml-1">({payment.transactionReference})</span>
            ) : null}
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">
            Cashier / Clerk: {recordedByName || 'Office Staff'}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-3">Authorized Signature</p>
          <div className="w-28 border-b border-slate-400 inline-block" />
        </div>
      </div>
    </div>
  );
};

export const PrintableReceipt: React.FC<ReceiptDataProps> = ({ receipt, onClose }) => {
  const { 
    payment = {} as any, 
    school = {} as any, 
    student = {} as any, 
    feeSummary = {} as any, 
    recordedByName 
  } = receipt;
  const printRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Auto-fit scale factor for A4 Portrait preview
  useEffect(() => {
    const handleResize = () => {
      const maxH = Math.min(window.innerHeight - 180, 1050);
      const scaleH = maxH / 1060;
      const maxW = Math.min(window.innerWidth - 64, 760);
      const scaleW = maxW / 760;
      
      const fitScale = Math.min(scaleW, scaleH, 1);
      setScale(Math.max(fitScale, 0.45));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Direct Browser Native Print Preview (Clean & Instant)
  const handlePrint = () => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'visible';

    // Open browser native print preview
    window.print();

    // Restore body overflow after print dialog closes
    setTimeout(() => {
      document.body.style.overflow = originalOverflow;
    }, 1000);
  };

  // Direct PDF File Generation and Download using jsPDF & html2canvas
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGeneratingPDF(true);
    setPdfSuccess(false);

    try {
      // Temporarily remove transform on cloned or original for high-res raster
      const element = printRef.current;
      const originalTransform = element.style.transform;
      element.style.transform = 'none';

      const canvas = await html2canvas(element, {
        scale: 2, // 2x DPI for crisp print quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Restore transform preview
      element.style.transform = originalTransform;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210; // A4 mm
      const pdfHeight = 297;
      const contentWidth = 194;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      const marginX = (pdfWidth - contentWidth) / 2;
      const marginY = 6;

      pdf.addImage(imgData, 'PNG', marginX, marginY, contentWidth, Math.min(contentHeight, pdfHeight - 12));

      const receiptNum = (payment?.receiptNumber || 'REC').replace(/[^a-zA-Z0-9_-]/g, '_');
      const studentName = (student?.fullName || 'student').replace(/\s+/g, '_');
      const filename = `Fee_Receipt_${receiptNum}_${studentName}.pdf`;

      pdf.save(filename);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('PDF generation error, opening browser print fallback:', err);
      handlePrint();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. ACTION TOOLBAR (HIDDEN IN PRINT) */}
      <div className="no-print bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between gap-4 shadow-lg border border-slate-800 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-wider">
            A4 Portrait
          </span>
          <span className="text-xs text-slate-300 font-medium hidden sm:inline">
            Official Dual Copy (Parent & School Copy)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            disabled={isGeneratingPDF}
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved PDF!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. A4 PORTRAIT RECEIPT CONTAINER */}
      <div className="overflow-x-auto flex justify-center bg-slate-100 p-3 sm:p-4 rounded-2xl border border-slate-200">
        <div 
          ref={printRef}
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          className="printable-receipt-area print-area w-[740px] bg-white p-5 shadow-xl border border-slate-300 space-y-3 box-border font-sans transition-transform duration-200"
        >
          {/* TOP COPY: PARENT COPY */}
          <ReceiptHalf 
            copyType="PARENT COPY"
            school={school}
            student={student}
            payment={payment}
            feeSummary={feeSummary}
            recordedByName={recordedByName}
          />

          {/* PERFORATION DIVIDER */}
          <div className="my-1.5 border-b-2 border-dashed border-slate-400 relative flex items-center justify-center">
            <span className="bg-white px-3 text-[9px] text-slate-500 font-extrabold uppercase tracking-widest flex items-center gap-1 border border-slate-200 rounded-full py-0.5">
              <Scissors className="w-3 h-3 text-slate-600" />
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
            recordedByName={recordedByName}
          />
        </div>
      </div>

      {/* 3. STRICT MEDIA PRINT STYLES FOR BROWSER PRINT ENGINE & PREVIEW */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 6mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            overflow: visible !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          .printable-receipt-area,
          .printable-receipt-area *,
          .print-area,
          .print-area * {
            visibility: visible !important;
          }
          .printable-receipt-area,
          .print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            transform: none !important;
            z-index: 9999999 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          .receipt-half {
            height: 480px !important;
            border: 1px solid #cbd5e1 !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
          }
          .no-print,
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintableReceipt;
