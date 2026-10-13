import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Send, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  Clock, 
  Bookmark,
  Calendar,
  AlertCircle,
  IndianRupee,
  Bell,
  Award
} from 'lucide-react';

export const SmsCampaignPage: React.FC = () => {
  const { school } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  // Composer Form State
  const [campaignTitle, setCampaignTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'class_wise' | 'custom_phones'>('all');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [customPhones, setCustomPhones] = useState('');
  
  // Dynamic UI State
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Ready-to-Use Bulk SMS Presets (with Placeholders)
  const smsPresets = [
    {
      id: 'p1',
      title: '🚨 Absence Alert',
      category: 'Attendance',
      icon: Bell,
      color: 'bg-red-50 text-red-700 border-red-200',
      body: 'Dear Parent, {student_name} of Class {class_name} has been marked ABSENT today ({date}). Please contact {school_name} for any query.'
    },
    {
      id: 'p2',
      title: '⏰ Late Arrival Notice',
      category: 'Attendance',
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      body: 'Dear Parent, {student_name} of Class {class_name} arrived late to school today ({time}). Please ensure timely arrival.'
    },
    {
      id: 'p3',
      title: '💰 Fee Outstanding Reminder',
      category: 'Fee & Dues',
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      body: 'Dear Parent, fee balance of INR {due_amount} for {student_name} (Class {class_name}) is due. Kindly clear before {due_date}. Thank you, {school_name}.'
    },
    {
      id: 'p4',
      title: '🧾 Fee Receipt Confirmation',
      category: 'Fee & Dues',
      icon: CheckCircle2,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      body: 'Dear Parent, fee payment of INR {amount} received for {student_name}. Receipt No: {receipt_no}. Thank you, {school_name}.'
    },
    {
      id: 'p5',
      title: '🏖️ General Holiday Announcement',
      category: 'Circular',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      body: 'Dear Parents, {school_name} will remain closed on {date} on account of {holiday_reason}. Regular classes resume on {resume_date}.'
    },
    {
      id: 'p6',
      title: '🌧️ Weather / Rain Holiday',
      category: 'Emergency',
      icon: AlertCircle,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      body: 'Dear Parents, {school_name} remains closed today ({date}) due to heavy rain alert. Online study material sent.'
    },
    {
      id: 'p7',
      title: '📝 Parent-Teacher Meeting (PTM)',
      category: 'Academics',
      icon: Users,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      body: 'Dear Parents, Parent-Teacher Meeting (PTM) & Progress Report Card distribution for {student_name} (Class {class_name}) is scheduled on {ptm_date} from {ptm_time}.'
    },
    {
      id: 'p8',
      title: '🏆 Annual Sports & Cultural Day',
      category: 'Events',
      icon: Award,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      body: 'Dear Parents, Annual Sports & Cultural Day event is on {event_date} at {school_name} campus. All parents are cordially invited!'
    }
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      if (res.data.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedSection('');
    if (!classId) return;
    try {
      const res = await api.get(`/classes/${classId}/sections`);
      if (res.data.success) {
        setSections(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Populate Composer with Raw Preset Tags
  const applyPreset = (preset: any) => {
    setCampaignTitle(preset.title.replace(/[^a-zA-Z0-9 ]/g, '').trim());
    setMessageBody(preset.body);
  };

  const handleInsertTag = (tag: string) => {
    setMessageBody(prev => prev + ` ${tag}`);
  };

  const handleGenerateAiSms = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    try {
      const res = await api.post('/ai/generate-sms', { prompt: aiPrompt });
      if (res.data.success) {
        setMessageBody(res.data.messageBody);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody) return;
    setIsLoading(true);
    setStatusMsg('');

    try {
      const payload: any = {
        title: campaignTitle || 'Bulk SMS Campaign',
        message: messageBody,
        targetType
      };

      if (targetType === 'class_wise') {
        payload.classId = selectedClass;
        payload.sectionId = selectedSection;
      } else if (targetType === 'custom_phones') {
        payload.customPhones = customPhones.split(',').map(p => p.trim()).filter(Boolean);
      }

      const res = await api.post('/sms/campaign', payload);
      if (res.data.success) {
        setStatusMsg(`🎉 Bulk SMS Campaign Dispatched! Total Recipients: ${res.data.total}, Delivered: ${res.data.successCount}`);
        setCampaignTitle('');
        setMessageBody('');
      }
    } catch (err: any) {
      setStatusMsg(err.response?.data?.message || 'Failed to dispatch campaign.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Bulk SMS Broadcast & Presets Portal"
        subtitle="Dispatch automated parent SMS alerts, fee reminders, holiday circulars, and event invitations."
      />

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* QUICK PRESETS GALLERY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Quick Bulk SMS Presets</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Click Preset to Load Template Placeholders into Composer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {smsPresets.map((preset) => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`p-3.5 rounded-xl border cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between space-y-2 ${preset.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">{preset.category}</span>
                  <Icon className="w-4 h-4 opacity-70" />
                </div>
                <p className="font-bold text-xs leading-snug">{preset.title}</p>
                <p className="text-[11px] opacity-80 line-clamp-2 italic">"{preset.body}"</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN COMPOSER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: SMS Composer Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Bulk SMS Composer</h3>
            </div>
            <div className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Dynamic Tags:</span> Placeholders evaluate per student on send
            </div>
          </div>

          {/* Dynamic Placeholder Insertion Chips */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Insert Dynamic Student Placeholders:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { tag: '{student_name}', label: 'Student Name' },
                { tag: '{class_name}', label: 'Class & Section' },
                { tag: '{due_amount}', label: 'Fee Due' },
                { tag: '{school_name}', label: 'School Name' },
                { tag: '{date}', label: 'Today Date' }
              ].map(t => (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => handleInsertTag(t.tag)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-mono font-semibold transition-colors"
                >
                  + {t.tag}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Campaign / Subject Title *
              </label>
              <input
                required
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="e.g. Fee Balance Reminder / Holiday Announcement"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Target Audience Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Target Audience Group *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType('all')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    targetType === 'all'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All School Parents
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('class_wise')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    targetType === 'class_wise'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Class-wise Target
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('custom_phones')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    targetType === 'custom_phones'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Custom Phone Numbers
                </button>
              </div>
            </div>

            {/* Class & Section Selection */}
            {targetType === 'class_wise' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Select Class *</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none"
                  >
                    <option value="">-- All Classes --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Select Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none"
                  >
                    <option value="">-- All Sections --</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>Section {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Custom Phone Numbers */}
            {targetType === 'custom_phones' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Comma-Separated Phone Numbers *
                </label>
                <textarea
                  rows={2}
                  value={customPhones}
                  onChange={(e) => setCustomPhones(e.target.value)}
                  placeholder="+919876543210, +919876543211, +919876543212"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                />
              </div>
            )}

            {/* Message Content Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  SMS Message Body *
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {messageBody.length} characters • {Math.ceil(messageBody.length / 160) || 1} SMS unit(s)
                </span>
              </div>
              <textarea
                required
                rows={5}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message body here or select a preset above..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Dispatching SMS Broadcast...' : 'Broadcast Bulk SMS Campaign'}</span>
            </button>
          </form>
        </div>

        {/* Right 1 Column: Gemini AI Draft Generator */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl space-y-4 border border-slate-700">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm text-purple-100">Gemini AI Message Generator</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Describe the notice or announcement in natural language. Gemini AI will generate a professional, concise SMS template with dynamic tag placeholders.
          </p>

          <div className="space-y-3 pt-2">
            <textarea
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Write a polite SMS reminding parents that Second Term exams begin next Monday and hall tickets are available."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />

            <button
              type="button"
              onClick={handleGenerateAiSms}
              disabled={isAiLoading || !aiPrompt}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAiLoading ? 'Drafting SMS with Gemini...' : 'Draft SMS with AI'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300 uppercase tracking-wider">Dynamic Placeholder Engine:</p>
            <p className="font-mono text-purple-300">{'{student_name}'} → Student Full Name</p>
            <p className="font-mono text-purple-300">{'{class_name}'} → Student Class & Section</p>
            <p className="font-mono text-purple-300">{'{due_amount}'} → Individual Outstanding Fee</p>
            <p className="font-mono text-purple-300">{'{school_name}'} → {school?.name || 'Murthy High School'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
