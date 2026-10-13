import { dbStore, supabaseAdmin } from '../config/supabase';
import { StudentItem } from '../types';
import crypto from 'crypto';

export class StudentService {
  static generateSequentialRegNumber(schoolId: string): string {
    const school = dbStore.schools.find(s => s.id === schoolId);
    const prefix = school?.registrationPrefix || 'REG';
    const schoolStudents = dbStore.students.filter(s => s.schoolId === schoolId || s.school_id === schoolId);
    const nextNum = schoolStudents.length + 1;
    return `${prefix}-${String(nextNum).padStart(4, '0')}`;
  }

  static async createStudent(schoolId: string, data: any) {
    const activeAcademicYear = dbStore.academicYears.find(ay => (ay.schoolId === schoolId || ay.school_id === schoolId) && ay.isCurrent);
    const academicYearId = activeAcademicYear ? (activeAcademicYear.id) : (dbStore.academicYears[0]?.id || crypto.randomUUID());

    const registrationNumber = data.registrationNumber || this.generateSequentialRegNumber(schoolId);
    const studentId = crypto.randomUUID();

    const newStudent: StudentItem = {
      id: studentId,
      schoolId: schoolId,
      academicYearId: academicYearId,
      registrationNumber: registrationNumber,
      studentCode: `STU-${new Date().getFullYear()}-${String(dbStore.students.length + 1).padStart(4, '0')}`,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      admissionDate: data.admissionDate || new Date().toISOString().split('T')[0],
      classId: data.classId,
      sectionId: data.sectionId,
      status: data.status || 'active',
      studentAadhaar: data.studentAadhaar || '',
      address: data.address || '',
      city: data.city || '',
      district: data.district || '',
      state: data.state || '',
      postalCode: data.postalCode || '',
      createdAt: new Date().toISOString()
    };
    dbStore.students.push(newStudent);

    // Parent details record
    const parentRecord = {
      id: crypto.randomUUID(),
      schoolId: schoolId,
      studentId: studentId,
      fatherName: data.fatherName || '',
      motherName: data.motherName || '',
      guardianName: data.guardianName || '',
      fatherPhone: data.fatherPhone || '',
      motherPhone: data.motherPhone || '',
      guardianPhone: data.guardianPhone || '',
      parentEmail: data.parentEmail || '',
      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
      relationship: data.relationship || 'Parent'
    };
    dbStore.studentParents.push(parentRecord);

    // Initial student fee record generation based on class fee structure
    const feeStruct = dbStore.feeStructures.find(fs => (fs.schoolId === schoolId || fs.school_id === schoolId) && (fs.classId === data.classId || fs.class_id === data.classId));
    const baseFee = feeStruct ? feeStruct.totalFee : 15000;
    
    const feeRecord = {
      id: crypto.randomUUID(),
      schoolId: schoolId,
      studentId: studentId,
      academicYearId: academicYearId,
      previousYearDue: 0,
      baseFee: baseFee,
      concessionAmount: 0,
      finalFee: baseFee,
      amountPaid: 0,
      balance: baseFee
    };
    dbStore.studentFees.push(feeRecord);

    // Save to local disk store
    dbStore.saveToDisk();

    // Persist to real Supabase PostgreSQL tables (handling null UUIDs gracefully)
    try {
      const { error: stErr } = await supabaseAdmin.from('students').insert([{
        id: studentId,
        school_id: schoolId,
        academic_year_id: academicYearId || null,
        registration_number: registrationNumber,
        student_code: newStudent.studentCode,
        full_name: data.fullName,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || 'male',
        admission_date: newStudent.admissionDate,
        class_id: data.classId && data.classId.trim() !== '' ? data.classId : null,
        section_id: data.sectionId && data.sectionId.trim() !== '' ? data.sectionId : null,
        status: newStudent.status,
        student_aadhaar: data.studentAadhaar || '',
        address: data.address || '',
        city: data.city || '',
        district: data.district || '',
        state: data.state || '',
        postal_code: data.postalCode || ''
      }]);

      if (stErr) console.warn('[Supabase Student Insert Warning]', stErr.message || stErr);

      const { error: prErr } = await supabaseAdmin.from('student_parents').insert([{
        id: parentRecord.id,
        school_id: schoolId,
        student_id: studentId,
        father_name: data.fatherName || '',
        mother_name: data.motherName || '',
        father_phone: data.fatherPhone || '',
        mother_phone: data.motherPhone || '',
        parent_email: data.parentEmail || ''
      }]);

      if (prErr) console.warn('[Supabase Parent Insert Warning]', prErr.message || prErr);

      const { error: sfErr } = await supabaseAdmin.from('student_fees').insert([{
        id: feeRecord.id,
        school_id: schoolId,
        student_id: studentId,
        academic_year_id: academicYearId || null,
        previous_year_due: 0,
        base_fee: baseFee,
        concession_amount: 0,
        final_fee: baseFee,
        amount_paid: 0,
        balance: baseFee
      }]);

      if (sfErr) console.warn('[Supabase Student Fee Insert Warning]', sfErr.message || sfErr);

      console.log(`[Supabase PostgreSQL Sync] Persisted student "${data.fullName}" to real database.`);
    } catch (err: any) {
      console.warn('[Supabase Student Sync Error]', err.message || err);
    }

    return { ...newStudent, parentDetails: parentRecord };
  }

