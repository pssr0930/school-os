import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { validateBody } from '../middleware/validate';
import { createStaffSchema, updateStaffPermissionsSchema } from '../validators/staff.validator';
import { StaffService } from '../services/staff.service';

const router = Router();

// GET /api/staff
router.get('/', requireAuth, requirePermission('staff.view'), (req, res) => {
  const staff = StaffService.getStaffList(req.schoolId!);
  res.json({ success: true, count: staff.length, data: staff });
});

// POST /api/staff
router.post('/', requireAuth, requirePermission('staff.manage'), validateBody(createStaffSchema), async (req, res, next) => {
  try {
    const newStaff = await StaffService.createStaff(req.schoolId!, req.body);
    res.status(201).json({ success: true, message: 'Staff member account created', data: newStaff });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/staff/:id/password
router.patch('/:id/password', requireAuth, requirePermission('staff.manage'), (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long' });
  }
  const success = StaffService.updatePassword(req.schoolId!, req.params.id, newPassword);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Staff member not found' });
  }
  res.json({ success: true, message: 'Staff password updated successfully' });
});

// PATCH /api/staff/:id/permissions
router.patch('/:id/permissions', requireAuth, requirePermission('staff.manage'), validateBody(updateStaffPermissionsSchema), (req, res) => {
  const { permissions } = req.body;
  StaffService.updatePermissions(req.schoolId!, req.params.id, permissions);
  res.json({ success: true, message: 'Staff permissions updated successfully' });
});

// PATCH /api/staff/:id/status
router.patch('/:id/status', requireAuth, requirePermission('staff.manage'), (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be active or inactive' });
  }
  const success = StaffService.toggleStatus(req.schoolId!, req.params.id, status);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Staff member not found' });
  }
  res.json({ success: true, message: `Staff status set to ${status}` });
});

// DELETE /api/staff/:id
router.delete('/:id', requireAuth, requirePermission('staff.manage'), async (req, res) => {
  await StaffService.deleteStaff(req.schoolId!, req.params.id);
  res.json({ success: true, message: 'Staff member removed successfully' });
});

export default router;
