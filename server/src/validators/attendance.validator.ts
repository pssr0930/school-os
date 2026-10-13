import { z } from 'zod';

export const markAttendanceSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  sectionId: z.string().optional(),
  attendanceDate: z.string().min(1, 'Attendance date is required'),
  records: z.array(
    z.object({
      studentId: z.string().min(1, 'Student ID is required'),
      status: z.enum(['present', 'absent', 'late'])
    })
  ).min(1, 'At least one student record is required')
});

export const triggerAbsenceSmsSchema = z.object({
  attendanceDate: z.string().optional(),
  classId: z.string().optional()
});
