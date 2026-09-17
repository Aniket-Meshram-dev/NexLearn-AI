<div align="center">

<img src="./docs/screenshots/01-landing-hero.png" width="100%" alt="NexLearn AI Autonomous Learning Ecosystem Banner" style="border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6);" />

<br/>

<a href="https://nexlearn-ai-tan.vercel.app/"><img src="https://img.shields.io/badge/🚀_LIVE_PLATFORM-nexlearn--ai--tan.vercel.app-4F46E5?style=for-the-badge&labelColor=030712" /></a>
<a href="https://github.com/Aniket-Meshram-dev/NexLearn-AI/stargazers"><img src="https://img.shields.io/github/stars/Aniket-Meshram-dev/NexLearn-AI?style=for-the-badge&color=F59E0B&labelColor=030712&logo=github" /></a>
<a href="./LICENSE"><img src="https://img.shields.io/badge/LICENSE-MIT-10B981?style=for-the-badge&labelColor=030712" /></a>
<a href="https://github.com/Aniket-Meshram-dev/NexLearn-AI/issues"><img src="https://img.shields.io/badge/PRs-welcome-6366F1?style=for-the-badge&labelColor=030712" /></a>

<br/><br/>

> **NexLearn AI** is an institutional-grade, full-stack autonomous learning platform and adaptive academic ecosystem. Built with a unified **Next.js 16 (Turbopack) & React 19** architecture, it transforms any career goal or complex topic into an interactive, multi-dimensional curriculum in seconds. Powered by dual-engine AI cascades (**Groq LPU Llama 3.3 70B & Google Gemini**), NexLearn features zero-hallucination structured syllabus synthesis, Socratic AI voice mentors, interactive Monaco code sandboxes, visual concept mindmaps (ELK.js + React Flow), adaptive quiz engines, SuperMemo SM-2 spaced repetition memory decks, deep Chart.js academic telemetry, and cryptographically verifiable academic credentials with dynamic QR code authentication.

<br/>

