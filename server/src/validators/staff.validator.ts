import { z } from 'zod';

export const createStaffSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().min(2, 'Alphanumeric Staff ID / Username must be at least 2 characters'),
  phone: z.string().trim().optional().or(z.literal('')),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['teacher', 'staff']),
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  qualification: z.string().optional(),
  address: z.string().optional(),
  permissions: z.array(z.string()).default([])
});

export const updateStaffPermissionsSchema = z.object({
  permissions: z.array(z.string())
});
