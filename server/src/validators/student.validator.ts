import { z } from 'zod';

export const createStudentSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  admissionDate: z.string(),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().optional(),
  studentAadhaar: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  
  // Parent details
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  guardianName: z.string().optional(),
  fatherPhone: z.string().optional(),
  motherPhone: z.string().optional(),
  guardianPhone: z.string().optional(),
  parentEmail: z.string().email('Invalid parent email').optional().or(z.literal('')),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  relationship: z.string().optional()
});

export const updateStudentSchema = createStudentSchema.partial();