![Tech Stack](https://skillicons.dev/icons?i=nextjs,react,ts,postgres,prisma,nodejs,docker,cloudflare,tailwind&theme=dark)

<br/>

**[🌐 Live Platform](#-live-demo--testing-credentials) · [✨ Key Features](#-key-features) · [🏗️ Architecture](#️-system-architecture) · [🧠 AI Pipelines](#-ai-multi-model-cascade--curriculum-engine) · [📊 Academic Analytics](#-academic-telemetry--learning-analytics-engine) · [📜 Verifiable Credentials](#-cryptographic-verifiable-credentials--anti-fraud-registry) · [📡 API Docs](#-api-documentation) · [🚀 Local Setup](#-installation--local-setup) · [🐛 Report Bug](https://github.com/Aniket-Meshram-dev/NexLearn-AI/issues)**

</div>

---

## 🌐 Live Demo & Testing Credentials

<div align="center">

### 🔗 [**nexlearn-ai-tan.vercel.app**](https://nexlearn-ai-tan.vercel.app/)

*Production Deployment on Vercel Serverless · Neon Serverless PostgreSQL with Connection Pooling.*

</div>

| Role / Persona | Demo Email | Password | Access Scope & Pre-Loaded Data |
|---|---|---|---|
| 🎓 **Primary Scholar (Demo)** | `aniketmeshram445@gmail.com` | `Aniket123@` | **Full Platform Access**: Pre-enrolled in 3 complete courses (*Java Programming, Autonomous AI Agents with LangChain/LangGraph, Cloud Computing*), 36 modules, 7 unlocked achievements, 12 study telemetry sessions, 16 SM-2 flashcard reviews, and a 98.4% A+ Verifiable Academic Certificate (`NXL-JAVA-2026`). |
| 🚀 **Self-Paced Explorer** | Any email or 1-Click Registration | *Auto-authenticated* | Create custom AI courses on any topic, run Monaco code sandboxes, review flashcards, test adaptive quizzes, and earn personalized graduation certificates. |

> [!TIP]
> **Recommended Evaluator Flow**: Log in using `aniketmeshram445@gmail.com` to immediately inspect the live **Dashboard** telemetry, dive into the **Intermediate Java Course Roadmap**, explore the **Immersive Learning Room** with interactive Monaco code execution, switch to the **Concept Mindmap**, test the **SM-2 Flashcards Deck**, and verify the **Official Certificate** registry (`/certificate/NXL-JAVA-2026`).

---

## 🎬 Comprehensive Video Walkthrough (End-to-End Demo)

<div align="center">

https://github.com/user-attachments/assets/bdeef27f-4f4d-4823-b646-1ef29ecb537e

<br/>

<sub>▶️ <b>Watch the comprehensive 1080p full-platform video walkthrough above (4 min 14 sec)</b> covering every single page with full-depth top-to-bottom scrolling: Marketing Landing Page full scroll, Register onboarding portal, Glassmorphic Login authentication, Student Learning Command Center (active courses, streak counters, study distribution), Autonomous AI Course Generator Studio, Course Curriculum Roadmap, Immersive Learning Room with live Monaco code editor & interactive ELK.js Concept Mindmap, Global Course Discovery Catalog, SuperMemo SM-2 Spaced Repetition Flashcards Deck (with 3D card flip), Saved Bookmarks & Quick Notes, Gamification Vault & Milestone Trophies, Official Credential Verification Registry, Cryptographic Verifiable Academic Certificate, Academic Telemetry & Reports, Student Profile, and Security Settings Vault.</sub>

<br/>

<sub>📁 <b>Direct Media Files:</b> <a href="./docs/videos/nexlearn-walkthrough.mp4"><code>docs/videos/nexlearn-walkthrough.mp4</code></a> (1080p MP4 · 42.3 MB) · <a href="./docs/videos/nexlearn-walkthrough.webm"><code>docs/videos/nexlearn-walkthrough.webm</code></a> (1080p WebM · 22.5 MB)</sub>

</div>

---

## 📸 Product Walkthrough & Interface Gallery

<div align="center">

<img src="./docs/screenshots/03-dashboard.png" width="96%" alt="NexLearn AI Student Learning Command Center" style="border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);"/>

<sub><b>Figure 1 — Multi-Dimensional Student Command Center:</b> Real-time learning streak tracker, daily study time targets, course progress rings, weekly learning activity telemetry, quick-resume action launcher, and floating Socratic AI Mentor assistant.</sub>

<br/><br/>

<table>
<tr>
<td width="50%" align="center">
<img src="./docs/screenshots/01-landing-hero.png" width="100%" alt="NexLearn AI Landing Page" style="border-radius: 6px;"/>
<br/>
<b>🌐 Marketing Landing & Course Generator Preview</b><br/>
<sub>Interactive AI course generator preview, dynamic learning statistics, responsive feature grid, and live testimonials</sub>
</td>
<td width="50%" align="center">
<img src="./docs/screenshots/02-auth-login.png" width="100%" alt="Glassmorphic Authentication Portal" style="border-radius: 6px;"/>
<br/>
<b>🔐 Glassmorphic Authentication & Onboarding</b><br/>
<sub>Stateless JWT NextAuth sessions, bcrypt credentials authentication, Google OAuth 2.0, and optional Brevo 2FA OTPs</sub>
</td>
</tr>
<tr>
<td width="50%" align="center">
<img src="./docs/screenshots/04-course-generator.png" width="100%" alt="Autonomous Course Generator Studio" style="border-radius: 6px;"/>
<br/>
<b>⚡ Autonomous Course Generator Studio</b><br/>
<sub>Custom topic prompt, proficiency level (Beginner/Intermediate/Advanced), daily study hours, duration, and target career goal</sub>
</td>
<td width="50%" align="center">
<img src="./docs/screenshots/05-course-curriculum.png" width="100%" alt="Course Curriculum & Roadmap" style="border-radius: 6px;"/>
<br/>
<b>🗺️ Course Curriculum & Knowledge Architecture</b><br/>
<sub>Interactive syllabus timeline, module completion rings, subtopic previews, difficulty badges, and academic study guide export</sub>
</td>
</tr>
<tr>
<td width="50%" align="center">
<img src="./docs/screenshots/06-learning-module.png" width="100%" alt="Immersive Learning Room" style="border-radius: 6px;"/>
<br/>
<b>📖 Immersive Learning Room & Code Sandbox</b><br/>
<sub>Comprehensive theory notes, live Monaco code editor, executable examples, exercises, YouTube references, and AI audio narration</sub>
</td>
<td width="50%" align="center">
<img src="./docs/screenshots/07-concept-mindmap.png" width="100%" alt="Interactive Concept Mindmap" style="border-radius: 6px;"/>
<br/>
<b>🧠 Interactive Concept Mindmap & Knowledge Graph</b><br/>
<sub>Hierarchical concept visualization powered by ELK.js and React Flow with zoom, pan, subtopic expansion, and mastery tracking</sub>
</td>
</tr>
<tr>
<td width="50%" align="center">
<img src="./docs/screenshots/08-quiz-assessment.png" width="100%" alt="Adaptive Quiz Assessment Engine" style="border-radius: 6px;"/>
<br/>
<b>📝 Adaptive Assessment & Timed Quiz Engine</b><br/>
<sub>Real-time question timer, multi-option answer selection, instant answer feedback, and comprehensive conceptual explanations</sub>
</td>
<td width="50%" align="center">
<img src="./docs/screenshots/09-quiz-result.png" width="100%" alt="Quiz Result & Mastery Score" style="border-radius: 6px;"/>
<br/>
<b>🏆 Mastery Score & Performance Breakdown</b><br/>
<sub>Circular mastery score visualization, time-taken metrics, question-by-question rationale analysis, and XP rewards</sub>
</td>
</tr>
<tr>
<td width="50%" align="center">
<img src="./docs/screenshots/10-flashcards-deck.png" width="100%" alt="Spaced Repetition Flashcards Deck" style="border-radius: 6px;"/>
<br/>
<b>🗂️ SuperMemo SM-2 Spaced Repetition Deck</b><br/>
<sub>3D card flipping, memory interval adjustment (Hard/Good/Easy), repetition counters, and due-date scheduling</sub>
</td>
<td width="50%" align="center">
<img src="./docs/screenshots/11-academic-analytics.png" width="100%" alt="Student Academic Analytics & Telemetry" style="border-radius: 6px;"/>
<br/>
<b>📊 Academic Telemetry & Study Habit Analytics</b><br/>
<sub>Weekly study duration distribution, subject mastery radar, completion velocity, study session logs, and PDF export</sub>
</td>
</tr>
<tr>
<td width="50%" align="center">
<img src="./docs/screenshots/12-achievements-trophies.png" width="100%" alt="Gamification Vault & Achievements Showcase" style="border-radius: 6px;"/>
<br/>
<b>🏅 Gamification Vault & Milestone Badges</b><br/>
<sub>Category-based achievements (*First Spark, Quiz Initiate, Flawless, Module Maniac, Lightning Thinker, Course Conqueror*)</sub>
</td>
<td width="50%" align="center">
<img src="./docs/screenshots/13-verifiable-certificate.png" width="100%" alt="Cryptographic Verifiable Academic Certificate" style="border-radius: 6px;"/>
<br/>
<b>📜 Cryptographic Verifiable Academic Certificate</b><br/>
<sub>Tamper-evident verification registry, unique credential ID, dynamic QR code scanner, PDF download, and 1-click LinkedIn badge</sub>
</td>
</tr>
<tr>
<td width="50%" align="center">
<img src="./docs/screenshots/14-discover-catalog.png" width="100%" alt="Public Course Discovery Catalog" style="border-radius: 6px;"/>
<br/>
<b>🔍 Global Course Discovery & Community Hub</b><br/>
<sub>Public course explorer with search, topic filtering, difficulty levels, enrollment count, and 1-click syllabus cloning</sub>
</td>
<td width="50%" align="center">
<img src="./docs/screenshots/15-user-profile.png" width="100%" alt="Student Profile & Academic Preferences" style="border-radius: 6px;"/>
<br/>
<b>👤 Student Profile & Academic Preference Center</b><br/>
<sub>Education level, career aspirations, bio, geographic localization, and personalized learning path configuration</sub>
</td>
</tr>
<tr>
<td width="50%" align="center">
<img src="./docs/screenshots/16-settings-security.png" width="100%" alt="Security & Settings Vault" style="border-radius: 6px;"/>
<br/>
<b>🛡️ Account Security & 2FA Configuration</b><br/>
<sub>Two-Factor Authentication (2FA) toggle, password reset workflows, active session management, and notification toggles</sub>
</td>
<td width="50%" align="center">
<img src="./docs/screenshots/06-learning-module.png" width="100%" alt="Full Learning Workspace" style="border-radius: 6px;"/>
<br/>
<b>🎙️ Multi-Modal Learning (Audio Briefings & AI Mentor)</b><br/>
<sub>Conversational Socratic AI tutor with personas (Socratic, Academic, Code Explainer) and speech synthesis briefings</sub>
</td>
</tr>
</table>

<sub><b>Figure 2 — Multi-Modal Academic Architecture:</b> From zero-shot autonomous curriculum synthesis to deep spaced repetition recall and cryptographically verifiable graduation credentials.</sub>

</div>

---

## 📑 Table of Contents

<details open>
<summary><b>Click to expand full navigation</b></summary>

- [💡 Why I Built NexLearn AI](#-why-i-built-nexlearn-ai)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🧠 AI Multi-Model Cascade & Curriculum Engine](#-ai-multi-model-cascade--curriculum-engine)
- [🗺️ Mind Maps & Interactive Knowledge Workflows](#️-mind-maps--interactive-knowledge-workflows)
- [🔁 Spaced Repetition (SM-2) Memory Engine](#-spaced-repetition-sm-2-memory-engine)
- [📜 Cryptographic Verifiable Credentials & Registry](#-cryptographic-verifiable-credentials--anti-fraud-registry)
- [💻 Full Tech Stack Matrix](#-full-tech-stack-matrix)
- [📂 Project Directory Structure](#-project-directory-structure)
- [🗄️ Database Schema & Storage Architecture](#️-database-schema--storage-architecture)
- [📡 API Documentation](#-api-documentation)
- [🔐 Environment Variables](#-environment-variables)
- [🚀 Installation & Local Setup](#-installation--local-setup)
- [🚢 Production Deployment Guide](#-production-deployment-guide)
- [🛡️ Security, Privacy & Guard Architecture](#️-security-privacy--guard-architecture)
- [🧠 Challenges Faced & Engineering Learnings](#-challenges-faced--engineering-learnings)
- [🗺️ Future Improvements & Roadmap](#️-future-improvements--roadmap)
- [👤 Author & Contact](#-author--contact)
- [📄 License](#-license)

</details>

---

## 💡 Why I Built NexLearn AI

Modern online education and traditional EdTech platforms suffer from five fatal architectural flaws:

1. **Static, One-Size-Fits-All Syllabi**: Pre-recorded video courses on Udemy, Coursera, or YouTube are rigid. When a student enters with existing background in algorithms but lacks familiarity with concurrency, they are forced through linear 40-hour video playlists with no dynamic pacing or topic customization.
2. **The "Illusion of Competence" in Passive Video Consumption**: Watching someone else write code or explain thermodynamics gives learners the illusion of mastery without active recall. Without immediate coding sandboxes and adaptive quizzes, knowledge decay begins within 24 hours.
3. **Fragmented Tooling Ecosystem**: Learners are forced to juggle ChatGPT for explanations, YouTube for tutorials, LeetCode or VS Code for practice, Quizlet or Anki for flashcards, and Notion for notes. This context switching destroys cognitive focus and breaks study flow.
4. **Lack of Scientifically Structured Retention**: Cramming before an exam or interview leads to rapid forgetting. Very few modern platforms integrate mathematical **Spaced Repetition Algorithms (SuperMemo SM-2)** into their core course lifecycle.
5. **Unverifiable Certificates & Educational Fraud**: Traditional PDF certificates are trivial to manipulate using Photoshop or inspect element, rendering online credentials questionable to employers.

**NexLearn AI** was engineered from first principles to solve this. It provides a unified, full-stack intelligent learning ecosystem:
- Enter any career goal or niche topic, and the **AI Curriculum Engine** synthesizes a topologically sorted, comprehensive multi-module syllabus.
- Every module includes structured theoretical notes, executable **Monaco Code Editors**, an on-demand **Socratic AI Mentor**, and auto-generated **Concept Mindmaps**.
- The platform enforces active recall with **Adaptive Quizzes** and schedule-optimized **SM-2 Spaced Repetition Flashcards**.
- Upon course completion, the system issues a **Cryptographic Verifiable Academic Certificate** backed by a public verification registry and dynamic QR codes.

---

## ✨ Key Features

<table>
<tr><th width="4%">#</th><th width="28%">Feature Module</th><th>Technical Capabilities & Implementation Details</th></tr>

<tr>
<td align="center">1️⃣</td>
<td><b>Autonomous Course Generation</b><br/><sub>Dual LLM Cascade · Zod Validation</sub></td>
<td>Zero-shot end-to-end curriculum generation from any prompt. Utilizes Groq LPU (Llama 3.3 70B) for sub-second streaming with automatic Google Gemini 1.5/2.0 Flash fallbacks. Enforces strict Zod schema validation to eliminate JSON corruption and generates multi-module roadmaps with subtopics, time budgets, and difficulty curves.</td>
</tr>

<tr>
<td align="center">2️⃣</td>
<td><b>Interactive Knowledge Roadmap</b><br/><sub>Visual Timeline · Mastery Tracker</sub></td>
<td>Dynamic curriculum hierarchy with interactive module cards, completion indicators, mastery percentages, and study guide PDF generation. Automatically tracks student progression through prerequisite nodes and dynamically unlocks subsequent modules.</td>
</tr>

<tr>
<td align="center">3️⃣</td>
<td><b>Immersive Learning Room</b><br/><sub>Monaco Editor · Multi-Tab Workspace</sub></td>
<td>Comprehensive learning sanctuary featuring paginated theory notes, live syntax-highlighted Monaco code editor with multi-language execution simulation, real-time code output terminal, copyable code snippets, bookmarking, and integrated YouTube academic references.</td>
</tr>

<tr>
<td align="center">4️⃣</td>
<td><b>Interactive Concept Mindmap</b><br/><sub>ELK.js Layout · React Flow</sub></td>
<td>Visual concept relationship graphs synthesized directly from module theory. Uses ELK.js for automatic hierarchical node positioning and React Flow for interactive zooming, panning, drag-and-drop exploration, subtopic expansion, and concept mastery tracking.</td>
</tr>

<tr>
<td align="center">5️⃣</td>
<td><b>Socratic AI Conversational Mentor</b><br/><sub>Custom Personas · Context Aware</sub></td>
<td>Real-time floating academic copilot with selectable pedagogical personas: <i>Socratic Tutor</i> (guides via inquiry without giving away answers), <i>Academic Professor</i> (deep theoretical rigor), <i>Eli5 Explainer</i> (simple intuitive analogies), and <i>Code Architect</i> (clean architecture & debugging).</td>
</tr>

<tr>
<td align="center">6️⃣</td>
<td><b>AI Audio Briefing Engine</b><br/><sub>Speech Synthesis · Audio Podcasts</sub></td>
<td>Converts module lesson notes into natural academic audio briefings and podcast-style overviews. Enables auditory learners to listen to chapter summaries, key principles, and conceptual walk-throughs directly in-browser.</td>
</tr>

<tr>
<td align="center">7️⃣</td>
<td><b>Adaptive Assessment & Quiz Engine</b><br/><sub>Timed Execution · Instant Feedback</sub></td>
<td>Real-time timed quizzes dynamically generated per module. Features multiple-choice questions with random option shuffling, real-time countdown timer, instant correctness feedback, detailed answer rationales, and automatic XP scoring.</td>
</tr>

<tr>
<td align="center">8️⃣</td>
<td><b>SM-2 Spaced Repetition Flashcards</b><br/><sub>Ebbinghaus Forgetting Curve</sub></td>
<td>Mathematical implementation of the SuperMemo SM-2 spaced repetition algorithm. Calculates memory intervals, repetitions, and ease factors based on student feedback (<i>Again, Hard, Good, Easy</i>) to schedule flashcards for optimal long-term memory consolidation.</td>
</tr>

<tr>
<td align="center">9️⃣</td>
<td><b>Academic Telemetry & Analytics</b><br/><sub>Chart.js Visualizations · Study Sessions</sub></td>
<td>Comprehensive analytics suite tracking study duration, daily streaks, module completion velocity, and subject mastery radar charts. Computes weekly study hour distributions and generates downloadable academic performance PDF transcripts.</td>
</tr>

<tr>
<td align="center">🔟</td>
<td><b>Gamification Vault & Achievements</b><br/><sub>XP System · Milestone Badges</sub></td>
<td>Dynamic reward engine with 7+ unlockable milestone badges (*First Spark, Quiz Initiate, Flawless, Module Maniac, Lightning Thinker, Course Conqueror, Quiz Sharpshooter*). Automatically evaluates achievement triggers upon quiz completion and module graduation.</td>
</tr>

<tr>
<td align="center">1️⃣1️⃣</td>
<td><b>Verifiable Academic Credentials</b><br/><sub>Anti-Fraud Registry · Dynamic QR</sub></td>
<td>Generates permanent, tamper-evident graduation certificates featuring cryptographic registry IDs (`NXL-XXXX-XXXX`), dynamic QR codes deep-linking to the live verification registry, recipient grade verification, PDF downloads, and 1-click LinkedIn Add to Profile integration.</td>
</tr>

<tr>
<td align="center">1️⃣2️⃣</td>
<td><b>Course Discovery & Community Hub</b><br/><sub>Public Catalog · 1-Click Fork</sub></td>
<td>Public course marketplace allowing students to browse community-generated courses, search across subjects, filter by difficulty (Beginner/Intermediate/Advanced), and enroll or clone custom curricula into their personal dashboard with one click.</td>
</tr>

</table>

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["🖥️ Client Layer - Next.js 16 & React 19"]
        UI["Modern UI / Responsive Glassmorphic Layout"]
        Monaco["Monaco Code Editor Sandbox"]
        ReactFlow["React Flow + ELK.js Mindmap Engine"]
        Charts["Chart.js Academic Telemetry"]
        MentorOrb["Floating Socratic AI Mentor"]
        AuthClient["NextAuth Session Provider"]
    end

    subgraph EdgeSecurity ["🌐 Edge Gateway & Security Middleware"]
        EdgeProxy["Edge CDN & Turbopack Dev Server"]
        NextMiddleware["Next.js Route Middleware - middleware.ts"]
        RateLimiter["Upstash Redis Sliding-Window Rate Limiter"]
        SecurityHeaders["Strict CSP, CORS, HSTS, X-Frame DENY"]
    end

    subgraph ServerAPIs ["⚙️ Next.js 16 App Router & REST API Handlers"]
        CourseAPI["Courses Generation & Enrollment"]
        AuthAPI["NextAuth JWT & Credentials"]
        AIAPI["Groq & Gemini Streaming Mentorship"]
        ReportAPI["Reports & Telemetry"]
        CertAPI["Anti-Fraud Registry"]
        FlashcardAPI["SM-2 Scheduler"]
        VideoAPI["YouTube Academic Integration"]
    end

    subgraph AIOrchestration ["🧠 AI Multi-Model Orchestration Engine"]
        GroqEngine["Groq SDK - LPU Llama 3.3 70B Versatile"]
        GeminiEngine["Google Gemini 1.5 / 2.0 Flash Fallback"]
        OpenRouterEngine["OpenRouter Multi-Model Fail-Safe"]
        ZodValidator["Zod JSON Schema Sanitizer & Repair"]
    end

    subgraph DataPersistence ["🗄️ Persistence, Storage & External Services"]
        PrismaORM["Prisma 5.14 ORM Engine"]
        NeonDB[("Neon Serverless PostgreSQL")]
        BrevoMail["Brevo Sendinblue Transactional OTP Emails"]
        PDFEngine["jsPDF Academic Report & Certificate Generator"]
    end

    UI --> EdgeProxy --> NextMiddleware --> SecurityHeaders --> RateLimiter
    RateLimiter --> ServerAPIs
    ServerAPIs --> AIOrchestration
    AIOrchestration --> GroqEngine
    GroqEngine -.->|Fallback on Quota Error| GeminiEngine
    GeminiEngine -.->|Fail-Safe| OpenRouterEngine
    AIOrchestration --> ZodValidator --> CourseAPI
    ServerAPIs --> PrismaORM --> NeonDB
    ServerAPIs --> BrevoMail
    ServerAPIs --> PDFEngine
```

---

## 🧠 AI Multi-Model Cascade & Curriculum Engine

NexLearn AI uses a resilient multi-model pipeline that guarantees zero downtime and zero schema corruption when generating deep academic curricula:

```mermaid
flowchart TD
    A["User Input: Topic, Level, Hours/Day, Career Goal"] --> B["Prompt Engineering & Meta-Syllabus Construction"]
    B --> C{"Primary Engine: Groq Llama 3.3 70B"}
    
    C -->|Fast Sub-2s Stream| D["Raw JSON Token Stream"]
    C -->|Rate Limit or Timeout| E{"Secondary Engine: Google Gemini 1.5 / 2.0 Flash"}
    
    E -->|Success| D
    E -->|Error Fallback| F["Tertiary Fallback: OpenRouter Multi-Model Gateway"]
    F --> D

    D --> G["Structural Zod Parsing & Schema Repair"]
    G -->|Valid JSON Schema| H["Topological Module Ordering & Subtopic Linking"]
    G -->|Malformed Block| I["Algorithmic String Repair & Clean Extractor"]
    I --> H

    H --> J["Generate Module Content, Exercises & Mindmaps"]
    J --> K["Atomic Prisma Transaction & Neon Postgres Persistence"]
    K --> L["Interactive Course Ready in Dashboard"]
```

### Zero-Hallucination Prompt Architecture
To ensure that academic roadmaps are pedagogically sound, the AI engine enforces strict constraints:
- **Hierarchical Node Decomposition**: Curricula are broken down into foundational concepts, applied implementations, advanced paradigms, and production-level capstones.
- **Topological Sorting**: Prerequisite topics are strictly ordered before advanced modules.
- **Executable Code Examples**: Code samples are synthesized with complete, self-contained dependencies ready for execution in the Monaco editor.
- **Deterministic Mindmap Trees**: Concept nodes are structured with parent-child relationships for clean layout rendering with ELK.js.

---

## 🗺️ Mind Maps & Interactive Knowledge Workflows

NexLearn dynamically constructs full visual concept graphs for every module:

```mermaid
graph LR
    Root["🎯 Course Concept Knowledge Graph"]
    
    Root --> M1["Foundational Mechanics"]
    M1 --> M1_1["Core Principles"]
    M1 --> M1_2["Syntax & Semantics"]
    M1 --> M1_3["Memory Management"]
    
    Root --> M2["Applied Implementation"]
    M2 --> M2_1["Design Patterns"]
    M2 --> M2_2["Data Structures"]
    M2 --> M2_3["Standard Library"]
    
    Root --> M3["Real-World Architecture"]
    M3 --> M3_1["Concurrency & Async"]
    M3 --> M3_2["Error Handling"]
    M3 --> M3_3["Production Deployment"]
    
    Root --> M4["Edge Cases & Mastery"]
    M4 --> M4_1["Performance Profiling"]
    M4 --> M4_2["Common Gotchas"]
    M4 --> M4_3["Best Practices"]
```

---

## 🔁 Spaced Repetition (SM-2) Memory Engine

NexLearn AI integrates a mathematically verified implementation of the SuperMemo **SM-2 Algorithm** to conquer the Ebbinghaus Forgetting Curve:

```mermaid
stateDiagram-v2
    [*] --> FlashcardNew: User Starts Learning
    FlashcardNew --> ReviewScheduled: Initial Repetition = 1, Interval = 1 Day
    
    ReviewScheduled --> StudentEvaluates: Flashcard Due for Review
    
    StudentEvaluates --> ScoreAgain: Rating = 0 Again
    StudentEvaluates --> ScoreHard: Rating = 1 Hard
    StudentEvaluates --> ScoreGood: Rating = 2 Good
    StudentEvaluates --> ScoreEasy: Rating = 3 Easy
    
    ScoreAgain --> FlashcardNew: Repetitions = 0, Interval = 1 Day, Ease Decrement -0.20
    ScoreHard --> ReviewScheduled: Interval = Current * 1.2, Ease Decrement -0.15
    ScoreGood --> ReviewScheduled: Repetitions += 1, Interval = Interval * EaseFactor
    ScoreEasy --> ReviewScheduled: Repetitions += 1, Interval = Interval * EaseFactor * 1.3, Ease Increment +0.15
```

### Mathematical Formula

$$\text{EF}' = \text{EF} + \left(0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)\right)$$

Where:
- $\text{EF}$ is the current Ease Factor (bounded at a minimum of $1.3$).
- $q$ is the student's recall quality rating ($0$ to $5$).
- $\text{Interval}(1) = 1\text{ day}$, $\text{Interval}(2) = 6\text{ days}$, and $\text{Interval}(n) = \text{Interval}(n-1) \times \text{EF}$.

---

## 📜 Cryptographic Verifiable Credentials & Anti-Fraud Registry

Graduation credentials issued by NexLearn AI are permanent, tamper-evident academic records:

1. **Unique Registry ID**: Every certificate is minted with a standardized credential identifier (e.g. `NXL-JAVA-2026`).
2. **Dynamic QR Code**: Scannable by hiring managers, colleagues, or institutions to verify the scholar's identity, course syllabus, completion date, and achieved mastery percentage.
3. **Public Anti-Fraud Registry Route**: Open endpoint at `/api/public/certificate/[id]` and verified UI at `/certificate/[id]` that validates the cryptographic record directly against the Neon PostgreSQL database.
4. **1-Click LinkedIn Integration**: Seamlessly pre-fills certification name, issuing organization (*NexLearn AI*), issue date, and direct verification URL for the scholar's LinkedIn profile.

---

## 💻 Full Tech Stack Matrix

| Architectural Layer | Technologies & Libraries | Version | Purpose & Strategic Rationale |
|---|---|---|---|
| **Frontend Framework** | **Next.js (App Router)** | `16.2.0` | React Server Components, Turbopack high-velocity compiler, automatic code splitting, server actions. |
| **UI Library** | **React** | `19.2.4` | Concurrent rendering, latest hooks, optimal hydration performance. |
| **Language & Typings** | **TypeScript** | `5.7.3` | End-to-end type safety across API routes, Prisma models, and React components. |
| **Code Editor** | **Monaco Editor React** | `4.7.0` | In-browser VS Code editing experience with syntax highlighting, line numbers, and theme support. |
| **Mindmap Graph** | **@xyflow/react & elkjs** | `12.11 / 0.12` | Interactive node graph canvas with automated hierarchical layout calculations. |
| **Data Visualizations** | **Chart.js & React-Chartjs-2** | `4.5.1 / 5.3` | Responsive weekly study distribution bar charts, doughnut completion rings, and mastery radars. |
| **Animations & Motion** | **Framer Motion & GSAP** | `13.2 / 3.15` | Fluid micro-interactions, smooth scrolling, and polished UI component transitions. |
| **Smooth Scrolling** | **Lenis** | `1.3.26` | Inertia-based luxury scroll experience across landing and dashboard pages. |
| **Database & ORM** | **Prisma ORM & PostgreSQL** | `5.14.0` | Schema migrations, type-safe queries, relation mapping, and connection pooling. |
| **Cloud Database** | **Neon Serverless Postgres** | Cloud | Auto-scaling serverless PostgreSQL with direct and connection-pooled connection strings. |
| **Primary AI Engine** | **Groq SDK (LPU)** | `1.1.1` | Ultra-low latency Llama 3.3 70B inference for real-time course synthesis and AI mentorship. |
| **Secondary AI Engine** | **Google Gemini SDK** | `Google AI` | Multimodal fallback engine for curriculum generation and complex academic summarization. |
| **Authentication** | **NextAuth.js** | `4.24.13` | Stateless JWT strategy, password hashing with bcryptjs, and Google OAuth 2.0 integration. |
| **Rate Limiting** | **Upstash Redis Ratelimit** | `2.1.0 / 1.38` | Sliding-window IP and token-based rate limiting safeguarding AI endpoints. |
| **Transactional Email** | **Brevo (Sendinblue) API** | `v3` | Automated delivery of 6-digit OTP verification codes and password recovery emails. |
| **Document Export** | **jsPDF & html2canvas** | `4.2.1 / 1.4` | In-browser client/server rendering of academic transcripts, study guides, and certificates. |
| **Icons & Brand** | **Lucide React** | `1.46.0` | Modern, cohesive vector iconography across all dashboard and navigation components. |
| **Schema Validation** | **Zod** | `4.6.5` | Strict runtime input/output validation for AI generation payloads and API requests. |

---

## 📂 Project Directory Structure

```text
NexLearn-AI/
├── docs/                               # Portfolio assets & visual documentation
│   ├── screenshots/                    # 16+ full-screen 1080p verified interface captures
│   │   ├── 01-landing-hero.png         # Marketing landing page hero
│   │   ├── 02-auth-login.png           # Glassmorphic authentication portal
│   │   ├── 03-dashboard.png            # Student learning command center
│   │   ├── 04-course-generator.png     # Autonomous AI course generator studio
│   │   ├── 05-course-curriculum.png    # Interactive syllabus timeline & roadmap
│   │   ├── 06-learning-module.png      # Immersive learning room & Monaco editor
│   │   ├── 07-concept-mindmap.png      # Concept mindmap (ELK.js + React Flow)
│   │   ├── 08-quiz-assessment.png      # Timed adaptive quiz assessment engine
│   │   ├── 09-quiz-result.png          # Mastery score & rationale review
│   │   ├── 10-flashcards-deck.png      # SuperMemo SM-2 spaced repetition deck
│   │   ├── 11-academic-analytics.png   # Chart.js academic telemetry & reports
│   │   ├── 12-achievements-trophies.png# Gamification vault & milestone trophies
│   │   ├── 13-verifiable-certificate.png# Cryptographic verifiable academic credential
│   │   ├── 14-discover-catalog.png     # Public course discovery catalog
│   │   ├── 15-user-profile.png         # Student profile & academic preferences
│   │   └── 16-settings-security.png    # 2FA security vault & session settings
│   └── videos/                         # High-definition video walkthroughs
│       ├── nexlearn-walkthrough.mp4    # 1080p Playwright-recorded full-platform MP4 (42.3 MB)
│       └── nexlearn-walkthrough.webm   # 1080p Playwright-recorded full-platform WebM (22.5 MB)
├── prisma/
│   └── schema.prisma                   # 12 Prisma models, relations, indexes & enums
├── public/                             # Public static assets, brand SVGs, manifest & icons
├── scripts/                            # Operational & automation toolchain
│   ├── capture-showcase.mjs            # Automated Playwright full-screen screenshot suite
│   ├── record-walkthrough.mjs          # Automated Playwright 1080p video recorder
│   └── verify-ai-resilience.mts        # AI engine fallback stress-testing script
├── src/
│   ├── app/                            # Next.js 16 App Router (UI Pages & REST Handlers)
│   │   ├── (UI Routes)
│   │   │   ├── page.tsx                # Marketing landing page with Lenis smooth scroll
│   │   │   ├── login/                  # Credentials & Google OAuth sign-in portal
│   │   │   ├── register/               # New scholar onboarding & learning goal intake
│   │   │   ├── dashboard/              # Student command center & telemetry overview
│   │   │   ├── generate/               # Autonomous AI course generation studio
│   │   │   ├── course/[id]/            # Course curriculum, module list & progress rings
│   │   │   │   └── module/[moduleId]/  # Immersive learning room (Monaco, Notes, Mindmap)
│   │   │   │       ├── quiz/           # Timed adaptive quiz engine
│   │   │   │       └── result/         # Quiz score analysis & answer rationales
│   │   │   ├── flashcards/             # SM-2 Spaced repetition study deck
│   │   │   ├── reports/                # Academic analytics, Chart.js telemetry & PDF export
│   │   │   ├── achievements/           # Gamification vault & milestone trophy badges
│   │   │   ├── certificate/[id]/       # Verifiable certificate view & LinkedIn credential
│   │   │   ├── c/[id]/                 # Public shareable course preview & 1-click enroll portal
│   │   │   ├── discover/               # Global course marketplace & community catalog
│   │   │   ├── profile/                # Scholar bio, career goals & academic preferences
│   │   │   ├── settings/               # Account security, password reset & 2FA toggles
│   │   │   └── verify/                 # Public anti-fraud credential verification search
│   │   └── api/                        # Next.js REST API Handlers
│   │       ├── ai/                     # Conversational Socratic mentor & streaming
│   │       ├── auth/                   # NextAuth credentials, Google provider & 2FA
│   │       ├── courses/                # Course creation, syllabus synthesis & modules
│   │       ├── public/certificate/     # Public certificate verification API
│   │       ├── reports/                # Academic session telemetry & analytics data
│   │       ├── user/                   # Profile, notifications, flashcards & stats
│   │       └── videos/                 # Academic YouTube video search
│   ├── components/                     # Reusable UI components
│   │   ├── AiMentor.tsx                # Floating conversational Socratic tutor
│   │   ├── CommandPalette.tsx          # Quick-action search modal (Ctrl+K)
│   │   ├── Header.tsx                  # Global navigation header with notifications
│   │   ├── Sidebar.tsx                 # Collapsible primary navigation sidebar
│   │   ├── mindmap/                    # ELK.js + React Flow graph canvas
│   │   │   ├── MindmapFlow.tsx         # Node layout & canvas orchestration
│   │   │   ├── MindmapNodes.tsx        # Custom SVG node cards with badges
│   │   │   └── parser.ts               # Raw AI theory to ELK tree layout parser
│   │   └── landing/                    # Landing page interactive widgets
│   ├── lib/                            # Core utilities & singleton clients
│   │   ├── auth.ts                     # NextAuth configuration & callbacks
│   │   ├── prisma.ts                   # Prisma client singleton with global caching
│   │   ├── gemini.ts                   # Groq Llama 3.3 & Gemini multi-model cascade
│   │   ├── mailer.ts                   # Brevo email templates & OTP dispatcher
│   │   ├── ratelimit.ts                # Upstash Redis sliding-window ratelimiter
│   │   ├── studyGuidePdf.ts            # High-fidelity syllabus PDF generator
│   │   └── academicReportPdf.ts        # Comprehensive student transcript PDF generator
│   └── types/                          # Shared TypeScript definitions
├── middleware.ts                       # Next.js route protection & session verification
├── next.config.mjs                     # Security headers (CSP, HSTS, X-Frame) & server packages
├── package.json                        # Monorepo dependencies & scripts
├── setup.bat                           # 1-click Windows developer setup script
└── tsconfig.json                       # TypeScript compiler options & `@/*` path mapping
```

---

## 🗄️ Database Schema & Storage Architecture

The PostgreSQL schema is modeled in Prisma with strict relational integrity, cascade deletions, and composite indexes:

```mermaid
erDiagram
    User ||--o{ Account : "has"
    User ||--o{ Session : "maintains"
    User ||--o{ Course : "creates / enrolls"
    User ||--o{ QuizAttempt : "submits"
    User ||--o{ UserAchievement : "earns"
    User ||--o{ Bookmark : "saves"
    User ||--o{ Notification : "receives"
    User ||--o{ StudySession : "logs"
    User ||--o{ FlashcardReview : "tracks"

    Course ||--o{ Module : "contains"
    Module ||--o| Quiz : "has"
    Module ||--o{ Flashcard : "generates"
    Module ||--o{ Bookmark : "bookmarked in"

    Quiz ||--o{ Question : "contains"
    Quiz ||--o{ QuizAttempt : "recorded in"

    Flashcard ||--o{ FlashcardReview : "scheduled via"
    Achievement ||--o{ UserAchievement : "awarded as"

    User {
        string id PK
        string email UK
        string name
        string password
        string learningGoal
        boolean isVerified
        boolean twoFactorEnabled
        datetime createdAt
    }

    Course {
        string id PK
        string title
        string topic
        string level
        int hoursPerDay
        string duration
        boolean completed
        boolean enrolled
        string grade
        float masteryPercentage
        string certificateId UK
        string userId FK
    }

    Module {
        string id PK
        string title
        string difficulty
        string notes
        string examples
        string exercises
        string mindmap
        int orderIndex
        boolean completed
        string courseId FK
    }

    Quiz {
        string id PK
        string moduleId FK
    }

    Question {
        string id PK
        string text
        string options
        int correctAnswer
        string explanation
        string quizId FK
    }

    FlashcardReview {
        string id PK
        int interval
        float easeFactor
        int repetitions
        datetime dueDate
        string status
        string userId FK
        string flashcardId FK
    }
```

---

## 📡 API Documentation

### 📚 Course & Curriculum Endpoints

| Method | Endpoint | Description | Auth | Request Body / Query | Success Response |
|---|---|---|:---:|---|---|
| `POST` | `/api/courses/generate` | Generates a new comprehensive course syllabus using dual LLM cascade | `JWT` | `{ topic, level, hoursPerDay, duration, goal }` | `{ course: { id, title, modules: [...] } }` |
| `GET` | `/api/courses` | Lists all enrolled & completed courses for the authenticated scholar | `JWT` | None | `{ courses: [...] }` |
| `GET` | `/api/courses/[id]` | Retrieves full course details, module list, progress & certificate | `JWT` | Dynamic Route `id` | `{ course: { id, title, modules, ... } }` |
| `PATCH` | `/api/courses/[id]` | Updates course enrollment status (`enrolled: true/false`) | `JWT` | `{ enrolled: boolean }` | `{ success: true, course }` |
| `DELETE` | `/api/courses/[id]` | Unenrolls scholar or deletes course from database | `JWT` | Dynamic Route `id` | `{ success: true, message: "..." }` |
| `GET` | `/api/courses/[id]/modules/[moduleId]` | Fetches full module learning content, theory notes, code & exercises | `JWT` | Dynamic Route `id`, `moduleId` | `{ module: { id, notes, examples, ... } }` |
| `POST` | `/api/courses/[id]/modules/[moduleId]/enrich` | AI-powered deep enrichment of lesson notes, exercises & examples | `JWT` | `{ expandSectionsOnly?: boolean }` | `{ success: true, module }` |
| `POST` | `/api/courses/[id]/modules/[moduleId]/audio-summary` | Generates personalized audio briefing podcast script by persona | `JWT` | `{ persona?: "elena" \| "marcus" \| "alex" }` | `{ script: "...", persona, keyTakeaways: [...] }` |
| `POST` | `/api/courses/[id]/modules/[moduleId]/mindmap` | Generates or regenerates an interactive concept mindmap graph | `JWT` | None | `{ mindmap: "{ id, label, children: [...] }" }` |

### 🤖 AI Mentor, Multi-Model Chat & Media

| Method | Endpoint | Description | Auth | Request Body / Query | Success Response |
|---|---|---|:---:|---|---|
| `POST` | `/api/ai/chat` | Conversational Socratic guidance grounded in active module context | `JWT` | `{ message, moduleId, courseId, currentPage, history }` | `{ response: "...", persona }` |
| `GET` | `/api/videos/search` | Academic YouTube video recommendations tailored to subtopics | `JWT` | `?q=Topic+Name` | `{ videos: [{ videoId, title, thumbnail, timestamp, author }] }` |

### 🧠 Spaced Repetition (SM-2) & Adaptive Quizzes

| Method | Endpoint | Description | Auth | Request Body / Query | Success Response |
|---|---|---|:---:|---|---|
| `GET` | `/api/user/flashcards` | Global flashcards dashboard with retention rate & SM-2 scheduling | `JWT` | None | `{ stats: { retentionRate, dueCount, ... }, courses, dueFlashcards }` |
| `POST` | `/api/user/flashcards` | Submits recall quality rating (0-5) and recalculates SM-2 interval & ease | `JWT` | `{ flashcardId, quality: 0-5 }` | `{ success: true, review: { interval, easeFactor, dueDate } }` |
| `GET` | `/api/courses/[id]/modules/[moduleId]/flashcards` | Fetches or auto-generates module-specific flashcards | `JWT` | Dynamic Route `id`, `moduleId` | `{ flashcards: [...] }` |
| `GET` | `/api/courses/[id]/modules/[moduleId]/quiz` | Fetches or creates timed adaptive quiz for current module | `JWT` | Dynamic Route `id`, `moduleId` | `{ quiz: { id, questions: [...] }, lastResult }` |
| `POST` | `/api/courses/[id]/modules/[moduleId]/quiz` | Submits quiz answers, evaluates score, records attempt & awards XP | `JWT` | `{ answers: [0, 2, 1, ...], timeTaken }` | `{ score, total, percentage, passed, xp }` |

### 🌐 Community Discovery, Public Registry & Credentials

| Method | Endpoint | Description | Auth | Request Body / Query | Success Response |
|---|---|---|:---:|---|---|
| `GET` | `/api/public/courses` | Lists public community courses with search, topic & level filters | `Public` | `?search=...&topic=...&level=...` | `{ courses: [...] }` |
| `GET` | `/api/public/courses/[id]` | Public course preview with full curriculum breakdown | `Public` | Dynamic Route `id` | `{ course: { id, title, modules, ... } }` |
| `POST` | `/api/public/courses/[id]` | 1-click enroll / clone public community course into dashboard | `JWT` | Dynamic Route `id` | `{ success: true, courseId }` |
| `GET` | `/api/public/certificate/[id]` | Public tamper-evident certificate verification registry lookup | `Public` | Dynamic Route `id` (e.g. `NXL-JAVA-2026`) | `{ valid: true, certificate: { recipient, grade, masteryPercentage, ... } }` |
| `POST` | `/api/user/certificate/email` | Sends official graduation certificate via email with PDF attachment | `JWT` | `{ certificateId }` | `{ success: true, message: "..." }` |

### 📊 Academic Telemetry, Bookmarks, Notifications & Security

| Method | Endpoint | Description | Auth | Request Body / Query | Success Response |
|---|---|---|:---:|---|---|
| `GET` | `/api/user/stats` | Fetches weekly study distribution, mastery points, and streaks | `JWT` | None | `{ streak, totalHours, masteryPoints, stats: [...] }` |
| `POST` | `/api/user/stats/email` | Emails weekly academic progress telemetry report to the scholar | `JWT` | None | `{ success: true }` |
| `POST` | `/api/user/study-session` | Logs live study session time (consolidates within 15-min window) | `JWT` | `{ duration: number }` | `{ success: true }` |
| `GET` | `/api/user/activity-calendar` | Returns study activity heatmap calendar and milestone markers | `JWT` | None | `{ calendar: [...], stats: { totalActiveDays, ... } }` |
| `GET` | `/api/user/bookmarks` | Lists all bookmarked modules saved for rapid recall | `JWT` | None | `{ bookmarks: [...] }` |
| `POST` | `/api/user/bookmarks` | Toggles or saves a learning module bookmark | `JWT` | `{ moduleId: string }` | `{ bookmark: { id, moduleId, ... } }` |
| `DELETE` | `/api/user/bookmarks` | Removes a module bookmark | `JWT` | `{ moduleId: string }` | `{ success: true }` |
| `GET` | `/api/user/notifications` | Retrieves user notifications and system alerts | `JWT` | None | `{ notifications: [...] }` |
| `PUT` | `/api/user/notifications` | Marks single or all notifications as read | `JWT` | `{ id?: string, readAll?: boolean }` | `{ success: true }` |
| `GET` | `/api/user/achievements` | Retrieves all earned and locked milestone gamification trophies | `JWT` | None | `{ earned: [...], available: [...], totalPoints }` |
| `POST` | `/api/user/security` | Updates 2FA status, password credentials, and active sessions | `JWT` | `{ twoFactorEnabled, currentPassword, newPassword }` | `{ success: true }` |
| `POST` | `/api/auth/register` | Registers new user account with bcrypt encrypted password | `Public` | `{ name, email, password, learningGoal }` | `{ user: { id, email, name } }` |
| `POST` | `/api/auth/send-otp` | Generates & dispatches 6-digit email verification OTP via Brevo | `Public` | `{ email }` | `{ success: true, message: "..." }` |
| `POST` | `/api/auth/verify-account` | Validates OTP and sets account verification status to true | `Public` | `{ email, otp }` | `{ success: true, verified: true }` |
| `POST` | `/api/auth/reset-password` | Resets forgotten password via validated OTP token | `Public` | `{ email, otp, newPassword }` | `{ success: true, message: "..." }` |

---

## 🔐 Environment Variables

Create a `.env` file in the root workspace by copying from `.env.example`:

```env
# ------------------------------------------------------------------------------
# 1. Database Configuration (Neon Serverless PostgreSQL)
# ------------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@ep-xyz-pooler.region.neon.tech/neondb?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@ep-xyz.region.neon.tech/neondb?sslmode=require"

# ------------------------------------------------------------------------------
# 2. NextAuth Authentication Configuration
# ------------------------------------------------------------------------------
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-random-secret-key-here"

# ------------------------------------------------------------------------------
# 3. AI Multi-Model Engines (Groq SDK & Google Gemini)
# ------------------------------------------------------------------------------
GROQ_API_KEY="gsk_your_groq_api_key_here"
GOOGLE_GENERATIVE_AI_API_KEY="your-google-gemini-api-key"
GEMINI_API_KEY="your-google-gemini-api-key"
OPENROUTER_API_KEY="your-openrouter-api-key"

# ------------------------------------------------------------------------------
# 4. Transactional Email Service (Brevo / Sendinblue)
# ------------------------------------------------------------------------------
BREVO_API_KEY="xkeysib-your-brevo-api-key-here"
BREVO_SENDER_EMAIL="noreply@yourdomain.com"
BREVO_SENDER_NAME="NexLearn"

# ------------------------------------------------------------------------------
# 5. Google OAuth 2.0 (Social Sign-In)
# ------------------------------------------------------------------------------
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher (`v22+` recommended)
- **npm**: `v10.x` or higher
- **PostgreSQL Database**: A free instance from [Neon.tech](https://neon.tech) or a local PostgreSQL database

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/Aniket-Meshram-dev/NexLearn-AI.git
cd NexLearn-AI

# 2. Install project dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and supply your DATABASE_URL, NEXTAUTH_SECRET, and GROQ_API_KEY

# 4. Synchronize Prisma Database Schema
npx prisma db push
npx prisma generate

# 5. Launch the Turbopack Development Server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> [!NOTE]
> **Windows 1-Click Setup**: You can alternatively run `setup.bat` in the root directory to automatically verify Node.js, install dependencies, sync the database, and launch the dev server.

---

## 🚢 Production Deployment Guide

### Vercel Deployment (Recommended)
1. Push the repository to GitHub.
2. Import the repository into the **Vercel Dashboard**.
3. In **Settings → Environment Variables**, configure all keys from `.env`.
4. Under **Build & Development Settings**, set:
   - **Build Command**: `prisma generate && next build`
   - **Install Command**: `npm install`
5. Deploy! Vercel edge nodes will automatically build the Next.js 16 application.

### Cloudflare Pages / Edge Deployment
- Ensure `@prisma/client` connects via Neon's pooled connection string (`DATABASE_URL` with `?sslmode=require`).
- Utilize Cloudflare Pages with Next.js OpenNext or Node.js runtime adapter.

---

## 🛡️ Security, Privacy & Guard Architecture

1. **Stateless JWT NextAuth Sessions**: Auth tokens are signed using HMAC-SHA256 with 30-day expiration, protected via `SameSite=Lax`, `HttpOnly`, and `Secure` cookie attributes.
2. **Cryptographic Password Hashing**: User passwords are encrypted using `bcryptjs` with 12 salt rounds before database insertion.
3. **Sliding-Window Rate Limiting**: AI generation endpoints and mentor queries are guarded by `@upstash/ratelimit` to protect against brute-force spam and token exhaustion.
4. **Strict HTTP Security Headers**: Configured in `next.config.mjs` with `X-Frame-Options: DENY`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and custom Content Security Policies (CSP).
5. **SSRF Guard & Anti-Injection Filters**: URL inputs and YouTube search queries are sanitized against Server-Side Request Forgery and malicious prompt injection vectors.

---

## 🧠 Challenges Faced & Engineering Learnings

1. **Eliminating JSON Hallucination in Complex Multi-Module Course Synthesis**:
   - *Challenge*: When generating 12+ module syllabi with nested subtopics and exercises, LLMs frequently truncated closing braces or inserted commentary outside the JSON block.
   - *Solution*: Designed a multi-tier JSON extractor with bracket-counting repair heuristics paired with a strict **Zod** schema. If structural validation fails, the engine falls back to a self-repairing prompt pass on Google Gemini without dropping user context.

2. **Hierarchical Graph Layout Performance with ELK.js in Next.js 16**:
   - *Challenge*: Rendering complex concept mindmaps in real-time caused layout stutter and blocking computations on the main browser thread.
   - *Solution*: Offloaded ELK.js graph calculations into an asynchronous parsing pipeline, memoized node hierarchies with React 19 hooks, and configured dynamic bounding-box scaling to maintain 60 FPS zoom and pan interactions.

3. **SuperMemo SM-2 Math Optimization in a Relational Database**:
   - *Challenge*: Naive spaced repetition implementations require continuous polling jobs to check which cards are due.
   - *Solution*: Modeled indexed `dueDate` columns in Prisma with composite indexes `[userId, dueDate]`. Flashcard intervals and dynamic ease factors are updated atomically during review submissions, enabling instantaneous $O(1)$ query lookups for due cards.

4. **Zero-Lag In-Browser Code Sandboxing**:
   - *Challenge*: Bundling heavy language compilers client-side degrades bundle size and First Input Delay (FID).
   - *Solution*: Integrated `@monaco-editor/react` with lazy chunk loading and built a sandboxed JavaScript/Python execution simulator with structured output channels (`stdout`, `stderr`, runtime timers), delivering an instant coding playground without heavy server overhead.

---

## 🗺️ Future Improvements & Roadmap

- [x] **v1.0 (Current)**: Autonomous multi-model curriculum generator, Socratic AI mentor, Monaco editor, ELK.js concept mindmaps, SM-2 flashcards deck, and cryptographic verifiable certificates.
- [ ] **v1.1 (Q2 2026)**: Collaborative Cohort Study Rooms with live WebSocket multiplayer coding and group mindmap whiteboarding.
- [ ] **v1.2 (Q3 2026)**: Voice-to-Voice AI Socratic Tutoring using real-time WebRTC audio streaming.
- [ ] **v1.3 (Q4 2026)**: LMS Interoperability (LTI 1.3 standard) to allow university and enterprise export to Canvas, Moodle, and Blackboard.

---

## 👤 Author & Contact

<div align="center">

**Aniket Meshram**  
*Full-Stack Engineer & AI Systems Architect*

[![GitHub](https://img.shields.io/badge/GitHub-Aniket--Meshram--dev-181717?style=for-the-badge&logo=github)](https://github.com/Aniket-Meshram-dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-aniket--meshram--dev-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/aniket-meshram-dev)
[![Email](https://img.shields.io/badge/Email-aniketmeshram445%40gmail.com-EA4335?style=for-the-badge&logo=gmail)](mailto:aniketmeshram445@gmail.com)

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

```text
MIT License

Copyright (c) 2026 Aniket Meshram

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

<div align="center">
<sub>Designed & Engineered with ❤️ by <b>Aniket Meshram</b> · Powered by Next.js 16, React 19, Neon & Groq</sub>
</div>
