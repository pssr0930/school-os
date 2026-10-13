import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { dbStore, supabaseAdmin } from '../config/supabase';
import crypto from 'crypto';

const router = Router();

// GET /api/classes
router.get('/', requireAuth, (req, res) => {
  const schoolId = req.schoolId;
  if (!schoolId) {
    return res.json({ success: true, data: [] });
  }

  const classes = dbStore.classes
    .filter(c => c.schoolId === schoolId || (c as any).school_id === schoolId)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  res.json({ success: true, data: classes });
});

// GET /api/classes/:classId/sections
router.get('/:classId/sections', requireAuth, (req, res) => {
  const schoolId = req.schoolId;
  if (!schoolId) {
    return res.json({ success: true, data: [] });
  }

  const sections = dbStore.sections.filter(s => (s.schoolId === schoolId || (s as any).school_id === schoolId) && s.classId === req.params.classId);
  res.json({ success: true, data: sections });
});

// POST /api/classes (Create a class for current school)
router.post('/', requireAuth, async (req, res) => {
  const schoolId = req.schoolId;
  if (!schoolId) {
    return res.status(400).json({ success: false, error: 'School ID required' });
  }

  const { name, displayOrder } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Class name is required' });
  }

  const newClass = {
    id: crypto.randomUUID(),
    schoolId: schoolId,
    name: name,
    displayOrder: displayOrder || dbStore.classes.filter(c => c.schoolId === schoolId).length + 1,
    createdAt: new Date().toISOString()
  };

  dbStore.classes.push(newClass as any);
  dbStore.saveToDisk();

  try {
    await supabaseAdmin.from('classes').insert([{
      id: newClass.id,
      school_id: schoolId,
      name: newClass.name,
      display_order: newClass.displayOrder
    }]);
  } catch (err) {
    console.warn('[Supabase Class Insert Warning]', err);
  }

  res.status(201).json({ success: true, data: newClass });
});

export default router;
