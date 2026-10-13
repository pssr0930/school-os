import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema } from '../validators/student.validator';
import { StudentService } from '../services/student.service';

const router = Router();

// Helper middleware for student permission checks
const checkStudentPermission = (permType: 'view' | 'create' | 'edit' | 'delete') => {
  return (req: any, res: any, next: any) => {
    if (req.user?.role === 'admin') return next();
    
    const perms = req.user?.permissions || [];
    
    if (permType === 'view') {
      if (
        perms.includes('students.view') || 
        perms.includes('students.manage') || 
        perms.includes('students.create') ||
        perms.includes('fees.view') || 
        perms.includes('fees.manage') || 
        perms.includes('payments.record')
      ) {
        return next();
      }
    } else if (permType === 'create' || permType === 'edit' || permType === 'delete') {
      if (
        perms.includes('students.manage') || 
        perms.includes('students.create') || 
        perms.includes('students.edit') ||
        perms.includes('students.view')
      ) {
        return next();
      }
    }

    return res.status(403).json({ 
      success: false, 
      message: `Access Denied: Missing permission (${permType} students) for your staff account.` 
    });
  };
};

// GET /api/students
router.get('/', requireAuth, checkStudentPermission('view'), async (req, res) => {
  const { classId, sectionId, search, status } = req.query;
  const students = await StudentService.getStudents(req.schoolId!, {
    classId: classId as string,
    sectionId: sectionId as string,
    search: search as string,
    status: status as string
  });
  res.json({ success: true, count: students.length, data: students });
});

// GET /api/students/:id
router.get('/:id', requireAuth, checkStudentPermission('view'), async (req, res) => {
  const student = await StudentService.getStudentById(req.schoolId!, req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, data: student });
});

// POST /api/students (Create New Student)
router.post('/', requireAuth, checkStudentPermission('create'), validateBody(createStudentSchema), async (req, res) => {
  const newStudent = await StudentService.createStudent(req.schoolId!, req.body);
  res.status(201).json({ success: true, message: 'Student enrolled successfully', data: newStudent });
});

// PUT /api/students/:id (Update Student)
router.put('/:id', requireAuth, checkStudentPermission('edit'), validateBody(updateStudentSchema), async (req, res) => {
  const updated = await StudentService.updateStudent(req.schoolId!, req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, message: 'Student updated successfully', data: updated });
});

// POST /api/students/promote-cohort (Bulk Class Promotion)
router.post('/promote-cohort', requireAuth, checkStudentPermission('edit'), async (req, res) => {
  const { fromClassId, toClassId } = req.body;
  if (!fromClassId || !toClassId) {
    return res.status(400).json({ success: false, message: 'Source class and target class are required.' });
  }
  const result = await StudentService.promoteClassCohort(req.schoolId!, fromClassId, toClassId);
  res.json({ 
    success: true, 
    message: `Successfully promoted ${result.count} students.`, 
    count: result.count 
  });
});

// POST /api/students/:id/promote (Single Student Promotion)
router.post('/:id/promote', requireAuth, checkStudentPermission('edit'), async (req, res) => {
  const { targetClassId, targetSectionId } = req.body;
  const result = await StudentService.promoteStudent(req.schoolId!, req.params.id, targetClassId, targetSectionId);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, message: 'Student promoted successfully', data: result });
});

// DELETE /api/students/:id
router.delete('/:id', requireAuth, checkStudentPermission('delete'), async (req, res) => {
  const result = await StudentService.archiveStudent(req.schoolId!, req.params.id);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, message: 'Student archived successfully' });
});

export default router;
