import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, ShieldCheck, UserCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'staff' | 'teacher'>;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission
}) => {
  const { user, isLoading, hasPermission, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Loading State Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/20">
          <Lock className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-extrabold text-sm text-slate-200 tracking-wide">Authenticating Session Security...</p>
          <p className="text-xs text-slate-400">Verifying role permissions & multi-tenant access tokens</p>
        </div>
      </div>
    );
  }

  // 2. Authentication Check: User Must Be Logged In
  if (!user) {
    const loginTarget = location.pathname.startsWith('/staff') ? '/staff/login' : '/admin/login';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  // 3. Role Authorization Guard Check
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = user.role;
    const isAuthorized = allowedRoles.includes(currentRole as any) ||
      (allowedRoles.includes('staff') && (currentRole === 'teacher' || currentRole === 'staff')) ||
      (allowedRoles.includes('teacher') && (currentRole === 'staff' || currentRole === 'teacher'));

    if (!isAuthorized) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-[10px] font-extrabold uppercase tracking-wider">
                403 • Unauthorized Session
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Invalid Credentials</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access Denied: Invalid Credentials or Unauthorized Session for this portal.
              </p>
            </div>

            <div className="relative z-10 space-y-3 pt-2">
              <button
                onClick={() => { logout(); navigate('/staff/login'); }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Go to Staff Login</span>
              </button>

              <button
                onClick={() => { logout(); navigate('/admin/login'); }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Go to Admin Login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // 4. Granular Permission Guard Check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
              Permission Required
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Invalid Credentials</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access Denied: Invalid Credentials or Missing Permission for this portal feature.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => { logout(); navigate('/staff/login'); }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Go to Staff Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Access Granted!
  return <>{children}</>;
};
