import twilio from 'twilio';
import { env } from '../config/env';
import { dbStore } from '../config/supabase';
import crypto from 'crypto';

let twilioClient: twilio.Twilio | null = null;

const isRealTwilio = env.TWILIO_ACCOUNT_SID && 
                     !env.TWILIO_ACCOUNT_SID.includes('your-') && 
                     env.TWILIO_AUTH_TOKEN && 
                     !env.TWILIO_AUTH_TOKEN.includes('your-');

if (isRealTwilio) {
  try {
    twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  } catch (err) {
    console.warn('[Twilio] Credentials unconfigured or invalid, falling back to safe local log delivery mode.');
  }
}

export const DEFAULT_SMS_PRESETS = [
  {
    id: 'preset-1',
    name: 'Absence Alert Notice',
    category: 'attendance',
    messageBody: 'Dear Parent, {student_name} of Class {class_name} has been marked ABSENT today ({date}). Please contact school office for any query.'
  },
  {
    id: 'preset-2',
    name: 'Late Arrival Alert',
    category: 'attendance',
    messageBody: 'Dear Parent, {student_name} of Class {class_name} arrived late to school today ({time}). Please ensure timely arrival.'
  },
  {
    id: 'preset-3',
    name: 'Fee Outstanding Due Reminder',
    category: 'fee',
    messageBody: 'Dear Parent, fee balance of INR {due_amount} for {student_name} (Class {class_name}) is due. Kindly clear at your earliest. Thank you, {school_name}.'
  },
  {
    id: 'preset-4',
    name: 'Fee Payment Receipt Confirmation',
    category: 'fee',
    messageBody: 'Dear Parent, fee payment of INR {amount} received for {student_name}. Receipt No: {receipt_no}. Thank you, {school_name}.'
  },
  {
    id: 'preset-5',
    name: 'General Holiday Circular',
    category: 'holiday',
    messageBody: 'Dear Parents, {school_name} will remain closed on {date} on account of {holiday_reason}. Regular classes resume on {resume_date}.'
  },
  {
    id: 'preset-6',
    name: 'Emergency Rain / Weather Holiday',
    category: 'holiday',
    messageBody: 'Dear Parents, school remains closed today ({date}) due to heavy rain alert. Online study material sent.'
  },
  {
    id: 'preset-7',
    name: 'Parent-Teacher Meeting (PTM) Notice',
    category: 'exam',
    messageBody: 'Dear Parents, Parent-Teacher Meeting (PTM) & Progress Report Card distribution is scheduled on {ptm_date} from {ptm_time}.'
  },
  {
    id: 'preset-8',
    name: 'Examination Schedule Announcement',
    category: 'exam',
    messageBody: 'Dear Parent, {exam_name} examinations for Class {class_name} start on {start_date}. Date sheet published.'
  },
  {
    id: 'preset-9',
    name: 'Annual Sports & Cultural Event Invitation',
    category: 'event',
    messageBody: 'Dear Parents, Annual Sports & Cultural Day event is on {event_date} at school campus. All parents are cordially invited!'
  },
  {
    id: 'preset-10',
    name: 'Educational Field Trip Consent Notice',
    category: 'event',
    messageBody: 'Dear Parents, Educational Excursion for Class {class_name} is planned on {trip_date}. Kindly send signed consent form.'
  }
];

export class SmsService {
  static getTemplates(schoolId: string) {
    const schoolTemplates = dbStore.smsTemplates.filter(t => t.schoolId === schoolId || t.school_id === schoolId);
    return [...DEFAULT_SMS_PRESETS, ...schoolTemplates];
  }

  // Student-specific dynamic placeholder evaluation engine
  private static personalizeMessageForStudent(template: string, student: any, schoolId: string): string {
    const school = dbStore.schools.find(s => s.id === schoolId);
    const schoolName = school?.name || 'School Office';

    const parent = dbStore.studentParents.find(p => p.studentId === student.id || p.student_id === student.id);
    const feeSummary = dbStore.studentFees.find(f => f.studentId === student.id || f.student_id === student.id);
    const cls = dbStore.classes.find(c => c.id === student.classId || c.id === student.class_id);
    const sec = dbStore.sections.find(s => s.id === student.sectionId || s.id === student.section_id);

    const classNameStr = `${cls ? cls.name : ''}${sec ? ' - ' + sec.name : ''}`.trim() || 'Class';
    const dueAmountStr = feeSummary ? (feeSummary.balance || 0).toLocaleString() : '0';
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return template
      .replace(/\{student_name\}/g, student.fullName || 'Student')
      .replace(/\{class_name\}/g, classNameStr)
      .replace(/\{due_amount\}/g, dueAmountStr)
      .replace(/\{school_name\}/g, schoolName)
      .replace(/\{date\}/g, todayStr)
      .replace(/\{time\}/g, '10:15 AM')
      .replace(/\{due_date\}/g, '15th August')
      .replace(/\{holiday_reason\}/g, 'Independence Day')
      .replace(/\{resume_date\}/g, 'Monday, 18th August')
      .replace(/\{ptm_date\}/g, 'Saturday, 15th August')
      .replace(/\{ptm_time\}/g, '9:00 AM to 1:00 PM')
      .replace(/\{exam_name\}/g, 'Mid-Term Examinations')
      .replace(/\{start_date\}/g, '18th August 2026')
      .replace(/\{event_date\}/g, '15th August 2026')
      .replace(/\{trip_date\}/g, '22nd August 2026');
  }

