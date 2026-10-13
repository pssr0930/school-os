import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { dbStore } from '../config/supabase';
import { StudentService } from '../services/student.service';

const router = Router();

// GET /api/dashboard/summary
router.get('/summary', requireAuth, async (req, res) => {
  const schoolId = req.schoolId!;

  // Use StudentService.getStudents to get exact active enrolled student list strictly for this school
  const activeStudents = await StudentService.getStudents(schoolId, { status: 'active' });
  const activeTeachers = dbStore.schoolMembers.filter(sm => (sm.school_id === schoolId || sm.schoolId === schoolId) && (sm.role === 'teacher' || sm.role === 'staff') && sm.status === 'active');

  const today = new Date().toISOString().split('T')[0];
  const todayPayments = dbStore.payments.filter(p => (p.schoolId === schoolId || p.school_id === schoolId) && (p.paymentDate === today || p.payment_date === today));
  
  const cashCollection = todayPayments.filter(p => p.paymentMethod === 'cash' || p.payment_method === 'cash').reduce((acc, p) => acc + (p.amount || 0), 0);
  const upiCollection = todayPayments.filter(p => p.paymentMethod === 'UPI' || p.payment_method === 'UPI').reduce((acc, p) => acc + (p.amount || 0), 0);
  const otherCollection = todayPayments.filter(p => p.paymentMethod !== 'cash' && p.payment_method !== 'cash' && p.paymentMethod !== 'UPI' && p.payment_method !== 'UPI').reduce((acc, p) => acc + (p.amount || 0), 0);
  const todayTotalCollection = cashCollection + upiCollection + otherCollection;

  res.json({
    success: true,
    data: {
      totalStudents: activeStudents.length,
      totalTeachers: activeTeachers.length,
      todayCollection: {
        total: todayTotalCollection,
        cash: cashCollection,
        upi: upiCollection,
        other: otherCollection
      }
    }
  });
});

// GET /api/dashboard/attendance
router.get('/attendance', requireAuth, async (req, res) => {
  const schoolId = req.schoolId!;
  const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const sectionFilter = req.query.sectionId as string;

  const allActiveStudents = await StudentService.getStudents(schoolId, { status: 'active' });

  const schoolClasses = dbStore.classes
    .filter(c => c.schoolId === schoolId || c.school_id === schoolId)
    .sort((a, b) => (a.displayOrder || a.display_order || 0) - (b.displayOrder || b.display_order || 0));

  const dayAttendance = dbStore.attendance.filter(a => 
    (a.schoolId === schoolId || a.school_id === schoolId) && 
    (a.attendanceDate === targetDate || a.attendance_date === targetDate)
  );

  const tableData = schoolClasses.map(cls => {
    let classStudents = allActiveStudents.filter(s => s.classId === cls.id || s.class_id === cls.id);
    if (sectionFilter) {
      classStudents = classStudents.filter(s => s.sectionId === sectionFilter || s.section_id === sectionFilter);
    }

    const studentIds = new Set(classStudents.map(s => s.id));
    const records = dayAttendance.filter(a => studentIds.has(a.studentId || a.student_id));

    const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const absentCount = records.filter(r => r.status === 'absent').length;

    return {
      classId: cls.id,
      className: cls.name,
      totalStudents: classStudents.length,
      present: presentCount,
      absent: absentCount,
      unmarked: Math.max(0, classStudents.length - (presentCount + absentCount))
    };
  });

  res.json({
    success: true,
    date: targetDate,
    data: tableData
  });
});

export default router;
