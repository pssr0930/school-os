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
      console.error('Failed to load fee structures', err);
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
      console.error('Failed to save fee structure', err);
    }
  };

  const filteredStructures = feeStructures.filter(fs => 
    fs.className?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-[#F3F4F6]">
      {/* 1. Page Header */}
      <PageHeader
        title="Fee Structure"
        subtitle="Configure standard annual fee particulars by academic grade."
        action={
          isAdmin ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Configure Class Fee</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2937] border border-[#303B4D] rounded-lg text-[#9CA3AF] text-xs font-medium shrink-0">
              <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>Read-Only View</span>
            </div>
          )
        }
      />

      {saveMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[#22C55E] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by class name..."
            className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-10 pr-9 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#9CA3AF] w-full sm:w-auto justify-end">
          <span className="px-3 py-1.5 bg-[#243244] border border-[#303B4D] rounded-lg text-[#F3F4F6] font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>{feeStructures.length} Classes Defined</span>
          </span>
        </div>
      </div>

      {/* 3. Fee Structure Cards Grid */}
      {isLoading ? (
        <div className="p-10 text-center text-[#9CA3AF] bg-[#1F2937] rounded-lg border border-[#303B4D] text-xs font-medium">
          Loading class fee structures...
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="p-10 text-center text-[#9CA3AF] bg-[#1F2937] rounded-lg border border-[#303B4D] text-xs font-medium">
          No fee structures found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStructures.map((fs) => {
            const total = (fs.tuitionFee || 0) + (fs.admissionFee || 0) + (fs.examinationFee || 0) + (fs.booksFee || 0) + (fs.transportFee || 0);

            return (
              <div 
                key={fs.id} 
                className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-4.5 hover:border-gray-600 transition-colors flex flex-col justify-between space-y-3.5"
              >
                {/* Card Top Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#303B4D]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#243244] text-blue-400 border border-[#303B4D] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#F3F4F6] text-sm">{fs.className}</h3>
                      <p className="text-[11px] text-[#9CA3AF]">Annual Base Fee</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(fs)}
                      className="px-2.5 py-1 bg-[#243244] hover:bg-gray-700 text-blue-400 font-medium text-xs rounded-md border border-[#303B4D] transition-colors flex items-center gap-1"
                      title="Edit Class Fee"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Particulars Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-md bg-[#243244] border border-[#303B4D]">
                    <span className="text-[#9CA3AF] flex items-center gap-1.5 text-[11px]">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tuition Fee</span>
                    </span>
                    <span className="font-mono font-medium text-[#F3F4F6] tabular-nums">₹ {(fs.tuitionFee || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-md bg-[#243244] border border-[#303B4D]">
                    <span className="text-[#9CA3AF] flex items-center gap-1.5 text-[11px]">
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      <span>Admission Fee</span>
                    </span>
                    <span className="font-mono font-medium text-[#F3F4F6] tabular-nums">₹ {(fs.admissionFee || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-md bg-[#243244] border border-[#303B4D]">
                    <span className="text-[#9CA3AF] flex items-center gap-1.5 text-[11px]">
                      <BookMarked className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>Examination Fee</span>
                    </span>
                    <span className="font-mono font-medium text-[#F3F4F6] tabular-nums">₹ {(fs.examinationFee || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-md bg-[#243244] border border-[#303B4D]">
                    <span className="text-[#9CA3AF] flex items-center gap-1.5 text-[11px]">
                      <CreditCard className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Books & Materials</span>
                    </span>
                    <span className="font-mono font-medium text-[#F3F4F6] tabular-nums">₹ {(fs.booksFee || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Card Total Banner */}
                <div className="pt-2 border-t border-[#303B4D] flex items-center justify-between p-2.5 bg-[#243244] rounded-lg border border-[#303B4D]">
                  <span className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider">Total Package</span>
                  <span className="text-sm font-semibold font-mono text-[#22C55E] tabular-nums">₹ {total.toLocaleString()}</span>
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
              <label className="block font-medium text-[#9CA3AF] uppercase tracking-wider mb-1 text-[11px]">Target Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3.5 pr-8 text-xs text-[#F3F4F6] font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#1F2937] text-[#F3F4F6]">{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#9CA3AF] uppercase tracking-wider mb-1 text-[11px]">Tuition Fee (₹)</label>
                <input
                  type="number"
                  value={formData.tuitionFee}
                  onChange={(e) => setFormData({ ...formData, tuitionFee: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] focus:border-blue-500 focus:outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9CA3AF] uppercase tracking-wider mb-1 text-[11px]">Admission Fee (₹)</label>
                <input
                  type="number"
                  value={formData.admissionFee}
                  onChange={(e) => setFormData({ ...formData, admissionFee: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] focus:border-blue-500 focus:outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9CA3AF] uppercase tracking-wider mb-1 text-[11px]">Examination Fee (₹)</label>
                <input
                  type="number"
                  value={formData.examinationFee}
                  onChange={(e) => setFormData({ ...formData, examinationFee: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] focus:border-blue-500 focus:outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9CA3AF] uppercase tracking-wider mb-1 text-[11px]">Books & Materials (₹)</label>
                <input
                  type="number"
                  value={formData.booksFee}
                  onChange={(e) => setFormData({ ...formData, booksFee: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] focus:border-blue-500 focus:outline-none tabular-nums"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
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
