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
  GraduationCap, 
  CheckCircle2, 
  ExternalLink, 
  LogOut, 
  Clock, 
  Calendar, 
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Agent Top Navbar */}
      <header className="h-20 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <img 
            src="/pssr-logo.png" 
            alt="School OS Logo" 
            className="w-10 h-10 rounded-xl object-contain bg-white p-1 shadow-lg shadow-blue-500/20 shrink-0" 
          />
          <div>
            <h1 className="font-extrabold text-white tracking-wide text-base leading-none">PSSR AGENT OPERATIONS</h1>
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">SuperAdmin School Provisioning Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditPasswordOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all"
          >
            <Key className="w-4 h-4 text-blue-400" />
            <span>Edit Agent Password</span>
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Provision & Register New School</span>
          </button>

          <div className="h-6 w-px bg-slate-800" />

          <button
            onClick={() => {
              localStorage.removeItem('agent_token');
              localStorage.removeItem('agent_data');
              navigate('/');
            }}
            title="Sign Out Agent"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/30 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-Tenant Enterprise License Network</span>
            </span>
            <h2 className="text-2xl font-extrabold text-white">Registered Client Schools Roster</h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Register new buyer schools, configure administrator credentials, and launch directly into client school dashboards.
            </p>
          </div>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all shrink-0 relative z-10 flex items-center gap-2"
          >
            <Building className="w-4 h-4" />
            <span>Register New School</span>
          </button>
        </div>

        {/* 3 Executive Agent KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Provisioned Client Schools</span>
            <div className="text-3xl font-extrabold text-white font-mono">{schools.length} Schools</div>
            <span className="text-[10px] text-emerald-400 font-bold block">100% Active Enterprise Licenses</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Enrolled Students</span>
            <div className="text-3xl font-extrabold text-blue-400 font-mono">{totalStudentsAllSchools} Students</div>
            <span className="text-[10px] text-slate-400 font-medium block">Across all registered tenant schools</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">PSSR License Status</span>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">Enterprise Active</div>
            <span className="text-[10px] text-slate-400 font-medium block">Agent SuperAdmin Operations</span>
          </div>
        </div>

        {/* Schools Roster Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                <span>Provisioned Tenant Schools ({filteredSchools.length})</span>
              </h3>
              <p className="text-xs text-slate-400">All registered client schools provisioned by authorized agents.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search school name or code..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-6">School Code</th>
                  <th className="py-3.5 px-6">School Name</th>
                  <th className="py-3.5 px-6">Admin Contact</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6 text-center">Enrolled Students</th>
                  <th className="py-3.5 px-6 text-center">License Status</th>
                  <th className="py-3.5 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">Loading registered schools...</td>
                  </tr>
                ) : filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">No provisioned schools found. Click &quot;Provision & Register New School&quot; to add a buyer school.</td>
                  </tr>
                ) : (
                  filteredSchools.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-extrabold text-blue-400">{sch.schoolCode}</td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-extrabold text-white text-sm">{sch.name}</p>
                          <p className="text-[10px] text-slate-500">{sch.email || sch.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-slate-200">{sch.adminName}</p>
                          <p className="text-[10px] text-blue-300 font-mono">{sch.adminEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-medium">{sch.city}, {sch.state}</td>
                      <td className="py-4 px-6 text-center font-extrabold text-white font-mono text-sm">{sch.studentCount}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {sch.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => navigate('/admin/dashboard')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] rounded-lg shadow-md transition-colors"
                        >
                          <span>Launch School Admin</span>
                          <ExternalLink className="w-3.5 h-3.5" />
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
        title="Edit / Change Agent Security Password"
      >
        <form onSubmit={handleSaveAgentPassword} className="space-y-4 text-xs">
          {passwordSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{passwordSuccessMsg}</span>
            </div>
          )}

          {passwordErrorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl font-bold">
              {passwordErrorMsg}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Agent Email / Authorized ID *</label>
            <input
              type="text"
              required
              value={editAgentEmail}
              onChange={(e) => setEditAgentEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Agent Security Password *</label>
            <input
              type="password"
              required
              value={newAgentPassword}
              onChange={(e) => setNewAgentPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Confirm New Agent Password *</label>
            <input
              type="password"
              required
              value={confirmAgentPassword}
              onChange={(e) => setConfirmAgentPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingPassword}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4"
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
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-bold">
              {errorMsg}
            </div>
          )}

          {/* Section 1: School Details */}
          <div className="space-y-3 border-b border-slate-200 pb-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-600" />
              <span>1. School Profile Particulars</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Name *</label>
                <input
                  type="text"
                  name="schoolName"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="e.g. Saint Johns High School"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Code (Short) *</label>
                <input
                  type="text"
                  name="schoolCode"
                  required
                  value={formData.schoolCode}
                  onChange={handleChange}
                  placeholder="e.g. SJHS"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Address *</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Street Address, Area"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Phone *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Official Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@school.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Administrator Account Credentials */}
          <div className="space-y-3 border-b border-slate-200 pb-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>2. School Administrator Credentials</span>
            </h4>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admin Full Name *</label>
              <input
                type="text"
                name="adminFullName"
                required
                value={formData.adminFullName}
                onChange={handleChange}
                placeholder="e.g. Dr. K. Murthy (Principal)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admin ID / Login Username *</label>
                <input
                  type="text"
                  name="adminEmail"
                  required
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@school.com or MHS_ADMIN"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admin Phone *</label>
                <input
                  type="text"
                  name="adminPhone"
                  required
                  value={formData.adminPhone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="adminPassword"
                  required
                  value={formData.adminPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="adminConfirmPassword"
                  required
                  value={formData.adminConfirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Configuration */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>3. System Defaults & Cutoff Settings</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Year *</label>
                <input
                  type="text"
                  name="academicYearName"
                  required
                  value={formData.academicYearName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SMS Cutoff Time *</label>
                <input
                  type="time"
                  name="attendanceCutoffTime"
                  required
                  value={formData.attendanceCutoffTime}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{isSubmitting ? "Provisioning Buyer School..." : "Confirm & Provision School License"}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};
