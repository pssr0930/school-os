import { z } from 'zod';

export const createFeeStructureSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  tuitionFee: z.number().min(0),
  admissionFee: z.number().min(0).default(0),
  examinationFee: z.number().min(0).default(0),
  transportFee: z.number().min(0).default(0),
  booksFee: z.number().min(0).default(0),
  uniformFee: z.number().min(0).default(0),
  otherFee: z.number().min(0).default(0)
});

export const applyConcessionSchema = z.object({
  amount: z.number().positive('Concession amount must be greater than 0'),
  reason: z.string().min(3, 'Reason for concession is required')
});

export const updatePreviousDueSchema = z.object({
  previousYearDue: z.number().min(0, 'Previous due cannot be negative')
});
