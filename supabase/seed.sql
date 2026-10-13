-- Default SMS Templates for School OS
-- Will be inserted automatically for newly registered schools or as global presets

INSERT INTO public.sms_templates (id, school_id, name, category, message_body)
VALUES 
(
    uuid_generate_v4(), 
    '00000000-0000-0000-0000-000000000000', 
    'Daily Absence Alert', 
    'attendance', 
    'Dear Parent, your child {student_name} of class {class_name} was marked absent today ({date}). Please contact {school_name} if required.'
),
(
    uuid_generate_v4(), 
    '00000000-0000-0000-0000-000000000000', 
    'Fee Due Reminder', 
    'fee', 
    'Dear Parent, this is a gentle reminder that the pending fee balance of {currency} {due_amount} for {student_name} is due. Kindly make payment at the earliest. — {school_name}'
),
(
    uuid_generate_v4(), 
    '00000000-0000-0000-0000-000000000000', 
    'Holiday Announcement', 
    'holiday', 
    'Dear Parent/Student, please note that {school_name} will remain closed on {date} on account of {holiday_reason}. Regular classes resume on {resume_date}.'
),
(
    uuid_generate_v4(), 
    '00000000-0000-0000-0000-000000000000', 
    'Festival Greetings', 
    'festival', 
    'Wishing all our students and parents a very Happy {festival_name}! May this festival bring peace, health, and joy to your family. — {school_name}'
)
ON CONFLICT DO NOTHING;
