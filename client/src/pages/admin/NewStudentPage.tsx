import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowLeft, Save, User, Users, MapPin } from 'lucide-react';

export const NewStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === 'admin' ? '/admin' : '/staff';
  const [searchParams] = useSearchParams();
  const preSelectedClassId = searchParams.get('classId') || '';

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '2016-05-10',
    gender: 'male',
    admissionDate: new Date().toISOString().split('T')[0],
    classId: preSelectedClassId,
    sectionId: '',
    studentAadhaar: '',
    address: '',
    city: '',
    district: '',
    state: '',
    postalCode: '',
    fatherName: '',
    motherName: '',
    guardianName: '',
    fatherPhone: '',
    motherPhone: '',
    guardianPhone: '',
    parentEmail: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    relationship: 'Father'
  });

  useEffect(() => {
    api.get('/classes').then(res => {
      if (res.data.success) {
        setClasses(res.data.data);
        if (res.data.data.length > 0 && !formData.classId) {
          const initialClassId = preSelectedClassId || res.data.data[0].id;
          setFormData(prev => ({ ...prev, classId: initialClassId }));
        }
      }
    });
  }, []);

  useEffect(() => {
    if (formData.classId) {
      api.get(`/classes/${formData.classId}/sections`).then(res => {
        if (res.data.success) {
          setSections(res.data.data);
          if (res.data.data.length > 0) {
            setFormData(prev => ({ ...prev, sectionId: res.data.data[0].id }));
          }
        }
      });
    }
  }, [formData.classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        navigate(`${basePath}/students`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll student. Please check fields.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClassObj = classes.find(c => c.id === formData.classId);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-20 md:pb-6 text-[#F3F4F6]">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`${basePath}/students`)}
          className="flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#F3F4F6] text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Directory</span>
        </button>
      </div>

      <PageHeader
        title={selectedClassObj ? `Enroll New Student in ${selectedClassObj.name}` : "Enroll New Student"}
        subtitle="Register student profile, generate sequential admission numbers, and link parent contact details."
      />

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* 1. Basic Student Information */}
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#F3F4F6] font-semibold text-xs sm:text-sm border-b border-[#303B4D] pb-3">
            <User className="w-4 h-4 text-blue-400" />
            <span>1. Student Personal Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Full Student Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-2.5 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
                >
                  <option value="male" className="bg-[#1F2937]">Male</option>
                  <option value="female" className="bg-[#1F2937]">Female</option>
                  <option value="other" className="bg-[#1F2937]">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Target Class *</label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#1F2937]">{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Assigned Section *</label>
                <select
                  required
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.id} className="bg-[#1F2937]">Section {s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Admission Date</label>
              <input
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Aadhaar (12 Digits)</label>
              <input
                type="text"
                maxLength={12}
                value={formData.studentAadhaar}
                onChange={(e) => setFormData({ ...formData, studentAadhaar: e.target.value })}
                placeholder="e.g. 9829 8925 5972"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] font-mono placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Parent & Guardian Contact Information */}
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#F3F4F6] font-semibold text-xs sm:text-sm border-b border-[#303B4D] pb-3">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>2. Parent & Guardian Contact Particulars</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Father Name *</label>
              <input
                type="text"
                required
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="e.g. Rajesh Sharma"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Father Mobile (Primary SMS) *</label>
              <input
                type="tel"
                required
                value={formData.fatherPhone}
                onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] font-mono placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Mother Name</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                placeholder="e.g. Sunita Sharma"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Parent Email</label>
              <input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="e.g. parent@email.com"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Residential Address */}
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#F3F4F6] font-semibold text-xs sm:text-sm border-b border-[#303B4D] pb-3">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>3. Residential Address</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Door No, Street name, Landmark"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">City / Town</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Kakinada"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="e.g. 533001"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] font-mono placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* STICKY FLOATING BOTTOM SAVE BUTTON BAR ON MOBILE */}
        <div className="fixed md:relative bottom-0 left-0 right-0 z-40 bg-[#1F2937]/95 backdrop-blur-md md:bg-transparent border-t md:border-none border-[#303B4D] p-3 md:p-0 flex items-center justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? "Enrolling Student..." : `Save & Enroll Student in ${selectedClassObj?.name || 'Class'}`}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
