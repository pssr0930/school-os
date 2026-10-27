import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { AiService } from '../services/ai.service';
import { dbStore } from '../config/supabase';

const router = Router();

// GET /api/ai/insights
router.get('/insights', requireAuth, async (req, res, next) => {
  try {
    const insights = await AiService.generateDashboardInsights(req.schoolId!);
    res.json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/draft-sms OR /api/ai/generate-sms
router.post(['/draft-sms', '/generate-sms'], requireAuth, async (req, res, next) => {
  try {
    const { prompt, category, targetAudience, details } = req.body;
    const school = dbStore.schools.find(s => s.id === req.schoolId || s.id === (req as any).school_id);
    const content = prompt || details || 'Important announcement';
    const draft = await AiService.draftSms(
      school?.name || 'School OS',
      category || 'Announcement',
      targetAudience || 'Parents',
      content
    );
    res.json({
      success: true,
      data: {
        body: draft.message,
        title: category || 'School Notice',
        ...draft
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/fee-reminder
router.post('/fee-reminder', requireAuth, async (req, res, next) => {
  try {
    const { studentName, amount } = req.body;
    const school = dbStore.schools.find(s => s.id === req.schoolId);
    const draft = await AiService.draftFeeReminder(
      school?.name || 'School OS',
      studentName,
      amount
    );
    res.json({ success: true, data: draft });
  } catch (err) {
    next(err);
  }
});

export default router;
