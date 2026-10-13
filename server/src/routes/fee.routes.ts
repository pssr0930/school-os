import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { validateBody } from '../middleware/validate';
import { createFeeStructureSchema, applyConcessionSchema, updatePreviousDueSchema } from '../validators/fee.validator';
import { FeeService } from '../services/fee.service';
import { dbStore } from '../config/supabase';

const router = Router();

// GET /api/fees/dashboard (Allowed for Admin and Staff with fees.view or fees.manage permission)
router.get('/dashboard', requireAuth, requirePermission('fees.view'), (req, res) => {
  const schoolId = req.schoolId;
  if (!schoolId) {
    return res.json({
      success: true,
      data: {
        totalCollected: 0,
        pendingDues: 0,
        defaultersCount: 0,
        paymentMethods: {},
        defaulters: [],
        recentTransactions: [],
        today: { total: 0, transactionsCount: 0, averageTransaction: 0, breakdown: {}, transactionsList: [] },
        classBreakdown: []
      }
    });
  }

  const students = dbStore.students.filter(st => (st.schoolId === schoolId || st.school_id === schoolId) && !st.isArchived);
  const classes = dbStore.classes.filter(c => c.schoolId === schoolId || c.school_id === schoolId);
  const sections = dbStore.sections.filter(sec => sec.schoolId === schoolId || sec.school_id === schoolId);
  const studentFees = dbStore.studentFees.filter(sf => sf.schoolId === schoolId || sf.school_id === schoolId);
  const payments = dbStore.payments.filter(p => p.schoolId === schoolId || p.school_id === schoolId);

  let totalCollected = 0;
  const paymentMethodBreakdown: Record<string, { count: number; amount: number }> = {};

  payments.forEach(p => {
    const amt = p.amount || 0;
    totalCollected += amt;
    const method = (p.paymentMethod || 'cash').toLowerCase();
    if (!paymentMethodBreakdown[method]) {
      paymentMethodBreakdown[method] = { count: 0, amount: 0 };
    }
    paymentMethodBreakdown[method].count += 1;
    paymentMethodBreakdown[method].amount += amt;
  });

  // TODAY'S PAYMENT ANALYSIS
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysPayments = payments.filter(p => {
    if (!p.paymentDate) return false;
    return p.paymentDate.startsWith(todayStr) || p.paymentDate === todayStr;
  });

  let todaysTotal = 0;
  const todaysMethodBreakdown: Record<string, number> = {};

  const todaysTransactionsList = todaysPayments.map(p => {
    const amt = p.amount || 0;
    todaysTotal += amt;
    const method = (p.paymentMethod || 'cash').toLowerCase();
    todaysMethodBreakdown[method] = (todaysMethodBreakdown[method] || 0) + amt;

    const st = students.find(s => s.id === p.studentId || s.id === p.student_id);
    const classObj = classes.find(c => c.id === st?.classId || c.id === st?.class_id);

    return {
      id: p.id,
      receiptNumber: p.receiptNumber,
      paymentDate: p.paymentDate,
      amount: amt,
      paymentMethod: p.paymentMethod,
      transactionReference: p.transactionReference,
      studentName: st?.fullName || 'Student',
      registrationNumber: st?.registrationNumber || 'N/A',
      className: classObj?.name || 'N/A'
    };
  });

  const todaysAvg = todaysPayments.length > 0 ? Math.round(todaysTotal / todaysPayments.length) : 0;

  let totalBaseFee = 0;
  let totalPreviousYearDue = 0;
  let totalConcessions = 0;

  const defaulters: any[] = [];
  const classBreakdownMap: Record<string, any> = {};

  classes.forEach(c => {
    classBreakdownMap[c.id] = {
      classId: c.id,
      className: c.name,
      studentCount: 0,
      totalBaseFee: 0,
      totalPreviousDue: 0,
      totalConcessions: 0,
      totalDue: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      collectionPercentage: 0,
      defaultersCount: 0
    };
  });

  students.forEach(st => {
    const classObj = classes.find(c => c.id === st.classId || c.id === st.class_id);
    const sectionObj = sections.find(s => s.id === st.sectionId || s.id === st.section_id);
    const sf = studentFees.find(f => f.studentId === st.id || f.student_id === st.id);

    const baseFee = sf?.baseFee || sf?.base_fee || 15000;
    const previousYearDue = sf?.previousYearDue || sf?.previous_year_due || 0;
    const concessionAmount = sf?.concessionAmount || sf?.concession_amount || 0;

    // Student's payments
    const stPayments = payments.filter(p => p.studentId === st.id || p.student_id === st.id);
    const amountPaid = stPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalDue = baseFee + previousYearDue - concessionAmount;
    const balance = sf?.balance !== undefined ? sf.balance : Math.max(0, totalDue - amountPaid);

    totalBaseFee += baseFee;
    totalPreviousYearDue += previousYearDue;
    totalConcessions += concessionAmount;

    const classId = st.classId || st.class_id;
    if (classId && classBreakdownMap[classId]) {
      classBreakdownMap[classId].studentCount += 1;
      classBreakdownMap[classId].totalBaseFee += baseFee;
      classBreakdownMap[classId].totalPreviousDue += previousYearDue;
      classBreakdownMap[classId].totalConcessions += concessionAmount;
      classBreakdownMap[classId].totalDue += totalDue;
      classBreakdownMap[classId].totalPaid += amountPaid;
      classBreakdownMap[classId].totalOutstanding += balance;
      if (balance > 0) {
        classBreakdownMap[classId].defaultersCount += 1;
      }
    }

    if (balance > 0) {
      defaulters.push({
        id: st.id,
        fullName: st.fullName,
        registrationNumber: st.registrationNumber,
        className: classObj?.name || 'N/A',
        sectionName: sectionObj?.name || 'A',
        fatherName: st.parentDetails?.fatherName || st.fatherName || 'Parent',
        fatherPhone: st.parentDetails?.fatherPhone || st.fatherPhone || st.motherPhone || 'N/A',
        baseFee,
        previousYearDue,
        concessionAmount,
        totalDue,
        amountPaid,
        balance
      });
    }
  });

  // Calculate percentage per class
  Object.values(classBreakdownMap).forEach((cb: any) => {
    cb.collectionPercentage = cb.totalDue > 0 ? Math.round((cb.totalPaid / cb.totalDue) * 100) : 100;
  });

  const totalPackageDue = totalBaseFee + totalPreviousYearDue - totalConcessions;
  const totalOutstanding = Math.max(0, totalPackageDue - totalCollected);
  const overallCollectionPercentage = totalPackageDue > 0 ? Math.round((totalCollected / totalPackageDue) * 100) : 100;

  // Sort defaulters by highest balance first
  defaulters.sort((a, b) => b.balance - a.balance);

  res.json({
    success: true,
    metrics: {
      totalCollected,
      totalPackageDue,
      totalOutstanding,
      totalBaseFee,
      totalPreviousYearDue,
      totalConcessions,
      totalPaymentsCount: payments.length,
      overallCollectionPercentage,
      defaultersCount: defaulters.length
    },
    todaysAnalysis: {
      todayDate: todayStr,
      todaysTotal,
      todaysCount: todaysPayments.length,
      todaysAvg,
      todaysMethodBreakdown,
      todaysTransactionsList
    },
    paymentMethodBreakdown,
    classBreakdown: Object.values(classBreakdownMap),
    defaulters
  });
});

