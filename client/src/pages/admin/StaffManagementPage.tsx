import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import api from '../../services/api';
import { UserPlus, Key, Eye, EyeOff, Copy, Check, ShieldCheck, Edit3, Save, Trash2 } from 'lucide-react';
import { Modal } from '../../components/Modal';

export const StaffManagementPage: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  
  const [selectedStaffUser, setSelectedStaffUser] = useState<any>(null);
  const [modalError, setModalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCredPassword, setShowCredPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Edit Password inline state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [passwordSaveMsg, setPasswordSaveMsg] = useState('');

  // Add Staff Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '', // Alphanumeric Staff ID / Username allotted by admin
    password: '',
    phone: '',
    employeeId: '',
    designation: '',
    role: 'teacher',
    permissions: ['students.view', 'attendance.view', 'attendance.mark']
  });

  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const availablePermissions = [
    { key: 'students.view', label: 'View Student Directory' },
    { key: 'students.create', label: 'Create New Students' },
    { key: 'students.edit', label: 'Edit Student Records' },
    { key: 'attendance.view', label: 'View Attendance Records' },
    { key: 'attendance.mark', label: 'Mark Class Attendance' },
    { key: 'fees.view', label: 'View Fee Structures & Balance' },
    { key: 'payments.record', label: 'Record Fee Payments' },
    { key: 'sms.send', label: 'Send SMS Broadcasts' },
  ];

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/staff');
      if (res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await api.post('/staff', formData);
      if (res.data.success) {
        const newlyCreated = res.data.data;
        setIsAddModalOpen(false);
        setFormData({
          fullName: '',
          email: '',
          password: '',
          phone: '',
          employeeId: '',
          designation: '',
          role: 'teacher',
          permissions: ['students.view', 'attendance.view', 'attendance.mark']
        });
        await fetchStaff();

        // Open View Credentials Modal immediately for newly onboarded staff member
        setSelectedStaffUser({
          userId: newlyCreated.userId,
          fullName: newlyCreated.fullName,
          email: newlyCreated.staffId,
          password: newlyCreated.password || formData.password,
          role: newlyCreated.role,
          employeeId: newlyCreated.employeeId,
          phone: formData.phone || 'N/A'
        });
        setIsCredModalOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const details = err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        setModalError(`Validation Error: ${details}`);
      } else {
        setModalError(err.response?.data?.message || 'Failed to create staff member credentials.');
      }
    }
  };

  const handleDeleteStaff = async (userId: string, fullName: string) => {
    if (!window.confirm(`Are you sure you want to remove staff member "${fullName}"? This will revoke their portal access.`)) {
      return;
    }
    try {
      const res = await api.delete(`/staff/${userId}`);
      if (res.data.success) {
        fetchStaff();
      }
    } catch (err) {
      console.error('Failed to remove staff member', err);
    }
  };

  const handleOpenPermModal = (staff: any) => {
    setSelectedStaffUser(staff);
    setSelectedPerms(staff.permissions || []);
    setIsPermModalOpen(true);
  };

  const handleOpenCredModal = (staff: any) => {
    setSelectedStaffUser(staff);
    setShowCredPassword(false);
    setIsEditingPassword(false);
    setNewPasswordVal('');
    setPasswordSaveMsg('');
    setIsCredModalOpen(true);
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveNewPassword = async () => {
    if (!selectedStaffUser || !newPasswordVal) return;
    try {
      const res = await api.patch(`/staff/${selectedStaffUser.userId}/password`, {
        newPassword: newPasswordVal
      });
      if (res.data.success) {
        setSelectedStaffUser({ ...selectedStaffUser, password: newPasswordVal });
        setIsEditingPassword(false);
        setPasswordSaveMsg('Password updated successfully!');
        setTimeout(() => setPasswordSaveMsg(''), 2500);
        fetchStaff();
      }
    } catch (err: any) {
      setPasswordSaveMsg(err.response?.data?.message || 'Failed to update password.');
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedStaffUser) return;
    try {
      const res = await api.patch(`/staff/${selectedStaffUser.userId}/permissions`, {
        permissions: selectedPerms
      });
      if (res.data.success) {
        setIsPermModalOpen(false);
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.patch(`/staff/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getStaffColor = (name: string) => {
    const gradients = [
      'from-purple-600 to-indigo-600',
      'from-blue-600 to-cyan-600',
      'from-emerald-600 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-600 to-pink-600'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Staff & Teacher Directory"
        subtitle="Manage teaching and non-teaching staff, custom alphanumeric credentials, authorization permissions, and account removals."
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        }
      />

      {/* ULTRA-COMPACT MOBILE STAFF CARD STACK (< 768px) */}
      <div className="block md:hidden space-y-2.5">
        {isLoading ? (
          <div className="p-6 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs font-semibold">
            Loading staff records...
          </div>
        ) : (
          staffList.map((st) => (
            <div key={st.userId} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getStaffColor(st.fullName)} text-white font-black text-xs flex items-center justify-center shadow-sm`}>
                    {getInitials(st.fullName)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 leading-tight">{st.fullName}</h3>
                    <span className="font-mono font-bold text-[10px] text-blue-600">{st.employeeId}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(st.userId, st.status)}
                  className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase transition-colors ${
                    st.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {st.status}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Username / Staff ID</span>
                  <span className="font-mono font-bold text-slate-900">{st.email}</span>
                </div>

                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Designation</span>
                  <span className="font-bold text-slate-800">{st.designation || 'Teacher'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-black uppercase text-[9px] rounded-md border border-purple-200">
                  {st.role}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenCredModal(st)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-extrabold text-xs rounded-xl transition-colors active:scale-95"
                    title="View Login Credentials & Edit Password"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Creds</span>
                  </button>

                  <button
                    onClick={() => handleOpenPermModal(st)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-extrabold text-xs rounded-xl transition-colors active:scale-95"
                    title="Manage Permissions"
                  >
                    <Key className="w-3.5 h-3.5 text-slate-600" />
                    <span>Perms</span>
                  </button>

                  <button
                    onClick={() => handleDeleteStaff(st.userId, st.fullName)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-colors active:scale-95"
                    title="Remove Staff Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP STAFF TABLE (>= 768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <th className="py-3 px-6">Emp ID</th>
              <th className="py-3 px-6">Staff Name</th>
              <th className="py-3 px-6">Staff ID / Username</th>
              <th className="py-3 px-6">Designation</th>
              <th className="py-3 px-6">Role</th>
              <th className="py-3 px-6 text-center">Status</th>
              <th className="py-3 px-6 text-center">Manage & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">Loading staff records...</td>
              </tr>
            ) : (
              staffList.map((st) => (
                <tr key={st.userId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-blue-600">{st.employeeId}</td>
                  <td className="py-3.5 px-6 font-bold text-slate-900">{st.fullName}</td>
                  <td className="py-3.5 px-6 font-mono font-semibold text-slate-700">{st.email}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-700">{st.designation}</td>
                  <td className="py-3.5 px-6 uppercase font-bold text-[10px] text-purple-600">{st.role}</td>
                  <td className="py-3.5 px-6 text-center">
                    <button
                      onClick={() => handleToggleStatus(st.userId, st.status)}
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase transition-colors ${
                        st.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {st.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenCredModal(st)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition-colors"
                        title="View Login Credentials & Edit Password"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Credentials</span>
                      </button>

                      <button
                        onClick={() => handleOpenPermModal(st)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                        title="Manage Permissions"
                      >
                        <Key className="w-3.5 h-3.5 text-slate-600" />
                        <span>Permissions</span>
                      </button>

                      <button
                        onClick={() => handleDeleteStaff(st.userId, st.fullName)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-colors"
                        title="Remove Staff Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member Account"
      >
        <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
          {modalError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
            <input
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-extrabold uppercase text-slate-900 focus:outline-none"
              >
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Alphanumeric Staff Username *</label>
            <input
              required
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. MHS01STF, MHS01TCR"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Fixed Login Password *</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-1.5 text-xs focus:outline-none font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Emp ID</label>
              <input
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="MHSTF01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Designation</label>
              <input
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Cashier / Co-ordinator"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 mt-2"
          >
            Create Staff Credentials
          </button>
        </form>
      </Modal>

      {/* VIEW & EDIT CREDENTIALS MODAL */}
      <Modal
        isOpen={isCredModalOpen}
        onClose={() => setIsCredModalOpen(false)}
        title={`Staff Credentials: ${selectedStaffUser?.fullName}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h4 className="font-extrabold text-slate-900 text-xs">{selectedStaffUser?.fullName}</h4>
            </div>
            <p className="text-[10px] text-slate-600 pl-6">
              {selectedStaffUser?.designation || 'Teacher'} • <span className="uppercase font-extrabold text-purple-600">{selectedStaffUser?.role}</span>
            </p>
          </div>

          {passwordSaveMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{passwordSaveMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Staff ID Field */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                Staff ID / Username
              </label>
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">{selectedStaffUser?.email}</span>
                <button
                  onClick={() => handleCopyText(selectedStaffUser?.email || '', 'staffId')}
                  className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700 transition-colors active:scale-95"
                >
                  {copiedField === 'staffId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedField === 'staffId' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Fixed Password Field with Inline Edit */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Login Password
                </label>
                {!isEditingPassword && (
                  <button
                    onClick={() => { setIsEditingPassword(true); setNewPasswordVal(selectedStaffUser?.password || 'password123'); }}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-extrabold transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {!isEditingPassword ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                      {showCredPassword ? (selectedStaffUser?.password || 'password123') : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => setShowCredPassword(!showCredPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showCredPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopyText(selectedStaffUser?.password || 'password123', 'password')}
                    className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700 transition-colors active:scale-95"
                  >
                    {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedField === 'password' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    placeholder="New password"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewPassword}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPassword(false)}
                    className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Contact & Employee Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Phone</span>
                <span className="font-bold text-slate-800">{selectedStaffUser?.phone || 'N/A'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Emp Code</span>
                <span className="font-mono font-black text-blue-600">{selectedStaffUser?.employeeId || 'N/A'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCredModalOpen(false)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
          >
            Close Window
          </button>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        title={`Permissions: ${selectedStaffUser?.fullName}`}
      >
        <div className="space-y-3 text-xs">
          <p className="text-xs text-slate-500 font-semibold">Toggle feature access for this staff member:</p>
          <div className="space-y-1.5">
            {availablePermissions.map(p => {
              const isChecked = selectedPerms.includes(p.key);
              return (
                <label key={p.key} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPerms([...selectedPerms, p.key]);
                      else setSelectedPerms(selectedPerms.filter(k => k !== p.key));
                    }}
                    className="w-4 h-4 text-blue-600 rounded-md focus:ring-0"
                  />
                  <span className="text-xs font-extrabold text-slate-800">{p.label}</span>
                </label>
              );
            })}
          </div>

          <button
            onClick={handleSavePermissions}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 mt-2"
          >
            Save Permissions
          </button>
        </div>
      </Modal>
    </div>
  );
};
