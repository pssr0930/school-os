import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import api from '../../services/api';
import { UserPlus, Key, Eye, EyeOff, Copy, Check, ShieldCheck, Edit3, Save, Trash2, Users } from 'lucide-react';
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
        fetchStaff();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create staff member.');
    }
  };

  const handleDeleteStaff = async (userId: string, fullName: string) => {
    if (!window.confirm(`Are you sure you want to completely remove staff account "${fullName}"? This action cannot be undone.`)) {
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
      console.error('Failed to toggle status', err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-[#F3F4F6]">
      <PageHeader
        title="Staff & Teacher Directory"
        subtitle="Manage teaching and non-teaching staff, custom alphanumeric credentials, authorization permissions, and account removals."
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        }
      />

      {/* MOBILE STAFF CARD STACK (< 768px) */}
      <div className="block md:hidden space-y-2.5">
        {isLoading ? (
          <div className="p-6 text-center text-[#9CA3AF] bg-[#1F2937] rounded-lg border border-[#303B4D] text-xs font-medium">
            Loading staff records...
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-8 text-center bg-[#1F2937] rounded-lg border border-[#303B4D] space-y-2">
            <Users className="w-6 h-6 mx-auto text-[#9CA3AF] mb-1" />
            <p className="font-medium text-xs text-[#F3F4F6]">No staff accounts configured.</p>
          </div>
        ) : (
          staffList.map((st) => (
            <div key={st.userId} className="p-3.5 bg-[#1F2937] hover:bg-[#243244]/60 rounded-lg border border-[#303B4D] space-y-2.5 transition-colors">
              <div className="flex items-center justify-between border-b border-[#303B4D] pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#243244] border border-[#303B4D] text-blue-400 font-semibold text-xs flex items-center justify-center shrink-0">
                    {getInitials(st.fullName)}
                  </div>
                  <div>
                    <h3 className="font-medium text-xs text-[#F3F4F6] leading-tight">{st.fullName}</h3>
                    <span className="font-mono text-[10px] text-blue-400">{st.employeeId}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(st.userId, st.status)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${
                    st.status === 'active' 
                      ? 'bg-emerald-950/40 text-[#22C55E] border-emerald-800/40' 
                      : 'bg-red-950/40 text-[#EF4444] border-red-800/40'
                  }`}
                >
                  {st.status}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#9CA3AF]">
                <div>
                  <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider block">Username</span>
                  <span className="font-mono font-medium text-[#F3F4F6]">{st.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider block">Designation</span>
                  <span className="text-[#F3F4F6] font-medium">{st.designation || 'Teacher'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#303B4D] flex items-center gap-2 justify-end">
                <button
                  onClick={() => handleOpenCredModal(st)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#243244] hover:bg-gray-700 text-blue-400 border border-[#303B4D] font-medium text-xs rounded-md transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Credentials</span>
                </button>

                <button
                  onClick={() => handleOpenPermModal(st)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] border border-[#303B4D] font-medium text-xs rounded-md transition-colors"
                >
                  <Key className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>Perms</span>
                </button>

                <button
                  onClick={() => handleDeleteStaff(st.userId, st.fullName)}
                  className="p-1 bg-[#243244] hover:bg-gray-700 text-[#EF4444] border border-[#303B4D] rounded-md transition-colors"
                  title="Remove Staff Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP STAFF TABLE (>= 768px) */}
      <div className="hidden md:block bg-[#1F2937] rounded-lg border border-[#303B4D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#243244] border-b border-[#303B4D] text-[#9CA3AF] font-medium text-xs">
                <th className="py-2.5 px-5 w-32">Emp ID</th>
                <th className="py-2.5 px-5">Staff Name</th>
                <th className="py-2.5 px-5 w-44">Username / ID</th>
                <th className="py-2.5 px-5 w-40">Designation</th>
                <th className="py-2.5 px-5 w-28">Role</th>
                <th className="py-2.5 px-5 text-center w-28">Status</th>
                <th className="py-2.5 px-5 text-center w-48">Manage & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303B4D] bg-[#1F2937]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[#9CA3AF]">Loading staff records...</td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#9CA3AF]">No staff accounts configured yet.</td>
                </tr>
              ) : (
                staffList.map((st) => (
                  <tr key={st.userId} className="hover:bg-[#243244]/60 transition-colors">
                    <td className="py-2.5 px-5 font-mono font-medium text-blue-400 tabular-nums">{st.employeeId}</td>
                    <td className="py-2.5 px-5 font-medium text-[#F3F4F6]">{st.fullName}</td>
                    <td className="py-2.5 px-5 font-mono text-[#9CA3AF]">{st.email}</td>
                    <td className="py-2.5 px-5 text-[#F3F4F6]">{st.designation || 'Teacher'}</td>
                    <td className="py-2.5 px-5 uppercase font-medium text-[10px] text-purple-400">{st.role}</td>
                    <td className="py-2.5 px-5 text-center">
                      <button
                        onClick={() => handleToggleStatus(st.userId, st.status)}
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${
                          st.status === 'active' 
                            ? 'bg-emerald-950/40 text-[#22C55E] border-emerald-800/40' 
                            : 'bg-red-950/40 text-[#EF4444] border-red-800/40'
                        }`}
                      >
                        {st.status}
                      </button>
                    </td>
                    <td className="py-2.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenCredModal(st)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#243244] hover:bg-gray-700 text-blue-400 border border-[#303B4D] font-medium text-xs rounded-md transition-colors"
                          title="View Login Credentials"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Credentials</span>
                        </button>

                        <button
                          onClick={() => handleOpenPermModal(st)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] border border-[#303B4D] font-medium text-xs rounded-md transition-colors"
                          title="Manage Permissions"
                        >
                          <Key className="w-3.5 h-3.5 text-[#9CA3AF]" />
                          <span>Perms</span>
                        </button>

                        <button
                          onClick={() => handleDeleteStaff(st.userId, st.fullName)}
                          className="p-1 bg-[#243244] hover:bg-gray-700 text-[#EF4444] border border-[#303B4D] rounded-md transition-colors"
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

        {/* Footer */}
        <div className="p-3.5 bg-[#1F2937] border-t border-[#303B4D] flex items-center justify-between text-xs text-[#9CA3AF]">
          <span>
            Total Staff: <strong className="text-[#F3F4F6] font-medium">{staffList.length}</strong> {staffList.length === 1 ? 'member' : 'members'} enrolled
          </span>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member Account"
      >
        <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
          {modalError && (
            <div className="p-3 bg-red-950/40 border border-red-800/40 text-[#EF4444] rounded-lg text-xs font-medium">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">Full Name *</label>
            <input
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">Phone Number</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 pr-8 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="teacher" className="bg-[#1F2937]">Teacher</option>
                <option value="staff" className="bg-[#1F2937]">Staff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">Staff ID / Username *</label>
            <input
              required
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. MHS01STF, MHS01TCR"
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">Fixed Login Password *</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-9 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F3F4F6]"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">Emp Code</label>
              <input
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="MHSTF01"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">Designation</label>
              <input
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Cashier / Co-ordinator"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors mt-2"
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
          <div className="p-3 rounded-lg bg-[#243244] border border-[#303B4D] space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <h4 className="font-medium text-[#F3F4F6] text-xs">{selectedStaffUser?.fullName}</h4>
            </div>
            <p className="text-[11px] text-[#9CA3AF] pl-6">
              {selectedStaffUser?.designation || 'Teacher'} • <span className="uppercase font-medium text-purple-400">{selectedStaffUser?.role}</span>
            </p>
          </div>

          {passwordSaveMsg && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 text-[#22C55E] rounded-lg text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-[#22C55E]" />
              <span>{passwordSaveMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Staff ID Field */}
            <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D]">
              <label className="block text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-0.5">
                Staff ID / Username
              </label>
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium text-[#F3F4F6] text-xs sm:text-sm">{selectedStaffUser?.email}</span>
                <button
                  onClick={() => handleCopyText(selectedStaffUser?.email || '', 'staffId')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#1F2937] hover:bg-gray-700 border border-[#303B4D] rounded-md text-xs font-medium text-[#F3F4F6] transition-colors"
                >
                  {copiedField === 'staffId' ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />}
                  <span>{copiedField === 'staffId' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Fixed Password Field with Inline Edit */}
            <div className="p-3 bg-[#243244] rounded-lg border border-[#303B4D] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">
                  Login Password
                </label>
                {!isEditingPassword && (
                  <button
                    onClick={() => { setIsEditingPassword(true); setNewPasswordVal(selectedStaffUser?.password || 'password123'); }}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {!isEditingPassword ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-[#F3F4F6] text-xs sm:text-sm">
                      {showCredPassword ? (selectedStaffUser?.password || 'password123') : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => setShowCredPassword(!showCredPassword)}
                      className="text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
                    >
                      {showCredPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopyText(selectedStaffUser?.password || 'password123', 'password')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#1F2937] hover:bg-gray-700 border border-[#303B4D] rounded-md text-xs font-medium text-[#F3F4F6] transition-colors"
                  >
                    {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />}
                    <span>{copiedField === 'password' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    placeholder="New password"
                    className="flex-1 h-8 bg-[#1F2937] border border-[#303B4D] rounded-md px-2.5 text-xs text-[#F3F4F6] font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewPassword}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPassword(false)}
                    className="px-2.5 py-1 bg-[#1F2937] hover:bg-gray-700 text-[#9CA3AF] text-xs font-medium rounded-md border border-[#303B4D] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Contact & Employee Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#243244] rounded-lg border border-[#303B4D]">
                <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider block">Phone</span>
                <span className="font-medium text-[#F3F4F6]">{selectedStaffUser?.phone || 'N/A'}</span>
              </div>

              <div className="p-2.5 bg-[#243244] rounded-lg border border-[#303B4D]">
                <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider block">Emp Code</span>
                <span className="font-mono font-medium text-blue-400">{selectedStaffUser?.employeeId || 'N/A'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCredModalOpen(false)}
            className="w-full py-2 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-lg border border-[#303B4D] transition-colors"
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
        <div className="space-y-3.5 text-xs">
          <p className="text-xs text-[#9CA3AF]">Toggle module authorization permissions for this staff account:</p>
          <div className="space-y-2">
            {availablePermissions.map(p => {
              const isChecked = selectedPerms.includes(p.key);
              return (
                <label key={p.key} className="flex items-center gap-3 p-2.5 bg-[#243244] rounded-lg border border-[#303B4D] cursor-pointer hover:bg-gray-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPerms([...selectedPerms, p.key]);
                      else setSelectedPerms(selectedPerms.filter(k => k !== p.key));
                    }}
                    className="w-4 h-4 text-blue-600 rounded bg-[#1F2937] border-[#303B4D] focus:ring-0"
                  />
                  <span className="text-xs font-medium text-[#F3F4F6]">{p.label}</span>
                </label>
              );
            })}
          </div>

          <button
            onClick={handleSavePermissions}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors mt-2"
          >
            Save Permissions
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StaffManagementPage;
