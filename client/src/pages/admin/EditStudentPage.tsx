import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowLeft, Save, CheckCircle2, User, GraduationCap, Users, MapPin } from 'lucide-react';

export const EditStudentPage: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === 'admin' ? '/admin' : '/staff';
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState<any>({
    fullName: '',
    registrationNumber: '',
    dateOfBirth: '',
    gender: 'male',
    studentAadhaar: '',
    admissionDate: '',
    status: 'active',

    classId: '',
    sectionId: '',

    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    parentEmail: '',
    emergencyContactName: '',
    emergencyContactPhone: '',

    address: '',
    city: '',
    district: '',
    state: '',
    postalCode: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/classes'),
      api.get(`/students/${studentId}`)
    ]).then(([clsRes, stRes]) => {
      if (clsRes.data.success) setClasses(clsRes.data.data);
      if (stRes.data.success) {
        const st = stRes.data.data;
        setFormData({
          fullName: st.fullName || '',
          registrationNumber: st.registrationNumber || '',
          dateOfBirth: st.dateOfBirth || '',
          gender: st.gender || 'male',
          studentAadhaar: st.studentAadhaar || '',
          admissionDate: st.admissionDate || '',
          status: st.status || 'active',

          classId: st.classId || '',
          sectionId: st.sectionId || '',

          fatherName: st.parentDetails?.fatherName || '',
          fatherPhone: st.parentDetails?.fatherPhone || '',
          motherName: st.parentDetails?.motherName || '',
          motherPhone: st.parentDetails?.motherPhone || '',
          parentEmail: st.parentDetails?.parentEmail || '',
          emergencyContactName: st.parentDetails?.emergencyContactName || '',
          emergencyContactPhone: st.parentDetails?.emergencyContactPhone || '',

          address: st.address || '',
          city: st.city || '',
          district: st.district || '',
          state: st.state || '',
          postalCode: st.postalCode || ''
        });
      }
      setIsLoading(false);
    });
  }, [studentId]);

  useEffect(() => {
    if (formData.classId) {
      api.get(`/classes/${formData.classId}/sections`).then(res => {
        if (res.data.success) setSections(res.data.data);
      });
    } else {
      setSections([]);
    }
  }, [formData.classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg('');
    setErrorMsg('');

    try {
      const res = await api.put(`/students/${studentId}`, formData);
      if (res.data.success) {
        setStatusMsg('All student details updated successfully! Redirecting...');
        setTimeout(() => {
          navigate(`${basePath}/students/${studentId}`);
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update student profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-[#9CA3AF] text-xs">Loading complete student profile...</div>;

  return (
    <div className="space-y-5 max-w-4xl mx-auto text-[#F3F4F6]">
      <PageHeader
        title={`Edit Complete Profile: ${formData.fullName}`}
        subtitle="Update student details, academic placement, parent contacts, and address records."
        action={
          <button
            onClick={() => navigate(`${basePath}/students/${studentId}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] font-medium text-xs rounded-lg border border-[#303B4D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        }
      />

      {statusMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* SECTION 1: PERSONAL DETAILS */}
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
          <h3 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-2 border-b border-[#303B4D] pb-3">
            <User className="w-4 h-4 text-blue-400" />
            <span>1. Student Personal Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Full Name *</label>
              <input
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Registration Number *</label>
              <input
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono font-medium text-blue-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none capitalize"
              >
                <option value="male" className="bg-[#1F2937]">Male</option>
                <option value="female" className="bg-[#1F2937]">Female</option>
                <option value="other" className="bg-[#1F2937]">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Student Aadhaar Number</label>
              <input
                value={formData.studentAadhaar}
                onChange={(e) => setFormData({ ...formData, studentAadhaar: e.target.value })}
                placeholder="12-digit Aadhaar number"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Admission Date</label>
              <input
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ACADEMIC & STATUS */}
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
          <h3 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-2 border-b border-[#303B4D] pb-3">
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span>2. Academic Placement & Enrolment Status</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Assigned Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs font-medium text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#1F2937]">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Assigned Section</label>
              <select
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
              >
                <option value="" className="bg-[#1F2937]">-- Select Section --</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#1F2937]">Section {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Enrolment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs font-medium uppercase text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
              >
                <option value="active" className="bg-[#1F2937]">Active</option>
                <option value="inactive" className="bg-[#1F2937]">Inactive</option>
                <option value="suspended" className="bg-[#1F2937]">Suspended</option>
                <option value="graduated" className="bg-[#1F2937]">Graduated</option>
                <option value="archived" className="bg-[#1F2937]">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: PARENT & GUARDIAN PROFILE */}
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
          <h3 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-2 border-b border-[#303B4D] pb-3">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>3. Parent & Guardian Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Father's Name</label>
              <input
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="Father's full name"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Father's Phone Number</label>
              <input
                value={formData.fatherPhone}
                onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Mother's Name</label>
              <input
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                placeholder="Mother's full name"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Mother's Phone Number</label>
              <input
                value={formData.motherPhone}
                onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Parent Email Address</label>
              <input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="parent@example.com"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Emergency Contact</label>
                <input
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="Contact Name"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Emergency Phone</label>
                <input
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="Phone No"
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: RESIDENTIAL ADDRESS */}
        <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 space-y-4">
          <h3 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-2 border-b border-[#303B4D] pb-3">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>4. Residential Address</span>
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Street Address</label>
              <input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Door No, Street Name, Landmark..."
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">City</label>
                <input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">District</label>
                <input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">State</label>
                <input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">PIN / Postal Code</label>
                <input
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Complete Student Profile...' : 'Save Complete Student Profile'}</span>
        </button>
      </form>
    </div>
  );
};
export default EditStudentPage;
