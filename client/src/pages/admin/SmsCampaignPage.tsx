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
  Award,
  RotateCw,
  Phone,
  XCircle
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
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  // Quick Test SMS State
  const [testPhone, setTestPhone] = useState('9121454554');
  const [testMessage, setTestMessage] = useState('Test SMS from Murthy High School via Twilio Gateway.');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Ready-to-Use Bulk SMS Presets (with Placeholders)
  const smsPresets = [
    {
      id: 'p1',
      title: 'Absence Alert',
      category: 'Attendance',
      icon: Bell,
      body: 'Dear Parent, {student_name} of Class {class_name} has been marked ABSENT today ({date}). Please contact {school_name} for any query.'
    },
    {
      id: 'p2',
      title: 'Late Arrival Notice',
      category: 'Attendance',
      icon: Clock,
      body: 'Dear Parent, {student_name} of Class {class_name} arrived late to school today ({time}). Please ensure timely arrival.'
    },
    {
      id: 'p3',
      title: 'Fee Outstanding Reminder',
      category: 'Fee & Dues',
      icon: IndianRupee,
      body: 'Dear Parent, fee balance of INR {due_amount} for {student_name} (Class {class_name}) is due. Kindly clear before {due_date}. Thank you, {school_name}.'
    },
    {
      id: 'p4',
      title: 'Fee Receipt Confirmation',
      category: 'Fee & Dues',
      icon: CheckCircle2,
      body: 'Dear Parent, fee payment of INR {amount} received for {student_name}. Receipt No: {receipt_no}. Thank you, {school_name}.'
    },
    {
      id: 'p5',
      title: 'General Holiday Announcement',
      category: 'Circular',
      icon: Calendar,
      body: 'Dear Parents, {school_name} will remain closed on {date} on account of {holiday_reason}. Regular classes resume on {resume_date}.'
    },
    {
      id: 'p6',
      title: 'Weather / Rain Holiday',
      category: 'Emergency',
      icon: AlertCircle,
      body: 'Dear Parents, {school_name} remains closed today ({date}) due to heavy rain alert. Online study material sent.'
    },
    {
      id: 'p7',
      title: 'Parent-Teacher Meeting (PTM)',
      category: 'Academics',
      icon: Users,
      body: 'Dear Parents, Parent-Teacher Meeting (PTM) & Progress Report Card distribution for {student_name} (Class {class_name}) is scheduled on {ptm_date} from {ptm_time}.'
    },
    {
      id: 'p8',
      title: 'Annual Sports & Cultural Day',
      category: 'Events',
      icon: Award,
      body: 'Dear Parents, Annual Sports & Cultural Day event is on {event_date} at {school_name} campus. All parents are cordially invited!'
    }
  ];

  useEffect(() => {
    fetchClasses();
    fetchSmsLogs();
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

  const fetchSmsLogs = async () => {
    setIsLogsLoading(true);
    try {
      const res = await api.get('/sms/logs');
      if (res.data.success) {
        setSmsLogs(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load SMS logs:', err);
    } finally {
      setIsLogsLoading(false);
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
        const bodyText = res.data.data?.body || res.data.data?.message || res.data.messageBody || res.data.data?.messageBody || '';
        if (bodyText) {
          setMessageBody(bodyText);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone || !testMessage) return;
    setIsSendingTest(true);
    setTestStatus(null);
    try {
      const res = await api.post('/sms/send', {
        recipient: testPhone,
        message: testMessage,
        studentName: 'Test Recipient',
        category: 'test'
      });
      if (res.data.success) {
        setTestStatus({ success: true, msg: `Live SMS delivered! Twilio SID: ${res.data.data?.twilioMessageId || 'Success'}` });
        fetchSmsLogs();
      } else {
        setTestStatus({ success: false, msg: res.data.message || 'SMS dispatch failed' });
      }
    } catch (err: any) {
      setTestStatus({ 
        success: false, 
        msg: err.response?.data?.message || err.message || 'Twilio failed to dispatch. Note: Twilio Trial mode delivers only to verified numbers.' 
      });
    } finally {
      setIsSendingTest(false);
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
        payload.customPhones = customPhones.split(/[\r\n,;]+/).map(p => p.trim()).filter(Boolean);
      }

      const res = await api.post('/sms/campaign', payload);
      if (res.data.success) {
        const total = res.data.total || 0;
        const delivered = res.data.successCount || 0;
        const failed = res.data.failedCount || 0;
        let msg = `Bulk SMS Campaign Dispatched! Total Recipients: ${total}, Delivered: ${delivered}`;
        if (failed > 0) {
          msg += ` (${failed} unverified/failed - Twilio Trial accounts only deliver to verified numbers)`;
        }
        setStatusMsg(msg);
        setCampaignTitle('');
        setMessageBody('');
        fetchSmsLogs();
      }
    } catch (err: any) {
      setStatusMsg(err.response?.data?.message || 'Failed to dispatch campaign.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto text-[#F3F4F6]">
      <PageHeader
        title="Bulk SMS Broadcast & Presets Portal"
        subtitle="Dispatch automated parent SMS alerts, fee reminders, holiday circulars, and event invitations."
      />

      {statusMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* TWILIO GATEWAY STATUS & INSTANT TEST DISPATCH */}
      <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#303B4D] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#243244] border border-[#303B4D] flex items-center justify-center text-blue-400 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[#F3F4F6]">Twilio Outbound SMS Gateway</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
                  LIVE & CONNECTED
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Outbound Sender: <span className="font-mono text-[#F3F4F6] font-medium">+1 (447) 284-1082</span> • Verified Number: <span className="font-mono text-emerald-400 font-medium">+91 9121454554</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-[#243244] text-[#9CA3AF] px-2.5 py-1 rounded border border-[#303B4D] self-start sm:self-auto">
            Trial Mode: Delivers to Verified Numbers
          </span>
        </div>

        {/* Quick Instant Test SMS Dispatch */}
        <form onSubmit={handleSendTestSms} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-end">
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Send Test To Mobile *</label>
            <input
              type="text"
              required
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+919121454554"
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-6">
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Test Message *</label>
            <input
              type="text"
              required
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test SMS from Murthy High School"
              className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isSendingTest}
              className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingTest ? 'Sending...' : 'Send Test SMS Now'}</span>
            </button>
          </div>
        </form>

        {testStatus && (
          <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            testStatus.success 
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50' 
              : 'bg-red-950/40 text-red-400 border border-red-800/50'
          }`}>
            <span>{testStatus.msg}</span>
          </div>
        )}
      </div>

      {/* QUICK PRESETS GALLERY */}
      <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#303B4D] pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-[#F3F4F6] text-sm">Quick Bulk SMS Presets</h3>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-[#243244] text-[#9CA3AF] border border-[#303B4D]">
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
                className="p-3.5 rounded-lg border border-[#303B4D] bg-[#243244] hover:bg-gray-700/60 cursor-pointer transition-colors flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">{preset.category}</span>
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="font-medium text-xs text-[#F3F4F6] leading-snug">{preset.title}</p>
                <p className="text-[11px] text-[#9CA3AF] line-clamp-2 italic">"{preset.body}"</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN COMPOSER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: SMS Composer Form */}
        <div className="lg:col-span-2 bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#303B4D] pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-[#F3F4F6] text-sm">Bulk SMS Composer</h3>
            </div>
            <div className="text-xs text-[#9CA3AF]">
              Placeholders evaluate per student on send
            </div>
          </div>

          {/* Dynamic Placeholder Insertion Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#9CA3AF]">
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
                  className="px-2.5 py-1 bg-[#243244] hover:bg-gray-700 text-[#F3F4F6] border border-[#303B4D] rounded-md text-[11px] font-mono font-medium transition-colors"
                >
                  + {t.tag}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Campaign / Subject Title *
              </label>
              <input
                required
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="e.g. Fee Balance Reminder / Holiday Announcement"
                className="w-full h-9 bg-[#243244] border border-[#303B4D] rounded-lg px-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Target Audience Selector */}
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-2">
                Target Audience Group *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType('all')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors border ${
                    targetType === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-[#243244] text-[#9CA3AF] border-[#303B4D] hover:text-[#F3F4F6]'
                  }`}
                >
                  All School Parents
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('class_wise')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors border ${
                    targetType === 'class_wise'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-[#243244] text-[#9CA3AF] border-[#303B4D] hover:text-[#F3F4F6]'
                  }`}
                >
                  Class-wise Target
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('custom_phones')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors border ${
                    targetType === 'custom_phones'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-[#243244] text-[#9CA3AF] border-[#303B4D] hover:text-[#F3F4F6]'
                  }`}
                >
                  Custom Phone Numbers
                </button>
              </div>
            </div>

            {/* Class & Section Selection */}
            {targetType === 'class_wise' && (
              <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-[#243244] border border-[#303B4D] rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Select Class *</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full h-9 bg-[#1F2937] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  >
                    <option value="" className="bg-[#1F2937]">-- All Classes --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#1F2937]">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Select Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full h-9 bg-[#1F2937] border border-[#303B4D] rounded-lg pl-3 pr-8 text-xs text-[#F3F4F6] focus:outline-none focus:border-blue-500"
                  >
                    <option value="" className="bg-[#1F2937]">-- All Sections --</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#1F2937]">Section {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Custom Phone Numbers */}
            {targetType === 'custom_phones' && (
              <div className="p-3.5 bg-[#243244] border border-[#303B4D] rounded-lg">
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                  Comma-Separated Phone Numbers *
                </label>
                <textarea
                  rows={2}
                  value={customPhones}
                  onChange={(e) => setCustomPhones(e.target.value)}
                  placeholder="+919876543210, +919876543211, +919876543212"
                  className="w-full bg-[#1F2937] border border-[#303B4D] rounded-lg p-2.5 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            )}

            {/* Message Content Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#9CA3AF]">
                  SMS Message Body *
                </label>
                <span className="text-xs text-[#9CA3AF] font-mono">
                  {messageBody.length} chars • {Math.ceil(messageBody.length / 160) || 1} SMS unit(s)
                </span>
              </div>
              <textarea
                required
                rows={5}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message body here or select a preset above..."
                className="w-full bg-[#243244] border border-[#303B4D] rounded-lg p-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Dispatching SMS Broadcast...' : 'Broadcast Bulk SMS Campaign'}</span>
            </button>
          </form>
        </div>

        {/* Right 1 Column: Gemini AI Draft Generator */}
        <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#303B4D] pb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-sm text-[#F3F4F6]">Gemini AI Message Generator</h3>
          </div>

          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Describe the notice or announcement in natural language. Gemini AI will generate a professional, concise SMS template with dynamic tag placeholders.
          </p>

          <div className="space-y-3 pt-1">
            <textarea
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Write a polite SMS reminding parents that Second Term exams begin next Monday and hall tickets are available."
              className="w-full bg-[#243244] border border-[#303B4D] rounded-lg p-3 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={handleGenerateAiSms}
              disabled={isAiLoading || !aiPrompt}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiLoading ? 'Drafting SMS with Gemini...' : 'Draft SMS with AI'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#303B4D] text-[11px] text-[#9CA3AF] space-y-1">
            <p className="font-medium text-[#F3F4F6] uppercase tracking-wider text-[10px]">Dynamic Placeholder Engine:</p>
            <p className="font-mono text-blue-400">{'{student_name}'} → Student Full Name</p>
            <p className="font-mono text-blue-400">{'{parent_name}'} → Parent Full Name</p>
            <p className="font-mono text-blue-400">{'{class_name}'} → Student Class & Section</p>
            <p className="font-mono text-blue-400">{'{due_amount}'} → Individual Outstanding Fee</p>
            <p className="font-mono text-blue-400">{'{school_name}'} → {school?.name || 'Murthy High School'}</p>
          </div>
        </div>
      </div>

      {/* RECENT SMS BROADCAST AUDIT LOGS */}
      <div className="bg-[#1F2937] border border-[#303B4D] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#303B4D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm text-[#F3F4F6]">Recent SMS Broadcasts & Delivery Audit Logs</h3>
          </div>
          <button
            type="button"
            onClick={fetchSmsLogs}
            disabled={isLogsLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] py-1.5 px-3 rounded-lg border border-[#303B4D] bg-[#243244] transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLogsLoading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {smsLogs.length === 0 ? (
          <div className="text-center py-10 text-[#9CA3AF] space-y-2">
            <Phone className="w-8 h-8 mx-auto text-[#9CA3AF]/60" />
            <p className="text-xs font-medium">No SMS broadcast records found.</p>
            <p className="text-[11px] text-[#9CA3AF]">Sent broadcasts, fee reminders, and attendance notifications will automatically log here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#303B4D] text-[#9CA3AF] font-medium uppercase tracking-wider text-[10px] bg-[#243244]">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Recipient</th>
                  <th className="py-2.5 px-4">Phone</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Message Snippet</th>
                  <th className="py-2.5 px-4 text-right">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303B4D]">
                {smsLogs.slice(0, 30).map((log) => {
                  const isMock = log.status === 'mock_sent' || (log.twilioMessageId && log.twilioMessageId.startsWith('MOCK-'));
                  const isSuccess = log.status === 'sent' && !isMock;
                  const dateStr = log.createdAt || log.created_at || '';
                  const formattedDate = dateStr ? new Date(dateStr).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Just now';

                  return (
                    <tr key={log.id} className="hover:bg-[#243244]/60 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#9CA3AF] whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-[#F3F4F6]">
                        {log.recipientName || 'Parent / Recipient'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#9CA3AF] whitespace-nowrap">
                        {log.recipientPhone || 'N/A'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-[#243244] text-[#9CA3AF] border border-[#303B4D]">
                          {log.category || 'general'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#9CA3AF] max-w-xs truncate" title={log.messageBody}>
                        {log.messageBody}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {isSuccess ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                            title={`Twilio SID: ${log.twilioMessageId}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Delivered</span>
                          </span>
                        ) : isMock ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border bg-amber-950/40 text-amber-400 border-amber-800/50"
                            title="Mock / Simulator dispatch (Twilio credentials were not active when sent)"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Simulated</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border bg-red-950/40 text-red-400 border-red-800/50"
                            title={log.errorMessage || 'Dispatch failed'}
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmsCampaignPage;
