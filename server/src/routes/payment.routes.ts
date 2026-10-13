import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { validateBody } from '../middleware/validate';
import { recordPaymentSchema } from '../validators/payment.validator';
import { PaymentService } from '../services/payment.service';

const router = Router();

// GET /api/payments (Accessible for Admin and Staff with payments.view, payments.record, fees.manage, or fees.view)
router.get('/', requireAuth, (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  const perms = req.user?.permissions || [];
  if (
    perms.includes('payments.view') || 
    perms.includes('payments.record') || 
    perms.includes('fees.manage') || 
    perms.includes('fees.view')
  ) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Missing required permission to view payment records.' });
}, async (req, res) => {
  const filters = {
    paymentMethod: req.query.paymentMethod as string,
    search: req.query.search as string
  };
  const list = await PaymentService.getPayments(req.schoolId!, filters);
  res.json({ success: true, count: list.length, data: list });
});

// POST /api/payments
router.post('/', requireAuth, (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  const perms = req.user?.permissions || [];
  if (
    perms.includes('payments.record') || 
    perms.includes('fees.manage')
  ) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Missing required permission to record payments.' });
}, validateBody(recordPaymentSchema), async (req, res, next) => {
  try {
    const result = await PaymentService.recordPayment(req.schoolId!, req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Payment recorded & receipt generated successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/:id/receipt
router.get('/:id/receipt', requireAuth, (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  const perms = req.user?.permissions || [];
  if (
    perms.includes('payments.view') || 
    perms.includes('payments.record') || 
    perms.includes('fees.manage') || 
    perms.includes('fees.view')
  ) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Missing required permission to view receipt.' });
}, async (req, res) => {
  const receipt = await PaymentService.getReceiptDetails(req.schoolId!, req.params.id);
  if (!receipt) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }
  res.json({ success: true, data: receipt });
});

export default router;
