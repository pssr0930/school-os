import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, CheckCircle2, XCircle, Clock, Send, Save, CheckCheck, XSquare } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [studentsAttendance, setStudentsAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      api.get(`/classes/${selectedClass}/sections`).then(res => {
        if (res.data.success) {
          setSections(res.data.data);
        }
      });
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
      console.error(err);
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
        setSaveSuccess('🎉 Attendance saved successfully!');
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  const presentCount = studentsAttendance.filter(s => s.status === 'present').length;
  const absentCount = studentsAttendance.filter(s => s.status === 'absent').length;

  return (
    <div className="space-y-3 pb-20 md:pb-6">
      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {smsResult && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs font-bold flex items-center gap-2">
          <Send className="w-4 h-4 text-blue-600" />
          <span>{smsResult}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 sm:flex-none">
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="">All Sec</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>Sec {s.name}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Batch Toggles & SMS Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
          <button
            onClick={() => handleMarkAll('present')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-[11px] rounded-xl transition-colors active:scale-95"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={() => handleMarkAll('absent')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold text-[11px] rounded-xl transition-colors active:scale-95"
          >
            <XSquare className="w-3.5 h-3.5" />
            <span>Mark All Absent</span>
          </button>

          <button
            onClick={handleTriggerAbsenceSms}
            title="Send parent absence SMS"
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-xl shadow-xs transition-colors active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Absence SMS</span>
          </button>
        </div>
      </div>

      {/* ULTRA-COMPACT MOBILE ATTENDANCE LIST VIEW (< 768px) */}
      <div className="block md:hidden bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Student (Reg No • Sec)</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-700 font-black">P: {presentCount}</span>
            <span>•</span>
            <span className="text-red-700 font-black">A: {absentCount}</span>
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-slate-400 text-xs font-semibold">Loading student roster...</div>
          ) : studentsAttendance.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-semibold">No students enrolled in this section.</div>
          ) : (
            studentsAttendance.map((st) => (
              <div key={st.studentId} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900 truncate">{st.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold mt-0.5">
                    <span className="text-blue-600">{st.registrationNumber}</span>
                    <span>•</span>
                    <span>Sec {st.sectionName}</span>
                  </div>
                </div>

                {/* Compact Touch Toggles: [P] [A] [L] */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(st.studentId, 'present')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                      st.status === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    P
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusToggle(st.studentId, 'absent')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                      st.status === 'absent'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    A
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusToggle(st.studentId, 'late')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                      st.status === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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

      {/* DESKTOP ATTENDANCE TABLE (>= 768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-6">Reg No</th>
                <th className="py-3 px-6">Student Name</th>
                <th className="py-3 px-6">Section</th>
                <th className="py-3 px-6 text-center">Status Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">Loading student attendance list...</td>
                </tr>
              ) : studentsAttendance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">No active students found in this class section.</td>
                </tr>
              ) : (
                studentsAttendance.map((st) => (
                  <tr key={st.studentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-600">{st.registrationNumber}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">{st.fullName}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-700">Section {st.sectionName}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st.studentId, 'present')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                            st.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st.studentId, 'absent')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                            st.status === 'absent'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st.studentId, 'late')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                            st.status === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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
      </div>

      {/* STICKY FLOATING BOTTOM "SAVE CLASS ATTENDANCE" BAR */}
      <div className="fixed md:relative bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md md:bg-transparent border-t md:border-none border-slate-200 p-3 md:p-0 shadow-lg md:shadow-none flex items-center justify-between gap-3">
        <div className="block md:hidden text-xs">
          <span className="text-slate-500 font-bold block text-[10px] uppercase">Roster Total</span>
          <span className="font-extrabold text-slate-900">{studentsAttendance.length} Enrolled</span>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={studentsAttendance.length === 0}
          className="w-full md:w-auto ml-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Class Attendance</span>
        </button>
      </div>
    </div>
  );
};
