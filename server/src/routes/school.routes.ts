import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { registerSchoolSchema } from '../validators/auth.validator';
import { AuthService } from '../services/auth.service';
import { dbStore, supabaseAdmin } from '../config/supabase';

const router = Router();

// POST /api/schools/register
router.post('/register', validateBody(registerSchoolSchema), async (req, res, next) => {
  try {
    const result = await AuthService.registerSchool(req.body);
    res.status(201).json({
      success: true,
      message: 'School and administrator account registered successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/schools/public-info (Public school info for custom landing entrance page)
router.get('/public-info', (req, res) => {
  const code = (req.query.code as string)?.trim().toUpperCase();
  
  let school = code 
    ? dbStore.schools.find(s => 
        (s.schoolCode || (s as any).school_code || '').toUpperCase() === code ||
        (s.id || '').toUpperCase() === code
      )
    : null;

  if (!school) {
    school = dbStore.schools[0] || {
      name: 'Murthy High School',
      schoolCode: 'MHS',
      logoUrl: '/pssr-logo.png',
      address: 'Sarpavaram police station road, near SRMT mall, Kakinada',
      phone: '9121454554',
      email: 'pssr0930@gmail.com'
    };
  }

  const motto = (school as any).motto || 'Empowering Minds, Shaping Futures & Inspiring Leaders';
  const logo = school.logoUrl || (school as any).logo_url || '/pssr-logo.png';

  res.json({
    success: true,
    school: {
      id: school.id || 'default',
      name: school.name || 'Murthy High School',
      schoolCode: school.schoolCode || (school as any).school_code || 'MHS',
      motto: motto,
      logoUrl: logo,
      address: school.address || 'Sarpavaram police station road, near SRMT mall, Kakinada',
      city: school.city || 'Kakinada',
      phone: school.phone || '9121454554',
      email: school.email || 'pssr0930@gmail.com'
    }
  });
});

// GET /api/schools/lookup/:code (Validates and retrieves school by school code)
router.get('/lookup/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const school = dbStore.schools.find(s => 
    (s.schoolCode || (s as any).school_code || '').toUpperCase() === code ||
    (s.name || '').toUpperCase().includes(code)
  );

  if (!school) {
    return res.status(404).json({
      success: false,
      message: `No active school found matching code "${code}". Please verify with your institution administration.`
    });
  }

  const motto = (school as any).motto || 'Empowering Minds, Shaping Futures & Inspiring Leaders';
  const logo = school.logoUrl || (school as any).logo_url || '/pssr-logo.png';

  res.json({
    success: true,
    school: {
      id: school.id,
      name: school.name,
      schoolCode: school.schoolCode || (school as any).school_code || code,
      motto,
      logoUrl: logo,
      address: school.address,
      city: school.city,
      phone: school.phone,
      email: school.email
    }
  });
});

// GET /api/schools/public-list (Lightweight list of registered schools for portal discovery)
router.get('/public-list', (req, res) => {
  const list = (dbStore.schools.length > 0 ? dbStore.schools : [{
    id: '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e',
    name: 'Murthy High School',
    schoolCode: 'MHS',
    city: 'Kakinada',
    logoUrl: '/pssr-logo.png'
  }]).map(s => ({
    id: s.id,
    name: s.name,
    schoolCode: s.schoolCode || (s as any).school_code || 'MHS',
    city: s.city || 'Kakinada',
    logoUrl: s.logoUrl || (s as any).logo_url || '/pssr-logo.png'
  }));

  res.json({ success: true, count: list.length, schools: list });
});

// GET /api/schools/current
router.get('/current', requireAuth, (req, res) => {
  const school = dbStore.schools.find(s => s.id === req.schoolId) || dbStore.schools[0];
  if (!school) {
    return res.status(404).json({ success: false, message: 'School not found' });
  }

  const normalizedSchool = {
    ...school,
    schoolCode: school.schoolCode || school.school_code || 'MHS',
    logoUrl: school.logoUrl || school.logo_url || '',
    logo_url: school.logoUrl || school.logo_url || '',
    attendanceCutoffTime: school.attendanceCutoffTime || school.attendance_cutoff_time || '10:30',
    attendanceSmsEnabled: school.attendanceSmsEnabled !== undefined ? school.attendanceSmsEnabled : (school.attendance_sms_enabled ?? true),
    defaultCurrency: school.defaultCurrency || school.default_currency || 'INR'
  };

  res.json({ success: true, school: normalizedSchool });
});

// PATCH /api/schools/current
router.patch('/current', requireAuth, async (req, res) => {
  const schoolId = req.schoolId || dbStore.schools[0]?.id;
  let idx = dbStore.schools.findIndex(s => s.id === schoolId);
  
  if (idx === -1 && dbStore.schools.length > 0) {
    idx = 0;
  }

  if (idx !== -1) {
    const updatedLogo = req.body.logoUrl !== undefined ? req.body.logoUrl : (req.body.logo_url !== undefined ? req.body.logo_url : (dbStore.schools[idx].logoUrl || dbStore.schools[idx].logo_url || ''));

    const updatedSchool = {
      ...dbStore.schools[idx],
      name: req.body.name !== undefined ? req.body.name : dbStore.schools[idx].name,
      schoolCode: req.body.schoolCode || req.body.school_code || dbStore.schools[idx].schoolCode || dbStore.schools[idx].school_code,
      school_code: req.body.schoolCode || req.body.school_code || dbStore.schools[idx].schoolCode || dbStore.schools[idx].school_code,
      address: req.body.address !== undefined ? req.body.address : dbStore.schools[idx].address,
      city: req.body.city !== undefined ? req.body.city : dbStore.schools[idx].city,
      state: req.body.state !== undefined ? req.body.state : dbStore.schools[idx].state,
      phone: req.body.phone !== undefined ? req.body.phone : dbStore.schools[idx].phone,
      email: req.body.email !== undefined ? req.body.email : dbStore.schools[idx].email,
      attendanceCutoffTime: req.body.attendanceCutoffTime || req.body.attendance_cutoff_time || dbStore.schools[idx].attendanceCutoffTime || dbStore.schools[idx].attendance_cutoff_time,
      attendance_cutoff_time: req.body.attendanceCutoffTime || req.body.attendance_cutoff_time || dbStore.schools[idx].attendanceCutoffTime || dbStore.schools[idx].attendance_cutoff_time,
      attendanceSmsEnabled: req.body.attendanceSmsEnabled !== undefined ? req.body.attendanceSmsEnabled : (dbStore.schools[idx].attendanceSmsEnabled ?? dbStore.schools[idx].attendance_sms_enabled),
      attendance_sms_enabled: req.body.attendanceSmsEnabled !== undefined ? req.body.attendanceSmsEnabled : (dbStore.schools[idx].attendanceSmsEnabled ?? dbStore.schools[idx].attendance_sms_enabled),
      defaultCurrency: req.body.defaultCurrency || req.body.default_currency || dbStore.schools[idx].defaultCurrency || dbStore.schools[idx].default_currency,
      default_currency: req.body.defaultCurrency || req.body.default_currency || dbStore.schools[idx].defaultCurrency || dbStore.schools[idx].default_currency,
      logoUrl: updatedLogo,
      logo_url: updatedLogo,
      updatedAt: new Date().toISOString()
    };

    dbStore.schools[idx] = updatedSchool;
    dbStore.saveToDisk();

    try {
      await supabaseAdmin.from('schools').update({
        name: updatedSchool.name,
        address: updatedSchool.address,
        phone: updatedSchool.phone,
        email: updatedSchool.email,
        logo_url: updatedLogo
      }).eq('id', dbStore.schools[idx].id);
      console.log(`[Supabase School Update] Saved school "${updatedSchool.name}" to cloud database.`);
    } catch (err: any) {
      console.warn('[Supabase School Update Warning]', err.message || err);
    }

    return res.json({ success: true, school: updatedSchool });
  }

  res.status(404).json({ success: false, message: 'School not found' });
});

export default router;
