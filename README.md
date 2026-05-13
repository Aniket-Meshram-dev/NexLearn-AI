# 🎓 ICM SYSTEM (Intelligent Course Management System)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![AI](https://img.shields.io/badge/AI-Groq%20%2B%20Gemini-orange?style=for-the-badge)](https://groq.com/)

**ICM SYSTEM** (Intelligent Course Management System) is a complete, AI-native academic platform designed to revolutionize the way students learn. By leveraging Large Language Models (LLMs), interactive visualizations, and real-time progress tracking, it transforms any topic into a comprehensive, personalized learning journey.

---

## ✨ Key Features

### 🤖 Core AI Engine
- **AI Course Generator**: Instantly generate structured courses with modules, detailed notes, and exercises.
- **Smart Quizzes**: Dynamic assessment system with instant feedback, explanations, and XP rewards.
- **AI Mind Maps**: Interactive Mermaid.js diagrams that visualize complex concepts automatically.
- **Voice Mentorship**: Hands-free study mode with automated speech-to-text and text-to-speech interaction.

### 💻 Interactive Environment
- **Integrated Code Sandbox**: High-performance Monaco editor for practicing code directly within modules.
- **YouTube Integration**: Contextual video recommendations synced with course modules using `yt-search`.
- **Markdown Rendering**: Premium, readable content with syntax highlighting for all programming languages.

### 📈 Gamification & Analytics
- **Activity Heatmap**: GitHub-style study tracker to maintain learning streaks and visualize daily progress.
- **Skill Radar**: Visual growth charts showing performance across different academic domains (React-Chartjs-2).
- **Achievements & Badges**: Unlockable milestones for course completions, perfect quiz scores, and study streaks.
- **Verifiable Certificates**: Professional PDF certificates with QR code verification and digital signatures.

### 🔒 Security & Profile
- **OTP Verification**: Secure email change flow with 6-digit one-time passwords via Nodemailer.
- **Multi-Auth**: Support for both traditional credentials and Google OAuth via NextAuth.
- **Dynamic Profile**: Real-time stats, demographic details, and academic velocity tracking.

---

## 🛠️ Technical Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19, Lucide Icons, Vanilla CSS (Premium Glassmorphism) |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | PostgreSQL (Hosted on Neon.tech) |
| **ORM** | Prisma |
| **Authentication** | NextAuth.js (Credentials & Google Provider) |
| **AI SDKs** | Groq (Llama 3.1 70b), Google Generative AI (Gemini Pro) |
| **Email Service** | Nodemailer (SMTP - Gmail App Passwords) |
| **Visuals** | Chart.js 4, Mermaid.js 11 |
| **PDF** | jsPDF |
| **Editor** | Monaco Editor (@monaco-editor/react) |

---

## 🚀 Project Information Flow

1. **User Request**: User enters a topic (e.g., "Quantum Computing").
2. **AI Processing**: 
   - The `Groq/Gemini` API is prompted to generate a detailed JSON schema.
   - Content includes: Course Description, Modules, Key Points, Code Examples, and Quizzes.
3. **Database Layer**: Prisma saves the structure into the `Course` and `Module` tables.
4. **Learning Interface**: 
   - Content is rendered via `react-markdown`.
   - `Mermaid.js` renders mindmaps dynamically for complex concepts.
   - `Monaco Editor` provides a sandbox for code exercises.
5. **Evaluation**: User takes a quiz -> JSON response validated against correct answers -> Result saved.
6. **Analytics**: `UserStats` table is updated -> Heatmap and Radar charts update in real-time.
7. **Milestone**: Upon 100% completion, a PDF is generated on-the-fly with a unique verification hash.

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18.x or higher)
- npm or yarn
- A PostgreSQL database (Neon.tech recommended)

### 2. Clone the Repository
```bash
git clone https://github.com/aniket080808/ICM.git
cd ICM
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Create a `.env` file in the root directory and populate it with the following:

```env
# Database Connections
DATABASE_URL="postgresql://user:pass@ep-jolly-hall...neon.tech/neondb?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@ep-jolly-hall...neon.tech/neondb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your_random_32_char_secret"
NEXTAUTH_URL="http://localhost:3000"

# AI Engineering
GROQ_API_KEY="gsk_..."
# (Optionally Google Gemini)
GOOGLE_GENERATIVE_AI_API_KEY="..."

# Email (SMTP) Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"

# Google Authentication
GOOGLE_CLIENT_ID="142499239480-..."
GOOGLE_CLIENT_SECRET="GOCSPX-..."
```

### 5. Database Initialization
Synchronize your local Prisma schema with your Neon Database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Run the Project
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to start your journey.

---

## 🔑 Where to Get All Credentials?

| Credential | Provider | Where to find? |
| :--- | :--- | :--- |
| **DATABASE_URL** | [Neon.tech](https://neon.tech) | Dashboard -> Project -> Connection Details -> Prisma tab. |
| **GROQ_API_KEY** | [Groq Console](https://console.groq.com/) | API Keys -> Create API Key. |
| **SMTP_PASS** | [Google Account](https://myaccount.google.com/apppasswords) | Security -> App Passwords (requires 2FA). |
| **GOOGLE_CLIENT_ID** | [GCP Console](https://console.cloud.google.com/) | APIs & Services -> Credentials -> Create OAuth 2.0 Client ID. |
| **NEXTAUTH_SECRET** | Self-generated | Run `node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'` |

---

## 📂 Project Structure

- `/src/app`: Next.js App Router (Pages, Layouts, API Routes).
- `/src/components`: Reusable UI components (Dashboard, Analytics, Editor).
- `/prisma`: Schema definition and migrations.
- `/public`: Static assets and media.
- `/src/lib`: Shared utilities (AI helpers, DB clients).

---

## 📄 License
This project is licensed under the MIT License.

© 2026 ICM SYSTEM — Intelligent Course Management System
