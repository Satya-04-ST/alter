# Software Design & Specification Document (SDD)

## 1. Project Overview & Tech Stack

### Project Overview

**ALTER** is a full-stack, AI-powered personalized academic workspace, degree-progress tracker, and multi-persona tutor. The system ingests academic documents (handbooks, syllabi, timetables, resumes) via a Retrieval-Augmented Generation (RAG) pipeline to ground all guidance in the student's curriculum and career trajectory.

The core assistant switches across five operational personas:

* **A (Advisor):** Career path mapping, baseline assessments, curriculum sequencing, cut-list generation.
* **L (Librarian):** Resource curation across academic papers, textbooks, courses, and technical video repositories.
* **T (Tutor):** Step-by-step concept explanations, Socratic dialogue, and automated practice quizzes.
* **E (Editor):** Structural and technical review for assignments, research drafts, and resumes.
* **R (Roommate):** Motivation, lightweight check-ins, Pomodoro companion, and ambient study management,maintaining a schedule and discipline.

The interface implements a responsive **30 : 40 : 30** three-panel workspace layout with a floating, context-aware persona console.

---

### Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Zustand, React Flow (`@xyflow/react`), Lucide React, Radix UI, TanStack Query, Three.js / `@react-three/fiber` |
| **Backend** | Node.js, Express, TypeScript, LangChain, LangGraph, Prisma ORM, BullMQ on Redis (`ioredis`), Socket.IO, Multer, `pdf-parse`, `tesseract.js`, `zod` |
| **Databases & Vector Store** | PostgreSQL (Relational operational data), pgvector / Pinecone (Dense document embeddings), Redis (Job queues, session cache, real-time presence) |
| **AI & Embeddings** | Google Gemini 1.5 Pro / Flash SDK, OpenAI API / OpenRouter, `text-embedding-3-small` / Gemini Embeddings |
| **External Integrations** | Google Calendar API, Notion API, Devpost / Unstop / Devfolio Scraper APIs, YouTube Data API v3, Semantic Scholar / arXiv API |

---

## 2. Core Architecture & RAG Pipeline

```
[ Uploaded Artifacts ] 
  ├── Syllabus / Handbook (PDF)
  ├── Weekly Timetable (PDF / Image)
  ├── Resume (PDF / Markdown)
  └── Career Goals (Input JSON, recommendation text from AI)
           │
           ▼
[ Ingestion & Parsing Engine ] 
  ├── Document Parser (pdf-parse / OCR via tesseract.js)
  ├── Markdown Structural Sanitizer
  └── Contextual Splitter (300-500 tokens, 50-token overlap)
           │
           ▼
[ Embedding & Enrichment Layer ]
  ├── Metadata Extraction (Subject, Module, Exam Dates, Skill Mappings)
  ├── Vector Generation (Gemini / OpenAI Embeddings)
  └── Dual Storage Upsert:
        ├── Dense Embeddings ──► pgvector / Pinecone
        └── Structured Data   ──► PostgreSQL (Timetables, Deadlines, Credits)
           │
           ▼
[ Multi-Persona Orchestration Engine (LangGraph) ]
  ├── Profile Context (Interests, Gaps, Career Roles, Degree Progress)
  ├── RAG Retrieval (Top-k Chunks via Vector Store + Hybrid Metadata Filter)
  └── Persona Router (Advisor | Librarian | Tutor | Editor | Roommate)
           │
           ▼
[ Unified Client Workspace (30 : 40 : 30 Panels + Floating Overlay) ]

```

---

## 3. UI/UX Workspace Layout (30 : 40 : 30 View)

```
+----------------------------------------------------------------------------------------------------+
|                                         APP HEADER / NAV                                           |
+------------------------------+---------------------------------------+-----------------------------+
| LEFT PANEL (30%)             | CENTER PANEL (40%)                    | RIGHT PANEL (30%)           |
|                              |                                       |                             |
| • Career Roadmap & Milestones| • Dynamic Planner (Daily / Weekly)   | • Notebook-Style RAG Notes  |
| • External Course Engine     | • Document & Syllabus Reader          | • Subject-to-Career Tree    |
| • Recommended AI Tools Hub   | • Research Paper Analyzer             | • Flashcards & Quiz Engine  |
| • Live Hackathon Feed        | • Degree Progress & Analytics         | • Priority Task Cut-List    |
| • Pomodoro & Ambient Player  |                                       |                             |
+------------------------------+---------------------------------------+-----------------------------+
| [FLOATING OVERLAY] ALTER Interactive Multimodal Console (Switch: [A] [L] [T] [E] [R])               |
+----------------------------------------------------------------------------------------------------+

```