  static async getStudents(schoolId: string, filters: { classId?: string; sectionId?: string; search?: string; status?: string }) {
    if (!schoolId) return [];

    let list = dbStore.students.filter(s => s.schoolId === schoolId || s.school_id === schoolId);

    // If local memory list is empty for this specific school, fetch real records from Supabase PostgreSQL scoped by school_id
    if (list.length === 0) {
      try {
        const { data: cloudStudents, error } = await supabaseAdmin
          .from('students')
          .select('*')
          .eq('school_id', schoolId);

        if (error) {
          console.warn('[Supabase Fetch Error]', error.message || error);
        }
          
        if (cloudStudents && cloudStudents.length > 0) {
          cloudStudents.forEach(st => {
            const mapped: StudentItem = {
              id: st.id,
              schoolId: st.school_id || schoolId,
              academicYearId: st.academic_year_id,
              registrationNumber: st.registration_number,
              studentCode: st.student_code,
              fullName: st.full_name,
              dateOfBirth: st.date_of_birth,
              gender: st.gender,
              admissionDate: st.admission_date,
              classId: st.class_id,
              sectionId: st.section_id,
              status: st.status || 'active',
              studentAadhaar: st.student_aadhaar,
              address: st.address,
              city: st.city,
              district: st.district,
              state: st.state,
              postalCode: st.postal_code,
              createdAt: st.created_at || new Date().toISOString()
            };
            if (!dbStore.students.some(s => s.id === st.id)) {
              dbStore.students.push(mapped);
            }
          });
          dbStore.saveToDisk();
          list = dbStore.students.filter(s => s.schoolId === schoolId || s.school_id === schoolId);
        }
      } catch (err: any) {
        console.warn('[Supabase Student Fetch Error]', err.message || err);
      }
    }

    if (filters.status) {
      list = list.filter(s => s.status === filters.status);
    } else {
      list = list.filter(s => s.status !== 'archived');
    }

    if (filters.classId) {
      list = list.filter(s => s.classId === filters.classId || s.class_id === filters.classId);
    }

    if (filters.sectionId) {
      list = list.filter(s => s.sectionId === filters.sectionId || s.section_id === filters.sectionId);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(s => 
        (s.fullName && s.fullName.toLowerCase().includes(q)) || 
        (s.registrationNumber && s.registrationNumber.toLowerCase().includes(q))
      );
    }

    return list.map(st => {
      const cls = dbStore.classes.find(c => c.id === st.classId || c.id === st.class_id);
      const sec = dbStore.sections.find(s => s.id === st.sectionId || s.id === st.section_id);
      const parents = dbStore.studentParents.find(p => p.studentId === st.id || p.student_id === st.id);
      const fees = dbStore.studentFees.find(f => f.studentId === st.id || f.student_id === st.id);
      
      const attRecords = dbStore.attendance.filter(a => a.studentId === st.id || a.student_id === st.id);
      const presentCount = attRecords.filter(a => a.status === 'present' || a.status === 'late').length;
      const attPct = attRecords.length > 0 ? Math.round((presentCount / attRecords.length) * 100) : 100;

      return {
        ...st,
        className: cls ? cls.name : 'Class 1',
        sectionName: sec ? sec.name : 'A',
        parentDetails: parents,
        feeSummary: fees,
        attendancePercentage: attPct
      };
    });
  }

