import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { validateBody } from '../middleware/validate';
import { createSmsTemplateSchema, sendSmsCampaignSchema } from '../validators/sms.validator';
import { SmsService } from '../services/sms.service';
import { dbStore } from '../config/supabase';

const router = Router();

// GET /api/sms/templates
router.get('/templates', requireAuth, (req, res) => {
  const templates = SmsService.getTemplates(req.schoolId!);
  res.json({ success: true, data: templates });
});

// POST /api/sms/templates
router.post('/templates', requireAuth, requirePermission('sms.manage_templates'), validateBody(createSmsTemplateSchema), (req, res) => {
  const newTmpl = {
    id: `tmpl-${Date.now()}`,
    schoolId: req.schoolId!,
    name: req.body.name,
    category: req.body.category,
    messageBody: req.body.messageBody,
    createdAt: new Date().toISOString()
  };
  dbStore.smsTemplates.push(newTmpl);
  dbStore.saveToDisk();
  res.status(201).json({ success: true, message: 'SMS template created', data: newTmpl });
});

// POST /api/sms/campaign OR /api/sms/campaigns
router.post(['/campaign', '/campaigns'], requireAuth, requirePermission('sms.send'), validateBody(sendSmsCampaignSchema), async (req, res, next) => {
  try {
    const { title, message, targetType, classId, sectionId, customPhones } = req.body;
    const result = await SmsService.sendCampaign(
      req.schoolId!,
      req.user!.userId,
      title,
      message,
      targetType,
      classId,
      sectionId,
      customPhones
    );
    res.json({ success: true, message: 'SMS campaign completed', ...result });
  } catch (err) {
    next(err);
  }
});

// GET /api/sms/logs
router.get('/logs', requireAuth, requirePermission('sms.send'), (req, res) => {
  const logs = dbStore.smsLogs
    .filter(l => l.schoolId === req.schoolId || l.school_id === req.schoolId)
    .sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime());
  res.json({ success: true, data: logs });
});

export default router;
