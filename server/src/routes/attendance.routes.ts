import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { validateBody } from '../middleware/validate';
import { markAttendanceSchema, triggerAbsenceSmsSchema } from '../validators/attendance.validator';
import { AttendanceService } from '../services/attendance.service';

const router = Router();

// GET /api/attendance/class
router.get('/class', requireAuth, requirePermission('attendance.view'), (req, res) => {
  const schoolId = req.schoolId!;
  const classId = req.query.classId as string;
  const sectionId = req.query.sectionId as string;
  const date = req.query.date as string;

  if (!classId) {
    return res.status(400).json({ success: false, message: 'classId query parameter is required' });
  }

  const list = AttendanceService.getAttendanceByClass(schoolId, classId, sectionId, date);
  res.json({ success: true, count: list.length, data: list });
});

// POST /api/attendance
router.post('/', requireAuth, requirePermission('attendance.mark'), validateBody(markAttendanceSchema), async (req, res) => {
  const { classId, sectionId, attendanceDate, records } = req.body;
  const result = await AttendanceService.markAttendance(req.schoolId!, req.user!.userId, classId, sectionId, attendanceDate, records);
  res.json({ success: true, message: 'Attendance marked successfully', data: result });
});

// POST /api/attendance/send-absence-notifications
router.post('/send-absence-notifications', requireAuth, requirePermission('sms.send'), validateBody(triggerAbsenceSmsSchema), async (req, res, next) => {
  try {
    const { attendanceDate } = req.body;
    const result = await AttendanceService.sendAbsenceNotifications(req.schoolId!, attendanceDate);
    res.json({ success: true, message: `Absence notification process completed (${result.count} SMS sent)`, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
