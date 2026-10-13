import { dbStore, supabaseAdmin } from '../config/supabase';
import { FeeStructureItem } from '../types';
import crypto from 'crypto';

export class FeeService {
  static getFeeStructures(schoolId: string) {
    const activeYear = dbStore.academicYears.find(ay => (ay.schoolId === schoolId || ay.school_id === schoolId) && ay.isCurrent);
    const academicYearId = activeYear ? activeYear.id : dbStore.academicYears[0]?.id;

    return dbStore.feeStructures
      .filter(fs => (fs.schoolId === schoolId || fs.school_id === schoolId) && (fs.academicYearId === academicYearId || fs.academic_year_id === academicYearId))
      .map(fs => {
        const cls = dbStore.classes.find(c => c.id === fs.classId || c.id === fs.class_id);
        return {
          ...fs,
          className: cls ? cls.name : ''
        };
      });
  }

  static async createOrUpdateFeeStructure(schoolId: string, data: any) {
    const activeYear = dbStore.academicYears.find(ay => (ay.schoolId === schoolId || ay.school_id === schoolId) && ay.isCurrent);
    const academicYearId = activeYear ? activeYear.id : (dbStore.academicYears[0]?.id || crypto.randomUUID());

    const existingIdx = dbStore.feeStructures.findIndex(fs => 
      (fs.schoolId === schoolId || fs.school_id === schoolId) && 
      (fs.academicYearId === academicYearId || fs.academic_year_id === academicYearId) && 
      (fs.classId === data.classId || fs.class_id === data.classId)
    );

    const totalFee = 
      (data.tuitionFee || 0) + 
      (data.admissionFee || 0) + 
      (data.examinationFee || 0) + 
      (data.transportFee || 0) + 
      (data.booksFee || 0) + 
      (data.uniformFee || 0) + 
      (data.otherFee || 0);

    const fsId = existingIdx !== -1 ? dbStore.feeStructures[existingIdx].id : crypto.randomUUID();

    const record: FeeStructureItem = {
      id: fsId,
      schoolId,
      academicYearId,
      classId: data.classId,
      tuitionFee: data.tuitionFee || 0,
      admissionFee: data.admissionFee || 0,
      examinationFee: data.examinationFee || 0,
      transportFee: data.transportFee || 0,
      booksFee: data.booksFee || 0,
      uniformFee: data.uniformFee || 0,
      otherFee: data.otherFee || 0,
      totalFee: totalFee
    };

    if (existingIdx !== -1) {
      dbStore.feeStructures[existingIdx] = record;
    } else {
      dbStore.feeStructures.push(record);
    }

    // Auto-sync base fees for enrolled class students without overwriting concessions or previous payments
    this.syncClassFeeStructure(schoolId, data.classId, totalFee);

    dbStore.saveToDisk();

    // Sync to Supabase PostgreSQL
    try {
      await supabaseAdmin.from('fee_structures').upsert([{
        id: fsId,
        school_id: schoolId,
        academic_year_id: academicYearId,
        class_id: data.classId,
        tuition_fee: data.tuitionFee || 0,
        admission_fee: data.admissionFee || 0,
        examination_fee: data.examinationFee || 0,
        transport_fee: data.transportFee || 0,
        books_fee: data.booksFee || 0,
        uniform_fee: data.uniformFee || 0,
        other_fee: data.otherFee || 0,
        total_fee: totalFee
      }]);
    } catch (err) {
      console.warn('[Supabase Fee Structure Sync Warning]', err);
    }

    return record;
  }

