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
    <div className="space-y-5 max-w-3xl mx-auto text-[#F3F4F6]">
      <PageHeader
        title="School Identity & Official Logo Header"
        subtitle="Upload official school logo for fee receipts, printouts, identity branding, address details, and SMS cutoff rules."
      />

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 sm:p-6 space-y-5">
        {/* OFFICIAL SCHOOL LOGO FOR RECEIPTS */}
        <div className="p-4 bg-[#243244] border border-[#303B4D] rounded-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-[#303B4D] pb-3">
            <School className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-xs text-[#F3F4F6]">Official School Branding & Fee Receipt Logo</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Live Logo Preview Box */}
            <div className="shrink-0 w-20 h-20 rounded-lg bg-[#111827] border border-[#303B4D] p-1.5 flex flex-col items-center justify-center text-center overflow-hidden">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="School Official Logo"
                  className="w-full h-full object-contain rounded"
                />
              ) : (
                <div className="text-[#9CA3AF] flex flex-col items-center">
                  <Image className="w-6 h-6 mb-1 text-[#9CA3AF]" />
                  <span className="text-[10px] font-medium">No Logo</span>
                </div>
              )}
            </div>

            <div className="space-y-2.5 flex-1 w-full text-xs">
              <div>
                <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">
                  Upload Logo Image File (PNG, JPG, SVG)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-[#1F2937] hover:bg-gray-700 border border-[#303B4D] rounded-lg cursor-pointer font-medium text-xs text-[#F3F4F6] transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
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
                      className="text-rose-400 hover:text-rose-300 font-medium text-xs"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">
                  Or Direct Logo Image URL
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full h-9 bg-[#111827] border border-[#303B4D] rounded-lg px-3 text-xs font-mono text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SCHOOL GENERAL INFORMATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#303B4D] pb-3">
            <Building className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-xs text-[#F3F4F6]">School Legal Particulars & Contacts</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">School Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">School Abbreviation Code *</label>
              <input
                type="text"
                required
                value={formData.schoolCode}
                onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 font-mono text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Street Address (Printed on Receipts) *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Door No, Street Road, Area"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">City / Town *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Official Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 font-mono text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Official Contact Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ATTENDANCE & SMS AUTOMATION RULES */}
        <div className="space-y-4 border-t border-[#303B4D] pt-4">
          <div className="flex items-center gap-2 border-b border-[#303B4D] pb-3">
            <Settings className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-xs text-[#F3F4F6]">Attendance & SMS Automation Rules</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Daily Attendance Cutoff Time *</label>
              <input
                type="time"
                required
                value={formData.attendanceCutoffTime}
                onChange={(e) => setFormData({ ...formData, attendanceCutoffTime: e.target.value })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-[#F3F4F6] font-mono text-xs focus:outline-none focus:border-blue-500 [color-scheme:dark]"
              />
              <p className="text-[10px] text-[#9CA3AF] mt-1">Automatic parent SMS triggers for unmarked/absent students after cutoff.</p>
            </div>

            <div>
              <label className="block font-medium text-[#9CA3AF] text-xs mb-1.5">Automated Absence Parent SMS</label>
              <select
                value={formData.attendanceSmsEnabled ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, attendanceSmsEnabled: e.target.value === 'true' })}
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
              >
                <option value="true" className="bg-[#1F2937]">Enabled (Send Automatic Parent SMS)</option>
                <option value="false" className="bg-[#1F2937]">Disabled (Manual SMS Only)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving School Details & Syncing..." : "Save School Settings & Sync Receipts"}</span>
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
