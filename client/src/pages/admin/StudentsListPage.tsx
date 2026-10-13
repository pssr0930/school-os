import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Archive, 
  TrendingUp, 
  Check, 
  ArrowRight, 
  UserPlus, 
  Layers, 
  Phone, 
  X,
  GraduationCap,
  Filter,
  Users
} from 'lucide-react';
import { Modal } from '../../components/Modal';

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const basePath = user?.role === 'admin' ? '/admin' : '/staff';

  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState<'all' | 'paid' | 'due'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Promote Modal State
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteFromClass, setPromoteFromClass] = useState('');
  const [promoteToClass, setPromoteToClass] = useState('');
  const [promoteSuccessMsg, setPromoteSuccessMsg] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      if (res.data.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedClass) query.append('classId', selectedClass);
      if (selectedSection) query.append('sectionId', selectedSection);
      if (searchTerm) query.append('search', searchTerm);

      const res = await api.get(`/students?${query.toString()}`);
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
    const interval = setInterval(() => {
      fetchStudents(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedClass, selectedSection, searchTerm]);

  useEffect(() => {
    if (selectedClass) {
      api.get(`/classes/${selectedClass}/sections`).then(res => {
        if (res.data.success) setSections(res.data.data);
      });
    } else {
      setSections([]);
    }
  }, [selectedClass]);

  const handleArchiveStudent = async (studentId: string, fullName: string) => {
    if (!window.confirm(`Are you sure you want to archive student "${fullName}"?`)) {
      return;
    }
    try {
      const res = await api.delete(`/students/${studentId}`);
      if (res.data.success) {
        fetchStudents();
      }
    } catch (err) {
      console.error('Failed to archive student', err);
    }
  };

  const handlePromoteSingleStudent = async (studentId: string, fullName: string) => {
    if (!window.confirm(`Promote "${fullName}" to next class?`)) {
      return;
    }
    try {
      const res = await api.post(`/students/${studentId}/promote`, {});
      if (res.data.success) {
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not promote student.');
    }
  };

  const handlePromoteClassCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteFromClass || !promoteToClass) return;
    setIsPromoting(true);
    setPromoteSuccessMsg('');
    try {
      const res = await api.post('/students/promote-cohort', {
        fromClassId: promoteFromClass,
        toClassId: promoteToClass
      });
      if (res.data.success) {
        setPromoteSuccessMsg(`Successfully promoted ${res.data.count} students!`);
        fetchStudents();
        setTimeout(() => {
          setIsPromoteModalOpen(false);
          setPromoteSuccessMsg('');
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to promote class.');
    } finally {
      setIsPromoting(false);
    }
  };

  // Filter students based on Fee Status Filter
  const filteredStudents = students.filter(st => {
    const balance = st.feeSummary?.balance || 0;
    if (feeStatusFilter === 'paid') return balance === 0;
    if (feeStatusFilter === 'due') return balance > 0;
    return true;
  });

  const totalCount = students.length;
  const paidCount = students.filter(s => (s.feeSummary?.balance || 0) === 0).length;
  const dueCount = students.filter(s => (s.feeSummary?.balance || 0) > 0).length;

  const selectedClassObj = classes.find(c => c.id === selectedClass);
  const canCreate = hasPermission('students.create') || hasPermission('students.manage') || user?.role === 'admin';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5">
      {/* 1. HEADER BAR */}
      <PageHeader
        title="Students"
        action={
          <div className="flex items-center gap-2.5">
            {user?.role === 'admin' && (
              <button
                onClick={() => setIsPromoteModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all active:scale-95"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Promote Class</span>
              </button>
            )}

            {canCreate && (
              <button
                onClick={() => navigate(selectedClass ? `${basePath}/students/new?classId=${selectedClass}` : `${basePath}/students/new`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add Student</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Students Card */}
        <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white p-4 rounded-2xl border border-blue-100/90 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:border-blue-200">
          <div>
            <p className="text-[10px] font-extrabold text-blue-600/80 uppercase tracking-wider">Total Students</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Paid in Full Card */}
        <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white p-4 rounded-2xl border border-emerald-100/90 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:border-emerald-200">
          <div>
            <p className="text-[10px] font-extrabold text-emerald-700/80 uppercase tracking-wider">Paid in Full</p>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-0.5">{paidCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Dues Card */}
        <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white p-4 rounded-2xl border border-amber-100/90 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:border-amber-200">
          <div>
            <p className="text-[10px] font-extrabold text-amber-700/80 uppercase tracking-wider">Pending Dues</p>
            <p className="text-2xl font-black text-amber-800 font-mono mt-0.5">{dueCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Filter className="w-5 h-5" />
          </div>
        </div>

        {/* Classes Card */}
        <div className="bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-white p-4 rounded-2xl border border-purple-100/90 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:border-purple-200">
          <div>
            <p className="text-[10px] font-extrabold text-purple-600/80 uppercase tracking-wider">Classes</p>
            <p className="text-2xl font-black text-purple-950 font-mono mt-0.5">{classes.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Search Bar & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student name, reg no, or parent details..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-8 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-end">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">All Fee Status</option>
                <option value="paid">Paid in Full ✓</option>
                <option value="due">Pending Dues Only</option>
              </select>
            </div>

            {selectedClass && sections.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sec:</span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="">All Sec</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>Sec {s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          <button
            onClick={() => { setSelectedClass(''); setSelectedSection(''); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedClass === '' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Classes</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${selectedClass === '' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
              {students.length}
            </span>
          </button>

          {classes.map(c => {
            const isSelected = selectedClass === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedClass(c.id); setSelectedSection(''); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MOBILE CARDS VIEW (< 768px) */}
      <div className="block md:hidden space-y-2.5">
        {isLoading ? (
          <div className="p-6 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs font-semibold">
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
            <p className="font-semibold text-slate-700">No student records found.</p>
          </div>
        ) : (
          filteredStudents.map((st) => {
            const balance = st.feeSummary?.balance || 0;
            const parentPhone = st.parentDetails?.fatherPhone || st.parentDetails?.motherPhone || st.parentPhone || 'N/A';
            const parentName = st.parentDetails?.fatherName || st.parentDetails?.motherName || st.parentName || 'Parent';

            return (
              <div key={st.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900">{st.fullName}</h3>
                    <p className="text-[10px] font-mono font-bold text-blue-600">REG: {st.registrationNumber}</p>
                  </div>

                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded-lg border border-slate-200">
                    {st.className} {st.sectionName ? `- ${st.sectionName}` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold">Parent</p>
                    <p className="font-semibold text-slate-900 truncate">{parentName}</p>
                    <p className="font-mono text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {parentPhone}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold">Fee Status</p>
                    {balance === 0 ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                        PAID IN FULL ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                        ₹{balance.toLocaleString('en-IN')} DUE
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`${basePath}/students/${st.id}`)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => navigate(`${basePath}/students/${st.id}/edit`)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                    title="Edit Student"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. DESKTOP DATA TABLE (>= 768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5">Reg No</th>
                <th className="py-3 px-5">Student Name</th>
                <th className="py-3 px-5">Class & Section</th>
                <th className="py-3 px-5">Parent Details</th>
                <th className="py-3 px-5 text-center">Attendance</th>
                <th className="py-3 px-5 text-right">Fee Status</th>
                <th className="py-3 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    Loading student list...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <p className="font-semibold text-slate-700 text-xs">No student records match your search.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const balance = st.feeSummary?.balance || 0;
                  const parentPhone = st.parentDetails?.fatherPhone || st.parentDetails?.motherPhone || st.parentPhone || 'N/A';
                  const parentName = st.parentDetails?.fatherName || st.parentDetails?.motherName || st.parentName || 'Parent';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Reg No */}
                      <td className="py-3 px-5 font-mono font-bold text-blue-600">
                        {st.registrationNumber}
                      </td>
                      
                      {/* Student Name */}
                      <td className="py-3 px-5">
                        <span className="font-extrabold text-slate-900 block leading-tight text-xs">{st.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">ADM: {st.admissionNumber || st.registrationNumber}</span>
                      </td>

                      {/* Class & Section */}
                      <td className="py-3 px-5">
                        <span className="px-2.5 py-1 rounded-lg font-extrabold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                          {st.className} {st.sectionName ? `• Sec ${st.sectionName}` : ''}
                        </span>
                      </td>

                      {/* Parent Details */}
                      <td className="py-3 px-5">
                        <div className="text-slate-900 font-bold text-xs">{parentName}</div>
                        <div className="font-mono text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{parentPhone}</span>
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-extrabold border ${
                          (st.attendancePercentage || 100) >= 90 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : (st.attendancePercentage || 100) >= 75 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {st.attendancePercentage || 100}%
                        </span>
                      </td>

                      {/* Fee Status */}
                      <td className="py-3 px-5 text-right font-mono font-bold">
                        {balance === 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-black text-[10px]">
                            PAID IN FULL ✓
                          </span>
                        ) : (
                          <span className="text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-black text-[10px]">
                            ₹{balance.toLocaleString('en-IN')} DUE
                          </span>
                        )}
                      </td>

                      {/* Action Icons */}
                      <td className="py-3 px-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`${basePath}/students/${st.id}`)}
                            title="View Profile"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => navigate(`${basePath}/students/${st.id}/edit`)}
                            title="Edit Details"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {user?.role === 'admin' && (
                            <>
                              <button
                                onClick={() => handlePromoteSingleStudent(st.id, st.fullName)}
                                title="Promote Student"
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-emerald-600 transition-colors"
                              >
                                <TrendingUp className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleArchiveStudent(st.id, st.fullName)}
                                title="Archive Student"
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-red-600 transition-colors"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Table Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing {filteredStudents.length} of {totalCount} students</span>
          </div>
        </div>
      </div>

      {/* Promote Class Modal */}
      <Modal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        title="Promote Class"
      >
        <form onSubmit={handlePromoteClassCohort} className="space-y-4 text-xs">
          {promoteSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{promoteSuccessMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Current Class *</label>
            <select
              required
              value={promoteFromClass}
              onChange={(e) => setPromoteFromClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
            >
              <option value="">Select current class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center my-1">
            <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 sm:rotate-0" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Target Class *</label>
            <select
              required
              value={promoteToClass}
              onChange={(e) => setPromoteToClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
            >
              <option value="">Select target class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isPromoting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{isPromoting ? "Promoting Class..." : "Promote Class"}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentsListPage;
