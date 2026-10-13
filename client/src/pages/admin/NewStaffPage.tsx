import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import api from '../../services/api';
import { UserPlus, ShieldCheck, Check, ArrowLeft } from 'lucide-react';

export const NewStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '', // Custom Staff ID / Username
    phone: '',
    password: '',
    role: 'teacher',
    employeeId: '',
    designation: 'Class Teacher',
    joiningDate: new Date().toISOString().split('T')[0],
    qualification: 'M.Sc, B.Ed',
    address: '',
    permissions: ['students.view', 'attendance.view', 'attendance.mark']
  });

  const availablePermissions = [
    { key: 'students.view', label: 'View Student Directory' },
    { key: 'students.create', label: 'Create / Enroll New Students' },
    { key: 'students.manage', label: 'Manage & Edit Student Profiles' },
    { key: 'attendance.view', label: 'View Attendance Records' },
    { key: 'attendance.mark', label: 'Mark / Edit Daily Attendance' },
    { key: 'fees.view', label: 'View Class Fee Structures' },
    { key: 'fees.manage', label: 'Record Fee Payments & Apply Concessions' },
    { key: 'sms.send', label: 'Draft & Broadcast SMS Campaigns' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionToggle = (permKey: string) => {
    const exists = formData.permissions.includes(permKey);
    const updated = exists
      ? formData.permissions.filter(p => p !== permKey)
      : [...formData.permissions, permKey];
    setFormData({ ...formData, permissions: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/staff', formData);
      if (res.data.success) {
        setSuccessMsg(`Staff member "${formData.fullName}" onboarded successfully with Staff ID: "${formData.email}"`);
        setTimeout(() => {
          navigate('/admin/staff');
        }, 1800);
      }
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const details = err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        setError(`Validation Failed: ${details}`);
      } else {
        setError(err.response?.data?.message || 'Failed to create staff member. Please check details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Onboard New Staff Member"
        subtitle="Create teacher/staff credentials, assign custom alphanumeric Staff ID, set fixed login password, and define role permissions."
        action={
          <button
            onClick={() => navigate('/admin/staff')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Staff Roster</span>
          </button>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-8">
        {/* Section 1: Staff Account Credentials */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>1. Account Login Credentials</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Varma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Staff ID / Login Username *
              </label>
              <input
                type="text"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. MHS02STF, TEACHER01, or staff@school.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fixed Login Password *
              </label>
              <input
                type="text"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="e.g. MHS02STF2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Staff Particulars */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            2. Professional Profile & Designation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                System Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="teacher">Teacher</option>
                <option value="staff">Administrative Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Science Teacher"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee Code / Ref
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="e.g. EMP-2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Permission Allocations */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>3. Granular Access Permissions</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePermissions.map(p => {
              const isChecked = formData.permissions.includes(p.key);
              return (
                <div
                  key={p.key}
                  onClick={() => handlePermissionToggle(p.key)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isChecked 
                      ? 'bg-blue-50/50 border-blue-200 text-blue-900 shadow-2xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold">{p.label}</span>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                    isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/staff')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? 'Onboarding Staff...' : 'Confirm & Create Staff Account'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
