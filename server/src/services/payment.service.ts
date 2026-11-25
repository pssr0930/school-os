import { dbStore, supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { PaymentItem } from '../types';
import { StudentService } from './student.service';
import { SmsService, validatePhoneNumber } from './sms.service';
import crypto from 'crypto';

function toUuid(idStr: string): string {
  if (!idStr) return crypto.randomUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(idStr)) return idStr;
  const hash = crypto.createHash('md5').update(idStr).digest('hex');
  return `${hash.substring(0,8)}-${hash.substring(8,12)}-4${hash.substring(13,16)}-a${hash.substring(17,20)}-${hash.substring(20,32)}`;
}

export class PaymentService {
  private static checkedPaymentSchools = new Set<string>();
  static generateSequentialReceiptNumber(schoolId: string): string {
    const schoolPayments = dbStore.payments.filter(p => p.schoolId === schoolId || (p as any).school_id === schoolId);
    const maxNum = schoolPayments.reduce((max, p) => {
      const numStr = (p.receiptNumber || (p as any).receipt_number || '').replace(/\D/g, '');
      const num = parseInt(numStr, 10);
      return !isNaN(num) ? Math.max(max, num) : max;
    }, 0);
    return `REC-${String(maxNum + 1).padStart(5, '0')}`;
  }

  static async recordPayment(schoolId: string, userId: string, data: { studentId: string; amount: number; paymentMethod: 'cash' | 'UPI' | 'bank_transfer' | 'cheque' | 'other'; transactionReference?: string; paymentDate?: string; notes?: string; idempotencyKey?: string }) {
    const targetSchoolId = schoolId || dbStore.schools[0]?.id || '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e';

    // Idempotency guard: prevent duplicate payment & duplicate SMS on retried submission
    if (data.idempotencyKey) {
      const existingPayment = dbStore.payments.find(
        p => (p.schoolId === targetSchoolId || (p as any).school_id === targetSchoolId) && p.idempotencyKey === data.idempotencyKey
      );
      if (existingPayment) {
        const existingDetails = await this.getReceiptDetails(targetSchoolId, existingPayment.id);
        return {
          ...(existingDetails || { payment: existingPayment }),
          smsResult: {
            status: existingPayment.smsStatus || 'pending',
            error: existingPayment.smsError || '',
            recipientPhone: existingPayment.smsRecipientPhone || '',
            alreadyProcessed: true
          }
        };
      }
    }

    if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
      const err: any = new Error('Payment amount must be greater than 0.');
      err.statusCode = 400;
      throw err;
    }

    let student = dbStore.students.find(s => s.id === data.studentId);
    if (!student) {
      // Hydrate student cache if missing
      await StudentService.getStudents(targetSchoolId, {});
      student = dbStore.students.find(s => s.id === data.studentId);
    }