### 1. Left Panel (30% — Navigation, Roadmap & External Aggregation)

* **Career Roadmap:** Node-based milestone tree mapping target roles to prerequisite skills and acquired course credits, roadmap recommendation by AI.
* **Curated Channels & Courses:** Dynamically pulled resources (Coursera, edX, NPTEL, YouTube tech tracks) mapped directly to active modules, curated by AI.
* **AI Tool Recommender:** Context-aware cards suggesting external tools (e.g., Overleaf, Gamma, Napkin.ai, Cursor) depending on current user tasks, AI generated suggestions.
* **Hackathon & Contest Aggregator:** Live listings from Devpost, Unstop, and Devfolio with tag-based filtering (AI, Web3, Systems).
* **Pomodoro & Focus Soundscapes:** Integrated timer logging focused minutes to user analytics with background Lo-Fi streams and ambient sounds.

### 2. Center Panel (40% — Core Execution Workspace)

* **Dynamic Planner:** Time-blocked calendar combining auto-extracted class schedules, assignment deadlines, and AI-scheduled study blocks.
* **Document & Syllabus Reader:** Split-pane reader supporting PDF highlighting, inline markdown summaries, and targeted chunk querying.
* **Research Paper Analyzer:** Interface extracting problem statements, methodology breakdowns, and project ideas from arXiv / uploaded papers.
* **Degree Progress Dashboard:** SVG heatmaps, syllabus completion trackers, and GPA projections.
* **Note-taking:** Note taking feature with rich text formatting and code blocks support AI powered summaries of notes.


### 3. Right Panel (30% — Synthesis, Graphing & Testing)

* **Notebook-Style Synthesis:** Notebook-style workspace querying multiple active sources simultaneously with grounded citations.
* **Subject-to-Career Graph:** Interactive React Flow visual graph showing real-world career application paths for current syllabus topics.
* **Practice Quiz & Flashcard Engine:** Auto-generated spaced-repetition cards (Leitner system) and timed multi-format quizzes.
* **Task Cut-List:** Automated triage separating critical degree requirements from non-essential tasks during crunch and exam periods.

### 4. Floating Console Overlay

* Omnipresent, draggable AI assistant bar supporting hotkey invocation (`Cmd/Ctrl + K`), dynamic persona switching (`A`/`L`/`T`/`E`/`R`), and multimodal inputs.

---

## 4. Multi-Persona System Prompts & Behaviors

```
+-----------------------------------------------------------------------------------+
|                            ALTER ROUTING ORCHESTRATOR                             |
+-----------------------------------------------------------------------------------+
  │
  ├── [A] ADVISOR   ──► Strategic academic roadmaps, degree audits, skill gap cut-lists
  ├── [L] LIBRARIAN ──► RAG synthesis, literature search, YouTube/NPTEL curation
  ├── [T] TUTOR     ──► Socratic step-by-step topic breakdown, active quiz generation
  ├── [E] EDITOR    ──► Structural critique, resume alignment, assignment review
  └── [R] ROOMMATE  ──► Conversational check-ins, study pacing, Pomodoro enforcement

```

### System Prompt Matrix

#### 1. Advisor (`A`)

```markdown
You are ALTER-Advisor. Your responsibility is academic steering and career alignment.
- Map syllabus objectives to concrete industry skills and real-world job roles.
- Identify prerequisite gaps and structure multi-week study milestones.
- Triage workloads into aggressive "cut-lists" when exam dates are near.
- Tone: Strategic, objective, structured, pragmatic.

```

#### 2. Librarian (`L`)

