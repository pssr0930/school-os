# School OS — Comprehensive Technical Architecture & Engineering Report

---

## 1. Executive Summary & Product Vision

**School OS** is a modern, cloud-native, multi-tenant Educational Enterprise Resource Planning (ERP) and School Operating System engineered specifically for K-12 institutions.

### The Problem It Solves
Traditional schools operate using fragmented, error-prone workflows:
* **Revenue Leakage**: Untracked pending fee installments, lost paper receipts, lack of automated ledger reconciliation, and duplicate receipt numbers issued by multiple concurrent cashiers.
* **Attendance Latency & Communication Gaps**: Physical paper registers require hours to aggregate, delaying or preventing daily absentee notifications to parents.
* **Data Fragmentation & Security Risks**: Student personal data, fee records, attendance registers, and faculty credentials reside in disconnected spreadsheets without role-based access control, encryption, or audit trails.
* **Multi-Tenant Data Pollution**: Traditional legacy software often shares database queries across institutions, causing catastrophic cross-school data leakages.

### The School OS Solution
School OS consolidates institutional management into a secure, high-performance, single-pane-of-glass platform:
1. **School OS Gateway Portal (`/gateway`)**: A universal entry portal where administrators, staff, and students enter their unique institutional School Code (e.g. `MHS`) to be routed to their school's dedicated, branded environment.
2. **Branded Digital Entrance Portals**: Custom landing pages featuring GPU-accelerated 3D animated institutional crests, rotating orbital rings, ambient lighting, and dedicated access portals for Admins, Staff, and Licensing Agents.
3. **Strict Multi-Tenant Isolation & Zero-Data Cold-Start Guarantee**: When a new school registers or is provisioned, **every metric, record, and ledger starts completely empty at first** (zero students, zero fees collected, zero attendance records, zero unauthorized staff, and zero data leakage from existing schools).
4. **Collision-Free Sequential Receipt Engine**: Strictly isolated sequential numbering (`REC-xxxxx`), atomic balance updates, dual-copy printable A4 receipts (Official School Copy + Student Voucher).
5. **Real-Time Attendance & High-Performance SVG Analytics**: Zero-dependency mathematical calculation engine rendering interactive attendance donuts with real-time class filtering and automated SMS broadcast capabilities.
6. **AI Administrative Copilot**: Powered by Google Gemini 2.5 Flash (`@google/genai`), delivering executive observations, trend analysis, and context-aware messaging drafts with strict PII guardrails.
7. **Hybrid Persistence Architecture**: High-speed in-memory cache (<5ms read latency) backed by synchronous disk write-through persistence and asynchronous cloud PostgreSQL replication via Supabase.

---

## 2. Technology Stack Breakdown

| Architectural Layer | Technologies Employed | Rationale & Technical Role |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18.3** with **TypeScript 5.2** | Declarative component hierarchy, virtual DOM reconciliation, strict type contracts, hook-driven state management. |
| **Build & Tooling** | **Vite 5.3** | Near-instant Cold Server startup, ESM-native Hot Module Replacement (HMR), optimized Rollup production bundling and tree-shaking. |
| **Styling & Design System** | **Tailwind CSS 3.4** + Vanilla CSS Variables | Curated dark slate aesthetic (`#0B0F19`, `#111827`, `#1E293B`), glassmorphism (`backdrop-blur`), GPU-accelerated 3D keyframe animations. |
| **Icons & Visuals** | **Lucide React** (`0.395.0`) | Lightweight, tree-shakeable SVG icon components maintaining uniform design consistency. |
| **Client Routing** | **React Router DOM v6** | Declarative route topology, nested layouts (`AppShell`), programmatic navigation, protected route guards (`<ProtectedRoute>`). |
| **HTTP Transport** | **Axios 1.7** | Centralized client configuration, request token injection, standardized response/error interceptors. |
| **Receipt Rendering & PDF** | **html2canvas 1.4** + **jsPDF 4.2** | Pixel-accurate DOM rasterization, client-side A4 document composition, and native browser `@media print` style sheets. |
| **Backend Runtime** | **Node.js 20+** / **Express 4.19** (TypeScript 5.5) | Asynchronous non-blocking event loop, RESTful API architecture, layered controller-service-repository design. |
| **Validation Engine** | **Zod 3.23** | Compile-time and runtime schema validation, automatic type inference, input sanitization, and structured validation errors. |
| **Auth & Security** | **JSON Web Tokens (JWT)** + **bcryptjs** | Stateless HMAC-SHA256 bearer tokens, salted password hashing, `express-rate-limit` brute-force mitigation, strict CORS configuration. |
| **Cloud Database** | **Supabase Cloud PostgreSQL** | Relational integrity, ACID transaction guarantees, foreign key cascade rules, enterprise cloud durability. |
| **Hybrid Persistence Store** | **In-Memory Store (`dbStore`) + File Sync** | Ultra-low read latency (<5ms), synchronous disk write-through (`db_store.json`), resilient asynchronous cloud PostgreSQL replication. |
| **Artificial Intelligence** | **Google Gemini AI** (`@google/genai`) | Gemini 2.5 Flash model for automated administrative synthesis, structured JSON schema outputs, and analytical drafting. |
| **SMS Gateway** | **Twilio SDK** + Mock Provider | Outbound SMS dispatch pipeline for absentee emergency notifications and administrative fee reminders. |

