const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const fs = require('fs');
const path = require('path');

const url = 'https://nzfasftoimnfnuvakwdc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZmFzZnRvaW1uZm51dmFrd2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjAzODM5MiwiZXhwIjoyMTAxNjE0MzkyfQ.QQF-swl9wMg7NV5SEaP4ioCzyQyMUYDhQlofh_PX5Ok';

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

const DEMO_SCHOOL_ID = 's1111111-1111-1111-1111-111111111111';
const DEMO_SCHOOL_UUID = '06ae6bc0-c644-4225-a003-b34e3e0e52e9';

async function runCleanup() {
  const dbPath = path.resolve(__dirname, '../db_store.json');
  if (fs.existsSync(dbPath)) {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    console.log('Cleaning up demo data from local store...');

    // Filter out Apex International School & demo profiles
    db.schools = db.schools.filter(s => s.id !== DEMO_SCHOOL_ID && s.schoolCode !== 'APEX01');
    db.profiles = db.profiles.filter(p => p.email !== 'admin@apexschool.com' && p.email !== 'staff@apexschool.com');
    db.schoolMembers = db.schoolMembers.filter(sm => sm.school_id !== DEMO_SCHOOL_ID && sm.id !== 'sm-1' && sm.id !== 'sm-2');
    db.staffProfiles = db.staffProfiles.filter(sp => sp.school_id !== DEMO_SCHOOL_ID);
    db.staffPermissions = db.staffPermissions.filter(sp => sp.school_id !== DEMO_SCHOOL_ID);
    db.academicYears = db.academicYears.filter(ay => ay.schoolId !== DEMO_SCHOOL_ID && ay.school_id !== DEMO_SCHOOL_ID);
    db.classes = db.classes.filter(c => c.schoolId !== DEMO_SCHOOL_ID && c.school_id !== DEMO_SCHOOL_ID);
    db.sections = db.sections.filter(s => s.schoolId !== DEMO_SCHOOL_ID && s.school_id !== DEMO_SCHOOL_ID);
    db.students = db.students.filter(st => st.schoolId !== DEMO_SCHOOL_ID && st.school_id !== DEMO_SCHOOL_ID);
    db.studentParents = db.studentParents.filter(sp => sp.schoolId !== DEMO_SCHOOL_ID && sp.school_id !== DEMO_SCHOOL_ID);
    db.feeStructures = db.feeStructures.filter(f => f.schoolId !== DEMO_SCHOOL_ID && f.school_id !== DEMO_SCHOOL_ID);
    db.studentFees = db.studentFees.filter(sf => sf.schoolId !== DEMO_SCHOOL_ID && sf.school_id !== DEMO_SCHOOL_ID);
    db.payments = db.payments.filter(p => p.schoolId !== DEMO_SCHOOL_ID && p.school_id !== DEMO_SCHOOL_ID);

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    console.log('✓ Cleaned up local db_store.json');
  }

  console.log('Cleaning up demo data from Supabase PostgreSQL...');
  // Delete from Supabase
  await supabase.from('profiles').delete().in('email', ['admin@apexschool.com', 'staff@apexschool.com']);
  await supabase.from('schools').delete().eq('id', DEMO_SCHOOL_UUID);
  await supabase.from('schools').delete().eq('school_code', 'APEX01');

  console.log('===================================================');
  console.log('🎉 ALL DEMO STUDENTS & DEMO ADMINS REMOVED!');
  console.log('===================================================');
  process.exit(0);
}

runCleanup();
