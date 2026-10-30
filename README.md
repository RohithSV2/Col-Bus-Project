# 🚌 SmartBus — Digital Bus Pass & Student Verification System

> **Tagline:** *Your bus pass, always with you.*

SmartBus is a full-stack web application designed for schools and colleges that solves the persistent issue of lost, forgotten, damaged, or stolen physical bus passes. It replaces fragile plastic passes with secure, verifiable digital bus passes featuring live anti-screenshot security tokens, instant sub-second QR code scanning for conductors, and an administrative control suite for student registration, route fleet assignment, pass renewals, and loss mitigation.

---

## 🌟 Key Features

### 🎓 1. Student Portal
- **Instant Digital Pass:** High-contrast digital transit card displaying student photo, institutional ID, assigned bus number, route, boarding stop, and validity dates.
- **Dynamic Anti-Screenshot Security:** Features a live second-by-second ticker and animated heartbeat pulse to prove authentic session activity (prevents static screenshot fraud).
- **QR Code Verification:** Contains a cryptographic, backend-validated token rather than raw sensitive personal data.
- **Route & Timetable Viewer:** Complete timeline of scheduled morning and evening stops with assigned bus numbers and driver contact info.
- **Pass Renewal Requests:** Self-service pass extension requests (30, 90, 180, 365 days) with fee receipt verification.
- **1-Click Lost Pass Lockdown:** If a physical card is lost, students can immediately flag their pass as `SUSPENDED` from their phone to prevent unauthorized travel by anyone who finds it.
- **Print / PDF Backup:** One-click printable transit badge formatted for desktop or pocket backup.

### 🚌 2. Driver / Conductor Verification Terminal
- **Instant Browser Camera Scanner:** Scans digital passes using the phone's camera (powered by `html5-qrcode`).
- **QR Screenshot / Photo Upload:** Alternative image scanning mode if camera access is restricted.
- **Clear Status Feedback:** High-impact status displays:
  - `✅ VALID` — Authorized for travel
  - `⚠️ EXPIRED` — Validity period lapsed
  - `⛔ SUSPENDED` — Card blocked (reported lost or stolen)
  - `❌ INVALID` — Forged or unregistered QR token
- **Student ID Fallback Lookup:** If a student has a flat phone battery or left their phone at home, the conductor can search by Student Institutional ID (e.g., `COL2026001`) and verify authorization on the spot.
- **Boarding Audit Logs:** Live history table tracking every scan with timestamps, boarding stop, and passenger details.
- **1-Click Test Simulator:** Built-in demo buttons to instantly test Valid, Expired, Suspended, and Fake QR codes without needing two physical phones.

### 🛡️ 3. School / College Administration Portal
- **Executive Analytics Dashboard:** Real-time KPI counters (Registered Students, Active Passes, Expired, Pending, Suspended) with interactive **Recharts** visualizations.
- **Pass Application Review:** Approve or reject applications with custom validity periods and automated student notification.
- **Pass Lifecycle Management:** Temporarily suspend compromised passes or reactivate restored cards.
- **Renewal Processing:** Review fee receipts and approve semester extensions with one click.
- **Bus Fleet & Route Master:** Register new bus routes, manage vehicle numbers, define stop sequences, and monitor passenger capacity utilization.
- **Incident Resolution Center:** Track student-reported lost card incidents and reissue replacement digital passes.
- **Student Directory:** Search student records and toggle account activation status.
- **Comprehensive Audit Trail:** Exportable verification history of all conductor scans.

---

## 🏗️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS v4, Lucide React, Axios |
| **QR Engine** | `qrcode.react` (SVG generation), `html5-qrcode` (high-speed camera & image scanner) |
| **Data Analytics** | `recharts` (Route capacity bar charts, Scan outcome donut charts) |
| **Backend API** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB / Mongoose with built-in resilient in-memory fallback for offline testing |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing, HTTP-only secure cookies |
| **Security** | Helmet security headers, Express Rate Limiting, Role-Based Access Control (RBAC) |

---

## ⚡ Quick Start & Demonstration

### Prerequisites
- Node.js (v18 or higher recommended)
- Git

### 1. Clone or Open in VS Code
```bash
cd "d:\Smart bus passes"
```

### 2. Start the Backend Server
Open a terminal in VS Code:
```bash
cd server
npm install
npm run dev
```
*The backend API will start on `http://localhost:5000`.*
*(Health check: `http://localhost:5000/api/health`)*