  static syncClassFeeStructure(schoolId: string, classId: string, newTotalFee: number) {
    const classStudents = dbStore.students.filter(s => (s.schoolId === schoolId || s.school_id === schoolId) && (s.classId === classId || s.class_id === classId));
    
    classStudents.forEach(st => {
      const sfIdx = dbStore.studentFees.findIndex(sf => sf.studentId === st.id || sf.student_id === st.id);
      if (sfIdx !== -1) {
        const sf = dbStore.studentFees[sfIdx];
        sf.baseFee = newTotalFee;
        sf.finalFee = sf.previousYearDue + newTotalFee - sf.concessionAmount;
        sf.balance = sf.finalFee - sf.amountPaid;
      }
    });
  }

  static async applyConcession(schoolId: string, studentId: string, userId: string, amount: number, reason: string) {
    const activeYear = dbStore.academicYears.find(ay => (ay.schoolId === schoolId || ay.school_id === schoolId) && ay.isCurrent);
    const academicYearId = activeYear ? activeYear.id : (dbStore.academicYears[0]?.id || crypto.randomUUID());

    const concessionId = crypto.randomUUID();

    // Record concession log
    const concessionRecord = {
      id: concessionId,
      school_id: schoolId,
      student_id: studentId,
      studentId: studentId,
      academic_year_id: academicYearId,
      amount,
      reason,
      approved_by: userId,
      created_at: new Date().toISOString()
    };
    dbStore.feeConcessions.push(concessionRecord);

    // Recalculate student fee
    const sfIdx = dbStore.studentFees.findIndex(sf => (sf.studentId === studentId || sf.student_id === studentId) && (sf.schoolId === schoolId || sf.school_id === schoolId));
    let updatedSf = null;

    if (sfIdx !== -1) {
      const sf = dbStore.studentFees[sfIdx];
      sf.concessionAmount = (sf.concessionAmount || 0) + amount;
      sf.finalFee = (sf.previousYearDue || 0) + (sf.baseFee || 15000) - sf.concessionAmount;
      sf.balance = sf.finalFee - (sf.amountPaid || 0);
      updatedSf = sf;
    }

    dbStore.saveToDisk();

    // Persist to Supabase PostgreSQL
    try {
      await supabaseAdmin.from('fee_concessions').insert([{
        id: concessionId,
        school_id: schoolId,
        student_id: studentId,
        academic_year_id: academicYearId,
        amount,
        reason,
        approved_by: userId
      }]);

      if (updatedSf) {
        await supabaseAdmin.from('student_fees').update({
          concession_amount: updatedSf.concessionAmount,
          final_fee: updatedSf.finalFee,
          balance: updatedSf.balance
        }).eq('student_id', studentId);
      }
      console.log(`[Supabase PostgreSQL] Persisted concession of INR ${amount} for student ${studentId}.`);
    } catch (err) {
      console.warn('[Supabase Concession Sync Warning]', err);
    }

    return updatedSf;
  }

  static async updatePreviousDue(schoolId: string, studentId: string, previousYearDue: number) {
    const sfIdx = dbStore.studentFees.findIndex(sf => (sf.studentId === studentId || sf.student_id === studentId) && (sf.schoolId === schoolId || sf.school_id === schoolId));
    let updatedSf = null;

    if (sfIdx !== -1) {
      const sf = dbStore.studentFees[sfIdx];
      sf.previousYearDue = previousYearDue;
      sf.finalFee = sf.previousYearDue + (sf.baseFee || 15000) - (sf.concessionAmount || 0);
      sf.balance = sf.finalFee - (sf.amountPaid || 0);
      updatedSf = sf;
    }

    dbStore.saveToDisk();

    // Persist to Supabase PostgreSQL
    try {
      if (updatedSf) {
        await supabaseAdmin.from('student_fees').update({
          previous_year_due: previousYearDue,
          final_fee: updatedSf.finalFee,
          balance: updatedSf.balance
        }).eq('student_id', studentId);
      }
      console.log(`[Supabase PostgreSQL] Persisted previous year due of INR ${previousYearDue} for student ${studentId}.`);
    } catch (err) {
      console.warn('[Supabase Previous Due Sync Warning]', err);
    }

    return updatedSf;
  }
}