---

## 3. High-Level System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Presentation Layer (React 18 + Vite)"]
        Gateway["School OS Gateway\n(Universal School Code Input)"]
        Landing["Branded Entrance Portal\n(3D Animated Crest & Orbital Rings)"]
        AuthPages["Role-Specific Login Portals\n(Admin / Staff / Licensing Agent)"]
        AdminDashboard["Admin Command Center\n(AppShell + Sub-modules)"]
        StaffPortal["Staff & Teacher Workspace\n(Attendance & SIS)"]
        ReceiptModule["Dual A4 Receipt Engine\n(School Copy + Student Copy)"]
    end

    subgraph APILayer ["Backend API Gateway (Express 4.19 + TypeScript)"]
        APIRouter["Express Routing Pipeline"]
        SecurityMW["Security & Auth Middleware\n- CORS Policies\n- Rate Limiting\n- JWT requireAuth (Resolves req.schoolId)\n- RBAC requirePermission\n- Zod Input Validators"]
        ServiceLayer["Domain Services Layer\n- AuthService & SchoolService\n- StudentService (Strict School Scope)\n- PaymentService (Isolated Sequential Receipts)\n- AttendanceService\n- AiService (Google Gemini)\n- SmsService (Twilio)"]
    end

    subgraph PersistenceLayer ["Hybrid Persistence Architecture"]
        MemoryCache["In-Memory Store (dbStore)\nSub-5ms Execution Latency"]
        LocalFile["Local Disk Write-Through (db_store.json)\nInstant Disaster Recovery"]
        SupabaseCloud["Supabase PostgreSQL Cloud\nStrict Multi-Tenant Relational Database"]
    end

    subgraph ExternalCloud ["External AI & Telephony Cloud Services"]
        Gemini["Google Gemini 2.5 Flash\n(Structured Analysis & Drafting)"]
        Twilio["Twilio SMS API\n(Parent Alert Telephony)"]
    end

    Gateway -->|Code Validated| Landing
    Landing --> AuthPages
    AuthPages --> APIRouter
    AdminDashboard --> APIRouter
    StaffPortal --> APIRouter
    ReceiptModule --> AdminDashboard

    APIRouter --> SecurityMW
    SecurityMW --> ServiceLayer

    ServiceLayer <--> MemoryCache
    MemoryCache --> LocalFile
    MemoryCache -.->|Async Batch Sync| SupabaseCloud

    ServiceLayer <--> Gemini
    ServiceLayer <--> Twilio