### 3. Start the Frontend Client
Open a second terminal in VS Code:
```bash
cd client
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🔑 Preloaded Demo Accounts

The system comes pre-seeded with realistic institutional scenarios. You can log in using these credentials or click the **"Demo Switcher"** button in the navbar for 1-click access:

| Role | Name | Email / Student ID | Password | Scenario / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Prof. Vikram Singhania | `admin@smartbus.edu` | `Admin@123` | Full administrative control, analytics, pass approvals |
| **Conductor** | Sanjay Deshmukh | `conductor@smartbus.edu` | `Conductor@123` | Mobile QR scanner terminal & ID lookup |
| **Student** | Rahul Kumar | `rahul@college.edu` (`COL2026001`) | `Student@123` | **Active Pass** (`PASS-A8X72K`), Route 1 |
| **Student** | Arjun Reddy | `arjun@college.edu` (`COL2026003`) | `Student@123` | **Expired Pass** (`PASS-C5Q31T`), demonstrates renewal |
| **Student** | Priya Nair | `priya@college.edu` (`COL2026004`) | `Student@123` | **Suspended Pass** (`PASS-D9L82Z`), reported lost card |
| **Student** | Ananya Iyer | `ananya@college.edu` (`COL2026002`) | `Student@123` | **Pending Pass** (`PASS-B2M94W`), awaiting approval |

---

## 📁 Project Structure

```text
Smart bus passes/
├── package.json               # Root convenience scripts
├── README.md                  # Project documentation & manual
├── client/                    # React + Vite Frontend
│   ├── .env                   # Frontend API endpoint config
│   ├── vite.config.js         # Vite configuration with proxy
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                  # Header with demo switcher & notifications
│   │   │   ├── DigitalPassCard.jsx         # Live digital pass with anti-screenshot ticker
│   │   │   ├── QRScannerComponent.jsx      # Live camera & upload QR scanner
│   │   │   ├── VerificationResultModal.jsx # Instant VALID/INVALID status modal
│   │   │   └── ProtectedRoute.jsx          # Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx             # Authentication and session state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx             # Public portal & feature overview
│   │   │   ├── LoginPage.jsx               # Sign in with 1-click presets
│   │   │   ├── RegisterPage.jsx            # Student registration with route selection
│   │   │   ├── StudentDashboard.jsx        # Pass card, stops timetable, renewals & issue reports
│   │   │   ├── ConductorDashboard.jsx      # Scanner, ID search & boarding logs
│   │   │   └── AdminDashboard.jsx          # Analytics, fleet management & approvals
│   │   ├── lib/
│   │   │   └── api.js                      # Axios instance with interceptors
│   │   ├── App.jsx                         # Main router configuration
│   │   └── index.css                       # Tailwind CSS stylesheet
└── server/                    # Node.js + Express Backend
    ├── .env                   # Environment secrets (PORT, JWT_SECRET, MONGODB_URI)
    ├── server.js              # Server entry point & middleware pipeline
    ├── src/
    │   ├── db.js              # Dual-mode resilient storage (MongoDB + In-Memory/Disk)
    │   ├── data/
    │   │   └── initialData.js # Pre-seeded institutional routes, passes & users
    │   ├── models/            # Mongoose Schemas (User, BusPass, Route, Renewal, Issue, Log)
    │   ├── middleware/        # JWT verification & role authorization
    │   ├── controllers/       # Auth, Pass, Conductor, Admin, Route, Notification logic
    │   └── routes/            # Express route endpoints
    └── scripts/
        └── seed.js            # Standalone seed utility
```

---

## 🔒 Security Architecture

1. **Tokenized QR Verification:** QR codes encode a unique verification token (`TOK-SEC-...`), not raw sensitive student records. The backend validates the pass against the live database during each scan.
2. **Protection Against Forged Screenshots:** The digital pass includes a live seconds ticker synchronized with system time, visually indicating to the bus conductor that the pass is being rendered inside an active session.
3. **Immediate Lost Pass Lockdown:** If a physical or digital pass is compromised, the student can toggle suspension, ensuring subsequent scans flag the pass as `SUSPENDED`.
4. **Role-Based Access Control (RBAC):** Distinct permission levels prevent students from accessing administrative routes or conductor tools.
5. **Secure Authentication:** Passwords hashed with `bcryptjs` (salt rounds: 10), tokens delivered via HTTP-only cookies and Authorization headers.

---

## 🚀 Deployment Guide

### Deploying the Frontend (Vercel)
1. Push the code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com).
3. Set the Root Directory to `client`.
4. Add environment variable: `VITE_API_URL=https://your-backend-domain.com/api`.
5. Deploy.

### Deploying the Backend (Render / Railway)
1. Set the Root Directory to `server`.
2. Set Build Command: `npm install`.
3. Set Start Command: `npm start`.
4. Configure environment variables in the host dashboard:
   - `PORT=5000`
   - `CLIENT_URL=https://your-frontend-domain.vercel.app`
   - `JWT_SECRET=your_production_secret_key`
   - `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smartbus?retryWrites=true&w=majority`
