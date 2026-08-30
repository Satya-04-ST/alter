# ALTER: AI Academic Operations & Multi-Persona Orchestration Platform

> **A high-throughput, multi-persona AI academic operating system designed for modern university students, engineering researchers, and STEM scholars.**

---

## 🌟 Overview & System Capabilities

ALTER unifies academic knowledge ingestion, multi-persona AI guidance, conflict-free auto-scheduling, dynamic active-recall quizzing, and interactive research synthesis into a singular, dark cyber-academic 30 : 40 : 30 AppShell workspace.

---

## 🏗️ Architecture & Completed Phases

### **Phase 1: Foundation, Auth & Ingestion Engine**
- **Auth & Multi-Tenancy:** JWT (HS256) auth, bcrypt (12 rounds), strict rate limiters, and `userId`-partitioned data isolation.
- **Document Ingestion Engine:** PDF-parse with OCR fallback (`tesseract.js`), 400-token chunking with 50-token overlap, and 768-dim dense embeddings.
- **AppShell UI:** Next.js 15 App Router with 30 : 40 : 30 three-panel responsive cyber-academic layout.

### **Phase 2: RAG Pipeline & Multi-Persona Engine**
- **5 Autonomous Persona Agents:**
  - `[A]` **Advisor:** Degree milestones, prerequisite gap detection, and workload cut-lists.
  - `[L]` **Librarian:** Grounded citations from syllabus documents with page and module numbers.
  - `[T]` **Tutor:** Socratic concept mastery, step-by-step math/code derivations, and dynamic quiz generation.
  - `[E]` **Editor:** Line-by-line structural review, ATS resume alignment, and draft critiques.
  - `[R]` **Roommate:** Study pacing, Pomodoro enforcement, and daily focus streaks.
- **LangGraph Orchestrator:** StateGraph pipeline with retrieval augmentation and real-time SSE token streaming.
- **Floating Console:** Draggable floating assistant with global hotkey (`Cmd/Ctrl + K`) and interactive citation badges.

### **Phase 3: Dynamic Planner & Academic Triaging**
- **Timetable Ingestion:** Parses day-of-week slots, start/end hours, and course codes (e.g., `CS402`, `ROB701`).
- **Conflict-Free Auto-Scheduler:** Allocates non-overlapping study blocks around existing classes and user commitments.
- **Academic Cut-List Engine:** "Crunch Triage" algorithm that de-prioritizes non-essential assignments while preserving core degree credits.

### **Phase 4: Synthesis, Quizzing & Research Hub**
- **Active-Recall Quizzer:** Formulates multi-level multiple-choice evaluation quizzes tailored to specific syllabus topics with Socratic Tutor feedback.
- **Multi-Source Synthesis Notebook:** Aggregates syllabus modules, textbooks, and transcripts into comprehensive executive study guides with formula tables and citations.
- **Knowledge Graph Visualizer:** Interactive DAG visualizer of concept dependencies, prerequisites, and arXiv research papers.

### **Phase 5: Visualizers, Aggregators & External Integrations**
- **React Flow Concept DAG:** High-fidelity interactive `@xyflow/react` node graph with mini-map and pan/zoom controls.
- **Student Hackathons & Grants Feed:** Curated competition discovery cards with prize pools, deadlines, and skill tag filtering.
- **ArXiv Research Feed:** Real-time paper search engine for distributed systems, robotics, and machine learning.
- **Pomodoro Audio Synthesizer:** Cyber-academic focus player with Web Audio API sound alert synthesis and study session logging.
- **RFC 5545 iCalendar (.ics) Export:** One-click calendar sync for Google Calendar, Apple Calendar, and Outlook.

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Satya-04-ST/alter.git
cd ALTER

# Install all dependencies across root, server, and client
npm run install:all
```

### 3. Environment Setup
Copy the template files into active `.env` files:
```bash
cp .env.example .env
cp .env.example server/.env
cp .env.example client/.env.local
```

### 4. Running the Development Servers
```bash
# Start both Backend (Port 5000) and Frontend (Port 3000) concurrently
npm run dev

# Or start individually:
npm run dev:server   # Starts Express backend at http://localhost:5000
npm run dev:client   # Starts Next.js frontend at http://localhost:3000
```

---

## 🧪 Master Automated Regression Testing

Execute our comprehensive test suites across any phase:

```bash
# Run the Master Full-Platform Regression Suite (Phases 1 through 5)
npm run test:all

# Run individual phase test suites:
npm run test:phase1   # Auth, Ingestion, Vector search & Health
npm run test:phase2   # RAG pipeline, 5 Personas & SSE streaming
npm run test:phase3   # Timetable parser, Auto-scheduler & Cut-list triage
npm run test:phase4   # Dynamic quizzing, Grading & Study guide synthesis
npm run test:phase5   # iCal export, Pomodoro logging, ArXiv & Hackathons
```

---

## 🚀 Production Deployment

### Recommended Cloud Topology
* **Frontend:** Vercel (Auto-deploy Next.js 15 app).
* **Backend & Socket.IO:** Railway, Render, or Fly.io (`npm run start --prefix server`).
* **Database:** Supabase or Neon (PostgreSQL with `pgvector`).
* **Redis Cache / Queues:** Upstash Redis.

### Production Build
```bash
# Build both server and client bundles
npm run build
```
