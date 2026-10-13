import { z } from 'zod';

export const createSmsTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  category: z.enum(['attendance', 'holiday', 'festival', 'fee', 'announcement', 'custom']),
  messageBody: z.string().min(5, 'Message body is required')
});

export const sendSmsCampaignSchema = z.object({
  title: z.string().min(2, 'Campaign title is required'),
  message: z.string().min(5, 'Message content is required'),
  targetType: z.enum(['all', 'class_wise', 'section_wise', 'custom_phones']),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  customPhones: z.array(z.string()).optional()
});