```markdown
You are ALTER-Librarian. Your responsibility is reference discovery and research synthesis.
- Retrieve and ground answers strictly within uploaded handbooks, textbooks, and syllabus files.
- Cite specific page numbers, modules, and sections for all factual claims.
- Curate relevant papers (arXiv/Semantic Scholar), YouTube lectures, and documentation.
- Tone: Academic, precise, reference-oriented.

```

#### 3. Tutor (`T`)

```markdown
You are ALTER-Tutor. Your responsibility is concept mastery and evaluation.
- Break down complex technical ideas using plain language, analogies, and code/math derivations.
- Use Socratic guiding questions to test user comprehension before providing final solutions.
- Formulate dynamic multiple-choice, code snippet, and short-answer quizzes.
- Tone: Encouraging, didactic, analytical, interactive.

```

#### 4. Editor (`E`)

```markdown
You are ALTER-Editor. Your responsibility is document critique and refinement.
- Review assignments, resumes, reports, and presentation outlines.
- Provide targeted line-by-line feedback on structure, technical accuracy, clarity, and ATS score.
- Tone: Critical, professional, constructive.

```

#### 5. Roommate (`R`)

```markdown
You are ALTER-Roommate. Your responsibility is study habits, pacing, and accountability.
- Encourage timely breaks, track daily streaks, and support Pomodoro sessions.
- Provide casual check-ins without long theoretical explanations.
- Tone: Informal, supportive, lighthearted, concise.

```

---

## 5. Database Schema (PostgreSQL with Prisma & pgvector)

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

enum Role {
  STUDENT
  ADMIN
}

enum PersonaType {
  ADVISOR
  LIBRARIAN
  TUTOR
  EDITOR
  ROOMMATE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  CUT
}

model User {
  id              String         @id @default(uuid())
  email           String         @unique
  passwordHash    String
  name            String
  targetRole      String?        // e.g. "Robotics Engineer", "Full Stack Dev"
  degreeName      String?
  currentSemester Int            @default(1)
  gpa             Float?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  documents       Document[]
  courses         Course[]
  schedules       ScheduleBlock[]
  tasks           Task[]
  quizzes         QuizAttempt[]
  sessions        StudySession[]
  chatThreads     ChatThread[]
}

