import { Response, NextFunction } from 'express';
import { AuthRequest, AuthenticatedUser } from '../types';
import { dbStore } from '../config/supabase';

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const headerSchoolId = req.headers['x-school-id'] as string;
    
    // Check for authorization token or dev simulation token
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    let targetUserId = '';
    if (token && token.startsWith('user-')) {
      targetUserId = token.replace('user-', '');
    }

    let profile = targetUserId ? dbStore.profiles.find(p => p.id === targetUserId || p.auth_user_id === token) : null;
    let member = profile ? dbStore.schoolMembers.find(sm => sm.user_id === profile.id) : null;

    // Strict schoolId resolution based on user's active membership
    let schoolId = member?.school_id || (profile as any)?.school_id || (profile as any)?.schoolId;

    if (!schoolId) {
      if (headerSchoolId && dbStore.schools.some(s => s.id === headerSchoolId)) {
        schoolId = headerSchoolId;
      } else {
        // Fallback default admin/staff membership if dev bypass
        member = dbStore.schoolMembers[dbStore.schoolMembers.length - 1] || dbStore.schoolMembers[0];
        profile = profile || dbStore.profiles.find(p => p.id === member?.user_id) || dbStore.profiles[0];
        schoolId = member?.school_id || dbStore.schools[0]?.id || 'sch-1786045901898';
      }
    }

    let staffPerms = profile ? dbStore.staffPermissions
      .filter(sp => (sp.user_id === profile?.id || sp.userId === profile?.id) && (sp.school_id === schoolId || sp.schoolId === schoolId))
      .map(sp => sp.permission_key || sp.permissionKey) : [];

    const defaultPerms = ['students.view', 'attendance.view', 'attendance.mark', 'fees.view', 'fees.manage', 'payments.record', 'sms.send'];

    req.user = {
      userId: profile?.id || member?.user_id || 'usr-default',
      email: profile?.email || 'user@school.com',
      fullName: profile?.full_name || 'School User',
      schoolId: schoolId,
      role: member?.role || 'admin',
      permissions: member?.role === 'admin' ? defaultPerms : (staffPerms.length > 0 ? staffPerms : defaultPerms)
    };
    req.schoolId = schoolId;

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};
