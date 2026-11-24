import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
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
      console.error('Failed to fetch classes', err);
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
      console.error('Failed to fetch students', err);
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
      // Background auto-refresh paused if page is not visible
      if (!document.hidden) {
        fetchStudents(true);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [selectedClass, selectedSection, searchTerm]);

  useEffect(() => {
    if (selectedClass) {
      api.get(`/classes/${selectedClass}/sections`).then(res => {
        if (res.data.success) setSections(res.data.data);
      }).catch(err => console.error('Failed to fetch sections', err));
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

  const canCreate = hasPermission('students.create') || hasPermission('students.manage') || user?.role === 'admin';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-[#F3F4F6]">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#F3F4F6] tracking-tight">Students</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Manage student directory, class assignments, attendance, and fee status.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsPromoteModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#1F2937] hover:bg-gray-700 text-[#F3F4F6] text-xs font-medium rounded-lg border border-[#303B4D] transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Promote Class</span>
            </button>
          )}

          {canCreate && (
            <button
              onClick={() => navigate(selectedClass ? `${basePath}/students/new?classId=${selectedClass}` : `${basePath}/students/new`)}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Student</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Students Card */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#9CA3AF]">Total Students</p>
            <p className="text-2xl font-semibold text-[#F3F4F6] font-mono tabular-nums mt-1">{totalCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Paid in Full Card */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#9CA3AF]">Paid in Full</p>
            <p className="text-2xl font-semibold text-[#F3F4F6] font-mono tabular-nums mt-1">{paidCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-[#22C55E] flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Check className="w-4 h-4" />
          </div>
        </div>

        {/* Pending Dues Card */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#9CA3AF]">Pending Dues</p>
            <p className="text-2xl font-semibold text-[#F3F4F6] font-mono tabular-nums mt-1">{dueCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-[#F59E0B] flex items-center justify-center shrink-0 border border-amber-500/20">
            <Filter className="w-4 h-4" />
          </div>
        </div>

        {/* Classes Card */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#9CA3AF]">Classes</p>
            <p className="text-2xl font-semibold text-[#F3F4F6] font-mono tabular-nums mt-1">{classes.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Controls */}
      <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-4 space-y-3">
        {/* Search Bar & Dropdowns (Baseline Aligned, Uniform h-9) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student name, reg no, or parent details..."
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-10 pr-9 text-xs font-normal text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-end">
            {/* Fee Status Dropdown */}
            <div className="h-9 flex items-center gap-2 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6]">
              <Filter className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
              <select
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value as any)}
                aria-label="Filter by fee status"
                className="bg-transparent text-xs text-[#F3F4F6] focus:outline-none cursor-pointer pl-1 pr-8"
              >
                <option value="all" className="bg-[#1F2937] text-[#F3F4F6]">All Fee Status</option>
                <option value="paid" className="bg-[#1F2937] text-[#F3F4F6]">Paid in Full ✓</option>
                <option value="due" className="bg-[#1F2937] text-[#F3F4F6]">Pending Dues Only</option>
              </select>
            </div>

            {/* Section Dropdown */}
            {selectedClass && sections.length > 0 && (
              <div className="h-9 flex items-center gap-1.5 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6]">
                <span className="text-[11px] font-medium text-[#9CA3AF]">Sec:</span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  aria-label="Filter by section"
                  className="bg-transparent text-xs text-[#F3F4F6] focus:outline-none cursor-pointer pl-1 pr-8"
                >
                  <option value="" className="bg-[#1F2937] text-[#F3F4F6]">All Sec</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id} className="bg-[#1F2937] text-[#F3F4F6]">Sec {s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-[#303B4D] pt-3">
          <button
            onClick={() => { setSelectedClass(''); setSelectedSection(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
              selectedClass === '' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#243244] hover:bg-gray-700/60 text-[#9CA3AF] hover:text-[#F3F4F6] border border-[#303B4D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Classes</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              selectedClass === '' ? 'bg-blue-700/80 text-white' : 'bg-[#1F2937] text-[#9CA3AF]'
            }`}>
              {students.length}
            </span>
          </button>

          {classes.map(c => {
            const isSelected = selectedClass === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedClass(c.id); setSelectedSection(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#243244] hover:bg-gray-700/60 text-[#9CA3AF] hover:text-[#F3F4F6] border border-[#303B4D]'
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
          <div className="p-6 text-center text-[#9CA3AF] bg-[#1F2937] rounded-lg border border-[#303B4D] text-xs">
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center bg-[#1F2937] rounded-lg border border-[#303B4D] space-y-2">
            <Users className="w-6 h-6 mx-auto text-[#9CA3AF] mb-1" />
            <p className="font-medium text-xs text-[#F3F4F6]">No student records found.</p>
            <p className="text-[11px] text-[#9CA3AF]">
              {searchTerm || selectedClass || feeStatusFilter !== 'all'
                ? "No students match your active search and filter criteria."
                : "No students enrolled in this directory yet."}
            </p>
          </div>
        ) : (
          filteredStudents.map((st) => {
            const balance = st.feeSummary?.balance || 0;
            const parentPhone = st.parentDetails?.fatherPhone || st.parentDetails?.motherPhone || st.parentPhone || 'N/A';
            const parentName = st.parentDetails?.fatherName || st.parentDetails?.motherName || st.parentName || 'Parent';

            return (
              <div key={st.id} className="p-3.5 bg-[#1F2937] hover:bg-[#243244]/60 rounded-lg border border-[#303B4D] space-y-2.5 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-xs text-[#F3F4F6]">{st.fullName}</h3>
                    <p className="text-[10px] font-mono text-blue-400">REG: {st.registrationNumber}</p>
                  </div>

                  <span className="px-2 py-0.5 bg-[#243244] text-[#F3F4F6] font-medium text-[10px] rounded border border-[#303B4D]">
                    {st.className} {st.sectionName ? `- ${st.sectionName}` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#303B4D]">
                  <div>
                    <p className="text-[9px] text-[#9CA3AF] uppercase font-medium">Parent</p>
                    <p className="font-medium text-[#F3F4F6] truncate">{parentName}</p>
                    <p className="font-mono text-[10px] text-[#9CA3AF] flex items-center gap-1 mt-0.5 tabular-nums">
                      <Phone className="w-3 h-3 text-[#9CA3AF]" />
                      {parentPhone}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] text-[#9CA3AF] uppercase font-medium">Fee Status</p>
                    {balance === 0 ? (
                      <span className="text-[10px] font-medium text-[#22C55E] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 inline-block mt-0.5">
                        PAID IN FULL ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-medium text-[#F59E0B] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 inline-block mt-0.5 tabular-nums">
                        ₹{balance.toLocaleString('en-IN')} DUE
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#303B4D]">
                  <button
                    onClick={() => navigate(`${basePath}/students/${st.id}`)}
                    className="flex-1 py-1.5 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-[#303B4D]"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => navigate(`${basePath}/students/${st.id}/edit`)}
                    className="p-1.5 bg-[#243244] hover:bg-gray-700 text-[#9CA3AF] hover:text-blue-400 rounded-lg transition-colors border border-[#303B4D]"
                    title="Edit Student"
                    aria-label="Edit Student"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => handlePromoteSingleStudent(st.id, st.fullName)}
                        className="p-1.5 bg-[#243244] hover:bg-gray-700 text-[#9CA3AF] hover:text-emerald-400 rounded-lg transition-colors border border-[#303B4D]"
                        title="Promote Student"
                        aria-label="Promote Student"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleArchiveStudent(st.id, st.fullName)}
                        className="p-1.5 bg-[#243244] hover:bg-gray-700 text-[#9CA3AF] hover:text-red-400 rounded-lg transition-colors border border-[#303B4D]"
                        title="Archive Student"
                        aria-label="Archive Student"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. DESKTOP DATA TABLE (>= 768px) */}
      <div className="hidden md:block bg-[#1F2937] rounded-lg border border-[#303B4D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#243244] border-b border-[#303B4D] text-[#9CA3AF] font-medium text-xs">
                <th className="py-2.5 px-4 w-32">Reg No</th>
                <th className="py-2.5 px-4 min-w-[180px]">Student Name</th>
                <th className="py-2.5 px-4 w-36">Class & Section</th>
                <th className="py-2.5 px-4 w-48">Parent Details</th>
                <th className="py-2.5 px-4 text-center w-28">Attendance</th>
                <th className="py-2.5 px-4 text-right w-36">Fee Status</th>
                <th className="py-2.5 px-4 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303B4D] bg-[#1F2937]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[#9CA3AF]">
                    Loading student list...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Users className="w-6 h-6 mx-auto text-[#9CA3AF] mb-2" />
                    <p className="text-xs font-medium text-[#F3F4F6]">No student records found.</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                      {searchTerm || selectedClass || feeStatusFilter !== 'all'
                        ? "No students match your active search and filter criteria."
                        : "No students enrolled in this directory yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const balance = st.feeSummary?.balance || 0;
                  const parentPhone = st.parentDetails?.fatherPhone || st.parentDetails?.motherPhone || st.parentPhone || 'N/A';
                  const parentName = st.parentDetails?.fatherName || st.parentDetails?.motherName || st.parentName || 'Parent';

                  return (
                    <tr key={st.id} className="hover:bg-[#243244]/60 transition-colors">
                      {/* Reg No */}
                      <td className="py-2.5 px-4 font-mono font-medium text-blue-400 tabular-nums w-32 whitespace-nowrap">
                        {st.registrationNumber}
                      </td>
                      
                      {/* Student Name */}
                      <td className="py-2.5 px-4 min-w-[180px]">
                        <span className="font-medium text-[#F3F4F6] block leading-tight text-xs">{st.fullName}</span>
                        <span className="text-[10px] text-[#9CA3AF] font-mono">ADM: {st.admissionNumber || st.registrationNumber}</span>
                      </td>

                      {/* Class & Section */}
                      <td className="py-2.5 px-4 w-36 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#243244] text-[#F3F4F6] border border-[#303B4D]">
                          {st.className} {st.sectionName ? `• Sec ${st.sectionName}` : ''}
                        </span>
                      </td>

                      {/* Parent Details */}
                      <td className="py-2.5 px-4 w-48">
                        <div className="text-[#F3F4F6] font-medium text-xs truncate max-w-[160px]">{parentName}</div>
                        <div className="font-mono text-[10px] text-[#9CA3AF] flex items-center gap-1 mt-0.5 tabular-nums">
                          <Phone className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                          <span>{parentPhone}</span>
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="py-2.5 px-4 text-center w-28 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                          (st.attendancePercentage || 100) >= 90 
                            ? 'bg-emerald-950/40 text-[#22C55E] border-emerald-800/40' 
                            : (st.attendancePercentage || 100) >= 75 
                            ? 'bg-amber-950/40 text-[#F59E0B] border-amber-800/40' 
                            : 'bg-red-950/40 text-[#EF4444] border-red-800/40'
                        }`}>
                          {st.attendancePercentage || 100}%
                        </span>
                      </td>

                      {/* Fee Status */}
                      <td className="py-2.5 px-4 text-right w-36 whitespace-nowrap">
                        {balance === 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-[#22C55E] border border-emerald-800/40">
                            PAID IN FULL ✓
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-950/40 text-[#F59E0B] border border-amber-800/40 tabular-nums">
                            ₹{balance.toLocaleString('en-IN')} DUE
                          </span>
                        )}
                      </td>

                      {/* Action Icons */}
                      <td className="py-2.5 px-4 text-center w-32 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`${basePath}/students/${st.id}`)}
                            title="View Profile"
                            aria-label="View Profile"
                            className="p-1.5 hover:bg-[#243244] rounded-md text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => navigate(`${basePath}/students/${st.id}/edit`)}
                            title="Edit Details"
                            aria-label="Edit Details"
                            className="p-1.5 hover:bg-[#243244] rounded-md text-[#9CA3AF] hover:text-blue-400 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {user?.role === 'admin' && (
                            <>
                              <button
                                onClick={() => handlePromoteSingleStudent(st.id, st.fullName)}
                                title="Promote Student"
                                aria-label="Promote Student"
                                className="p-1.5 hover:bg-[#243244] rounded-md text-[#9CA3AF] hover:text-emerald-400 transition-colors"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleArchiveStudent(st.id, st.fullName)}
                                title="Archive Student"
                                aria-label="Archive Student"
                                className="p-1.5 hover:bg-[#243244] rounded-md text-[#9CA3AF] hover:text-red-400 transition-colors"
                              >
                                <Archive className="w-3.5 h-3.5" />
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

          {/* Table Footer with Pluralization */}
          <div className="p-3.5 bg-[#1F2937] border-t border-[#303B4D] flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>
              Showing <strong className="text-[#F3F4F6] font-medium">{filteredStudents.length}</strong> of{' '}
              <strong className="text-[#F3F4F6] font-medium">{totalCount}</strong>{' '}
              {totalCount === 1 ? 'student' : 'students'}
            </span>
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
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-[#22C55E] rounded-lg font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-[#22C55E]" />
              <span>{promoteSuccessMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-[#9CA3AF] uppercase tracking-wider mb-1 text-[11px]">Current Class *</label>
            <select
              required
              value={promoteFromClass}
              onChange={(e) => setPromoteFromClass(e.target.value)}
              className="w-full bg-[#1F2937] border border-[#303B4D] rounded-lg pl-3.5 pr-8 py-2 text-xs text-[#F3F4F6] font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#1F2937] text-[#9CA3AF]">Select current class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#1F2937] text-[#F3F4F6]">{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center my-2">
            <div className="w-7 h-7 rounded-full bg-[#243244] border border-[#303B4D] flex items-center justify-center text-[#9CA3AF]">
              <ArrowRight className="w-3.5 h-3.5 rotate-90 sm:rotate-0" />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#9CA3AF] uppercase tracking-wider mb-1 text-[11px]">Target Class *</label>
            <select
              required
              value={promoteToClass}
              onChange={(e) => setPromoteToClass(e.target.value)}
              className="w-full bg-[#1F2937] border border-[#303B4D] rounded-lg pl-3.5 pr-8 py-2 text-xs text-[#F3F4F6] font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#1F2937] text-[#9CA3AF]">Select target class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#1F2937] text-[#F3F4F6]">{c.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isPromoting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <span>{isPromoting ? "Promoting Class..." : "Promote Class"}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentsListPage;
