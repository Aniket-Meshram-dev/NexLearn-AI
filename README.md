# 🎓 NexLearn — AI-Powered Intelligent Learning Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/AI-Groq%20%2B%20Gemini-orange?style=for-the-badge)](https://groq.com/)

**NexLearn** is a complete, AI-native academic platform designed to revolutionize the way students learn. By leveraging Large Language Models (LLMs), interactive visualizations, and real-time progress tracking, it transforms any topic into a comprehensive, personalized learning journey.

The repository is organized into a clean, high-performance **Unified Full-Stack Next.js 16 Monorepo**.

---

## 📂 Repository Structure

```text
NexLearn/
├── src/
│   ├── app/                    # Next.js App Router UI pages, layouts, & API routes
│   │   ├── (UI Pages)          # dashboard, course, discover, profile, settings, etc.
│   │   └── api/                # REST API route handlers
│   │       ├── ai/             # Groq & Gemini conversational mentor
│   │       ├── auth/           # NextAuth, OTPs, 2FA, & password recovery
│   │       ├── courses/        # Course generation, enrollment, & progression
│   │       ├── reports/        # Student learning analytics & graphs
│   │       ├── user/           # Profile, settings, security, & notifications
│   │       └── videos/         # YouTube academic video search
│   ├── components/             # Reusable UI components (AiMentor, Sidebar, Mermaid, etc.)
│   ├── lib/                    # Core utilities (auth, prisma, gemini, mailer)
│   └── types/                  # Shared TypeScript type definitions
├── prisma/
│   └── schema.prisma           # PostgreSQL database schema & models
├── public/                     # Static SVGs, icons, brand assets, and manifest
├── next.config.mjs             # Next.js config with security headers
├── tsconfig.json               # TypeScript compiler config (@/* -> ./src/*)
├── eslint.config.mjs           # ESLint configuration
├── setup.bat                   # 1-click Windows setup script
├── package.json                # Project dependencies & scripts
└── .env                        # Environment variables & API credentials
```

---

## ⚡ Quick Start

### 1. Setup & Installation
```bash
setup.bat
```
Or manually run:
```bash
# Install dependencies & initialize database
npm install
npx prisma db push
npx prisma generate
```

### 2. Running the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📄 License
This project is licensed under the MIT License.

© 2026 NexLearn — AI-Powered Intelligent Learning Ecosystem
