# 🎓 NexLearn — AI-Powered Intelligent Learning Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/AI-Groq%20%2B%20Gemini-orange?style=for-the-badge)](https://groq.com/)

**NexLearn** is a complete, AI-native academic platform designed to revolutionize the way students learn. By leveraging Large Language Models (LLMs), interactive visualizations, and real-time progress tracking, it transforms any topic into a comprehensive, personalized learning journey.

The repository is organized into a clean decoupled architecture featuring two primary directories: **`FRONTEND`** and **`BACKEND`**.

---

## 📂 Repository Structure

```text
NexLearn/
├── FRONTEND/                       # All client-side UI files & assets
│   ├── public/                     # Static SVGs, icons, and assets
│   ├── src/
│   │   ├── app/                    # Next.js App Router UI pages & layouts
│   │   │   ├── achievements/       # Achievements & badges page
│   │   │   ├── auth/2fa/           # 2-Factor Authentication page
│   │   │   ├── bookmarks/          # Bookmarked modules page
│   │   │   ├── certificate/[id]/   # Verifiable PDF Certificate page
│   │   │   ├── course/[id]/        # Course view & module study pages
│   │   │   ├── dashboard/          # Student dashboard & course management
│   │   │   ├── discover/           # Course discovery & catalog
│   │   │   ├── forgot-password/    # Password recovery flow
│   │   │   ├── generate/           # AI course generation wizard
│   │   │   ├── login/              # Sign-in page
│   │   │   ├── notifications/      # Notifications inbox
│   │   │   ├── profile/            # User profile & statistics
│   │   │   ├── register/           # Registration page
│   │   │   ├── reports/            # Progress reports & analytics
│   │   │   ├── settings/           # Account & security settings
│   │   │   ├── verify-account/     # Account OTP verification page
│   │   │   ├── globals.css         # Global design system & theme CSS
│   │   │   ├── layout.js           # Root layout & providers
│   │   │   └── page.js             # Landing page
│   │   └── components/             # Reusable UI components
│   │       ├── AiMentor.js         # Voice & text AI mentor popup
│   │       ├── AppLayout.js        # Authenticated app shell layout
│   │       ├── Header.js           # Top navbar with user status & notifications
│   │       ├── Mermaid.js          # Interactive concept mindmap renderer
│   │       ├── SessionProvider.js  # NextAuth client session provider
│   │       ├── Sidebar.js          # Navigation sidebar
│   │       └── ThemeProvider.js    # Dark/light theme manager
│   ├── next.config.mjs             # Next.js config with reverse-proxy rewrites to BACKEND
│   ├── jsconfig.json               # Path aliases (@/* -> ./src/*)
│   ├── eslint.config.mjs           # ESLint configuration
│   └── package.json                # Frontend dependencies & scripts
│
├── BACKEND/                        # All server-side, API, database & AI files
│   ├── prisma/
│   │   └── schema.prisma           # PostgreSQL database schema & models
│   ├── src/
│   │   ├── app/api/                # 29 REST API route handlers
│   │   │   ├── ai/                 # AI mentorship chat endpoints
│   │   │   ├── auth/               # NextAuth, registration, OTP & 2FA endpoints
│   │   │   ├── courses/            # Course creation, study modules, quizzes, flashcards
│   │   │   ├── reports/            # Analytics & reports endpoints
│   │   │   ├── user/               # Profile, stats, bookmarks, notifications, security
│   │   │   └── videos/             # YouTube video recommendations search
│   │   └── lib/                    # Core backend libraries & services
│   │       ├── auth.ts             # NextAuth options, credentials & Google provider
│   │       ├── gemini.ts           # Groq & Google Gemini AI generation pipelines
│   │       ├── mailer.ts           # Brevo (Sendinblue) transactional email service
│   │       └── prisma.ts           # Prisma client singleton
│   ├── next.config.mjs             # Backend server configuration
│   ├── tsconfig.json               # TypeScript path aliases (@/* -> ./src/*)
│   ├── .env.example                # Example backend environment variables
│   └── package.json                # Backend dependencies & scripts
│
├── .gitignore                      # Git ignore rules for both FRONTEND & BACKEND
├── package.json                    # Monorepo orchestrator scripts (run both with 1 command)
├── setup.bat                       # Automated setup script
└── README.md                       # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.x or higher)
- npm or yarn
- PostgreSQL database (e.g. Neon.tech)

### 2. Clone the Repository
```bash
git clone https://github.com/Aniket-Meshram-dev/NexLearn-AI.git
cd NexLearn-AI
```

### 3. Environment Configuration
Create a `.env` file in the **`BACKEND/`** directory:
```bash
cp BACKEND/.env.example BACKEND/.env
```

Populate `BACKEND/.env` with your credentials:
```env
# Database Connections
DATABASE_URL="postgresql://user:pass@ep-jolly-hall...neon.tech/neondb?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@ep-jolly-hall...neon.tech/neondb?sslmode=require"

# NextAuth Configuration (Point to frontend port where browser navigates)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_random_32_char_secret"

# AI Services
GROQ_API_KEY="gsk_..."
GOOGLE_GENERATIVE_AI_API_KEY="..."

# Brevo (Sendinblue) Email Service
BREVO_API_KEY="xkeysib-..."
BREVO_SENDER_EMAIL="your-verified-email@domain.com"
BREVO_SENDER_NAME="NexLearn"

# Google Authentication
GOOGLE_CLIENT_ID="142499239480-..."
GOOGLE_CLIENT_SECRET="GOCSPX-..."
```

### 3. Automated Setup
On Windows, you can simply run:
```bash
setup.bat
```
Or manually run:
```bash
# Install backend dependencies & sync database
cd BACKEND
npm install
npx prisma db push
npx prisma generate
cd ..

# Install frontend dependencies
cd FRONTEND
npm install
cd ..

# Install root runner
npm install
```

### 4. Running the Application

#### Option A: Run Both Simultaneously (Recommended)
From the root directory, run:
```bash
npm run dev
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:5000](http://localhost:5000)

#### Option B: Run Individually in Separate Terminals
```bash
# Terminal 1: Start Backend API (Port 5000)
cd BACKEND
npm run dev

# Terminal 2: Start Frontend UI (Port 3000)
cd FRONTEND
npm run dev
```

---

## 🔄 How FRONTEND and BACKEND Communicate

- **Seamless Proxying**: The frontend's `next.config.mjs` has configured `rewrites()` that automatically proxy all `/api/*` calls from `http://localhost:3000/api/*` to `http://localhost:5000/api/*`.
- **Zero CORS Issues**: Because requests originate on `localhost:3000` and are forwarded server-side, cookies (`next-auth.session-token`) and headers pass smoothly between client and server.
- **Independence**: Both can be scaled, deployed, or modified independently.

---

## 📄 License
This project is licensed under the MIT License.

© 2026 NexLearn — AI-Powered Intelligent Learning Ecosystem