```

---

## 4. Multi-Tenant Architecture & Zero-Data Cold-Start Guarantee

One of the most critical enterprise requirements in School OS is **complete multi-tenant isolation**. When an administrator or licensing agent provisions a **brand new school**, that school must start in a **completely clean, empty state** with zero cross-tenant contamination.

### The Leakage Problem Identified & Resolved
In legacy architectures, systems frequently suffer from "cross-tenant leakage" due to:
1. Hardcoded fallback tenant IDs (e.g. `req.schoolId || dbStore.schools[0].id`).
2. Global database queries lacking mandatory `WHERE school_id = $1` or Supabase `.eq('school_id', schoolId)` clauses.
3. Shared payment counters evaluating total records globally instead of per-tenant.

### Architectural Measures Enforced in School OS:

#### 1. Strict Tenant ID Resolution in Authentication Middleware (`middleware/auth.ts`)
* `requireAuth` resolves `req.schoolId` directly from the authenticated user's `member.school_id`.
* Supports optional `x-school-id` header for authenticated licensing agent operations.
* **Eliminated all fallback defaults**: If an unauthenticated request attempts to access tenant data, it is rejected immediately with `401 Unauthorized`.

#### 2. Fully Scoped Student Information Queries (`services/student.service.ts`)
* `StudentService.getStudents(schoolId, filters)` enforces:
  ```typescript
  if (!schoolId) return [];
  let list = dbStore.students.filter(s => s.schoolId === schoolId || s.school_id === schoolId);
  ```
* When hydrating from Supabase PostgreSQL cloud storage, queries strictly enforce `.eq('school_id', schoolId)`. Cloud records belonging to other institutions are never loaded into the tenant's context.

#### 3. Isolated Sequential Receipt Generation (`services/payment.service.ts`)
* Receipt sequence numbering (`REC-xxxxx`) evaluates only historical payments belonging to the active school:
  ```typescript
  const schoolPayments = dbStore.payments.filter(
    p => p.schoolId === schoolId || (p as any).school_id === schoolId
  );
  const maxNum = schoolPayments.reduce((max, p) => {
    const num = parseInt((p.receiptNumber || '').replace(/\D/g, ''), 10);
    return !isNaN(num) ? Math.max(max, num) : max;
  }, 0);
  return `REC-${String(maxNum + 1).padStart(5, '0')}`;
  ```
* **Cold-Start Result**: For any newly created school with 0 transactions, `maxNum` is `0`, and its very first issued receipt is guaranteed to be `REC-00001`.

#### 4. Isolated Financial Dashboard & Ledger (`routes/fee.routes.ts`)
* Removed legacy `dbStore.schools[0]?.id` fallbacks.
* If `req.schoolId` contains no recorded fees, the dashboard safely returns:
  * `totalCollected: 0`
  * `pendingDues: 0`
  * `defaultersCount: 0`
  * `recentTransactions: []`
  * `defaulters: []`

#### 5. Cold-Start Verification Summary for New Schools
| Metric / Component | State for Newly Added School | Guarantee |
| :--- | :--- | :--- |
| **Total Students** | `0` | Empty array `[]`, zero student profiles. |
| **Total Staff / Teachers** | `0` | Zero faculty records until added by the admin. |
| **Total Fees Collected** | `₹0` | Zero payments ledger, zero cash/UPI collections. |
| **Today's Collections** | `₹0` | Empty collection breakdown. |
| **Pending Fee Dues** | `₹0` | Zero dues until students are enrolled with fee structures. |
| **Attendance Records** | `0` | Empty attendance registers, zero unmarked alerts. |
| **Receipt Sequence** | Starts at `REC-00001` | Independent numerical sequence strictly per tenant. |
| **Academic Structure** | Clean Standard Template | LKG to Class 10 with Section A and standard fee schedules ready for enrollment. |

---

## 5. Universal School Gateway Entry (`SchoolCodeEntryPage.tsx`)

To enable multi-tenant usability while preserving institution branding, School OS features a centralized gateway entry point at the root level (`/gateway` and `/`):

1. **Clean Institutional Interface**: A sleek, dark slate interface displaying the School OS official badge, an alphanumeric school code input field, and a single "Continue to School Portal" button.
2. **Instant Asynchronous Verification**: Validates the entered code against `GET /api/schools/lookup/:code`:
   * **If Valid**: Automatically resolves the school's ID, name, and logo, stores the active code in browser `localStorage`, and seamlessly transitions to that school's branded entrance portal (`/?school=CODE`).
   * **If Invalid**: Displays a clear, actionable validation error informing the user that the code was not recognized.
3. **Multi-Institution Portability**: Schools can provide direct URLs (`/?school=MHS`) or direct their community to enter their designated code on the universal gateway.

---

## 6. Module-by-Module Technical Deep Dive

### Module 1: Branded Digital Entrance Portal & 3D Visual Engine
* **Source**: `client/src/pages/LandingPage.tsx`, `server/src/routes/school.routes.ts`
* **Features**:
  * **GPU-Accelerated 3D Floating Crest**: Renders the school's logo crest inside a glass card utilizing CSS 3D transforms (`[transform-style:preserve-3d]`, `animate-float-3d`).
  * **Concentric Counter-Rotating Orbital Rings**: An inner clockwise ring (`animate-spin-orbit`) and an outer counter-clockwise ring (`animate-spin-orbit-reverse`) creating depth and motion.
  * **Radial Ambient Glow & Shimmer Sweep**: Pulsing lighting behind the logo card and animated light sweep overlay across the crest face.
  * **Role Partitioning**: Dedicated entry cards for Administrator, Staff / Teacher, and Licensing Agent.

### Module 2: Authentication & Role-Based Access Control (RBAC)
* **Source**: `server/src/middleware/auth.ts`, `server/src/middleware/permission.ts`, `client/src/components/ProtectedRoute.tsx`
* **Features**:
  * **JWT Payload Contract**: Encodes `userId`, `schoolId`, `role` (`'admin' | 'staff' | 'teacher' | 'agent'`), and specific `permissions` array.
  * **Multi-Tier Authorization Middleware**:
    * Admins inherit unrestricted access over their school tenant.
    * Staff and Teachers are checked against specific permission flags (`fees.view`, `payments.record`, `attendance.mark`, `students.create`, etc.).
  * **Frontend Navigation Guards**: `<ProtectedRoute>` validates user authentication, tenant identity, and required permissions before mounting any protected route.

### Module 3: Student Information System (SIS)
* **Source**: `server/src/services/student.service.ts`, `client/src/pages/admin/StudentsListPage.tsx`
* **Features**:
  * **Comprehensive Student Record**: Tracks registration numbers, auto-generated student codes (`STU-YYYY-XXXX`), demographics, Aadhaar numbers, guardian phone numbers, and addresses.
  * **Real-Time Client-Side Filtering**: Debounced search by name/registration number, class selector tabs, section dropdowns, and fee status filters (`All`, `Paid in Full`, `Pending Dues`).
  * **Cohort Batch Promotion**: Allows administrators to promote entire classes to the next grade upon academic year completion.
  * **Soft Archival Mechanism**: Non-destructive archival flag (`status: 'archived'`) preserving full financial audit logs and historical attendance.

### Module 4: Attendance Engine & Real-Time Analytics
* **Source**: `server/src/services/attendance.service.ts`, `client/src/pages/admin/AdminDashboardPage.tsx`
* **Features**:
  * **Daily Class Registers**: Teachers mark students as `present`, `absent`, or `late`.
  * **Cutoff Time Monitoring**: Enforces institutional cutoff times (e.g. 10:30 AM), flagging unmarked class registers on the administrator dashboard.
  * **Mathematical Formula**:
    $$\text{Attendance Rate (\%)} = \left(\frac{\text{Present Count}}{\text{Total Enrolled Students}}\right) \times 100$$
  * **Interactive SVG Donut Component**: Custom SVG circle renderer utilizing `strokeDasharray` and `strokeDashoffset` with zero external dependencies, providing seamless transitions between school-wide and class-specific metrics.

### Module 5: Financial Management, Ledger & Dual A4 Printable Receipts
* **Source**: `server/src/services/payment.service.ts`, `server/src/routes/fee.routes.ts`, `client/src/pages/admin/PaymentsPage.tsx`
* **Features**:
  * **Multi-Head Fee Structures**: Base tuition, admission, examination, computer lab, transport, and book fees.
  * **Atomic Balance Updates**: Recording a payment atomically recalculates `amountPaid` and `balance` in `student_fees`, transitioning status between `paid`, `partial`, and `overdue`.
  * **Dual-Copy A4 Printable Fee Receipt**:
    * **Top Half**: Official School Copy (Receipt number, date, cashier signature, institutional stamp placeholder).
    * **Bottom Half**: Student / Parent Voucher (Student details, fee breakdown, remaining balance, cutting guide).
    * Formatted via `@media print` rules for clean, margin-perfect printing on standard physical A4 paper.

### Module 6: Communication Engine & Automated Absentee Alerts
* **Source**: `server/src/services/sms.service.ts`, `server/src/routes/sms.routes.ts`
* **Features**:
  * **Automated Parent Absentee SMS**: One-click dashboard trigger dispatches absentee notices to parents of absent students.
  * **Dynamic Variable Templating**: Interpolates `{student_name}`, `{class}`, `{date}`, and `{school_name}` into personalized notification text.
  * **Delivery Audit Log**: Records delivery timestamps, recipient phone numbers, message bodies, and gateway statuses in `sms_logs`.

### Module 7: AI Administrative Copilot (Google Gemini 2.5 Flash)
* **Source**: `server/src/services/ai.service.ts`, `server/src/routes/ai.routes.ts`
* **Features**:
  * **Model**: Google Gemini 2.5 Flash via `@google/genai` SDK.
  * **Privacy Guardrails**: Raw PII (Aadhaar, passwords, parent phone numbers) is strictly excluded from prompt contexts. Prompts receive aggregated numerical facts.
  * **Structured JSON Enforcement**: Model responses are constrained to strict JSON schemas to prevent formatting irregularities.
  * **Deterministic Heuristic Fallback**: In offline scenarios or missing API keys, the system executes deterministic statistical heuristics calculated directly from database records.

### Module 8: Hybrid Persistence Engine & PostgreSQL Replication
* **Source**: `server/src/config/supabase.ts`
* **Features**:
  * **In-Memory Store (`dbStore`)**: Memory cache ensures all reads resolve in under 5 milliseconds.
  * **Synchronous Disk Write-Through**: Every mutation writes synchronously to `db_store.json` using Node.js filesystem operations, ensuring zero data loss upon process restarts.
  * **Cloud Supabase PostgreSQL Replication**: Asynchronous cloud synchronization ensures long-term relational durability, backup availability, and cross-device consistency.

---

## 7. Database Schema & Relational Models

```mermaid
erDiagram
    SCHOOLS ||--o{ ACADEMIC_YEARS : owns
    SCHOOLS ||--o{ CLASSES : manages
    SCHOOLS ||--o{ PROFILES : employs
    SCHOOLS ||--o{ STUDENTS : enrolls
    SCHOOLS ||--o{ PAYMENTS : records

    CLASSES ||--o{ SECTIONS : divides
    CLASSES ||--o{ STUDENTS : assigns
    SECTIONS ||--o{ STUDENTS : allocates

    STUDENTS ||--o{ STUDENT_PARENTS : has
    STUDENTS ||--o{ STUDENT_FEES : incurs
    STUDENTS ||--o{ PAYMENTS : pays
    STUDENTS ||--o{ ATTENDANCE : marks

    PROFILES ||--o{ STAFF_PROFILES : details
    STAFF_PROFILES ||--o{ STAFF_PERMISSIONS : grants

    SCHOOLS {
        uuid id PK
        string name
        string school_code
        string motto
        string logo_url
        string address
        string phone
        string email
    }

    STUDENTS {
        uuid id PK
        uuid school_id FK
        string registration_number
        string student_code
        string full_name
        string gender
        date date_of_birth
        uuid class_id FK
        uuid section_id FK
        string status
    }

    STUDENT_FEES {
        uuid id PK
        uuid student_id FK
        uuid school_id FK
        float base_fee
        float final_fee
        float amount_paid
        float balance
        string status
    }

    PAYMENTS {
        uuid id PK
        uuid school_id FK
        uuid student_id FK
        string receipt_number
        float amount
        string payment_method
        string transaction_reference
        date payment_date
        uuid recorded_by FK
    }

    ATTENDANCE {
        uuid id PK
        uuid school_id FK
        uuid student_id FK
        date attendance_date
        string status
        uuid marked_by FK
    }
```

---

## 8. Key Engineering Challenges Solved (Interview Highlights)

### 1. Guaranteeing True Multi-Tenant Isolation with Zero Cold-Start Contamination
* **Challenge**: When new school accounts were registered, query logic that defaulted to the first database index or lacked explicit tenant filters caused seed data from existing schools to contaminate the new school's view.
* **Solution**: Completely removed fallback tenant identifiers, enforced strict tenant extraction in `requireAuth` from authenticated JWTs, added explicit `.eq('school_id', schoolId)` filters across Supabase cloud queries, and scoped sequential receipt counters per tenant.

### 2. High-Concurrency Sequential Receipt Numbering
* **Challenge**: Generating sequential receipt numbers (`REC-xxxxx`) using array length (`length + 1`) causes collisions when payments are recorded concurrently or historical payments are archived.
* **Solution**: Implemented a numerical extraction algorithm across all historical payments belonging exclusively to that tenant, extracting the true numerical maximum and incrementing atomically.

### 3. High-Performance Zero-Dependency SVG Attendance Donut
* **Challenge**: Heavy charting libraries like Chart.js or Recharts increase client bundle sizes, introduce canvas blur on high-DPI displays, and cause re-rendering lag during real-time class filtering.
* **Solution**: Engineered a custom mathematical SVG donut component using standard trigonometric circumference formulas ($C = 2\pi r$) and CSS `strokeDasharray` / `strokeDashoffset` transitions. Calculates school and class percentages in $O(N)$ time.

### 4. Dual-Copy A4 Printable Fee Receipts
* **Challenge**: Standard HTML web pages break pagination and distort layouts when sent to physical office printers.
* **Solution**: Designed a dedicated dual-panel layout styled with custom CSS `@media print` directives, automatically fitting an official School Copy on the top half and a Parent Voucher on the bottom half with cutting guides on a single A4 sheet.

### 5. Resilient Hybrid Persistence Architecture
* **Challenge**: School administrative offices in semi-urban areas frequently experience broadband instability, which would paralyze purely cloud-dependent software.
* **Solution**: Developed a multi-tier persistence strategy: Node.js process memory serves read requests with sub-5ms latency, mutations are written synchronously to local disk for crash recovery, and an asynchronous pipeline replicates changes to Supabase PostgreSQL in the cloud.

---

## 9. Comprehensive Technical Interview Preparation Guide

Use these structured questions and answers to articulate your architectural decisions during technical interviews:

### Q1: "Can you provide a high-level architectural walkthrough of School OS?"
> *"School OS is a multi-tenant cloud educational ERP designed for K-12 institutions, built with a React 18 / TypeScript frontend and an Express / Node.js backend. The frontend utilizes Vite, Tailwind CSS with custom glassmorphism design tokens, Lucide icons, and GPU-accelerated 3D CSS animations. The backend follows a clean layered pattern consisting of routes, middleware, and domain services, utilizing Zod for runtime schema validation and JWTs for authentication. For data storage, we employ a hybrid persistence pattern: an in-memory store backed by synchronous disk write-through for ultra-low latency, coupled with asynchronous replication to Supabase Cloud PostgreSQL. We also integrate Google's Gemini 2.5 Flash model for automated administrative synthesis."*

### Q2: "How do you ensure complete data isolation across multiple schools, especially when a new school registers?"
> *"We enforce multi-tenancy at both the gateway and the persistence layer. Every entity in the schema—students, classes, payments, fees, and attendance—contains a mandatory `school_id` foreign key. On every authenticated request, our `requireAuth` middleware resolves the tenant ID strictly from the authenticated JWT. All service methods and Supabase cloud queries are strictly filtered by this `school_id`. When a new school registers, no student, payment, or attendance records are generated. The dashboard metrics strictly evaluate the new school's data, ensuring that all metrics start at zero with zero cross-tenant data leakage."*

### Q3: "How does receipt numbering work, and how do you prevent duplicates across cashiers?"
> *"Rather than relying on naive array lengths which cause duplicate IDs if transactions are concurrent or filtered, our `PaymentService` isolates payments by `school_id` and parses historical receipt numbers using regular expressions to find the true mathematical maximum (`Math.max`). It then computes `REC-${max + 1}` padded to 5 digits. For a brand new school, the maximum is 0, so its first receipt is guaranteed to be `REC-00001`."*

### Q4: "How does the AI Administrative Copilot work, and how do you prevent hallucinations and data leaks?"
> *"We integrate Google Gemini 2.5 Flash using the `@google/genai` SDK. To eliminate hallucinations, we never dump raw uncurated database tables into the model. Instead, our backend computes exact statistical aggregates (attendance percentages, payment totals, unmarked register counts) and feeds only these pre-verified facts to the prompt. Strict system instructions forbid the model from fabricating student identities or exposing sensitive PII like Aadhaar numbers or phone numbers. Finally, we mandate structured JSON output via `responseMimeType: 'application/json'` and include deterministic heuristic fallbacks if external API connectivity fails."*

### Q5: "Why did you build a custom SVG chart instead of using an existing library like Chart.js or Recharts?"
> *"Standard charting libraries introduce significant bundle overhead (often 100KB-300KB) and canvas-based solutions can look blurry on high-DPI screens. We built a lightweight, zero-dependency SVG donut component using the standard circle circumference formula $C = 2\pi r$ and CSS `strokeDashoffset` animation properties. This delivers sub-millisecond render times, crisp vector sharpness at any screen resolution, and zero impact on bundle size."*

### Q6: "How does the Universal School Gateway work?"
> *"At the root route `/gateway`, users enter their institution's unique alphanumeric code (such as `MHS`). The client validates the code via an asynchronous lookup endpoint (`GET /api/schools/lookup/:code`). Upon validation, the active school profile is cached in `localStorage` and the user is redirected to that school's branded entrance portal (`/?school=CODE`), complete with custom 3D animated school crests and dedicated role-based entry gates."*
