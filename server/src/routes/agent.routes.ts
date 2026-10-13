import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { dbStore } from '../config/supabase';

const router = Router();

// Store for dynamic Agent passwords
const agentPasswords: Record<string, string> = {
  'agent@pssr.com': 'agent123',
  'agent@schoolos.com': 'agent123',
  'agent': 'agent123'
};

// POST /api/agent/login (Agent Sign In)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const target = (email || '').trim().toLowerCase();

  const currentActivePassword = agentPasswords[target] || agentPasswords['agent@pssr.com'] || 'agent123';

  // Strictly check for authorized Agent credentials matching ONLY the updated active password
  if (
    (target === 'agent@pssr.com' || target === 'agent@schoolos.com' || target === 'agent') && 
    password === currentActivePassword
  ) {
    return res.json({
      success: true,
      token: 'agent-token-superadmin',
      agent: {
        id: 'agent-001',
        email: 'agent@pssr.com',
        fullName: 'PSSR Authorized Agent',
        role: 'agent'
      }
    });
  }

  // Reject all other user credentials or outdated passwords with generic message
  res.status(401).json({ success: false, message: 'Invalid Email or Password.' });
});

// POST /api/agent/change-password (Edit Agent Password)
router.post('/change-password', (req, res) => {
  const { email, newPassword } = req.body;
  const target = (email || 'agent@pssr.com').trim().toLowerCase();

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long.' });
  }

  const updatedPass = newPassword.trim();
  agentPasswords[target] = updatedPass;
  agentPasswords['agent@pssr.com'] = updatedPass;
  agentPasswords['agent@schoolos.com'] = updatedPass;
  agentPasswords['agent'] = updatedPass;

  return res.json({
    success: true,
    message: '🎉 Agent password updated successfully! You can now sign in with your new password.'
  });
});

// GET /api/agent/schools (List all provisioned tenant schools)
router.get('/schools', (req, res) => {
  const schools = dbStore.schools.map(s => {
    const adminMember = dbStore.schoolMembers.find(sm => sm.school_id === s.id && sm.role === 'admin');
    const adminProfile = dbStore.profiles.find(p => p.id === adminMember?.user_id);
    const studentCount = dbStore.students.filter(st => (st.schoolId === s.id || st.school_id === s.id) && !st.isArchived).length;
    const staffCount = dbStore.schoolMembers.filter(sm => sm.school_id === s.id && sm.role === 'staff').length;

    return {
      id: s.id,
      name: s.name,
      schoolCode: s.schoolCode || s.school_code || 'SCH',
      address: s.address,
      city: s.city || 'N/A',
      state: s.state || 'N/A',
      phone: s.phone,
      email: s.email,
      logoUrl: s.logoUrl || s.logo_url || '',
      adminName: adminProfile?.full_name || 'Admin',
      adminEmail: adminProfile?.email || s.email,
      studentCount,
      staffCount,
      registeredAt: s.createdAt || '2026-06-01',
      status: 'Active License'
    };
  });

  res.json({ success: true, data: schools });
});

// POST /api/agent/schools/register (Provision new buyer school)
router.post('/schools/register', async (req, res, next) => {
  try {
    const result = await AuthService.registerSchool(req.body);
    res.status(201).json({
      success: true,
      message: `🎉 School "${req.body.schoolName}" successfully provisioned and registered by Agent!`,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

export default router;
