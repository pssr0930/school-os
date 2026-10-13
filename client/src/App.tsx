import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { SchoolCodeEntryPage } from './pages/SchoolCodeEntryPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterSchoolPage } from './pages/RegisterSchoolPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

import { AgentLoginPage } from './pages/agent/AgentLoginPage';
import { AgentDashboardPage } from './pages/agent/AgentDashboardPage';

import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { FeeDashboardPage } from './pages/admin/FeeDashboardPage';
import { StudentsListPage } from './pages/admin/StudentsListPage';
import { NewStudentPage } from './pages/admin/NewStudentPage';
import { StudentProfilePage } from './pages/admin/StudentProfilePage';
import { EditStudentPage } from './pages/admin/EditStudentPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { FeeStructurePage } from './pages/admin/FeeStructurePage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { SmsCampaignPage } from './pages/admin/SmsCampaignPage';
import { StaffManagementPage } from './pages/admin/StaffManagementPage';
import { NewStaffPage } from './pages/admin/NewStaffPage';
import { SettingsPage } from './pages/admin/SettingsPage';

import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffStudentsPage } from './pages/staff/StaffStudentsPage';
import { StaffAttendancePage } from './pages/staff/StaffAttendancePage';
import { StaffProfilePage } from './pages/staff/StaffProfilePage';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Gateway & School Entrance Routes */}
        <Route path="/" element={<SchoolCodeEntryPage />} />
        <Route path="/portal" element={<SchoolCodeEntryPage />} />
        <Route path="/find-school" element={<SchoolCodeEntryPage />} />
        <Route path="/school" element={<LandingPage />} />
        <Route path="/school/:schoolCode" element={<LandingPage />} />
        
        {/* Authentication Routes */}
        <Route path="/admin/login" element={<LoginPage defaultRole="admin" />} />
        <Route path="/staff/login" element={<LoginPage defaultRole="staff" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-school" element={<RegisterSchoolPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* AGENT PORTAL ROUTES */}
        <Route path="/agent" element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="/agent/login" element={<AgentLoginPage />} />
        <Route path="/agent/dashboard" element={<AgentDashboardPage />} />

        {/* Protected Admin Routes (STRICTLY RESTRICTED TO ADMINISTRATORS) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="fee-dashboard" element={<FeeDashboardPage />} />
          <Route path="students" element={<StudentsListPage />} />
          <Route path="students/new" element={<NewStudentPage />} />
          <Route path="students/:studentId" element={<StudentProfilePage />} />
          <Route path="students/:studentId/edit" element={<EditStudentPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="fees" element={<FeeStructurePage />} />
          <Route path="fees/structure" element={<FeeStructurePage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="sms" element={<SmsCampaignPage />} />
          <Route path="staff" element={<StaffManagementPage />} />
          <Route path="staff/new" element={<NewStaffPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Protected Staff Routes (ACCESSIBLE TO BOTH STAFF AND TEACHER ROLES) */}
        <Route 
          path="/staff" 
          element={
            <ProtectedRoute allowedRoles={['staff', 'teacher']}>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboardPage />} />
          <Route 
            path="fee-dashboard" 
            element={
              <ProtectedRoute requiredPermission="fees.view">
                <FeeDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="students" 
            element={
              <ProtectedRoute requiredPermission="students.view">
                <StaffStudentsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="students/new" element={
            <ProtectedRoute requiredPermission="students.create">
              <NewStudentPage />
            </ProtectedRoute>
          } />
          <Route path="students/:studentId" element={<StudentProfilePage />} />
          <Route path="students/:studentId/edit" element={
            <ProtectedRoute requiredPermission="students.edit">
              <EditStudentPage />
            </ProtectedRoute>
          } />
          <Route 
            path="attendance" 
            element={
              <ProtectedRoute requiredPermission="attendance.mark">
                <StaffAttendancePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="fees" 
            element={
              <ProtectedRoute requiredPermission="fees.view">
                <FeeStructurePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="fees/structure" 
            element={
              <ProtectedRoute requiredPermission="fees.view">
                <FeeStructurePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="payments" 
            element={
              <ProtectedRoute requiredPermission="payments.record">
                <PaymentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="sms" 
            element={
              <ProtectedRoute requiredPermission="sms.send">
                <SmsCampaignPage />
              </ProtectedRoute>
            } 
          />
          <Route path="profile" element={<StaffProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
