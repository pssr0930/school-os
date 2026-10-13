import { Response, NextFunction } from 'express';
import { AuthRequest, PermissionKey, UserRole } from '../types';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}` 
    });
  };
};

export const requirePermission = (permissionKey: PermissionKey) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Admins implicitly have all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.permissions.includes(permissionKey)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: `Access denied. Missing permission: ${permissionKey}` 
    });
  };
};
