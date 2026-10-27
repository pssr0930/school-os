import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import { dbStore } from '../config/supabase';

let aiClient: GoogleGenAI | null = null;
if (env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('[Gemini AI] SDK initialization warning:', err);
  }
}

export class AiService {
  private static SYSTEM_PROMPT = `
You are an AI assistant inside a school-management application.
Your purpose is to assist authorized school administrators with administrative analysis and communication drafting.
You must:
- Never invent school statistics, students, payments, or attendance records.
- Clearly distinguish provided facts from interpretations.
- Avoid exposing sensitive student identification information (e.g. Aadhaar numbers).
- Never request or reveal passwords, authentication tokens or API keys.
- Never make high-stakes financial or attendance decisions automatically.
- Provide concise, actionable administrative insights in professional language.
- Return structured JSON when requested.
  `;

  static async generateDashboardInsights(schoolId: string) {
    // Gather aggregated stats safely with dual camelCase and snake_case support
    const totalStudents = dbStore.students.filter(s => (s.schoolId === schoolId || s.school_id === schoolId) && s.status === 'active').length;
    const totalTeachers = dbStore.staffProfiles.filter(sp => (sp.school_id === schoolId || sp.schoolId === schoolId) && sp.status === 'active').length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = dbStore.attendance.filter(a => (a.schoolId === schoolId || a.school_id === schoolId) && (a.attendanceDate === today || a.attendance_date === today));
    const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absentCount = todayAttendance.filter(a => a.status === 'absent').length;

    const schoolFees = dbStore.studentFees.filter(sf => sf.schoolId === schoolId || sf.school_id === schoolId);
    const totalDue = schoolFees.reduce((acc, f) => acc + (Number(f.balance) || 0), 0);
    const totalCollected = dbStore.payments.filter(p => p.schoolId === schoolId || p.school_id === schoolId).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const statsPayload = {
      totalStudents,
      totalTeachers,
      todayAttendance: { presentCount, absentCount, totalMarked: todayAttendance.length },
      financials: { totalDue, totalCollected }
    };

    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${this.SYSTEM_PROMPT}\n\nAnalyze the supplied aggregated school statistics and identify useful administrative observations:\n${JSON.stringify(statsPayload)}` }] }
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT' as any,
              properties: {
                summary: { type: 'STRING' as any },
                attendanceInsights: {
                  type: 'ARRAY' as any,
                  items: {
                    type: 'OBJECT' as any,
                    properties: {
                      observation: { type: 'STRING' as any },
                      severity: { type: 'STRING' as any, enum: ['low', 'medium', 'high'] },
                      recommendation: { type: 'STRING' as any }
                    }
                  }
                },
                feeInsights: {
                  type: 'ARRAY' as any,
                  items: {
                    type: 'OBJECT' as any,
                    properties: {
                      observation: { type: 'STRING' as any },
                      recommendation: { type: 'STRING' as any }
                    }
                  }
                },
                actions: { type: 'ARRAY' as any, items: { type: 'STRING' as any } }
              }
            }
          }
        });

        if (response.text) {
          return JSON.parse(response.text);
        }
      } catch (err) {
        console.error('[Gemini AI Insights Error]', err);
      }
    }

    // High-quality analytical fallback output if key is missing or offline
    return {
      summary: `School operating smoothly with ${totalStudents} enrolled students and ${totalTeachers} active teaching faculty members. Total collected fee revenue stands at INR ${totalCollected.toLocaleString('en-IN')}.`,
      attendanceInsights: [
        {
          observation: absentCount > 0 ? `${absentCount} students marked absent today (${presentCount} present).` : (todayAttendance.length > 0 ? '100% daily attendance recorded across active sections.' : 'Daily attendance marking pending for today.'),
          severity: absentCount > 5 ? 'medium' : 'low',
          recommendation: absentCount > 0 ? 'Trigger automated cutoff SMS notifications to absent students\' parents.' : 'Maintain current daily attendance tracking routines.'
        }
      ],
      feeInsights: [
        {
          observation: totalDue > 0 ? `Outstanding school fee balance is INR ${totalDue.toLocaleString('en-IN')}.` : 'Zero outstanding fee arrears recorded across active student cohorts.',
          recommendation: totalDue > 0 ? 'Schedule automated SMS fee reminders for students with pending Term dues.' : 'Fee recovery is in optimal status.'
        }
      ],
      actions: [
        'Review class-wise attendance records for all active grades',
        'Dispatch fee reminder broadcast to parents with pending balances',
        'Verify upcoming academic schedule and holiday notifications'
      ]
    };
  }

  static async draftSms(schoolName: string, category: string, audience: string, details: string) {
    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${this.SYSTEM_PROMPT}\n\nDraft a concise SMS for category: ${category}, School: ${schoolName}, Target Audience: ${audience}, Details: ${details}` }]
            }
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT' as any,
              properties: {
                message: { type: 'STRING' as any },
                characterCount: { type: 'NUMBER' as any },
                category: { type: 'STRING' as any }
              }
            }
          }
        });

        if (response.text) {
          return JSON.parse(response.text);
        }
      } catch (err) {
        console.error('[Gemini AI Draft Error]', err);
      }
    }

    // Default structured template fallback
    const msg = `Dear Parents, ${details} — ${schoolName}`;
    return {
      message: msg,
      characterCount: msg.length,
      category: category
    };
  }

  static async draftFeeReminder(schoolName: string, studentName?: string, amount?: number) {
    const amtStr = amount ? `INR ${amount}` : '{due_amount}';
    const stName = studentName || '{student_name}';
    const msg = `Dear Parent, gentle reminder that fee balance of ${amtStr} for ${stName} is pending. Kindly clear at earliest. — ${schoolName}`;

    return {
      message: msg,
      tone: 'polite',
      containsAmount: true
    };
  }
}
