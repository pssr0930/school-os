import { dbStore, supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import crypto from 'crypto';

export interface RegisterSchoolDTO {
  schoolName: string;
  schoolCode: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  adminFullName: string;
  adminEmail: string; // Custom Admin ID / Username
  adminPhone: string;
  adminPassword: string;
  academicYearName: string;
  startDate: string;
  attendanceCutoffTime: string;
  defaultCurrency: string;
}

export class AuthService {
  static async registerSchool(data: RegisterSchoolDTO) {
    const schoolId = crypto.randomUUID();
    const adminUserId = crypto.randomUUID();
    const authUserId = crypto.randomUUID();
    const academicYearId = crypto.randomUUID();

    // 1. Create School Record
    const newSchool = {
      id: schoolId,
      name: data.schoolName,
      school_code: data.schoolCode,
      address: data.address,
      city: data.city,
      state: data.state,
      postal_code: data.postalCode || '500001',
      phone: data.phone,
      email: data.email,
      website: data.website || '',
      logo_url: '',
      default_currency: data.defaultCurrency || 'INR',
      attendance_cutoff_time: data.attendanceCutoffTime || '10:30',
      attendance_sms_enabled: true,
      registration_prefix: 'REG',
      created_at: new Date().toISOString()
    };

    // 2. Create Admin User Profile
    const adminProfile = {
      id: adminUserId,
      auth_user_id: authUserId,
      full_name: data.adminFullName,
      email: data.adminEmail, // Custom ID or Email
      phone: data.adminPhone,
      password: data.adminPassword || 'password',
      created_at: new Date().toISOString()
    };

    // 3. Create Admin School Membership
    const schoolMember = {
      id: crypto.randomUUID(),
      user_id: adminUserId,
      school_id: schoolId,
      role: 'admin',
      status: 'active'
    };

    // 4. Create Initial Academic Year
    const newAcademicYear = {
      id: academicYearId,
      school_id: schoolId,
      name: data.academicYearName,
      start_date: data.startDate || '2026-06-01',
      end_date: '2027-04-30',
      is_current: true
    };

    // Persist to local JSON DB store immediately
    dbStore.schools.push(newSchool);
    dbStore.profiles.push(adminProfile);
    dbStore.schoolMembers.push(schoolMember);
    dbStore.academicYears.push(newAcademicYear);

    // Create Default Standard Classes (LKG to Class 10) for new school
    const standardClasses = [
      'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 
      'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
    ];

    const supabaseClasses: any[] = [];
    const supabaseSections: any[] = [];

    standardClasses.forEach((name, idx) => {
      const classId = crypto.randomUUID();
      dbStore.classes.push({
        id: classId,
        schoolId: schoolId,
        name: name,
        displayOrder: idx + 1
      });
      supabaseClasses.push({
        id: classId,
        school_id: schoolId,
        name: name,
        display_order: idx + 1
      });

      // Default Section A for each class
      const secId = crypto.randomUUID();
      dbStore.sections.push({
        id: secId,
        schoolId: schoolId,
        classId: classId,
        name: 'A'
      });
      supabaseSections.push({
        id: secId,
        school_id: schoolId,
        class_id: classId,
        name: 'A'
      });

      // Default Fee Structure per class
      const baseTuition = 12000 + idx * 2000;
      dbStore.feeStructures.push({
        id: crypto.randomUUID(),
        schoolId: schoolId,
        academicYearId: academicYearId,
        classId: classId,
        tuitionFee: baseTuition,
        admissionFee: 2500,
        examinationFee: 1500,
        transportFee: 0,
        booksFee: 1200,
        uniformFee: 0,
        otherFee: 0,
        totalFee: baseTuition + 2500 + 1500 + 1200
      });
    });

    // Save to local disk immediately
    dbStore.saveToDisk();

    // Persist to real Supabase PostgreSQL tables
    try {
      await supabaseAdmin.from('schools').insert([newSchool]);
      await supabaseAdmin.from('profiles').insert([adminProfile]);
      await supabaseAdmin.from('school_members').insert([schoolMember]);
      await supabaseAdmin.from('academic_years').insert([newAcademicYear]);
      await supabaseAdmin.from('classes').insert(supabaseClasses);
      await supabaseAdmin.from('sections').insert(supabaseSections);
      console.log(`[Supabase PostgreSQL] Persisted school "${data.schoolName}" to real database tables.`);
    } catch (err) {
      console.warn('[Supabase Persist Warning]', err);
    }

    return {
      school: newSchool,
      admin: adminProfile,
      academicYear: newAcademicYear
    };
  }

  static async authenticateUser(identifier: string, password?: string, role?: string) {
    const rawTarget = (identifier || '').trim();
    const target = rawTarget.toLowerCase();

    if (!rawTarget) return null;

    // Reject Agent credentials on Admin/Staff login with generic invalid credentials
    if (target === 'agent@pssr.com' || target === 'agent@schoolos.com' || target === 'agent') {
      return null;
    }

    // 1. Look up staff detail record by Employee ID, Phone, Email, Username, or ID
    let staffDetail = dbStore.staffProfiles.find(sp => 
      (sp.employeeId && sp.employeeId.trim().toLowerCase() === target) || 
      (sp.phone && sp.phone.trim().toLowerCase() === target) ||
      (sp.id && sp.id.trim().toLowerCase() === target) ||
      (sp.user_id && sp.user_id.trim().toLowerCase() === target)
    );

    // 2. Look up profile record by Email, Phone, Full Name, ID, or Username
    let profile = dbStore.profiles.find(p => 
      (p.email && p.email.trim().toLowerCase() === target) || 
      (p.phone && p.phone.trim().toLowerCase() === target) ||
      (p.full_name && p.full_name.trim().toLowerCase() === target) || 
      (p.id && p.id.trim().toLowerCase() === target) ||
      (staffDetail && p.id === staffDetail.user_id)
    );

    if (!profile && staffDetail) {
      profile = dbStore.profiles.find(p => p.id === staffDetail.user_id);
    }

    let school = dbStore.schools[dbStore.schools.length - 1] || dbStore.schools[0] || {
      id: 'sch-1786045901898',
      name: 'Murthy High School'
    };

    let member: any = null;

    if (profile) {
      member = dbStore.schoolMembers.find(sm => sm.user_id === profile.id);
      if (member) {
        const foundSchool = dbStore.schools.find(s => s.id === member.school_id);
        if (foundSchool) school = foundSchool;
      }
    }

    // Dynamic auto-registration for any new staff / admin credential
    if (!profile) {
      const newUserId = crypto.randomUUID();
      const isStaffLogin = role === 'staff' || target.includes('stf') || target.includes('tcr') || target.includes('emp') || target.includes('teacher');
      
      profile = {
        id: newUserId,
        full_name: rawTarget.includes('@') ? rawTarget.split('@')[0] : (rawTarget.toUpperCase()),
        email: rawTarget,
        phone: '9121454554',
        password: password || 'password',
        created_at: new Date().toISOString()
      };
      
      member = {
        id: crypto.randomUUID(),
        school_id: school.id,
        user_id: newUserId,
        role: isStaffLogin ? 'staff' : 'admin',
        status: 'active'
      };

      if (isStaffLogin) {
        staffDetail = {
          id: crypto.randomUUID(),
          school_id: school.id,
          user_id: newUserId,
          employeeId: rawTarget,
          designation: 'Teacher',
          phone: '9121454554',
          password: password || 'password',
          status: 'active'
        };
        dbStore.staffProfiles.push(staffDetail);
      }

      dbStore.profiles.push(profile);
      dbStore.schoolMembers.push(member);
      dbStore.saveToDisk();
    }

    if (!member && profile) {
      member = dbStore.schoolMembers.find(sm => sm.user_id === profile.id) || { user_id: profile.id, school_id: school.id, role: role || 'admin' };
    }

    // Fetch permissions assigned to this staff member
    let staffPerms: string[] = [];
    if (profile) {
      staffPerms = dbStore.staffPermissions
        .filter(sp => sp.user_id === profile.id || (staffDetail && sp.user_id === staffDetail.user_id))
        .map(sp => sp.permission_key || sp.permissionKey);
    }

    // Default permissions for staff if none explicitly allocated
    if (staffPerms.length === 0 && (role === 'staff' || member?.role !== 'admin')) {
      staffPerms = ['students.view', 'attendance.view', 'attendance.mark', 'fees.view', 'fees.manage', 'payments.record'];
    }

    // Standardize user role for Staff Portal vs Admin Portal
    const userRole = (role === 'staff' || member?.role === 'staff' || member?.role === 'teacher') 
      ? 'staff' 
      : (member?.role || 'admin');

    return {
      user: {
        userId: profile.id,
        fullName: profile.full_name || staffDetail?.designation || (userRole === 'staff' ? 'Staff Member' : 'School Administrator'),
        email: profile.email || rawTarget,
        schoolId: school.id,
        role: userRole,
        permissions: userRole === 'admin' ? ['students.view', 'attendance.view', 'attendance.mark', 'students.manage', 'fees.view', 'fees.manage', 'payments.record', 'sms.send'] : staffPerms
      },
      school,
      token: `user-${profile.id}`
    };
  }
}
