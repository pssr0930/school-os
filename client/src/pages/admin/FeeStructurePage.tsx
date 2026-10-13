import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Edit2, 
  Search,
  Layers,
  BookOpen,
  GraduationCap,
  Award,
  BookMarked,
  X
} from 'lucide-react';
import { Modal } from '../../components/Modal';

export const FeeStructurePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [formData, setFormData] = useState({
    classId: '',
    tuitionFee: 15000,
    admissionFee: 2500,
    examinationFee: 1500,
    transportFee: 0,
    booksFee: 1200,
    uniformFee: 0,
    otherFee: 0
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fsRes, clsRes] = await Promise.all([
        api.get('/fees/structures'),
        api.get('/classes')
      ]);
      if (fsRes.data.success) setFeeStructures(fsRes.data.data);
      if (clsRes.data.success) {
        setClasses(clsRes.data.data);
        if (clsRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, classId: clsRes.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (fs: any) => {
    if (!isAdmin) return;
    setFormData({
      classId: fs.classId,
      tuitionFee: fs.tuitionFee || 0,
      admissionFee: fs.admissionFee || 0,
      examinationFee: fs.examinationFee || 0,
      transportFee: fs.transportFee || 0,
      booksFee: fs.booksFee || 0,
      uniformFee: fs.uniformFee || 0,
      otherFee: fs.otherFee || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      const res = await api.post('/fees/structures', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        setSaveMessage('Fee structure updated & synced across enrolled students!');
        setTimeout(() => setSaveMessage(''), 3500);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStructures = feeStructures.filter(fs => 
    fs.className?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Fee Structure"
        subtitle="Configure standard annual fee particulars by class."
        action={
          isAdmin ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Configure Class Fee</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs shrink-0">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Read-Only View</span>
            </div>
          )
        }
      />

      {saveMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 2. SEARCH & SUMMARY BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by class name..."
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

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 w-full sm:w-auto justify-end">
          <span className="px-3 py-1.5 bg-slate-100 rounded-xl font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{feeStructures.length} Classes Defined</span>
          </span>
        </div>
      </div>

      {/* 3. CLEAN FEE STRUCTURE CARDS GRID */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs font-semibold">
          Loading class fee structures...
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs font-semibold">
          No fee structures found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStructures.map((fs) => {
            const total = (fs.tuitionFee || 0) + (fs.admissionFee || 0) + (fs.examinationFee || 0) + (fs.booksFee || 0) + (fs.transportFee || 0);

            return (
              <div 
                key={fs.id} 
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                {/* Card Top Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center border border-blue-100">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{fs.className}</h3>
                      <p className="text-[10px] font-bold text-slate-400">Annual Fee</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(fs)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1"
                      title="Edit Class Fee"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Particulars Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5 text-[11px]">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      <span>Tuition Fee</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">₹ {(fs.tuitionFee || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5 text-[11px]">
                      <Award className="w-3.5 h-3.5 text-purple-500" />
                      <span>Admission Fee</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">₹ {(fs.admissionFee || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5 text-[11px]">
                      <BookMarked className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Examination Fee</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">₹ {(fs.examinationFee || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5 text-[11px]">
                      <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                      <span>Books & Material</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">₹ {(fs.booksFee || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Card Total Banner */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Total Fee</span>
                  <span className="text-sm font-black font-mono text-blue-900">₹ {total.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Edit Modal */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Configure Class Fee Particulars"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Target Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Tuition Fee (₹)</label>
                <input
                  type="number"
                  value={formData.tuitionFee}
                  onChange={(e) => setFormData({ ...formData, tuitionFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Admission Fee (₹)</label>
                <input
                  type="number"
                  value={formData.admissionFee}
                  onChange={(e) => setFormData({ ...formData, admissionFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Examination Fee (₹)</label>
                <input
                  type="number"
                  value={formData.examinationFee}
                  onChange={(e) => setFormData({ ...formData, examinationFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Books & Materials (₹)</label>
                <input
                  type="number"
                  value={formData.booksFee}
                  onChange={(e) => setFormData({ ...formData, booksFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Save Fee Structure & Sync Class</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FeeStructurePage;
