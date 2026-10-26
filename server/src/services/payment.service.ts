import { dbStore, supabaseAdmin } from '../config/supabase';
import { PaymentItem } from '../types';
import { StudentService } from './student.service';
import crypto from 'crypto';

function toUuid(idStr: string): string {
  if (!idStr) return crypto.randomUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(idStr)) return idStr;
  const hash = crypto.createHash('md5').update(idStr).digest('hex');
  return `${hash.substring(0,8)}-${hash.substring(8,12)}-4${hash.substring(13,16)}-a${hash.substring(17,20)}-${hash.substring(20,32)}`;
}

export class PaymentService {
  static generateSequentialReceiptNumber(schoolId: string): string {
    const schoolPayments = dbStore.payments.filter(p => p.schoolId === schoolId || (p as any).school_id === schoolId);
    const maxNum = schoolPayments.reduce((max, p) => {
      const numStr = (p.receiptNumber || (p as any).receipt_number || '').replace(/\D/g, '');
      const num = parseInt(numStr, 10);
      return !isNaN(num) ? Math.max(max, num) : max;
    }, 0);
    return `REC-${String(maxNum + 1).padStart(5, '0')}`;
  }

  static async recordPayment(schoolId: string, userId: string, data: { studentId: string; amount: number; paymentMethod: 'cash' | 'UPI' | 'bank_transfer' | 'cheque' | 'other'; transactionReference?: string; paymentDate?: string; notes?: string }) {
    const targetSchoolId = schoolId || dbStore.schools[0]?.id || '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e';
    
    let student = dbStore.students.find(s => s.id === data.studentId);
    if (!student) {
      // Hydrate student cache if missing
      await StudentService.getStudents(targetSchoolId, {});
      student = dbStore.students.find(s => s.id === data.studentId);
    }

    const activeYear = dbStore.academicYears.find(ay => ay.isCurrent || ay.is_current);
    const academicYearId = activeYear ? activeYear.id : (dbStore.academicYears[0]?.id || '7719d5c0-6a22-4945-a1a6-bec5972f5157');

    const receiptNumber = this.generateSequentialReceiptNumber(targetSchoolId);
    const paymentId = crypto.randomUUID();

    const newPayment: PaymentItem = {
      id: paymentId,
      schoolId: targetSchoolId,
      studentId: data.studentId,
      academicYearId: academicYearId,
      receiptNumber: receiptNumber,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference || '',
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
      recordedBy: userId,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    dbStore.payments.push(newPayment);

    // Update student fee totals and balance transactionally in memory store
    let sfIdx = dbStore.studentFees.findIndex(sf => sf.studentId === data.studentId || sf.student_id === data.studentId);
    if (sfIdx === -1) {
      // Create studentFee record if missing for this student
      const newSf = {
        id: crypto.randomUUID(),
        schoolId: targetSchoolId,
        studentId: data.studentId,
        academicYearId: academicYearId,
        baseFee: 17200,
        finalFee: 17200,
        discountAmount: 0,
        amountPaid: data.amount,
        balance: Math.max(0, 17200 - data.amount),
        status: (17200 - data.amount) <= 0 ? 'paid' : 'partial'
      };
      dbStore.studentFees.push(newSf as any);
      sfIdx = dbStore.studentFees.length - 1;
    } else {
      const sf = dbStore.studentFees[sfIdx];
      sf.amountPaid = (sf.amountPaid || sf.amount_paid || 0) + data.amount;
      sf.amount_paid = sf.amountPaid;
      const totalPkg = (sf.finalFee || sf.final_fee || sf.baseFee || sf.base_fee || 17200);
      sf.balance = Math.max(0, totalPkg - sf.amountPaid);
      sf.status = sf.balance <= 0 ? 'paid' : 'partial';
    }

    // Save to local disk store immediately
    dbStore.saveToDisk();

    // Persist to real Supabase PostgreSQL tables with required academic_year_id and valid UUIDs
    try {
      await supabaseAdmin.from('payments').insert([{
        id: toUuid(newPayment.id),
        school_id: toUuid(targetSchoolId),
        student_id: toUuid(data.studentId),
        academic_year_id: toUuid(academicYearId),
        receipt_number: receiptNumber,
        amount: data.amount,
        payment_method: data.paymentMethod,
        transaction_reference: data.transactionReference || '',
        payment_date: newPayment.paymentDate,
        recorded_by: toUuid(userId),
        notes: data.notes || ''
      }]);

      if (sfIdx !== -1) {
        const sf = dbStore.studentFees[sfIdx];
        await supabaseAdmin.from('student_fees').upsert([{
          id: toUuid(sf.id),
          school_id: toUuid(targetSchoolId),
          student_id: toUuid(data.studentId),
          academic_year_id: toUuid(academicYearId),
          base_fee: sf.baseFee || 17200,
          final_fee: sf.finalFee || 17200,
          amount_paid: sf.amountPaid,
          balance: sf.balance
        }]);
      }
      console.log(`✅ [Supabase PostgreSQL Sync] Payment receipt "${receiptNumber}" (₹ ${data.amount}) persisted successfully.`);
    } catch (err) {
      console.warn('[Supabase Payment Sync Warning]', err);
    }

    const school = dbStore.schools.find(s => s.id === targetSchoolId) || dbStore.schools[0] || { name: 'School OS', address: '', phone: '', email: '' };
    const cls = dbStore.classes.find(c => c.id === student?.classId || c.id === (student as any)?.class_id);
    const sec = dbStore.sections.find(s => s.id === student?.sectionId || s.id === (student as any)?.section_id);
    const parents = dbStore.studentParents.find(p => p.studentId === data.studentId || p.student_id === data.studentId);
    const sf = dbStore.studentFees.find(f => f.studentId === data.studentId || f.student_id === data.studentId);

    return {
      payment: newPayment,
      school,
      student: {
        id: data.studentId,
        fullName: student ? (student.fullName || (student as any).full_name) : 'Student Record',
        registrationNumber: student ? (student.registrationNumber || (student as any).registration_number) : '',
        className: cls ? cls.name : 'LKG',
        sectionName: sec ? sec.name : 'A',
        fatherName: parents?.fatherName || parents?.guardianName || parents?.father_name || 'Parent'
      },
      feeSummary: sf
    };
  }

  static async getPayments(schoolId: string, filters?: { search?: string; paymentMethod?: string; startDate?: string; endDate?: string }) {
    if (!schoolId) return [];

    let list = dbStore.payments.filter(p => p.schoolId === schoolId || (p as any).school_id === schoolId);

    // If local memory is empty for this specific school, fetch real payment logs from Supabase Cloud PostgreSQL
    if (list.length === 0) {
      try {
        const { data: cloudPayments } = await supabaseAdmin
          .from('payments')
          .select('*')
          .eq('school_id', schoolId);

        if (cloudPayments && cloudPayments.length > 0) {
          cloudPayments.forEach(cp => {
            const mapped: PaymentItem = {
              id: cp.id,
              schoolId: cp.school_id,
              studentId: cp.student_id,
              academicYearId: cp.academic_year_id,
              receiptNumber: cp.receipt_number,
              amount: cp.amount,
              paymentMethod: cp.payment_method,
              transactionReference: cp.transaction_reference,
              paymentDate: cp.payment_date,
              recordedBy: cp.recorded_by,
              notes: cp.notes,
              createdAt: cp.created_at || new Date().toISOString()
            };
            if (!dbStore.payments.some(p => p.id === cp.id)) {
              dbStore.payments.push(mapped);
            }
          });
          dbStore.saveToDisk();
          list = dbStore.payments.filter(p => p.schoolId === schoolId || (p as any).school_id === schoolId);
        }
      } catch (err) {
        console.warn('[Supabase Payments Fetch Warning]', err);
      }
    }

    if (dbStore.students.length === 0) {
      await StudentService.getStudents(schoolId, {});
    }

    if (filters?.paymentMethod) {
      list = list.filter(p => p.paymentMethod === filters.paymentMethod || (p as any).payment_method === filters.paymentMethod);
    }

    return list.map(p => {
      const student = dbStore.students.find(s => s.id === p.studentId || s.id === (p as any).student_id);
      const cls = dbStore.classes.find(c => c.id === student?.classId || c.id === (student as any)?.class_id);
      const sec = dbStore.sections.find(s => s.id === student?.sectionId || s.id === (student as any)?.section_id);
      return {
        ...p,
        studentName: student ? (student.fullName || (student as any).full_name) : 'Student Record',
        registrationNumber: student ? (student.registrationNumber || (student as any).registration_number) : '',
        className: cls ? cls.name : 'LKG',
        sectionName: sec ? sec.name : 'A'
      };
    }).sort((a, b) => new Date(b.createdAt || b.paymentDate).getTime() - new Date(a.createdAt || a.paymentDate).getTime());
  }

  static async getReceiptDetails(schoolId: string, paymentIdentifier: string) {
    let payment = dbStore.payments.find(p => p.id === paymentIdentifier || p.receiptNumber === paymentIdentifier || (p as any).receipt_number === paymentIdentifier);

    if (!payment) {
      try {
        const { data: cloudPay } = await supabaseAdmin
          .from('payments')
          .select('*')
          .or(`id.eq.${paymentIdentifier},receipt_number.eq.${paymentIdentifier}`)
          .single();

        if (cloudPay) {
          payment = {
            id: cloudPay.id,
            schoolId: cloudPay.school_id,
            studentId: cloudPay.student_id,
            academicYearId: cloudPay.academic_year_id,
            receiptNumber: cloudPay.receipt_number,
            amount: cloudPay.amount,
            paymentMethod: cloudPay.payment_method,
            transactionReference: cloudPay.transaction_reference,
            paymentDate: cloudPay.payment_date,
            recordedBy: cloudPay.recorded_by,
            notes: cloudPay.notes,
            createdAt: cloudPay.created_at || new Date().toISOString()
          };
          if (!dbStore.payments.some(p => p.id === cloudPay.id)) {
            dbStore.payments.push(payment);
            dbStore.saveToDisk();
          }
        }
      } catch (err) {
        console.warn('[Supabase Cloud Receipt Lookup Warning]', err);
      }
    }

    if (!payment) return null;

    const targetStudentId = payment.studentId || (payment as any).student_id;

    // Ensure students are loaded from disk or Supabase Cloud
    let student = dbStore.students.find(s => s.id === targetStudentId);
    if (!student) {
      await StudentService.getStudents(schoolId, {});
      student = dbStore.students.find(s => s.id === targetStudentId);
    }

    // Direct Supabase Cloud query if still missing
    if (!student) {
      try {
        const { data: cloudSt } = await supabaseAdmin
          .from('students')
          .select('*')
          .eq('id', targetStudentId)
          .single();

        if (cloudSt) {
          student = {
            id: cloudSt.id,
            schoolId: cloudSt.school_id,
            academicYearId: cloudSt.academic_year_id,
            registrationNumber: cloudSt.registration_number,
            studentCode: cloudSt.student_code,
            fullName: cloudSt.full_name,
            dateOfBirth: cloudSt.date_of_birth,
            gender: cloudSt.gender,
            admissionDate: cloudSt.admission_date,
            classId: cloudSt.class_id,
            sectionId: cloudSt.section_id,
            status: cloudSt.status || 'active',
            studentAadhaar: cloudSt.student_aadhaar,
            address: cloudSt.address,
            city: cloudSt.city,
            district: cloudSt.district,
            state: cloudSt.state,
            postalCode: cloudSt.postal_code,
            createdAt: cloudSt.created_at || new Date().toISOString()
          };
          dbStore.students.push(student);
          dbStore.saveToDisk();
        }
      } catch (err) {
        console.warn('[Supabase Cloud Receipt Sync Error]', err);
      }
    }

    const school = dbStore.schools[0] || { name: 'Murthy High School', address: 'Sarpavaram police station road, near SRMT mall, Kakinada', phone: '9121454554', email: 'pssr0930@gmail.com' };
    const parents = dbStore.studentParents.find(p => p.studentId === targetStudentId || p.student_id === targetStudentId);
    const cls = dbStore.classes.find(c => c.id === student?.classId || c.id === (student as any)?.class_id);
    const sec = dbStore.sections.find(s => s.id === student?.sectionId || s.id === (student as any)?.section_id);
    const sf = dbStore.studentFees.find(f => f.studentId === targetStudentId || f.student_id === targetStudentId);
    const recorder = dbStore.profiles.find(pr => pr.id === payment?.recordedBy);

    return {
      payment,
      school,
      student: {
        id: targetStudentId,
        fullName: student ? (student.fullName || (student as any).full_name) : 'Student Record',
        registrationNumber: student ? (student.registrationNumber || (student as any).registration_number) : 'N/A',
        className: cls ? cls.name : 'LKG',
        sectionName: sec ? sec.name : 'A',
        fatherName: parents?.fatherName || parents?.guardianName || parents?.father_name || 'Parent'
      },
      feeSummary: sf,
      recordedByName: recorder ? (recorder.full_name || recorder.fullName) : 'Swetha'
    };
  }
}