// GET /api/fees/structures (Allowed for Admin and Staff with fees.view permission)
router.get('/structures', requireAuth, requirePermission('fees.view'), (req, res) => {
  const structures = FeeService.getFeeStructures(req.schoolId!);
  res.json({ success: true, data: structures });
});

// POST /api/fees/structures (STRICTLY RESTRICTED TO ADMINISTRATORS ONLY)
router.post('/structures', requireAuth, (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can modify fee structures.' });
  }
  next();
}, validateBody(createFeeStructureSchema), async (req, res) => {
  const structure = await FeeService.createOrUpdateFeeStructure(req.schoolId!, req.body);
  res.json({ success: true, message: 'Fee structure updated & synced across enrolled class students', data: structure });
});

// GET /api/fees/student-fees/:studentId OR /api/fees/student/:studentId
router.get(['/student-fees/:studentId', '/student/:studentId'], requireAuth, requirePermission('fees.view'), (req, res) => {
  const sf = dbStore.studentFees.find(f => (f.studentId === req.params.studentId || f.student_id === req.params.studentId) && (f.schoolId === req.schoolId || f.school_id === req.schoolId));
  const concessions = dbStore.feeConcessions.filter(fc => (fc.student_id === req.params.studentId || fc.studentId === req.params.studentId) && (fc.school_id === req.schoolId || fc.schoolId === req.schoolId));
  res.json({ success: true, feeSummary: sf, concessions });
});

// POST /api/fees/student-fees/:studentId/concession OR /api/fees/student/:studentId/concession
router.post(['/student-fees/:studentId/concession', '/student/:studentId/concession'], requireAuth, requirePermission('fees.manage'), validateBody(applyConcessionSchema), async (req, res) => {
  const { amount, reason } = req.body;
  const updated = await FeeService.applyConcession(req.schoolId!, req.params.studentId, req.user!.userId, amount, reason);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Student fee record not found' });
  }
  res.json({ success: true, message: 'Concession applied successfully', data: updated });
});

// PATCH /api/fees/student-fees/:studentId/previous-due OR /api/fees/student/:studentId/previous-due
router.patch(['/student-fees/:studentId/previous-due', '/student/:studentId/previous-due'], requireAuth, requirePermission('fees.manage'), validateBody(updatePreviousDueSchema), async (req, res) => {
  const { previousYearDue } = req.body;
  const updated = await FeeService.updatePreviousDue(req.schoolId!, req.params.studentId, previousYearDue);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Student fee record not found' });
  }
  res.json({ success: true, message: 'Previous year due updated', data: updated });
});

export default router;
