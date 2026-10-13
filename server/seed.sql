-- ==============================================================================
-- SCHOOL OS — SEED DATA FOR DEMO & PRODUCTION INITIALIZATION
-- ==============================================================================

-- 1. Insert Initial School
INSERT INTO schools (id, name, school_code, registration_prefix, address, city, state, phone, email, logo_url)
VALUES (
    '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e',
    'Murthy High School',
    'MHS',
    'REG',
    'Sarpavaram police station road, near SRMT mall',
    'Kakinada',
    'Andhra Pradesh',
    '9121454554',
    'pssr0930@gmail.com',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200&auto=format&fit=crop&q=80'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, phone = EXCLUDED.phone;

-- 2. Insert Academic Year
INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_current)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e',
    '2026 - 2027',
    '2026-06-01',
    '2027-04-30',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Classes (LKG through Class 10)
INSERT INTO classes (id, school_id, name, display_order) VALUES
('c1000000-0000-0000-0000-000000000001', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'LKG', 1),
('c1000000-0000-0000-0000-000000000002', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'UKG', 2),
('c1000000-0000-0000-0000-000000000003', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'Class 1', 3),
('c1000000-0000-0000-0000-000000000004', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'Class 2', 4),
('c1000000-0000-0000-0000-000000000005', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'Class 3', 5),
('c1000000-0000-0000-0000-000000000006', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'Class 4', 6),
('c1000000-0000-0000-0000-000000000007', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'Class 5', 7),
('c1000000-0000-0000-0000-000000000008', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'Class 6', 8),
('c1000000-0000-0000-0000-000000000009', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'Class 7', 9),
('c1000000-0000-0000-0000-000000000010', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'Class 8', 10),
('c1000000-0000-0000-0000-000000000011', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'Class 9', 11),
('c1000000-0000-0000-0000-000000000012', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'Class 10', 12)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Section A for LKG
INSERT INTO sections (id, school_id, class_id, name) VALUES
('s1000000-0000-0000-0000-000000000001', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'c1000000-0000-0000-0000-000000000001', 'A')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Class Fee Structures (LKG = 17,200 total)
INSERT INTO fee_structures (id, school_id, academic_year_id, class_id, tuition_fee, admission_fee, examination_fee, books_fee, total_fee) VALUES
('f1000000-0000-0000-0000-000000000001', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'c1000000-0000-0000-0000-000000000001', 12000, 2500, 1500, 1200, 17200),
('f1000000-0000-0000-0000-000000000002', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'c1000000-0000-0000-0000-000000000002', 14000, 2500, 1500, 1200, 19200),
('f1000000-0000-0000-0000-000000000003', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'c1000000-0000-0000-0000-000000000003', 16000, 2500, 1500, 1200, 21200)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Initial Enrolled Student: Palika Pavan
INSERT INTO students (
    id, school_id, academic_year_id, class_id, section_id, 
    registration_number, student_code, full_name, date_of_birth, gender, 
    admission_date, status, student_aadhaar, address, city, postal_code
) VALUES (
    'st100000-0000-0000-0000-000000000001',
    '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'c1000000-0000-0000-0000-000000000001',
    's1000000-0000-0000-0000-000000000001',
    'REG-0001',
    'REG-0001',
    'Palika Pavan',
    '2021-05-10',
    'male',
    '2026-08-09',
    'active',
    '982989255972',
    'Sarpavaram police station road',
    'Kakinada',
    '533001'
) ON CONFLICT (id) DO NOTHING;

-- 7. Insert Student Parent Details for Palika Pavan
INSERT INTO student_parents (
    id, school_id, student_id, father_name, father_phone, parent_email
) VALUES (
    'sp100000-0000-0000-0000-000000000001',
    '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e',
    'st100000-0000-0000-0000-000000000001',
    'Murthy',
    '9121454554',
    'pssr0930@gmail.com'
) ON CONFLICT (id) DO NOTHING;

-- 8. Insert Student Fee Ledger for Palika Pavan
INSERT INTO student_fees (
    id, school_id, student_id, academic_year_id, base_fee, previous_year_due, concession_amount, final_fee, amount_paid, balance
) VALUES (
    'sf100000-0000-0000-0000-000000000001',
    '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e',
    'st100000-0000-0000-0000-000000000001',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    17200,
    0,
    0,
    17200,
    5000,
    12200
) ON CONFLICT (id) DO NOTHING;

-- 9. Insert Payments / Receipts for Palika Pavan
INSERT INTO payments (
    id, school_id, student_id, receipt_number, amount, amount_paid, payment_method, payment_mode, payment_date, recorded_by_name
) VALUES 
('p1000000-0000-0000-0000-000000000001', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'st100000-0000-0000-0000-000000000001', 'REC-00001', 1000, 1000, 'UPI', 'UPI', '2026-08-09 10:00:00+05:30', 'Swetha'),
('p1000000-0000-0000-0000-000000000002', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'st100000-0000-0000-0000-000000000001', 'REC-00002', 2000, 2000, 'cash', 'cash', '2026-08-09 14:30:00+05:30', 'Swetha'),
('p1000000-0000-0000-0000-000000000003', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'st100000-0000-0000-0000-000000000001', 'REC-00003', 2000, 2000, 'cash', 'cash', '2026-08-10 11:15:00+05:30', 'Swetha')
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Staff Members (Ram, PP, PPP)
INSERT INTO school_members (
    id, school_id, employee_id, full_name, email, designation, role, status
) VALUES 
('sm100000-0000-0000-0000-000000000001', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'MHSTF01', 'Ram', 'MHS01STF', 'Cashier', 'staff', 'active'),
('sm100000-0000-0000-0000-000000000002', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'TCR001', 'PP', 'MHS01TCR', 'CO-ORDINATOR', 'teacher', 'active'),
('sm100000-0000-0000-0000-000000000003', '8f3b4c10-91a2-4d5e-8b1c-3f5a7b9c1d2e', 'TCR002', 'PPP', 'MHS02TCR', 'Head Teacher', 'teacher', 'active')
ON CONFLICT (id) DO NOTHING;

SELECT '✅ SCHOOL OS SEED DATA INSERTED SUCCESSFULLY!' AS status;