  static async getStudentById(schoolId: string, id: string) {
    let student = dbStore.students.find(s => s.id === id);
    
    if (!student) {
      const all = await this.getStudents(schoolId, {});
      student = all.find(s => s.id === id);
    }

    if (!student) return null;

    // Hydrate payments if local memory cache is empty
    if (dbStore.payments.length === 0) {
      try {
        const { data: cloudPayments } = await supabaseAdmin.from('payments').select('*');
        if (cloudPayments && cloudPayments.length > 0) {
          cloudPayments.forEach(cp => {
            if (!dbStore.payments.some(p => p.id === cp.id)) {
              dbStore.payments.push({
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
              });
            }
          });
          dbStore.saveToDisk();
        }
      } catch (err) {
        console.warn('[Supabase Payments Lookup Warning]', err);
      }
    }

    const cls = dbStore.classes.find(c => c.id === student?.classId || c.id === student?.class_id);
    const sec = dbStore.sections.find(s => s.id === student?.sectionId || s.id === student?.section_id);
    const parentDetails = dbStore.studentParents.find(p => p.studentId === id || p.student_id === id);
    const feeSummary = dbStore.studentFees.find(f => f.studentId === id || f.student_id === id);
    const payments = dbStore.payments
      .filter(p => p.studentId === id || (p as any).student_id === id)
      .sort((a: any, b: any) => new Date(b.createdAt || b.paymentDate).getTime() - new Date(a.createdAt || a.paymentDate).getTime());
    const attendance = dbStore.attendance.filter(a => a.studentId === id || (a as any).student_id === id);

    return {
      ...student,
      className: cls ? cls.name : '',
      sectionName: sec ? sec.name : '',
      parentDetails,
      feeSummary,
      payments,
      attendance
    };
  }

