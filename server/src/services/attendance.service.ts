import { dbStore, supabaseAdmin } from '../config/supabase';
import { SmsService } from './sms.service';
import crypto from 'crypto';

export class AttendanceService {
  static getAttendanceByClass(schoolId: string, classId: string, sectionId?: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    let students = dbStore.students.filter(s => (s.schoolId === schoolId || s.school_id === schoolId) && (s.classId === classId || s.class_id === classId) && s.status === 'active');
    if (sectionId) {
      students = students.filter(s => s.sectionId === sectionId || s.section_id === sectionId);
    }

    const attendanceRecords = dbStore.attendance.filter(a => 
      (a.schoolId === schoolId || a.school_id === schoolId) && 
      (a.attendanceDate === targetDate || a.attendance_date === targetDate)
    );

    return students.map(st => {
      const record = attendanceRecords.find(a => a.studentId === st.id || a.student_id === st.id);
      const sec = dbStore.sections.find(s => s.id === (st.sectionId || st.section_id));
      return {
        studentId: st.id,
        registrationNumber: st.registrationNumber || st.registration_number,
        fullName: st.fullName || st.full_name,
        sectionName: sec ? sec.name : 'A',
        status: record ? record.status : 'present',
        recordId: record ? record.id : null,
        smsStatus: record ? record.smsStatus : 'pending'
      };
    });
  }

  static async markAttendance(schoolId: string, userId: string, classId: string, sectionId: string | undefined, date: string, records: { studentId: string; status: 'present' | 'absent' | 'late' }[]) {
    const activeAcademicYear = dbStore.academicYears.find(ay => (ay.schoolId === schoolId || ay.school_id === schoolId) && ay.isCurrent);
    const academicYearId = activeAcademicYear ? activeAcademicYear.id : (dbStore.academicYears[0]?.id || crypto.randomUUID());

    const supabaseRows: any[] = [];

    records.forEach(rec => {
      const existingIdx = dbStore.attendance.findIndex(a => 
        (a.schoolId === schoolId || a.school_id === schoolId) && 
        (a.studentId === rec.studentId || a.student_id === rec.studentId) && 
        (a.attendanceDate === date || a.attendance_date === date)
      );

      const attId = existingIdx !== -1 ? dbStore.attendance[existingIdx].id : crypto.randomUUID();

      if (existingIdx !== -1) {
        dbStore.attendance[existingIdx].status = rec.status;
        dbStore.attendance[existingIdx].markedBy = userId;
        dbStore.attendance[existingIdx].markedAt = new Date().toISOString();
      } else {
        dbStore.attendance.push({
          id: attId,
          schoolId,
          studentId: rec.studentId,
          academicYearId,
          attendanceDate: date,
          status: rec.status,
          markedBy: userId,
          markedAt: new Date().toISOString(),
          smsStatus: rec.status === 'absent' ? 'pending' : 'not_required'
        });
      }

      supabaseRows.push({
        id: attId,
        school_id: schoolId,
        student_id: rec.studentId,
        academic_year_id: academicYearId || null,
        class_id: classId && classId.trim() !== '' ? classId : null,
        section_id: sectionId && sectionId.trim() !== '' ? sectionId : null,
        attendance_date: date,
        status: rec.status,
        marked_by: userId || null
      });
    });

    dbStore.saveToDisk();

    // Persist all marked attendance records to Supabase Cloud PostgreSQL
    try {
      const { error } = await supabaseAdmin.from('attendance').upsert(supabaseRows);
      if (error) {
        console.warn('[Supabase Attendance Upsert Warning]', error.message || error);
      } else {
        console.log(`[Supabase PostgreSQL Sync] Persisted ${records.length} attendance records for date ${date}.`);
      }
    } catch (err: any) {
      console.warn('[Supabase Attendance Sync Error]', err.message || err);
    }

    return { success: true, count: records.length };
  }

  static async sendAbsenceNotifications(schoolId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const school = dbStore.schools.find(s => s.id === schoolId);
    
    if (!school || !school.attendanceSmsEnabled) {
      return { success: false, message: 'SMS notifications disabled for this school' };
    }

    const absentRecords = dbStore.attendance.filter(a => 
      (a.schoolId === schoolId || a.school_id === schoolId) && 
      (a.attendanceDate === targetDate || a.attendance_date === targetDate) && 
      a.status === 'absent' && 
      a.smsStatus === 'pending'
    );

    let sentCount = 0;
    for (const record of absentRecords) {
      const student = dbStore.students.find(s => s.id === record.studentId || s.id === record.student_id);
      const parent = dbStore.studentParents.find(p => p.studentId === record.studentId || p.student_id === record.student_id);
      const cls = dbStore.classes.find(c => c.id === (student?.classId || student?.class_id));
      const phone = parent?.fatherPhone || parent?.motherPhone || parent?.guardianPhone || parent?.father_phone || parent?.mother_phone;

      if (student && phone) {
        const messageBody = `Dear Parent, ${student.fullName || student.full_name} of ${cls?.name || 'class'} was marked absent today (${targetDate}). Please contact ${school.name} if required.`;
        
        await SmsService.sendSms(schoolId, phone, student.fullName || student.full_name, student.id, messageBody, 'attendance');
        record.smsStatus = 'sent';
        record.smsSentAt = new Date().toISOString();
        sentCount++;
      }
    }

    dbStore.saveToDisk();

    return { success: true, count: sentCount };
  }
}
