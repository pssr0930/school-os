import { dbStore, supabaseAdmin } from '../config/supabase';
import crypto from 'crypto';
import { env } from '../config/env';

export interface CreateStaffDTO {
  fullName: string;
  email: string; // Custom Staff ID / Username allotted by admin
  phone: string;
  password: string; // Staff fixed password allotted by admin
  role: 'teacher' | 'staff';
  employeeId?: string;
  designation?: string;
  joiningDate?: string;
  qualification?: string;
  address?: string;
  permissions: string[];
}

export class StaffService {
  static async createStaff(schoolId: string, data: CreateStaffDTO) {
    const userId = crypto.randomUUID();
    const authUserId = crypto.randomUUID();
    const staffProfileId = crypto.randomUUID();

    // 1. User Profile Record
    const profile = {
      id: userId,
      auth_user_id: authUserId,
      full_name: data.fullName,
      email: data.email, // Custom Staff ID / Username
      phone: data.phone || '',
      password: data.password || 'password123',
      created_at: new Date().toISOString()
    };
    dbStore.profiles.push(profile);

    // 2. School Member Membership
    const member = {
      id: crypto.randomUUID(),
      school_id: schoolId,
      user_id: userId,
      role: data.role,
      status: 'active'
    };
    dbStore.schoolMembers.push(member);

    // 3. Staff Details Record
    const empId = data.employeeId || `EMP-${Date.now().toString().slice(-4)}`;
    const staffDetail = {
      id: staffProfileId,
      school_id: schoolId,
      user_id: userId,
      employeeId: empId,
      designation: data.designation || (data.role === 'teacher' ? 'Teacher' : 'Staff Member'),
      joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
      qualification: data.qualification || '',
      phone: data.phone || '',
      password: data.password || 'password123',
      address: data.address || '',
      status: 'active'
    };
    dbStore.staffProfiles.push(staffDetail);

    // 4. Permissions Allocation
    data.permissions.forEach(permKey => {
      dbStore.staffPermissions.push({
        id: crypto.randomUUID(),
        school_id: schoolId,
        user_id: userId,
        permission_key: permKey
      });
    });

    // Save to local disk immediately
    dbStore.saveToDisk();

    // Persist to real Supabase PostgreSQL tables if connected
    try {
      const { error: prErr } = await supabaseAdmin.from('profiles').insert([{
        id: profile.id,
        auth_user_id: profile.auth_user_id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone
      }]);
      if (prErr) console.warn('[Supabase Staff Profile Insert Warning]', prErr.message || prErr);

      const { error: smErr } = await supabaseAdmin.from('school_members').insert([member]);
      if (smErr) console.warn('[Supabase School Member Insert Warning]', smErr.message || smErr);

      console.log(`[Supabase PostgreSQL Sync] Persisted staff member "${data.fullName}" to real database.`);
    } catch (err: any) {
      console.warn('[Supabase Staff Sync Warning]', err.message || err);
    }

    return {
      userId,
      fullName: data.fullName,
      staffId: data.email,
      password: data.password || 'password123',
      role: data.role,
      employeeId: empId,
      permissions: data.permissions
    };
  }

  static getStaffList(schoolId: string) {
    const members = dbStore.schoolMembers.filter(sm => (sm.school_id === schoolId || sm.schoolId === schoolId) && (sm.role === 'teacher' || sm.role === 'staff'));
    return members.map(m => {
      const profile = dbStore.profiles.find(p => p.id === m.user_id);
      const detail = dbStore.staffProfiles.find(sp => sp.user_id === m.user_id && (sp.school_id === schoolId || sp.schoolId === schoolId));
      const perms = dbStore.staffPermissions.filter(sp => sp.user_id === m.user_id && (sp.school_id === schoolId || sp.schoolId === schoolId)).map(sp => sp.permission_key || sp.permissionKey);

      return {
        userId: m.user_id,
        fullName: profile?.full_name || 'Staff Member',
        email: profile?.email || 'N/A', // Staff ID / Username
        password: (detail as any)?.password || (profile as any)?.password || 'password123', // Fixed Login Password
        phone: profile?.phone || detail?.phone || 'N/A',
        role: m.role,
        status: m.status,
        employeeId: detail?.employeeId || 'N/A',
        designation: detail?.designation || 'Staff',
        permissions: perms
      };
    });
  }

  static async updatePassword(schoolId: string, userId: string, newPassword: string) {
    const profile = dbStore.profiles.find(p => p.id === userId);
    const detail = dbStore.staffProfiles.find(sp => sp.user_id === userId && (sp.school_id === schoolId || sp.schoolId === schoolId));

    if (profile) (profile as any).password = newPassword;
    if (detail) (detail as any).password = newPassword;

    dbStore.saveToDisk();

    try {
      await supabaseAdmin.from('profiles').update({ phone: profile?.phone }).eq('id', userId);
    } catch (err: any) {
      console.warn('[Supabase Staff Password Update Warning]', err.message || err);
    }

    return true;
  }

  static async toggleStatus(schoolId: string, userId: string, newStatus?: string) {
    const member = dbStore.schoolMembers.find(sm => (sm.school_id === schoolId || sm.schoolId === schoolId) && sm.user_id === userId);
    if (!member) return null;
    member.status = newStatus || (member.status === 'active' ? 'inactive' : 'active');
    dbStore.saveToDisk();

    try {
      await supabaseAdmin.from('school_members').update({ status: member.status }).eq('user_id', userId).eq('school_id', schoolId);
    } catch (err: any) {
      console.warn('[Supabase Staff Status Toggle Warning]', err.message || err);
    }

    return member.status;
  }

  static async deleteStaff(schoolId: string, userId: string) {
    dbStore.schoolMembers = dbStore.schoolMembers.filter(sm => !( (sm.school_id === schoolId || sm.schoolId === schoolId) && sm.user_id === userId));
    dbStore.staffProfiles = dbStore.staffProfiles.filter(sp => !( (sp.school_id === schoolId || sp.schoolId === schoolId) && sp.user_id === userId));
    dbStore.staffPermissions = dbStore.staffPermissions.filter(sp => !( (sp.school_id === schoolId || sp.schoolId === schoolId) && sp.user_id === userId));
    dbStore.profiles = dbStore.profiles.filter(p => p.id !== userId);

    dbStore.saveToDisk();

    try {
      await supabaseAdmin.from('school_members').delete().eq('user_id', userId).eq('school_id', schoolId);
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
    } catch (err: any) {
      console.warn('[Supabase Staff Delete Warning]', err.message || err);
    }

    return true;
  }

  static async updatePermissions(schoolId: string, userId: string, permissions: string[]) {
    // Clear old permissions for user
    dbStore.staffPermissions = dbStore.staffPermissions.filter(sp => !( (sp.school_id === schoolId || sp.schoolId === schoolId) && sp.user_id === userId));

    // Add new permissions
    permissions.forEach(permKey => {
      dbStore.staffPermissions.push({
        id: crypto.randomUUID(),
        school_id: schoolId,
        user_id: userId,
        permission_key: permKey
      });
    });

    dbStore.saveToDisk();
    return permissions;
  }
}
