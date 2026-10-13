import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { School, Building, User, Mail, Phone, Lock, Calendar, Globe, MapPin, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
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
        name: formData.name,
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
        setSuccessMsg('🎉 School tenant & Administrator account registered successfully!');
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-slate-900 to-indigo-900/30 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl relative z-10 text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-800/80 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
          <img src="/pssr-logo.png" alt="School OS Logo" className="w-8 h-8 rounded-lg bg-white p-1" />
          <span className="font-extrabold text-white tracking-wide text-base">SCHOOL OS</span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Register New School Tenant
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          Create your school account, initialize classes (LKG to Class 10), and set up administrator credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl relative z-10 px-4">
        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* SECTION 1: SCHOOL INFORMATION */}
            <div className="space-y-4">
              <div className="border-b border-slate-700/80 pb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">1. School Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">School Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Murthy High School"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">School Code (Prefix) *</label>
                  <input
                    type="text"
                    name="schoolCode"
                    required
                    value={formData.schoolCode}
                    onChange={handleChange}
                    placeholder="e.g. MHS"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Full street address"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Postal Code"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">School Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 Phone number"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">School Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@school.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Website (Optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://school.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ADMINISTRATOR INFORMATION */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-700/80 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">2. Administrator Account</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Administrator Full Name *</label>
                  <input
                    type="text"
                    name="adminFullName"
                    required
                    value={formData.adminFullName}
                    onChange={handleChange}
                    placeholder="Principal / Admin Name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Admin Email (Login ID) *</label>
                  <input
                    type="email"
                    name="adminEmail"
                    required
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@school.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Admin Phone *</label>
                  <input
                    type="tel"
                    name="adminPhone"
                    required
                    value={formData.adminPhone}
                    onChange={handleChange}
                    placeholder="+91 Mobile Number"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    name="adminPassword"
                    required
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: ACADEMIC CONFIGURATION */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-700/80 pb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">3. Initial Academic Configuration</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Academic Year *</label>
                  <input
                    type="text"
                    name="academicYearName"
                    required
                    value={formData.academicYearName}
                    onChange={handleChange}
                    placeholder="e.g. 2026-2027"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">SMS Cutoff Time *</label>
                  <input
                    type="time"
                    name="attendanceCutoffTime"
                    required
                    value={formData.attendanceCutoffTime}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Default Currency *</label>
                  <select
                    name="defaultCurrency"
                    value={formData.defaultCurrency}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 mt-4"
            >
              <span>{isLoading ? "Creating School & Administrator Tenant..." : "Register School & Initialize Tenant"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-700/60 text-xs text-slate-400">
            Already have a school registered?{' '}
            <Link to="/admin/login" className="text-blue-400 hover:underline font-bold">
              Sign In to Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
