import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import api from '../../services/api';
import { Settings, Save, CheckCircle2, Upload, Image, Building, School } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { school, updateSchoolData, refreshSession } = useAuth();
  const [formData, setFormData] = useState({
    name: school?.name || 'Murthy High School',
    schoolCode: school?.schoolCode || 'MHS',
    address: school?.address || '123 Academy Road',
    city: school?.city || 'Kakinada',
    state: school?.state || 'Andhra Pradesh',
    phone: school?.phone || '+91 9876543210',
    email: school?.email || 'admin@school.edu.in',
    attendanceCutoffTime: school?.attendanceCutoffTime || '10:30',
    attendanceSmsEnabled: school?.attendanceSmsEnabled ?? true,
    defaultCurrency: school?.defaultCurrency || 'INR',
    registrationPrefix: 'REG',
    logoUrl: school?.logoUrl || school?.logo_url || ''
  });

  const [saveSuccess, setSaveSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get('/schools/current').then(res => {
      if (res.data.success && res.data.school) {
        const s = res.data.school;
        setFormData(prev => ({
          ...prev,
          name: s.name || prev.name,
          schoolCode: s.schoolCode || s.school_code || prev.schoolCode,
          address: s.address !== undefined ? s.address : prev.address,
          city: s.city !== undefined ? s.city : prev.city,
          state: s.state !== undefined ? s.state : prev.state,
          phone: s.phone !== undefined ? s.phone : prev.phone,
          email: s.email !== undefined ? s.email : prev.email,
          attendanceCutoffTime: s.attendanceCutoffTime || prev.attendanceCutoffTime,
          attendanceSmsEnabled: s.attendanceSmsEnabled ?? prev.attendanceSmsEnabled,
          logoUrl: s.logoUrl || s.logo_url || prev.logoUrl
        }));
      }
    });
  }, []);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch('/schools/current', formData);
      if (res.data.success) {
        updateSchoolData(res.data.school);
        await refreshSession();
        setSaveSuccess('School details, address, logo, and fee receipt header saved successfully!');
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Failed to save school details', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="School Identity & Official Logo Header"
        subtitle="Upload official school logo for fee receipts, printouts, identity branding, address details, and SMS cutoff rules."
      />

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* OFFICIAL SCHOOL LOGO FOR RECEIPTS */}
        <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <School className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Official School Branding & Fee Receipt Logo</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Live Logo Preview Box */}
            <div className="shrink-0 w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 p-2 flex flex-col items-center justify-center text-center shadow-xs overflow-hidden">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="School Official Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <Image className="w-8 h-8 mb-1 text-slate-300" />
                  <span className="text-[10px] font-bold">No Logo</span>
                </div>
              )}
            </div>

            <div className="space-y-3 flex-1 w-full text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Upload Logo Image File (PNG, JPG, SVG)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl cursor-pointer font-bold text-slate-700 transition-colors shadow-xs">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Browse & Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                      className="text-red-600 hover:text-red-700 font-semibold underline text-xs"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Or Direct Logo Image URL
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SCHOOL GENERAL INFORMATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">School Legal Particulars & Contacts</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">School Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">School Abbreviation Code *</label>
              <input
                type="text"
                required
                value={formData.schoolCode}
                onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Street Address (Printed on Receipts) *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Door No, Street Road, Area"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">City / Town *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Official Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Official Contact Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ATTENDANCE & SMS AUTOMATION RULES */}
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Attendance & SMS Automation Rules</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Daily Attendance Cutoff Time *</label>
              <input
                type="time"
                required
                value={formData.attendanceCutoffTime}
                onChange={(e) => setFormData({ ...formData, attendanceCutoffTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Automatic parent SMS triggers for unmarked/absent students after cutoff.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Automated Absence Parent SMS</label>
              <select
                value={formData.attendanceSmsEnabled ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, attendanceSmsEnabled: e.target.value === 'true' })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="true">Enabled (Send Automatic Parent SMS)</option>
                <option value="false">Disabled (Manual SMS Only)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving School Details & Syncing..." : "Save School Settings & Sync Receipts"}</span>
        </button>
      </form>
    </div>
  );
};
