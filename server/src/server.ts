import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import schoolRoutes from './routes/school.routes';
import dashboardRoutes from './routes/dashboard.routes';
import studentRoutes from './routes/student.routes';
import classRoutes from './routes/class.routes';
import attendanceRoutes from './routes/attendance.routes';
import feeRoutes from './routes/fee.routes';
import paymentRoutes from './routes/payment.routes';
import smsRoutes from './routes/sms.routes';
import staffRoutes from './routes/staff.routes';
import aiRoutes from './routes/ai.routes';
import agentRoutes from './routes/agent.routes';

const app = express();

// Security Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Root endpoint welcome & API status
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'School OS SaaS API Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      schools: '/api/schools',
      agent: '/api/agent',
      dashboard: '/api/dashboard',
      students: '/api/students',
      classes: '/api/classes',
      attendance: '/api/attendance',
      fees: '/api/fees',
      payments: '/api/payments',
      sms: '/api/sms',
      staff: '/api/staff',
      ai: '/api/ai'
    }
  });
});

// Global Rate Limiter with Localhost Bypass for Dev Auto-Sync Polling
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  skip: (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    return ip === '::1' || ip === '127.0.0.1' || ip.includes('127.0.0.1');
  },
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', generalLimiter);

// Sensitive Auth Rate Limiter with Localhost Bypass
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    return ip === '::1' || ip === '127.0.0.1' || ip.includes('127.0.0.1');
  },
  message: { success: false, message: 'Too many login or registration attempts. Please wait 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/schools/register', authLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/student-fees', feeRoutes); // Dual mount for seamless client routing
app.use('/api/payments', paymentRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), app: 'School OS Backend API' });
});

// Central Error Handler
app.use(errorHandler);

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SCHOOL OS API SERVER IS RUNNING ON PORT ${PORT}`);
  console.log(`👉 API root: http://localhost:${PORT}/`);
  console.log(`👉 Health check: http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});

export default app;
