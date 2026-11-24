import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Modal } from '../../components/Modal';
import { 
  Building, 
  Plus, 
  Search, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  ExternalLink, 
  LogOut, 
  Clock, 
  Sparkles,
  Key
} from 'lucide-react';

export const AgentDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Register School Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Agent Password Modal State
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [editAgentEmail, setEditAgentEmail] = useState('agent@pssr.com');
  const [newAgentPassword, setNewAgentPassword] = useState('');
  const [confirmAgentPassword, setConfirmAgentPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolCode: '',
    address: '',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500001',
    phone: '',
    email: '',
    website: '',
    
    // Admin Details
    adminFullName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    adminConfirmPassword: '',

    // Config
    academicYearName: '2026-2027',
    startDate: '2026-06-01',
    attendanceCutoffTime: '10:30',
    defaultCurrency: 'INR'
  });

  const fetchAgentSchools = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/agent/schools');
      if (res.data.success) {
        setSchools(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch agent provisioned schools', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentSchools();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.adminPassword !== formData.adminConfirmPassword) {
      setErrorMsg('Admin passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/agent/schools/register', formData);
      if (res.data.success) {
        setSuccessMsg(res.data.message || `🎉 School "${formData.schoolName}" successfully provisioned!`);
        fetchAgentSchools();
        setTimeout(() => {
          setIsRegisterModalOpen(false);
          setSuccessMsg('');
          setFormData({
            schoolName: '',
            schoolCode: '',
            address: '',
            city: 'Hyderabad',
            state: 'Telangana',
            postalCode: '500001',
            phone: '',
            email: '',
            website: '',
            adminFullName: '',
            adminEmail: '',
            adminPhone: '',
            adminPassword: '',
            adminConfirmPassword: '',
            academicYearName: '2026-2027',
            startDate: '2026-06-01',
            attendanceCutoffTime: '10:30',
            defaultCurrency: 'INR'
          });
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to provision new school.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAgentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (newAgentPassword !== confirmAgentPassword) {
      setPasswordErrorMsg('New passwords do not match.');
      return;
    }

    if (newAgentPassword.trim().length < 4) {
      setPasswordErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await api.post('/agent/change-password', {
        email: editAgentEmail,
        newPassword: newAgentPassword
      });

      if (res.data.success) {
        setPasswordSuccessMsg(res.data.message || '🎉 Agent password updated successfully!');
        setTimeout(() => {
          setIsEditPasswordOpen(false);
          setPasswordSuccessMsg('');
          setNewAgentPassword('');
          setConfirmAgentPassword('');
        }, 1500);
      }
    } catch (err: any) {
      setPasswordErrorMsg(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.schoolCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudentsAllSchools = schools.reduce((sum, s) => sum + (s.studentCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#111827] text-[#F3F4F6] flex flex-col">
      {/* Agent Top Navbar */}
      <header className="h-14 bg-[#1F2937] border-b border-[#303B4D] px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img 
            src="/pssr-logo.png" 
            alt="School OS Logo" 
            className="w-7 h-7 rounded-md object-contain bg-white p-0.5 shrink-0" 
          />
          <div>
            <h1 className="font-semibold text-[#F3F4F6] text-sm leading-none">PSSR AGENT OPERATIONS</h1>
            <span className="text-[10px] uppercase font-medium text-blue-400 tracking-wider">SuperAdmin Provisioning Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditPasswordOpen(true)}
            className="h-8 px-3 bg-[#243244] hover:bg-[#303B4D] text-[#F3F4F6] font-medium text-xs rounded-lg border border-[#303B4D] transition-colors flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Change Password</span>
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision School</span>
          </button>

          <div className="h-4 w-px bg-[#303B4D]" />

          <button
            onClick={() => {
              localStorage.removeItem('agent_token');
              localStorage.removeItem('agent_data');
              navigate('/');
            }}
            title="Sign Out Agent"
            className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#243244] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Banner */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-[10px] font-medium uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Multi-Tenant Enterprise Network</span>
            </span>
            <h2 className="text-lg font-semibold text-[#F3F4F6]">Registered Client Schools Roster</h2>
            <p className="text-xs text-[#9CA3AF] max-w-2xl leading-relaxed">
              Register new buyer schools, configure administrator credentials, and launch directly into client school dashboards.
            </p>
          </div>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Building className="w-3.5 h-3.5" />
            <span>Register New School</span>
          </button>
        </div>

        {/* 3 Executive Agent KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#1F2937] border border-[#303B4D] space-y-1">
            <span className="text-xs font-medium text-[#9CA3AF] block">Provisioned Client Schools</span>
            <div className="text-2xl font-bold text-[#F3F4F6] font-mono">{schools.length} Schools</div>
            <span className="text-[11px] text-[#22C55E] font-medium block">100% Active Enterprise Licenses</span>
          </div>

          <div className="p-4 rounded-lg bg-[#1F2937] border border-[#303B4D] space-y-1">
            <span className="text-xs font-medium text-[#9CA3AF] block">Total Enrolled Students</span>
            <div className="text-2xl font-bold text-blue-400 font-mono">{totalStudentsAllSchools} Students</div>
            <span className="text-[11px] text-[#9CA3AF] font-normal block">Across all registered tenant schools</span>
          </div>

          <div className="p-4 rounded-lg bg-[#1F2937] border border-[#303B4D] space-y-1">
            <span className="text-xs font-medium text-[#9CA3AF] block">PSSR License Status</span>
            <div className="text-2xl font-bold text-[#22C55E] font-mono">Enterprise Active</div>
            <span className="text-[11px] text-[#9CA3AF] font-normal block">Agent SuperAdmin Operations</span>
          </div>
        </div>

        {/* Schools Roster Table */}
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] overflow-hidden">
          <div className="p-4 border-b border-[#303B4D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm text-[#F3F4F6] flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                <span>Provisioned Tenant Schools ({filteredSchools.length})</span>
              </h3>
              <p className="text-xs text-[#9CA3AF]">All registered client schools provisioned by authorized agents.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search school name or code..."
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-9 pr-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#243244] text-[#9CA3AF] font-medium text-[11px] uppercase tracking-wider border-b border-[#303B4D]">
                  <th className="py-2.5 px-4">School Code</th>
                  <th className="py-2.5 px-4">School Name</th>
                  <th className="py-2.5 px-4">Admin Contact</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4 text-center">Enrolled Students</th>
                  <th className="py-2.5 px-4 text-center">License Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303B4D] bg-[#1F2937]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#9CA3AF]">Loading registered schools...</td>
                  </tr>
                ) : filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#9CA3AF]">No provisioned schools found. Click &quot;Provision School&quot; to add a buyer school.</td>
                  </tr>
                ) : (
                  filteredSchools.map((sch) => (
                    <tr key={sch.id} className="hover:bg-[#243244]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-blue-400">{sch.schoolCode}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-[#F3F4F6]">{sch.name}</p>
                          <p className="text-[11px] text-[#9CA3AF]">{sch.email || sch.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-[#F3F4F6]">{sch.adminName}</p>
                          <p className="text-[11px] text-[#9CA3AF] font-mono">{sch.adminEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#9CA3AF]">{sch.city}, {sch.state}</td>
                      <td className="py-3 px-4 text-center font-medium text-[#F3F4F6] font-mono">{sch.studentCount}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {sch.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate('/admin/dashboard')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors"
                        >
                          <span>Launch Admin</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* EDIT AGENT PASSWORD MODAL */}
      <Modal
        isOpen={isEditPasswordOpen}
        onClose={() => setIsEditPasswordOpen(false)}
        title="Change Agent Security Password"
      >
        <form onSubmit={handleSaveAgentPassword} className="space-y-3.5 text-xs">
          {passwordSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{passwordSuccessMsg}</span>
            </div>
          )}

          {passwordErrorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-[#EF4444] rounded-lg font-medium">
              {passwordErrorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Agent Email / Authorized ID *</label>
            <input
              type="text"
              required
              value={editAgentEmail}
              onChange={(e) => setEditAgentEmail(e.target.value)}
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">New Agent Security Password *</label>
            <input
              type="password"
              required
              value={newAgentPassword}
              onChange={(e) => setNewAgentPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Confirm New Agent Password *</label>
            <input
              type="password"
              required
              value={confirmAgentPassword}
              onChange={(e) => setConfirmAgentPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingPassword}
            className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            <span>{isSavingPassword ? 'Updating Password...' : 'Save New Agent Password'}</span>
          </button>
        </form>
      </Modal>

      {/* Provision New School Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Agent Provision & Register New School"
      >
        <form onSubmit={handleRegisterSchoolSubmit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-[#EF4444] rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          {/* Section 1: School Details */}
          <div className="space-y-3 border-b border-[#303B4D] pb-4">
            <h4 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>1. School Profile Particulars</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">School Name *</label>
                <input
                  type="text"
                  name="schoolName"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="e.g. Saint Johns High School"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">School Code (Short) *</label>
                <input
                  type="text"
                  name="schoolCode"
                  required
                  value={formData.schoolCode}
                  onChange={handleChange}
                  placeholder="e.g. SJHS"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] font-mono placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Full Address *</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Street Address, Area"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">School Phone *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">School Official Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@school.com"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Administrator Account Credentials */}
          <div className="space-y-3 border-b border-[#303B4D] pb-4">
            <h4 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>2. School Administrator Credentials</span>
            </h4>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Admin Full Name *</label>
              <input
                type="text"
                name="adminFullName"
                required
                value={formData.adminFullName}
                onChange={handleChange}
                placeholder="e.g. Dr. K. Murthy (Principal)"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Admin ID / Login Username *</label>
                <input
                  type="text"
                  name="adminEmail"
                  required
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@school.com or MHS_ADMIN"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Admin Phone *</label>
                <input
                  type="text"
                  name="adminPhone"
                  required
                  value={formData.adminPhone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Password *</label>
                <input
                  type="password"
                  name="adminPassword"
                  required
                  value={formData.adminPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="adminConfirmPassword"
                  required
                  value={formData.adminConfirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Configuration */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>3. System Defaults & Cutoff Settings</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Academic Year *</label>
                <input
                  type="text"
                  name="academicYearName"
                  required
                  value={formData.academicYearName}
                  onChange={handleChange}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">SMS Cutoff Time *</label>
                <input
                  type="time"
                  name="attendanceCutoffTime"
                  required
                  value={formData.attendanceCutoffTime}
                  onChange={handleChange}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] [color-scheme:dark] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            <span>{isSubmitting ? "Provisioning Buyer School..." : "Confirm & Provision School License"}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};
