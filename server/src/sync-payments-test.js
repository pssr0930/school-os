const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://nzfasftoimnfnuvakwdc.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required in .env');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

const idMap = new Map();
function toUuid(idStr) {
  if (!idStr) return crypto.randomUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(idStr)) return idStr;
  if (idMap.has(idStr)) return idMap.get(idStr);
  const hash = crypto.createHash('md5').update(idStr).digest('hex');
  const uuid = `${hash.substring(0,8)}-${hash.substring(8,12)}-4${hash.substring(13,16)}-a${hash.substring(17,20)}-${hash.substring(20,32)}`;
  idMap.set(idStr, uuid);
  return uuid;
}

async function testPaymentSync() {
  const dbPath = path.resolve(__dirname, '../db_store.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  console.log('Testing payment sync for', db.payments.length, 'records with valid academic_year_id...');

  const defaultAyId = toUuid(db.academicYears && db.academicYears[0] ? db.academicYears[0].id : '2026-2027');

  for (const p of db.payments || []) {
    const payRow = {
      id: toUuid(p.id),
      school_id: toUuid(p.schoolId || p.school_id),
      student_id: toUuid(p.studentId || p.student_id),
      academic_year_id: toUuid(p.academicYearId || p.academic_year_id) || defaultAyId,
      receipt_number: p.receiptNumber || p.receipt_number || `REC-${p.id.slice(0,4)}`,
      amount: Number(p.amount || p.amountPaid || p.amount_paid || 0),
      payment_method: p.paymentMethod || p.payment_method || 'cash',
      transaction_reference: p.transactionReference || p.transaction_reference || '',
      payment_date: p.paymentDate || p.payment_date || new Date().toISOString()
    };

    console.log('Attempting insert of receipt:', payRow.receipt_number, payRow);
    const { data, error } = await supabase.from('payments').upsert([payRow], { onConflict: 'id' });
    if (error) {
      console.error('❌ Payment Sync Error:', error.message, error.details, error.hint);
    } else {
      console.log('✅ Payment Successfully Synced to Supabase:', payRow.receipt_number);
    }
  }
}

testPaymentSync();