model Document {
  id          String         @id @default(uuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  fileName    String
  fileUrl     String
  fileType    String         // "SYLLABUS", "HANDBOOK", "RESUME", "PAPER"
  parsedText  String?        @db.Text
  createdAt   DateTime       @default(now())
  
  chunks      DocumentChunk[]
}

model DocumentChunk {
  id          String                    @id @default(uuid())
  documentId  String
  document    Document                  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  content     String                    @db.Text
  subjectTag  String?
  moduleIndex Int?
  embedding   Unsupported("vector(768)")? // Standard vector dimension
  createdAt   DateTime                  @default(now())

  @@index([documentId])
}

model Course {
  id          String         @id @default(uuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  code        String         // e.g., "CS301"
  name        String         // e.g., "Operating Systems"
  credits     Int            @default(3)
  color       String         @default("#3B82F6")
  createdAt   DateTime       @default(now())
  
  tasks       Task[]
  schedules   ScheduleBlock[]
  quizzes     Quiz[]
}

model ScheduleBlock {
  id          String         @id @default(uuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId    String?
  course      Course?        @relation(fields: [courseId], references: [id], onDelete: SetNull)
  title       String
  startTime   DateTime
  endTime     DateTime
  isAutoGenerated Boolean    @default(false)
  isRecurring Boolean        @default(false)
  recurrenceRule String?     // e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR"
}

model Task {
  id          String         @id @default(uuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId    String?
  course      Course?        @relation(fields: [courseId], references: [id], onDelete: SetNull)
  title       String
  description String?
  dueDate     DateTime?
  priority    Priority       @default(MEDIUM)
  status      TaskStatus     @default(TODO)
  isCut       Boolean        @default(false)
  createdAt   DateTime       @default(now())
}

model StudySession {
  id          String         @id @default(uuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  durationMin Int
  category    String         // "POMODORO", "LECTURE_REVIEW", "RESEARCH"
  subject     String?
  createdAt   DateTime       @default(now())
}

model Quiz {
  id          String         @id @default(uuid())
  courseId    String?
  course      Course?        @relation(fields: [courseId], references: [id], onDelete: SetNull)
  title       String
  questions   Json           // Array of questions, options, answers, explanations
  createdAt   DateTime       @default(now())
  
  attempts    QuizAttempt[]
}

model QuizAttempt {
  id          String         @id @default(uuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  quizId      String
  quiz        Quiz           @relation(fields: [quizId], references: [id], onDelete: Cascade)
  score       Float
  total       Float
  details     Json           // User responses & evaluation
  createdAt   DateTime       @default(now())
}

model ChatThread {
  id          String         @id @default(uuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  persona     PersonaType    @default(TUTOR)
  messages    Json           // Array of { sender, text, citations, timestamp }
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

```

---

## 6. API Specifications

### Authentication & User Profile

* `POST /api/auth/register` — Create account and hash password with `bcryptjs`.
* `POST /api/auth/login` — Authenticate and issue JWT.
* `GET /api/user/profile` — Fetch student profile, target role, and degree progress.
* `PUT /api/user/profile` — Update career objectives, semester details, and academic targets.

### Document Ingestion & RAG

* `POST /api/documents/upload` — Ingest PDF/Image, run OCR/parser, generate chunks, create embeddings, and store in vector database.
* `GET /api/documents` — List uploaded files, processing statuses, and document metadata.
* `DELETE /api/documents/:id` — Remove document and purge associated vector chunks.

### Persona Assistant & Synthesis

* `POST /api/chat/stream` — Stream LLM response with selected persona context, memory history, and top-k vector citations.
* `POST /api/chat/rag-query` — Execute grounded semantic search across specific document scopes.

### Academic Planner & Task Cut-List

* `GET /api/planner/events` — Retrieve recurring timetable classes and auto-scheduled study slots.
* `POST /api/planner/auto-schedule` — Trigger auto-scheduling algorithm based on deadlines, free time, and task priorities.
* `GET /api/tasks` — List tasks with status filters (`TODO`, `IN_PROGRESS`, `CUT`).
* `PATCH /api/tasks/cut-list` — Run triage to mark non-essential tasks as `isCut: true` during crunch periods.

### Research, Quizzes & Analytics

* `POST /api/research/analyze` — Parse paper URL/PDF, extract findings, and generate project ideas.
* `POST /api/quizzes/generate` — Generate dynamic practice quizzes from syllabus modules or document chunks.
* `POST /api/quizzes/:id/submit` — Submit answers, calculate score, and log attempt to progress profile.
* `GET /api/analytics/dashboard` — Fetch study time distribution, syllabus coverage percentages, and streak metrics.
* `GET /api/external/hackathons` — Fetch aggregated listings from Devpost, Unstop, and Devfolio.

---

## 7. Directory Structure

```
alter-platform/
├── client/                                 # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                            # App Router Pages & Layouts
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (workspace)/
│   │   │   │   ├── layout.tsx              # 30:40:30 AppShell Layout
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── planner/page.tsx
│   │   │   │   ├── reader/page.tsx
│   │   │   │   └── research/page.tsx
│   │   │   ├── globals.css
│   │   │   └── providers.tsx
│   │   ├── components/
│   │   │   ├── panels/
│   │   │   │   ├── LeftPanel.tsx           # Roadmaps, Courses, Pomodoro, Hackathons
│   │   │   │   ├── CenterPanel.tsx         # Planner, Reader, Paper Analyzer, Stats
│   │   │   │   └── RightPanel.tsx          # Notebook Notes, Career Tree, Quiz, Cut-List
│   │   │   ├── floating-console/
│   │   │   │   ├── PersonaConsole.tsx      # Omnipresent Assistant UI
│   │   │   │   ├── PersonaToggle.tsx       # A / L / T / E / R Switcher
│   │   │   │   └── CitationViewer.tsx
│   │   │   ├── visualizers/
│   │   │   │   ├── CareerDependencyTree.tsx # React Flow / Three.js View
│   │   │   │   └── ProgressSphere.tsx      # Three.js 3D Progress Graphic
│   │   │   └── shared/
│   │   │       ├── AudioPlayer.tsx         # Lo-Fi / Focus Ambient Player
│   │   │       └── PomodoroWidget.tsx
│   │   ├── hooks/
│   │   │   ├── usePersonaChat.ts
│   │   │   └── useWorkspaceLayout.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── workspaceStore.ts
│   │   │   └── pomodoroStore.ts
│   │   └── lib/
│   │       ├── api.ts
│   │       └── socket.ts
│   └── package.json
│
├── server/                                 # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── prisma.ts
│   │   │   └── redis.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── documentController.ts
│   │   │   ├── chatController.ts
│   │   │   ├── plannerController.ts
│   │   │   └── analyticsController.ts
│   │   ├── services/
│   │   │   ├── ingestionService.ts         # OCR, text parsing, chunking
│   │   │   ├── ragService.ts               # Embedding generation, vector search
│   │   │   ├── autoScheduleService.ts      # Conflict-free study block allocation
│   │   │   └── hackathonAggregator.ts      # Fetch & cache competition feeds
│   │   ├── personas/
│   │   │   ├── advisorAgent.ts
│   │   │   ├── librarianAgent.ts
│   │   │   ├── tutorAgent.ts
│   │   │   ├── editorAgent.ts
│   │   │   └── roommateAgent.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── documentRoutes.ts
│   │   │   ├── chatRoutes.ts
│   │   │   ├── plannerRoutes.ts
│   │   │   └── analyticsRoutes.ts
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.ts
│   │   │   └── rateLimiter.ts
│   │   └── queues/
│   │       ├── documentQueue.ts            # BullMQ PDF processing worker
│   │       └── schedulerQueue.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── README.md

```

---

## 8. Phased Development Roadmap

### Phase 1: Environment Baseline & Ingestion Pipeline

* Set up Next.js App Router, Express, PostgreSQL with `pgvector`, and Redis.
* Build JWT authentication, user model, and AppShell (30:40:30 layout).
* Implement PDF/Image upload pipeline with `pdf-parse`, chunking engine, and embedding storage in `pgvector`.

### Phase 2: RAG Pipeline & Multi-Persona Engine

* Build vector retrieval service with top-k similarity search and metadata filtering.
* Implement the five persona agents (`A`, `L`, `T`, `E`, `R`) with LangGraph routing.
* Develop the floating UI console with streaming responses, markdown rendering, and citation cards.

### Phase 3: Dynamic Planner & Academic Triaging

* Ingest weekly timetables to build structured class schedules in PostgreSQL.
* Implement the auto-scheduling engine to allocate optimal study blocks around existing classes.
* Build the task cut-list engine to triage and de-prioritize secondary items during crunch weeks.

### Phase 4: Synthesis, Quizzing & Research Hub

* Create the multi-document notebook workspace in the right panel.
* Implement automated quiz generation with instant scoring and explanation generation.
* Build the research paper breakdown interface to extract methodologies and generate project roadmaps.

### Phase 5: Visualizers, Aggregators & External Integrations

* Render the interactive subject-to-career dependency tree using React Flow.
* Add Three.js visual elements for progress and the persona avatar.
* Integrate the Pomodoro timer, ambient Lo-Fi player, and live hackathon aggregator (Devpost/Unstop/Devfolio).
* Build export options for Google Calendar and Notion/Markdown.

---

## 9. Security, Reliability & Quality Assurance

* **Credential Protection:** Passwords hashed with `bcrypt` (12 rounds). JWTs signed using `JWT_SECRET` with explicit expiration.
* **Vector Safety & Data Isolation:** Document chunks strictly partitioned by `userId` in both metadata filters and SQL queries to prevent multi-tenant data leakage.
* **Resilient File Ingestion:** Asynchronous document parsing via BullMQ to keep HTTP handlers non-blocking; OCR timeouts handled gracefully.
* **Prompt Injection Defense:** Strict input sanitization on floating console prompts; retrieved RAG context wrapped in structural tags before model input.
* **API Rate Limiting:** Enforced via `express-rate-limit` on all AI generation and chat streaming routes.