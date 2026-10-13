# School OS — Multi-Tenant K-12 School ERP Platform

A modern, cloud-native, multi-tenant School Operating System for K-12 institutions.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase Cloud PostgreSQL + In-Memory Hybrid Store
- **AI**: Google Gemini 2.5 Flash
- **SMS**: Twilio Gateway
- **Auth**: JWT + bcryptjs + RBAC

## Features
- 🏫 Multi-tenant school isolation (zero cross-school data leakage)
- 🎓 Student Information System (SIS) with full profile management
- 💰 Fee collection, receipts, and ledger management
- 📊 Real-time attendance tracking with SVG analytics
- 🤖 AI-powered administrative insights (Google Gemini)
- 📱 SMS broadcast engine for parent notifications
- 🔐 Role-based access control (Admin / Staff / Teacher / Agent)
- 🖨️ Dual-copy A4 printable fee receipts

## Quick Start

### Backend
```bash
cd server
npm install
# Copy .env.example to .env and fill in your values
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Environment Variables (server/.env)
```
PORT=5000
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## License
Proprietary — All rights reserved.
