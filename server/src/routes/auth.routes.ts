import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../validators/auth.validator';
import { AuthService } from '../services/auth.service';
import { dbStore } from '../config/supabase';

const router = Router();

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const s = dbStore.schools.find(sc => sc.id === req.schoolId) || dbStore.schools[0];
  const normalizedSchool = s ? {
    ...s,
    schoolCode: s.schoolCode || s.school_code || 'MHS',
    logoUrl: s.logoUrl || s.logo_url || '',
    logo_url: s.logoUrl || s.logo_url || '',
    attendanceCutoffTime: s.attendanceCutoffTime || s.attendance_cutoff_time || '10:30',
    attendanceSmsEnabled: s.attendanceSmsEnabled !== undefined ? s.attendanceSmsEnabled : (s.attendance_sms_enabled ?? true),
    defaultCurrency: s.defaultCurrency || s.default_currency || 'INR'
  } : null;

  res.json({
    success: true,
    user: req.user,
    school: normalizedSchool
  });
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const role = req.body.role; // Optional role hint ('admin' | 'staff')
  
  const result = await AuthService.authenticateUser(email, password, role);
  if (!result) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  res.json({
    success: true,
    message: 'Login successful',
    token: result.token,
    user: result.user,
    school: result.school
  });
});

export default router;
