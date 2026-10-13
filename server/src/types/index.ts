import { Request } from 'express';

export type UserRole = 'admin' | 'teacher' | 'staff';

export type PermissionKey = 
  | 'students.view'
  | 'students.create'
  | 'students.edit'
  | 'students.manage'
  | 'students.archive'
  | 'attendance.view'
  | 'attendance.mark'
  | 'fees.view'
  | 'fees.manage'
  | 'payments.view'
  | 'payments.record'
  | 'sms.send'
  | 'sms.manage_templates'
  | 'staff.view'
  | 'staff.manage';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  fullName: string;
  schoolId: string;
  role: UserRole;
  permissions: PermissionKey[];
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  schoolId?: string;
}

export interface SchoolInfo {
  id: string;
  name: string;
  schoolCode: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  defaultCurrency: string;
  attendanceCutoffTime: string;
  attendanceSmsEnabled: boolean;
  registrationPrefix: string;
  createdAt: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ClassItem {
  id: string;
  schoolId: string;
  name: string;
  displayOrder: number;
}

export interface SectionItem {
  id: string;
  schoolId: string;
  classId: string;
  name: string;
}

export interface StudentItem {
  id: string;
  schoolId: string;
  academicYearId: string;
  registrationNumber: string;
  studentCode?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  admissionDate: string;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  status: 'active' | 'inactive' | 'archived';
  studentAadhaar?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  createdAt: string;
  parentDetails?: StudentParentItem;
  feeSummary?: StudentFeeSummary;
  attendancePercentage?: number;
}

export interface StudentParentItem {
  id: string;
  studentId: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  guardianPhone?: string;
  parentEmail?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  relationship?: string;
}

export interface FeeStructureItem {
  id: string;
  schoolId: string;
  academicYearId: string;
  classId: string;
  className?: string;
  tuitionFee: number;
  admissionFee: number;
  examinationFee: number;
  transportFee: number;
  booksFee: number;
  uniformFee: number;
  otherFee: number;
  totalFee: number;
}

export interface StudentFeeSummary {
  id: string;
  studentId: string;
  academicYearId: string;
  previousYearDue: number;
  baseFee: number;
  concessionAmount: number;
  finalFee: number;
  amountPaid: number;
  balance: number;
}

export interface PaymentItem {
  id: string;
  schoolId: string;
  studentId: string;
  studentName?: string;
  registrationNumber?: string;
  academicYearId: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: 'cash' | 'UPI' | 'bank_transfer' | 'cheque' | 'other';
  transactionReference?: string;
  paymentDate: string;
  recordedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  academicYearId: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late';
  markedBy?: string;
  markedAt: string;
  smsStatus?: 'pending' | 'sent' | 'failed' | 'not_required';
  smsSentAt?: string;
  twilioMessageId?: string;
}

export interface StaffItem {
  id: string;
  schoolId: string;
  userId: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string;
  designation: string;
  joiningDate: string;
  qualification?: string;
  address?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  permissions: PermissionKey[];
}