  static async sendSms(schoolId: string, phone: string, recipientName: string, studentId: string | null, messageBody: string, category: string, userId?: string) {
    let twilioMsgId = `MOCK-MSG-${Date.now()}`;
    let status = 'sent';
    let errorMessage = '';

    if (twilioClient && env.TWILIO_PHONE_NUMBER && !env.TWILIO_PHONE_NUMBER.includes('1234567890')) {
      try {
        const response = await twilioClient.messages.create({
          body: messageBody,
          from: env.TWILIO_PHONE_NUMBER,
          to: phone
        });
        twilioMsgId = response.sid;
        status = 'sent';
      } catch (err: any) {
        console.error('[Twilio Error]', err);
        status = 'failed';
        errorMessage = err.message || 'SMS dispatch failed';
      }
    } else {
      console.log(`[SMS DISPATCH] To: ${phone} (${recipientName}) | Body: "${messageBody}"`);
      status = 'sent';
    }

    const logRecord = {
      id: crypto.randomUUID(),
      schoolId,
      recipientPhone: phone,
      recipientName,
      studentId,
      messageBody,
      category,
      twilioMessageId: twilioMsgId,
      status,
      errorMessage,
      sentBy: userId || null,
      createdAt: new Date().toISOString()
    };

    dbStore.smsLogs.push(logRecord);
    dbStore.saveToDisk();
    return logRecord;
  }

  static async sendCampaign(schoolId: string, userId: string, title: string, messageTemplate: string, targetType: string, classId?: string, sectionId?: string, customPhones?: string[]) {
    const campaignId = crypto.randomUUID();
    
    dbStore.smsCampaigns.push({
      id: campaignId,
      school_id: schoolId,
      title,
      message: messageTemplate,
      target_type: targetType,
      created_by: userId,
      created_at: new Date().toISOString()
    });

    let targetStudents: any[] = [];

    if (targetType === 'all') {
      targetStudents = dbStore.students.filter(s => (s.schoolId === schoolId || s.school_id === schoolId) && s.status === 'active');
    } else if (targetType === 'class_wise' && classId) {
      targetStudents = dbStore.students.filter(s => (s.schoolId === schoolId || s.school_id === schoolId) && (s.classId === classId || s.class_id === classId) && s.status === 'active');
      if (sectionId) targetStudents = targetStudents.filter(s => s.sectionId === sectionId || s.section_id === sectionId);
    }

    let successCount = 0;

    if (targetType === 'custom_phones' && customPhones) {
      const school = dbStore.schools.find(s => s.id === schoolId);
      const schoolName = school?.name || 'School Office';
      const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const genericMsg = messageTemplate
        .replace(/\{school_name\}/g, schoolName)
        .replace(/\{date\}/g, todayStr);

      for (let i = 0; i < customPhones.length; i++) {
        const phone = customPhones[i];
        const log = await this.sendSms(schoolId, phone, `Recipient #${i + 1}`, null, genericMsg, 'campaign', userId);
        if (log.status === 'sent') successCount++;
      }
    } else {
      // Dynamic Student-Specific Personalization for every student individually
      for (const st of targetStudents) {
        const parent = dbStore.studentParents.find(p => p.studentId === st.id || p.student_id === st.id);
        const phone = parent?.fatherPhone || parent?.motherPhone || parent?.guardianPhone || parent?.emergencyContactPhone;

        if (phone) {
          const personalizedBody = this.personalizeMessageForStudent(messageTemplate, st, schoolId);
          const log = await this.sendSms(schoolId, phone, st.fullName, st.id, personalizedBody, 'campaign', userId);
          if (log.status === 'sent') successCount++;
        }
      }
    }

    dbStore.saveToDisk();
    return { campaignId, total: targetType === 'custom_phones' ? (customPhones?.length || 0) : targetStudents.length, successCount };
  }
}
