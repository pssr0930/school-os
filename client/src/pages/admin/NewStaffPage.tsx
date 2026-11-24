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
    <div className="space-y-5 max-w-4xl mx-auto text-[#F3F4F6]">
      <PageHeader
        title="Onboard New Staff Member"
        subtitle="Create teacher/staff credentials, assign custom alphanumeric Staff ID, set fixed login password, and define role permissions."
        action={
          <button
            onClick={() => navigate('/admin/staff')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] text-xs font-medium rounded-lg border border-[#303B4D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Staff Roster</span>
          </button>
        }
      />

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs rounded-lg">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 sm:p-6 space-y-6">
        {/* Section 1: Staff Account Credentials */}
        <div className="space-y-4">
          <h3 className="font-semibold text-xs text-[#F3F4F6] uppercase tracking-wider border-b border-[#303B4D] pb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <span>1. Account Login Credentials</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Varma"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Staff ID / Login Username *
              </label>
              <input
                type="text"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. MHS02STF, TEACHER01, or staff@school.com"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] font-mono placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Fixed Login Password *
              </label>
              <input
                type="text"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="e.g. MHS02STF2026"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Staff Particulars */}
        <div className="space-y-4">
          <h3 className="font-semibold text-xs text-[#F3F4F6] uppercase tracking-wider border-b border-[#303B4D] pb-3">
            2. Professional Profile & Designation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                System Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
              >
                <option value="teacher" className="bg-[#1F2937]">Teacher</option>
                <option value="staff" className="bg-[#1F2937]">Administrative Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Science Teacher"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Employee Code / Ref
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="e.g. EMP-2026"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Permission Allocations */}
        <div className="space-y-4">
          <h3 className="font-semibold text-xs text-[#F3F4F6] uppercase tracking-wider border-b border-[#303B4D] pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>3. Granular Access Permissions</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePermissions.map(p => {
              const isChecked = formData.permissions.includes(p.key);
              return (
                <div
                  key={p.key}
                  onClick={() => handlePermissionToggle(p.key)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                    isChecked 
                      ? 'bg-blue-500/10 border-blue-500/30 text-[#F3F4F6]' 
                      : 'bg-[#243244] border-[#303B4D] text-[#9CA3AF] hover:text-[#F3F4F6]'
                  }`}
                >
                  <span className="text-xs font-medium">{p.label}</span>
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-[#303B4D] bg-[#1F2937]'
                  }`}>
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-[#303B4D] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/staff')}
            className="px-4 py-2 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] text-xs font-medium rounded-lg border border-[#303B4D] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? 'Onboarding Staff...' : 'Confirm & Create Staff Account'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewStaffPage;
