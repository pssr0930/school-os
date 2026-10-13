import { z } from 'zod';

export const registerSchoolSchema = z.object({
  schoolName: z.string().trim().min(2, 'School name must be at least 2 characters'),
  schoolCode: z.string().trim().min(2, 'School code is required'),
  address: z.string().trim().min(2, 'Address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().optional().or(z.literal('')),
  phone: z.string().trim().min(5, 'Phone number is required'),
  email: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  
  // Administrator Info - Custom Admin ID / Username allotted by user
  adminFullName: z.string().trim().min(2, 'Admin full name is required'),
  adminEmail: z.string().trim().min(2, 'Admin ID / Username must be at least 2 characters'),
  adminPhone: z.string().trim().min(5, 'Admin phone number is required'),
  adminPassword: z.string().min(4, 'Password must be at least 4 characters'),
  adminConfirmPassword: z.string().optional(),
  
  // Academic & Config
  academicYearName: z.string().optional().default('2026-2027'),
  startDate: z.string().optional().default('2026-06-01'),
  attendanceCutoffTime: z.string().optional().default('10:30'),
  defaultCurrency: z.string().optional().default('INR')
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Admin ID / Username / Email is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.string().optional()
});
