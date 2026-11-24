import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, User, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const RegisterSchoolPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // School Details
    name: '',
    schoolCode: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    
    // Administrator Details
    adminFullName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',
    
    // Initial Academic Configuration
    academicYearName: '2026-2027',
    startDate: new Date().toISOString().split('T')[0],
    attendanceCutoffTime: '10:30',
    defaultCurrency: 'INR'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.adminPassword !== formData.confirmPassword) {
      setErrorMsg('Administrator passwords do not match!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/schools/register', {
        schoolName: formData.name,
        schoolCode: formData.schoolCode,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || undefined,
        logoUrl: formData.logoUrl || undefined,
        adminFullName: formData.adminFullName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        adminPassword: formData.adminPassword,
        academicYearName: formData.academicYearName,
        startDate: formData.startDate,
        attendanceCutoffTime: formData.attendanceCutoffTime,
        defaultCurrency: formData.defaultCurrency
      });

      if (res.data.success) {
        setSuccessMsg('School tenant & Administrator account registered successfully!');
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Registration Error', err);
      setErrorMsg(err.response?.data?.message || err.message || 'School registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-[#F3F4F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-[#1F2937] rounded-lg border border-[#303B4D] hover:bg-gray-700 transition-colors">
          <img src="/pssr-logo.png" alt="School OS Logo" className="w-6 h-6 rounded bg-white p-0.5" />
          <span className="font-semibold text-[#F3F4F6] text-sm">SCHOOL OS</span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#F3F4F6] tracking-tight">
          Register New School Tenant
        </h2>
        <p className="text-xs sm:text-sm text-[#9CA3AF]">
          Create your school account, initialize classes (LKG to Class 10), and set up administrator credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl px-4">
        <div className="bg-[#1F2937] border border-[#303B4D] py-6 sm:py-8 px-5 sm:px-8 rounded-lg space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* SECTION 1: SCHOOL INFORMATION */}
            <div className="space-y-4">
              <div className="border-b border-[#303B4D] pb-2.5 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-xs text-[#F3F4F6] uppercase tracking-wider">1. School Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">School Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Murthy High School"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">School Code (Prefix) *</label>
                  <input
                    type="text"
                    name="schoolCode"
                    required
                    value={formData.schoolCode}
                    onChange={handleChange}
                    placeholder="e.g. MHS"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] uppercase font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Full street address"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Postal Code"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">School Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 Phone number"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">School Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@school.edu"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">Website (Optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://school.edu"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ADMINISTRATOR INFORMATION */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-[#303B4D] pb-2.5 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-xs text-[#F3F4F6] uppercase tracking-wider">2. Administrator Account</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">Administrator Full Name *</label>
                  <input
                    type="text"
                    name="adminFullName"
                    required
                    value={formData.adminFullName}
                    onChange={handleChange}
                    placeholder="Principal / Admin Name"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">Admin Email (Login ID) *</label>
                  <input
                    type="email"
                    name="adminEmail"
                    required
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@school.com"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">Admin Phone *</label>
                  <input
                    type="tel"
                    name="adminPhone"
                    required
                    value={formData.adminPhone}
                    onChange={handleChange}
                    placeholder="+91 Mobile Number"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">Password *</label>
                  <input
                    type="password"
                    name="adminPassword"
                    required
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: ACADEMIC CONFIGURATION */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-[#303B4D] pb-2.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-xs text-[#F3F4F6] uppercase tracking-wider">3. Initial Academic Configuration</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">Academic Year *</label>
                  <input
                    type="text"
                    name="academicYearName"
                    required
                    value={formData.academicYearName}
                    onChange={handleChange}
                    placeholder="e.g. 2026-2027"
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">SMS Cutoff Time *</label>
                  <input
                    type="time"
                    name="attendanceCutoffTime"
                    required
                    value={formData.attendanceCutoffTime}
                    onChange={handleChange}
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9CA3AF] mb-1.5">Default Currency *</label>
                  <select
                    name="defaultCurrency"
                    value={formData.defaultCurrency}
                    onChange={handleChange}
                    className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  >
                    <option value="INR" className="bg-[#1F2937]">INR (₹)</option>
                    <option value="USD" className="bg-[#1F2937]">USD ($)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <span>{isLoading ? "Creating School & Administrator Tenant..." : "Register School & Initialize Tenant"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-3 border-t border-[#303B4D] text-xs text-[#9CA3AF]">
            Already have a school registered?{' '}
            <Link to="/admin/login" className="text-blue-400 hover:underline font-medium">
              Sign In to Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSchoolPage;