  static async updateStudent(schoolId: string, studentId: string, data: any) {
    const idx = dbStore.students.findIndex(s => s.id === studentId);
    if (idx === -1) return null;

    const existing = dbStore.students[idx];
    const updated: StudentItem = {
      ...existing,
      fullName: data.fullName !== undefined ? data.fullName : existing.fullName,
      dateOfBirth: data.dateOfBirth !== undefined ? data.dateOfBirth : existing.dateOfBirth,
      gender: data.gender !== undefined ? data.gender : existing.gender,
      admissionDate: data.admissionDate !== undefined ? data.admissionDate : existing.admissionDate,
      classId: data.classId !== undefined ? data.classId : existing.classId,
      sectionId: data.sectionId !== undefined ? data.sectionId : existing.sectionId,
      status: data.status !== undefined ? data.status : existing.status,
      studentAadhaar: data.studentAadhaar !== undefined ? data.studentAadhaar : existing.studentAadhaar,
      address: data.address !== undefined ? data.address : existing.address,
      city: data.city !== undefined ? data.city : existing.city,
      district: data.district !== undefined ? data.district : existing.district,
      state: data.state !== undefined ? data.state : existing.state,
      postalCode: data.postalCode !== undefined ? data.postalCode : existing.postalCode
    };

    dbStore.students[idx] = updated;

    // Update Parent Details
    const parentIdx = dbStore.studentParents.findIndex(p => p.studentId === studentId || p.student_id === studentId);
    let updatedParent = null;
    if (parentIdx !== -1) {
      const pExisting = dbStore.studentParents[parentIdx];
      updatedParent = {
        ...pExisting,
        fatherName: data.fatherName !== undefined ? data.fatherName : pExisting.fatherName,
        motherName: data.motherName !== undefined ? data.motherName : pExisting.motherName,
        guardianName: data.guardianName !== undefined ? data.guardianName : pExisting.guardianName,
        fatherPhone: data.fatherPhone !== undefined ? data.fatherPhone : pExisting.fatherPhone,
        motherPhone: data.motherPhone !== undefined ? data.motherPhone : pExisting.motherPhone,
        guardianPhone: data.guardianPhone !== undefined ? data.guardianPhone : pExisting.guardianPhone,
        parentEmail: data.parentEmail !== undefined ? data.parentEmail : pExisting.parentEmail,
        emergencyContactName: data.emergencyContactName !== undefined ? data.emergencyContactName : pExisting.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone !== undefined ? data.emergencyContactPhone : pExisting.emergencyContactPhone,
        relationship: data.relationship !== undefined ? data.relationship : pExisting.relationship
      };
      dbStore.studentParents[parentIdx] = updatedParent;
    }

    dbStore.saveToDisk();

    // Persist changes to Supabase Cloud PostgreSQL
    try {
      const { error: stUpErr } = await supabaseAdmin.from('students').update({
        full_name: updated.fullName,
        date_of_birth: updated.dateOfBirth || null,
        gender: updated.gender,
        admission_date: updated.admissionDate,
        class_id: updated.classId && updated.classId.trim() !== '' ? updated.classId : null,
        section_id: updated.sectionId && updated.sectionId.trim() !== '' ? updated.sectionId : null,
        status: updated.status,
        student_aadhaar: updated.studentAadhaar,
        address: updated.address,
        city: updated.city,
        district: updated.district,
        state: updated.state,
        postal_code: updated.postalCode
      }).eq('id', studentId);

      if (stUpErr) console.warn('[Supabase Student Update Warning]', stUpErr.message || stUpErr);

      if (updatedParent) {
        const { error: prUpErr } = await supabaseAdmin.from('student_parents').update({
          father_name: updatedParent.fatherName,
          mother_name: updatedParent.motherName,
          guardian_name: updatedParent.guardianName,
          father_phone: updatedParent.fatherPhone,
          mother_phone: updatedParent.motherPhone,
          guardian_phone: updatedParent.guardianPhone,
          parent_email: updatedParent.parentEmail
        }).eq('student_id', studentId);

        if (prUpErr) console.warn('[Supabase Parent Update Warning]', prUpErr.message || prUpErr);
      }

      console.log(`[Supabase PostgreSQL Sync] Updated student "${updated.fullName}" in real cloud database.`);
    } catch (err: any) {
      console.warn('[Supabase Student Update Error]', err.message || err);
    }

    return { ...updated, parentDetails: updatedParent };
  }

  static async promoteStudent(schoolId: string, studentId: string, targetClassId: string, targetSectionId?: string) {
    const idx = dbStore.students.findIndex(s => s.id === studentId);
    if (idx === -1) return null;

    dbStore.students[idx].classId = targetClassId;
    if (targetSectionId) dbStore.students[idx].sectionId = targetSectionId;

    dbStore.saveToDisk();

    try {
      await supabaseAdmin.from('students').update({
        class_id: targetClassId,
        section_id: targetSectionId || dbStore.students[idx].sectionId
      }).eq('id', studentId);
    } catch (err: any) {
      console.warn('[Supabase Promote Warning]', err.message || err);
    }

    return dbStore.students[idx];
  }

  static async promoteClassCohort(schoolId: string, sourceClassId: string, targetClassId: string) {
    const students = dbStore.students.filter(s => 
      (s.classId === sourceClassId || (s as any).class_id === sourceClassId) && 
      s.status !== 'archived'
    );
    
    students.forEach(st => {
      st.classId = targetClassId;
      (st as any).class_id = targetClassId;
    });

    dbStore.saveToDisk();

    try {
      await supabaseAdmin.from('students').update({
        class_id: targetClassId
      }).eq('class_id', sourceClassId);
    } catch (err: any) {
      console.warn('[Supabase Cohort Promote Warning]', err.message || err);
    }

    return { count: students.length };
  }

  static async archiveStudent(schoolId: string, studentId: string) {
    const idx = dbStore.students.findIndex(s => s.id === studentId);
    if (idx === -1) return null;

    dbStore.students[idx].status = 'archived';
    dbStore.saveToDisk();

    try {
      await supabaseAdmin.from('students').update({
        status: 'archived'
      }).eq('id', studentId);
    } catch (err: any) {
      console.warn('[Supabase Archive Warning]', err.message || err);
    }

    return dbStore.students[idx];
  }
}
