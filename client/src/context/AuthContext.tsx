import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  schoolId: string;
  role: 'admin' | 'teacher' | 'staff';
  permissions: string[];
}

export interface SchoolData {
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
  defaultCurrency: string;
  attendanceCutoffTime: string;
  attendanceSmsEnabled: boolean;
  logoUrl?: string;
  logo_url?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  school: SchoolData | null;
  isLoading: boolean;
  login: (email: string, password?: string, role?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
  refreshSession: () => Promise<void>;
  updateSchoolData: (updatedSchool: Partial<SchoolData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSession = async () => {
    const path = window.location.pathname;
    const isStaffRoute = path.startsWith('/staff');
    const isAdminRoute = path.startsWith('/admin');

    let activeToken: string | null = null;
    if (isStaffRoute) {
      activeToken = localStorage.getItem('school_os_staff_token');
    } else if (isAdminRoute) {
      activeToken = localStorage.getItem('school_os_admin_token');
    } else {
      activeToken = localStorage.getItem('school_os_admin_token') || localStorage.getItem('school_os_staff_token') || localStorage.getItem('school_os_token');
    }

    if (!activeToken) {
      setUser(null);
      setSchool(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        const fetchedUser = res.data.user;
        if (isAdminRoute && fetchedUser.role !== 'admin') {
          setUser(null);
        } else if (isStaffRoute && fetchedUser.role !== 'staff' && fetchedUser.role !== 'teacher') {
          setUser(null);
        } else {
          setUser(fetchedUser);
          setSchool(res.data.school);
        }
      }
    } catch (err) {
      console.warn('Failed to load session from token', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const refreshSession = async (): Promise<void> => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setSchool(res.data.school);
      }
    } catch (err) {
      console.warn('Failed to refresh session', err);
    }
  };

  const updateSchoolData = (updatedSchool: Partial<SchoolData>) => {
    setSchool(prev => prev ? ({ ...prev, ...updatedSchool }) : (updatedSchool as SchoolData));
  };

  const login = async (email: string, password?: string, role?: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password: password || 'password', role });
      if (res.data.success) {
        const isStaff = role === 'staff' || res.data.user?.role !== 'admin';
        const tokenKey = isStaff ? 'school_os_staff_token' : 'school_os_admin_token';

        localStorage.setItem(tokenKey, res.data.token);
        setUser(res.data.user);
        setSchool(res.data.school);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error', err);
      return false;
    }
  };

  const logout = (targetRole?: 'admin' | 'staff') => {
    const path = window.location.pathname;
    if (targetRole === 'staff' || path.startsWith('/staff')) {
      localStorage.removeItem('school_os_staff_token');
    } else if (targetRole === 'admin' || path.startsWith('/admin')) {
      localStorage.removeItem('school_os_admin_token');
    } else {
      localStorage.removeItem('school_os_admin_token');
      localStorage.removeItem('school_os_staff_token');
      localStorage.removeItem('school_os_token');
    }
    setUser(null);
    setSchool(null);
  };

  const hasPermission = (perm: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(perm);
  };

  return (
    <AuthContext.Provider value={{ user, school, isLoading, login, logout, hasPermission, refreshSession, updateSchoolData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
