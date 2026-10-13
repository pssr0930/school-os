import { z } from 'zod';

export const recordPaymentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  paymentMethod: z.union([
    z.enum(['cash', 'UPI', 'upi', 'bank_transfer', 'cheque', 'other']),
    z.string()
  ]).transform(val => (val.toUpperCase() === 'UPI' ? 'UPI' : val as any)),
  transactionReference: z.string().optional().nullable(),
  paymentDate: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
  notes: z.string().optional().nullable()
});
