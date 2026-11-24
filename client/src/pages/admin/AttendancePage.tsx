import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  Save, 
  CheckCheck, 
  XSquare,
  Users
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [studentsAttendance, setStudentsAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [smsResult, setSmsResult] = useState('');

  useEffect(() => {
    api.get('/classes').then(res => {
      if (res.data.success) {
        setClasses(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedClass(res.data.data[0].id);
        }
      }
    }).catch(err => console.error('Failed to load classes', err));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      api.get(`/classes/${selectedClass}/sections`).then(res => {
        if (res.data.success) {
          setSections(res.data.data);
        }
      }).catch(err => console.error('Failed to load sections', err));
    } else {
      setSections([]);
    }
  }, [selectedClass]);

  const fetchAttendanceList = async () => {
    if (!selectedClass) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/attendance/class?classId=${selectedClass}&sectionId=${selectedSection}&date=${selectedDate}`);
      if (res.data.success) {
        setStudentsAttendance(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load attendance list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceList();
  }, [selectedClass, selectedSection, selectedDate]);

  const handleStatusToggle = (studentId: string, newStatus: 'present' | 'absent' | 'late') => {
    setStudentsAttendance(prev => 
      prev.map(st => st.studentId === studentId ? { ...st, status: newStatus } : st)
    );
  };

  const handleMarkAll = (targetStatus: 'present' | 'absent') => {
    setStudentsAttendance(prev => prev.map(st => ({ ...st, status: targetStatus })));
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      const records = studentsAttendance.map(st => ({
        studentId: st.studentId,
        status: st.status
      }));

      const res = await api.post('/attendance', {
        classId: selectedClass,
        sectionId: selectedSection || undefined,
        attendanceDate: selectedDate,
        records
      });

      if (res.data.success) {
        setSaveSuccess('Attendance saved successfully!');
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save attendance', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerAbsenceSms = async () => {
    try {
      const res = await api.post('/attendance/send-absence-notifications', {
        attendanceDate: selectedDate
      });
      if (res.data.success) {
        setSmsResult(`Notification process complete. Sent ${res.data.data.count} SMS alerts to parents.`);
        setTimeout(() => setSmsResult(''), 4000);
      }
    } catch (err) {
      console.error('Failed to send absence notifications', err);
    }
  };

  const presentCount = studentsAttendance.filter(s => s.status === 'present').length;
  const absentCount = studentsAttendance.filter(s => s.status === 'absent').length;
  const lateCount = studentsAttendance.filter(s => s.status === 'late').length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 md:pb-6 text-[#F3F4F6]">
      {/* 1. Page Header & Live Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#F3F4F6] tracking-tight">Attendance</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Mark daily student attendance, review class status, and send absence alerts.</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Header Summary Pill: Roster: X | P: X | A: X | L: X */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1F2937] border border-[#303B4D] text-xs">
            <span className="text-[#9CA3AF]">Roster:</span>
            <span className="font-mono font-medium text-[#F3F4F6] tabular-nums">{studentsAttendance.length}</span>
            <span className="text-[#303B4D]">|</span>
            <span className="text-[#22C55E] font-medium font-mono tabular-nums">P: {presentCount}</span>
            <span className="text-[#303B4D]">|</span>
            <span className="text-[#EF4444] font-medium font-mono tabular-nums">A: {absentCount}</span>
            <span className="text-[#303B4D]">|</span>
            <span className="text-[#F59E0B] font-medium font-mono tabular-nums">L: {lateCount}</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[#22C55E] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {smsResult && (
        <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-400 text-xs font-medium flex items-center gap-2">
          <Send className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{smsResult}</span>
        </div>
      )}

      {/* 2. Filter & Bulk Action Toolbar */}
      <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-4 flex flex-wrap items-end justify-between gap-4">
        {/* Left: Class, Section, Date Selectors */}
        <div className="flex items-end gap-3 flex-wrap w-full lg:w-auto">
          {/* Class Dropdown */}
          <div className="flex-1 sm:flex-none min-w-[140px]">
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }}
              className="w-full sm:w-auto h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#1F2937] text-[#F3F4F6]">{c.name}</option>
              ))}
            </select>
          </div>

          {/* Section Dropdown */}
          <div className="flex-1 sm:flex-none min-w-[120px]">
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full sm:w-auto h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#1F2937] text-[#F3F4F6]">All Sec</option>
              {sections.map(s => (
                <option key={s.id} value={s.id} className="bg-[#1F2937] text-[#F3F4F6]">Sec {s.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="w-full sm:w-auto min-w-[140px]">
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full sm:w-auto h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] font-medium focus:border-blue-500 focus:outline-none cursor-pointer tabular-nums [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Right: Quick Batch Actions & SMS Trigger */}
        <div className="flex items-end gap-2.5 w-full lg:w-auto justify-end flex-wrap pt-2 lg:pt-0">
          <button
            type="button"
            onClick={() => handleMarkAll('present')}
            disabled={studentsAttendance.length === 0}
            className="flex-1 sm:flex-none h-9 px-3.5 bg-emerald-950/40 hover:bg-emerald-900/50 disabled:opacity-40 text-[#22C55E] border border-emerald-800/50 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={() => handleMarkAll('absent')}
            disabled={studentsAttendance.length === 0}
            className="flex-1 sm:flex-none h-9 px-3.5 bg-red-950/40 hover:bg-red-900/50 disabled:opacity-40 text-[#EF4444] border border-red-800/50 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <XSquare className="w-3.5 h-3.5" />
            <span>Mark All Absent</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerAbsenceSms}
            disabled={absentCount === 0}
            title={absentCount === 0 ? "No absent students to notify" : "Send parent absence SMS notifications"}
            className="flex-1 sm:flex-none h-9 px-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Absence SMS</span>
          </button>
        </div>
      </div>

      {/* 3. MOBILE ATTENDANCE LIST VIEW (< 768px) */}
      <div className="block md:hidden bg-[#1F2937] rounded-lg border border-[#303B4D] overflow-hidden">
        <div className="p-3 bg-[#243244] border-b border-[#303B4D] flex items-center justify-between text-xs text-[#9CA3AF]">
          <span className="font-medium">Student (Reg No • Sec)</span>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#22C55E] font-medium">P: {presentCount}</span>
            <span className="text-[#303B4D]">•</span>
            <span className="text-[#EF4444] font-medium">A: {absentCount}</span>
            <span className="text-[#303B4D]">•</span>
            <span className="text-[#F59E0B] font-medium">L: {lateCount}</span>
          </div>
        </div>

        <div className="divide-y divide-[#303B4D] bg-[#1F2937] max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-[#9CA3AF] text-xs">Loading student roster...</div>
          ) : studentsAttendance.length === 0 ? (
            <div className="p-8 text-center text-[#9CA3AF] text-xs space-y-1">
              <Users className="w-6 h-6 mx-auto mb-2 text-[#9CA3AF]" />
              <p className="font-medium text-[#F3F4F6]">No students found for this class and section.</p>
              <p className="text-[11px] text-[#9CA3AF]">Select another class or section above.</p>
            </div>
          ) : (
            studentsAttendance.map((st) => (
              <div key={st.studentId} className="p-3 flex items-center justify-between gap-3 hover:bg-[#243244]/60 transition-colors">
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-xs text-[#F3F4F6] truncate block">{st.fullName}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF] font-mono mt-0.5 tabular-nums">
                    <span className="text-blue-400">{st.registrationNumber}</span>
                    <span>•</span>
                    <span>Sec {st.sectionName}</span>
                  </div>
                </div>

                {/* Compact Mobile Segmented Control: [P] [A] [L] */}
                <div className="inline-flex items-center p-0.5 rounded-lg bg-[#243244] border border-[#303B4D] shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(st.studentId, 'present')}
                    className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-colors ${
                      st.status === 'present'
                        ? 'bg-emerald-950/60 text-[#22C55E] border border-emerald-800/60'
                        : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                    }`}
                  >
                    P
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusToggle(st.studentId, 'absent')}
                    className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-colors ${
                      st.status === 'absent'
                        ? 'bg-red-950/60 text-[#EF4444] border border-red-800/60'
                        : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                    }`}
                  >
                    A
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusToggle(st.studentId, 'late')}
                    className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-colors ${
                      st.status === 'late'
                        ? 'bg-amber-950/60 text-[#F59E0B] border border-amber-800/60'
                        : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                    }`}
                  >
                    L
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. DESKTOP ATTENDANCE TABLE (>= 768px) */}
      <div className="hidden md:block bg-[#1F2937] rounded-lg border border-[#303B4D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#243244] border-b border-[#303B4D] text-[#9CA3AF] font-medium text-xs">
                <th className="py-2.5 px-5 w-44">Reg No</th>
                <th className="py-2.5 px-5">Student Name</th>
                <th className="py-2.5 px-5 w-36">Section</th>
                <th className="py-2.5 px-5 text-right w-72">Status Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303B4D] bg-[#1F2937]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-xs text-[#9CA3AF]">
                    Loading student attendance roster...
                  </td>
                </tr>
              ) : studentsAttendance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs">
                    <Users className="w-6 h-6 mx-auto mb-2 text-[#9CA3AF]" />
                    <p className="font-medium text-[#F3F4F6]">No students found for this class and section.</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">Please choose another class or section above.</p>
                  </td>
                </tr>
              ) : (
                studentsAttendance.map((st) => (
                  <tr key={st.studentId} className="hover:bg-[#243244]/60 transition-colors">
                    {/* Reg No */}
                    <td className="py-2.5 px-5 font-mono font-medium text-blue-400 tabular-nums">
                      {st.registrationNumber}
                    </td>

                    {/* Student Name */}
                    <td className="py-2.5 px-5 font-medium text-[#F3F4F6]">
                      {st.fullName}
                    </td>

                    {/* Section */}
                    <td className="py-2.5 px-5">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#243244] text-[#F3F4F6] border border-[#303B4D]">
                        Section {st.sectionName}
                      </span>
                    </td>

                    {/* Status Toggle Segmented Control (Right-Aligned) */}
                    <td className="py-2.5 px-5 text-right">
                      <div className="inline-flex items-center p-0.5 rounded-lg bg-[#243244] border border-[#303B4D]">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st.studentId, 'present')}
                          className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            st.status === 'present'
                              ? 'bg-emerald-950/60 text-[#22C55E] border border-emerald-800/60 shadow-xs'
                              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st.studentId, 'absent')}
                          className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            st.status === 'absent'
                              ? 'bg-red-950/60 text-[#EF4444] border border-red-800/60 shadow-xs'
                              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st.studentId, 'late')}
                          className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            st.status === 'late'
                              ? 'bg-amber-950/60 text-[#F59E0B] border border-amber-800/60 shadow-xs'
                              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary & Desktop Save Button */}
        <div className="p-3.5 bg-[#1F2937] border-t border-[#303B4D] flex items-center justify-between text-xs text-[#9CA3AF]">
          <div>
            <span>Roster: <strong className="text-[#F3F4F6] font-medium">{studentsAttendance.length}</strong> {studentsAttendance.length === 1 ? 'student' : 'students'} enrolled</span>
          </div>

          <button
            onClick={handleSaveAttendance}
            disabled={studentsAttendance.length === 0 || isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Class Attendance'}</span>
          </button>
        </div>
      </div>

      {/* 5. Mobile Fixed Bottom Save Bar */}
      <div className="fixed md:hidden bottom-0 left-0 right-0 z-40 bg-[#1F2937]/95 backdrop-blur-md border-t border-[#303B4D] p-3 flex items-center justify-between gap-3">
        <div className="text-xs">
          <span className="text-[#9CA3AF] text-[10px] block">Roster</span>
          <span className="font-medium text-[#F3F4F6]">{studentsAttendance.length} {studentsAttendance.length === 1 ? 'Student' : 'Students'}</span>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={studentsAttendance.length === 0 || isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Class Attendance'}</span>
        </button>
      </div>
    </div>
  );
};

export default AttendancePage;