    if (!student) {
      const err: any = new Error('Student record not found. Payment cannot be recorded.');
      err.statusCode = 404;
      throw err;
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
      idempotencyKey: data.idempotencyKey || undefined,
      smsStatus: 'pending',
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

    // ONLY AFTER successful payment persistence: trigger automatic SMS confirmation
    // Failure to deliver SMS must NEVER roll back the recorded payment
    const smsResult = await this.dispatchPaymentConfirmationSms(newPayment, targetSchoolId, userId, student, cls, sec, parents, sf, school);

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
      feeSummary: sf,
      smsResult
    };
  }

  private static async dispatchPaymentConfirmationSms(
    payment: PaymentItem,
    schoolId: string,
    userId: string,
    student: any,
    cls: any,
    sec: any,
    parents: any,
    sf: any,
    school: any
  ): Promise<{ status: 'sent' | 'failed' | 'pending'; error?: string; recipientPhone?: string; messageId?: string; alreadySent?: boolean }> {
    // Prevent duplicate SMS for an already-confirmed payment
    if (payment.smsStatus === 'sent') {
      return {
        status: 'sent',
        recipientPhone: payment.smsRecipientPhone || '',
        messageId: payment.twilioMessageId || '',
        alreadySent: true
      };
    }

    try {
      // Fallback lookup for parent details in Supabase if missing from memory cache
      let parentRecord = parents;
      if (!parentRecord) {
        try {
          const { data: cloudParent } = await supabaseAdmin
            .from('student_parents')
            .select('*')
            .eq('student_id', payment.studentId)
            .maybeSingle();
          if (cloudParent) {
            parentRecord = cloudParent;
            dbStore.studentParents.push(cloudParent);
          }
        } catch {
          // Ignore lookup error and handle missing phone below
        }
      }

      const rawPhone =
        parentRecord?.fatherPhone ||
        parentRecord?.father_phone ||
        parentRecord?.motherPhone ||
        parentRecord?.mother_phone ||
        parentRecord?.guardianPhone ||
        parentRecord?.guardian_phone ||
        parentRecord?.emergencyContactPhone ||
        parentRecord?.emergency_contact_phone ||
        '';

      const phoneCheck = validatePhoneNumber(rawPhone);
      if (!phoneCheck.valid) {
        payment.smsStatus = 'failed';
        payment.smsError = phoneCheck.error || 'Parent mobile number is missing or invalid.';
        payment.smsRecipientPhone = rawPhone ? String(rawPhone).trim() : '';
        dbStore.saveToDisk();
        await this.syncPaymentSmsStatusToSupabase(payment);
        return {
          status: 'failed',
          error: payment.smsError,
          recipientPhone: payment.smsRecipientPhone
        };
      }

      const schoolName = school?.name || 'School OS';
      const studentName = student ? (student.fullName || (student as any).full_name || 'Student') : 'Student';
      const className = cls ? cls.name : 'Class';
      const sectionName = sec ? sec.name : '';
      const classSection = sectionName ? `${className} - ${sectionName}` : className;
      const formattedAmount = Number(payment.amount || 0).toLocaleString('en-IN');
      const remainingBalance = Math.max(0, Number(sf?.balance ?? 0)).toLocaleString('en-IN');
      const modeLabelMap: Record<string, string> = {
        cash: 'Cash',
        UPI: 'UPI',
        bank_transfer: 'Bank Transfer',
        cheque: 'Cheque',
        other: 'Other'
      };
      const modeLabel = modeLabelMap[payment.paymentMethod] || payment.paymentMethod || 'Payment';
      const parentName = parentRecord?.fatherName || parentRecord?.father_name || parentRecord?.motherName || parentRecord?.mother_name || parentRecord?.guardianName || parentRecord?.guardian_name || 'Parent';

      const messageBody = `Dear Parent, Fee payment of INR ${formattedAmount} received for ${studentName} (${classSection}) on ${payment.paymentDate} via ${modeLabel}. Receipt No: ${payment.receiptNumber}. Remaining Balance: INR ${remainingBalance}. Thank you, ${schoolName}.`;

      const logRecord = await SmsService.sendSms(
        schoolId,
        phoneCheck.formatted,
        parentName,
        payment.studentId,
        messageBody,
        'fee_payment',
        userId,
        true
      );

      if (logRecord.status === 'sent') {
        payment.smsStatus = 'sent';
        payment.smsError = '';
        payment.smsSentAt = new Date().toISOString();
        payment.smsRecipientPhone = phoneCheck.formatted;
        payment.twilioMessageId = logRecord.twilioMessageId;
      } else {
        payment.smsStatus = 'failed';
        payment.smsError = logRecord.status === 'mock_sent'
          ? 'SMS gateway not configured: configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.'
          : (logRecord.errorMessage || 'SMS delivery failed via Twilio.');
        payment.smsRecipientPhone = phoneCheck.formatted;
        payment.twilioMessageId = logRecord.twilioMessageId;
      }

      dbStore.saveToDisk();
      await this.syncPaymentSmsStatusToSupabase(payment);

      return {
        status: payment.smsStatus,
        error: payment.smsError || undefined,
        recipientPhone: payment.smsRecipientPhone,
        messageId: payment.twilioMessageId
      };
    } catch (err: any) {
      payment.smsStatus = 'failed';
      payment.smsError = err?.message || 'Unexpected error while sending SMS confirmation.';
      dbStore.saveToDisk();
      await this.syncPaymentSmsStatusToSupabase(payment);
      return {
        status: 'failed',
        error: payment.smsError,
        recipientPhone: payment.smsRecipientPhone
      };
    }
  }

  private static async syncPaymentSmsStatusToSupabase(payment: PaymentItem) {
    try {
      await supabaseAdmin
        .from('payments')
        .update({
          sms_status: payment.smsStatus || 'pending',
          sms_error: payment.smsError || null,
          sms_sent_at: payment.smsSentAt || null,
          sms_recipient_phone: payment.smsRecipientPhone || null,
          twilio_message_id: payment.twilioMessageId || null
        })
        .eq('id', toUuid(payment.id));
    } catch {
      // Best-effort sync; ignore if live schema hasn't added SMS columns yet
    }
  }

  static async retryPaymentSms(schoolId: string, paymentId: string, userId: string) {
    const targetSchoolId = schoolId || dbStore.schools[0]?.id || '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e';
    let payment = dbStore.payments.find(
      p => (p.id === paymentId || toUuid(p.id) === paymentId) &&
        (p.schoolId === targetSchoolId || (p as any).school_id === targetSchoolId)
    );

    if (!payment) {
      const details = await this.getReceiptDetails(targetSchoolId, paymentId);
      if (details?.payment) {
        payment = details.payment;
      }
    }

    if (!payment) return null;

    if (payment.smsStatus === 'sent') {
      return {
        alreadySent: true,
        payment,
        smsResult: {
          status: 'sent' as const,
          recipientPhone: payment.smsRecipientPhone || '',
          messageId: payment.twilioMessageId || '',
          alreadySent: true
        }
      };
    }

    const targetStudentId = payment.studentId || (payment as any).student_id;
    let student = dbStore.students.find(s => s.id === targetStudentId);
    if (!student) {
      await StudentService.getStudents(targetSchoolId, {});
      student = dbStore.students.find(s => s.id === targetStudentId);
    }

    const school = dbStore.schools.find(s => s.id === targetSchoolId) || dbStore.schools[0] || { name: 'School OS' };
    const cls = dbStore.classes.find(c => c.id === student?.classId || c.id === (student as any)?.class_id);
    const sec = dbStore.sections.find(s => s.id === student?.sectionId || s.id === (student as any)?.section_id);
    const parents = dbStore.studentParents.find(p => p.studentId === targetStudentId || p.student_id === targetStudentId);
    const sf = dbStore.studentFees.find(f => f.studentId === targetStudentId || f.student_id === targetStudentId);

    const smsResult = await this.dispatchPaymentConfirmationSms(payment, targetSchoolId, userId, student, cls, sec, parents, sf, school);
    return {
      alreadySent: false,
      payment,
      smsResult
    };
  }

  static async getPayments(schoolId: string, filters?: { search?: string; paymentMethod?: string; startDate?: string; endDate?: string }) {
    if (!schoolId) return [];

    let list = dbStore.payments.filter(p => p.schoolId === schoolId || (p as any).school_id === schoolId);

    // One-time hydration check per school (only if real Supabase credentials configured, strictly cached in memory afterwards)
    if (list.length === 0 && !this.checkedPaymentSchools.has(schoolId) && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
      this.checkedPaymentSchools.add(schoolId);
      try {
        const timeoutPromise = new Promise<{ data: any[] | null; error: any }>((_, reject) =>
          setTimeout(() => reject(new Error('Supabase payments fetch timeout')), 2000)
        );
        const fetchPromise = supabaseAdmin
          .from('payments')
          .select('*')
          .eq('school_id', schoolId);

        const { data: cloudPayments } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (cloudPayments && cloudPayments.length > 0) {
          cloudPayments.forEach((cp: any) => {
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
          list = dbStore.payments.filter(p => p.schoolId === schoolId || (p as any).school_id === schoolId);
        }
      } catch (err) {
        // Silently continue with instant in-memory list
      }
    } else {
      this.checkedPaymentSchools.add(schoolId);
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
        sectionName: sec ? sec.name : 'A',
        smsStatus: p.smsStatus || (p as any).sms_status || 'pending',
        smsError: p.smsError || (p as any).sms_error || '',
        smsSentAt: p.smsSentAt || (p as any).sms_sent_at || undefined,
        smsRecipientPhone: p.smsRecipientPhone || (p as any).sms_recipient_phone || ''
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
