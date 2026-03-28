<p align="center">
  <img src="frontend/app/logo.png" alt="AI Adaptive Learning Platform" width="80" />
</p>

<h1 align="center">🧠 AI-Powered Adaptive Learning Platform</h1>

<p align="center">
  <strong>An intelligent exam preparation system that adapts to each student in real-time using AI</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express.js-4.18-green?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/LLM-Groq%20(Llama%203)-orange" alt="Groq" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript" />
</p>

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [AI/ML Features Deep Dive](#-aiml-features-deep-dive)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Screenshots & Demo](#-screenshots--demo)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [How the Adaptive Algorithm Works](#-how-the-adaptive-algorithm-works)
- [Security](#-security)
- [Team](#-team)

---

## 🎯 Problem Statement

**Education today follows a one-size-fits-all approach.** Every student gets the same questions, the same pace, and the same study material — regardless of their individual strengths and weaknesses.

This leads to:
- ❌ Students wasting time on topics they've already mastered
- ❌ Weak topics going unidentified and unaddressed
- ❌ No personalized recovery plan after poor test performance
- ❌ Lack of AI-driven guidance for self-study

---

## 💡 Our Solution

We built a **full-stack AI-powered adaptive learning platform** that personalizes every aspect of exam preparation:

| What We Do | How We Do It |
|---|---|
| **Diagnose** student knowledge gaps | Real-time adaptive testing with 3-tier difficulty promotion |
| **Explain** mistakes intelligently | LLM-generated explanations with step-by-step solutions |
| **Plan** personalized recovery | AI-generated 7-day study roadmaps based on weak topics |
| **Schedule** study time smartly | AI-powered daily timetable generator with meal/sleep awareness |
| **Summarize** learning content | YouTube video → structured exam-ready notes (with Whisper fallback) |
| **Track** mastery over time | Topic-level heatmaps, ability scores, and analytics dashboard |

---

## ✨ Key Features

### 1. 🎯 Adaptive Diagnostic Testing
- **3-tier difficulty system** (Easy → Medium → Hard) with automatic level promotion
- Questions served from a structured JSON question bank (exam-specific: JEE, NEET, etc.)
- **Batch evaluation**: Promote after 4/5 correct; terminate after 3 incorrect
- Dynamic scoring: Easy = 1 mark, Medium = 2 marks, Hard = 4 marks
- Real-time ability tracking throughout the test session

### 2. 🤖 AI-Powered Explanations
- When a student answers incorrectly, the LLM generates:
  - ✅ Detailed concept explanation
  - ✅ Analysis of *why* the student likely made the mistake
  - ✅ Step-by-step solution walkthrough
  - ✅ 3 micro-practice questions for immediate reinforcement
  - ✅ Recommended next steps + relevant YouTube video link
- Responses cached for 24 hours (Redis) to minimize API costs

### 3. 📅 AI-Generated 7-Day Study Roadmap
- Built from the student's actual test performance data
- Identifies weak topics (accuracy < 80%) across difficulty levels
- Cross-references with historical mastery data for multi-subject recovery
- **AI prioritization**: LLM ranks topics by exam importance, logical prerequisites, and student weakness
- Includes personalized coaching messages (e.g., *"Since your accuracy in Thermodynamics was low, let's strengthen it today"*)
- Deterministic fallback if LLM fails (dynamic difficulty weighting algorithm)

### 4. ⏰ Smart Daily Timetable
- Students input their wake/sleep times, meal times, and preferred subjects
- AI generates an optimized hour-by-hour study schedule
- Accounts for breaks, meal times, and study fatigue
- Overwrites previous timetable on regeneration

### 5. 🎬 YouTube Video Summarizer
- Paste any educational YouTube URL → get structured study notes
- **Pipeline**: Transcript extraction → Whisper STT fallback (if no captions) → LLM summarization
- Output includes:
  - Main topic overview
  - Key concepts & definitions/formulas
  - Step-by-step explanations
  - Topic-wise timestamps
  - Exam-relevant points
  - Quick revision summary
- Cached for 7 days per video

### 6. 📊 Analytics Dashboard
- **Ability Meter**: Visual gauge showing student's overall ability (0–1 scale)
- **Topic Mastery Heatmap**: Color-coded grid showing weak/moderate/strong topics
- **Performance Trends**: Historical accuracy, ability score progression over time
- **Recent Activity Feed**: Latest test results and study actions

### 7. 🔐 Authentication & Profiles
- JWT-based authentication with bcrypt password hashing
- Google OAuth login support
- Student profiles with grade level, target exam, and ability tracking

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 16)                       │
│  Landing Page │ Adaptive Test │ Dashboard │ Roadmap │ Summarizer    │
│  TypeScript + Tailwind CSS + Framer Motion + Recharts               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ REST API (axios)
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js / Node.js)                  │
│                                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌────────────────┐  │
│  │   Auth   │  │   Adaptive   │  │  Roadmap  │  │   Timetable    │  │
│  │ Service  │  │   Engine     │  │  Service  │  │   Service      │  │
│  └──────────┘  └──────────────┘  └───────────┘  └────────────────┘  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌────────────────┐  │
│  │Analytics │  │  AI Service  │  │  Mastery  │  │ JSON Question  │  │
│  │ Service  │  │  (Proxy)     │  │Calculator │  │   Loader       │  │
│  └──────────┘  └──────────────┘  └───────────┘  └────────────────┘  │
│                                                                      │
│  MongoDB (Mongoose) │ JWT Auth │ Helmet │ Rate Limiting │ Winston   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Internal HTTP (axios)
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    AI SERVICE (FastAPI / Python)                      │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────┐ │
│  │ LLM Service │  │Video Service │  │   Whisper STT Service       │ │
│  │ (Groq API)  │  │(yt-transcript│  │   (OpenAI Whisper + yt-dlp) │ │
│  │             │  │  -api)       │  │                             │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐                                  │
│  │Cache Service│  │  Scheduler   │                                  │
│  │  (Redis)    │  │  Service     │                                  │
│  └─────────────┘  └──────────────┘                                  │
│                                                                      │
│  Endpoints: /explain │ /practice │ /summarize-video │ /roadmap      │
│             /timetable │ /prioritize-topics                         │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI/ML Features Deep Dive

### LLM Integration (Groq — Llama 3 / Mixtral)
| Feature | Prompt Engineering | Fallback |
|---|---|---|
| Explanations | Expert tutor persona; includes mastery level & difficulty context | Retry with explicit JSON reminder (3 attempts) |
| Topic Prioritization | Curriculum designer persona; considers exam weightage & prerequisites | Mathematical priority = `1 - avg_accuracy` |
| 7-Day Roadmap | Recovery-path designer; personalized coaching tone | Deterministic plan with dynamic difficulty weighting |
| Video Summarization | AI educator persona; outputs timestamps & exam-relevant points | Raises error if both transcript & Whisper fail |
| Timetable | Schedule optimizer; accounts for fatigue and breaks | Deterministic slot-based scheduler |

### Whisper Speech-to-Text Pipeline
For videos **without captions**, the system automatically:
1. Downloads audio using `yt-dlp`
2. Transcribes using **OpenAI Whisper** (local model)
3. Formats transcript with timestamps
4. Feeds into the LLM summarization pipeline

### Adaptive Algorithm Details
The adaptive engine uses a **batch-based promotion system** rather than simple IRT:

```
┌─────────────────────────────────────────────────────┐
│                 ADAPTIVE TEST FLOW                   │
│                                                      │
│  Start at Level 1 (Easy)                             │
│       │                                              │
│       ▼                                              │
│  Serve 5 questions (batch)                           │
│       │                                              │
│       ├── ≥4 correct → PROMOTE to next level         │
│       ├── ≥3 incorrect → TERMINATE test              │
│       └── Otherwise → STAY at same level             │
│       │                                              │
│       ▼                                              │
│  Reset batch counters, continue                      │
│       │                                              │
│  Scoring: Easy=1pt, Medium=2pt, Hard=4pt             │
└─────────────────────────────────────────────────────┘
```

### Mastery Calculation
```
mastery_score = (correct_attempts / total_attempts) × 100

Classification:
  < 40%  → 🔴 Weak
  < 70%  → 🟡 Moderate
  ≥ 70%  → 🟢 Strong
```

### Roadmap Dynamic Weighting
The roadmap adjusts study difficulty distribution based on actual test performance:

| Scenario | Easy % | Medium % | Hard % |
|---|---|---|---|
| Easy accuracy < 60% (weak foundation) | **80%** | 15% | 5% |
| Good Easy, failing Medium (stuck) | 20% | **60%** | 20% |
| Good Medium, failing Hard (advancing) | 10% | 30% | **60%** |
| Default fallback | 40% | 40% | 20% |

---

## ⚙️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Animations & page transitions |
| **Recharts** | Performance analytics charts |
| **Lucide React** | Icon library |
| **React Hot Toast** | User notifications |
| **react-circular-progressbar** | Ability meter visualization |

### Backend
| Technology | Purpose |
|---|---|
| **Express.js 4.18** | REST API framework |
| **MongoDB + Mongoose 7** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Helmet** | Security headers |
| **express-rate-limit** | API rate limiting |
| **Winston** | Structured logging with daily rotation |
| **Joi + express-validator** | Input validation |
| **Google Auth Library** | OAuth support |

### AI Microservice
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance Python API |
| **Groq SDK** | LLM inference (Llama 3 / Mixtral) |
| **Redis** | Response caching (24h explanations, 7d summaries) |
| **youtube-transcript-api** | YouTube transcript extraction |
| **OpenAI Whisper** | Speech-to-text for captionless videos |
| **yt-dlp** | YouTube audio download |
| **Pydantic** | Request/response validation |

---

## 📁 Project Structure

```
AI-learning/
│
├── frontend/                          # Next.js 16 (TypeScript)
│   ├── app/
│   │   ├── (auth)/                    # Login & Register pages
│   │   ├── (dashboard)/               # Protected dashboard routes
│   │   │   ├── dashboard/             #   Main dashboard (analytics)
│   │   │   ├── test/                  #   Adaptive test interface
│   │   │   ├── analytics/             #   Detailed performance analytics
│   │   │   ├── roadmap/               #   AI-generated study roadmap view
│   │   │   ├── timetable/             #   Smart timetable generator
│   │   │   ├── profile/               #   Student profile management
│   │   │   └── settings/              #   App settings
│   │   ├── summarizer/                # YouTube video summarizer page
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Landing page
│   ├── components/
│   │   ├── landing/                   # Hero, Navbar, HowItWorks, CTA, etc.
│   │   ├── dashboard/                 # Heatmap, AbilityMeter, Timetable widgets
│   │   ├── test/                      # Question card, timer, progress bar
│   │   ├── ui/                        # Reusable UI primitives (Button, Card)
│   │   ├── QuestionCard.tsx           # MCQ question interface
│   │   ├── ExplanationModal.tsx       # AI explanation display modal
│   │   └── TopicMasteryHeatmap.tsx    # Visual mastery grid
│   ├── contexts/                      # React context (Auth)
│   ├── services/                      # API service layer
│   └── lib/                           # Utilities (apiClient, helpers)
│
├── backend/                           # Express.js (Node.js)
│   ├── src/
│   │   ├── models/                    # 9 Mongoose schemas
│   │   │   ├── User.js                #   Student profile & ability score
│   │   │   ├── Question.js            #   Question bank schema
│   │   │   ├── Test.js                #   Test result records
│   │   │   ├── TestSession.js         #   Active test session state
│   │   │   ├── Answer.js              #   Individual answer records
│   │   │   ├── TopicMastery.js        #   Per-topic mastery tracking
│   │   │   ├── Roadmap.js             #   Generated study roadmaps
│   │   │   ├── Timetable.js           #   Daily schedules
│   │   │   └── DailySchedule.js       #   Schedule entries
│   │   ├── services/                  # Core business logic
│   │   │   ├── adaptiveEngine.js      #   ⭐ Adaptive testing algorithm
│   │   │   ├── testService.js         #   Test lifecycle management
│   │   │   ├── abilityService.js      #   Ability score calculations
│   │   │   ├── analyticsService.js    #   Performance analytics
│   │   │   ├── roadmapService.js      #   ⭐ AI roadmap generation with fallback
│   │   │   ├── aiService.js           #   Proxy to Python AI service
│   │   │   ├── scheduleService.js     #   Timetable logic
│   │   │   └── authService.js         #   Authentication logic
│   │   ├── controllers/               # 8 HTTP controllers
│   │   ├── routes/                    # 9 route modules
│   │   ├── utils/                     # Algorithms & helpers
│   │   │   ├── adaptiveAlgorithm.js   #   Core adaptive math
│   │   │   ├── masteryCalculator.js   #   Topic mastery computation
│   │   │   ├── jsonLoader.js          #   Question bank loader
│   │   │   └── logger.js             #   Winston logging setup
│   │   ├── middlewares/               # Auth, error handling
│   │   ├── validators/                # Input validation schemas
│   │   └── config/                    # App configuration
│   └── data/                          # Question bank JSON files
│
├── ai-service/                        # FastAPI (Python)
│   ├── app/
│   │   ├── main.py                    # 6 API endpoints
│   │   ├── models.py                  # Pydantic request/response models
│   │   ├── config.py                  # Environment configuration
│   │   └── services/
│   │       ├── llm_service.py         # ⭐ Groq LLM integration (5 features)
│   │       ├── video_service.py       # YouTube transcript extraction
│   │       ├── whisper_service.py     # Whisper STT fallback
│   │       ├── cache_service.py       # Redis caching layer
│   │       └── scheduler.py          # Timetable generation
│   └── requirements.txt
│
└── README.md
```

---

## 🖼 Screenshots & Demo

> 📹 **Live Demo**: Run locally to see all features in action (see setup below).

### Pages & Features

| Page | Description |
|---|---|
| **Landing Page** | Animated hero with gradient effects, "How It Works" flow, feature showcases, CTA |
| **Adaptive Test** | Real-time question cards with timer, progress bar, difficulty indicator |
| **AI Explanation** | Modal with step-by-step solution, mistake analysis, micro-practice questions |
| **Dashboard** | Ability meter gauge, topic mastery heatmap, recent activity, timetable widget |
| **Analytics** | Ability history chart, topic growth trends, accuracy breakdown |
| **Roadmap** | 7-day study plan cards with task completion tracking |
| **Timetable** | Hour-by-hour daily schedule with subject color coding |
| **Video Summarizer** | YouTube URL input → structured notes with timestamps & exam points |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18.0 |
| Python | ≥ 3.10 |
| MongoDB | ≥ 6.0 |
| Redis | Optional (for caching) |

### 1. Clone the Repository

```bash
git clone https://github.com/himanshu9330/AI-Learning.git
cd AI-Learning
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure `.env`:
```env
NODE_ENV=development
PORT=5005
MONGODB_URI=mongodb://localhost:27017/adaptive_learning
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
AI_SERVICE_URL=http://localhost:8000
```

Start the backend:
```bash
npm start          # Production
# or
npm run dev        # Development (with hot reload)
```

> Backend runs at `http://localhost:5005`

### 3. AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
```

Configure `.env`:
```env
GROQ_API_KEY=your_groq_api_key
LLM_PROVIDER=groq
GROQ_MODEL=llama3-70b-8192
```

Start the AI service:
```bash
python -m app.main
```

> AI Service runs at `http://localhost:8000`

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Configure `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5005/api/v1
```

Start the frontend:
```bash
npm run dev
```

> Frontend runs at `http://localhost:3000`

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new student |
| POST | `/api/v1/auth/login` | Login & receive JWT token |
| GET | `/api/v1/auth/profile` | Get authenticated user profile |
| PUT | `/api/v1/auth/profile` | Update user profile |

### Adaptive Testing
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/test/start` | Start a new adaptive test session |
| POST | `/api/v1/test/answer` | Submit an answer & get next question |
| GET | `/api/v1/test/result/:testId` | Get detailed test results |
| GET | `/api/v1/test/history` | Get user's test history |

### AI-Powered Features
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/ai/explain` | Generate AI explanation for wrong answer |
| POST | `/api/v1/ai/practice` | Generate practice questions for a topic |
| POST | `/api/v1/video/summarize` | Summarize a YouTube video into notes |

### Analytics & Tracking
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/analytics/performance` | Overall performance statistics |
| GET | `/api/v1/analytics/ability-history` | Ability score over time |
| GET | `/api/v1/analytics/topic-growth` | Topic mastery growth data |
| GET | `/api/v1/analytics/improvement` | Improvement metrics |

### Roadmap & Timetable
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/roadmap/generate` | Generate AI-powered 7-day study plan |
| GET | `/api/v1/roadmap/latest` | Get latest generated roadmap |
| POST | `/api/v1/timetable/generate` | Generate smart daily timetable |
| GET | `/api/v1/timetable/current` | Get user's active timetable |

---

## 🧠 How the Adaptive Algorithm Works

### 1. Test Session Lifecycle

```
Student selects: Exam → Subject → Chapter → Topic
                              │
                              ▼
              ┌─────────────────────────────┐
              │ Session starts at Level 1    │
              │ (Easy questions)             │
              └──────────┬──────────────────┘
                         │
              ┌──────────▼──────────────────┐
              │ Serve question from JSON bank │◄─────┐
              │ (matching difficulty + topic) │      │
              └──────────┬──────────────────┘      │
                         │                          │
              ┌──────────▼──────────────────┐      │
              │ Student answers              │      │
              │ Record: correct/incorrect    │      │
              │ Update batch counters        │      │
              └──────────┬──────────────────┘      │
                         │                          │
              ┌──────────▼──────────────────┐      │
              │ EVALUATE BATCH               │      │
              │                              │      │
              │ ≥3 incorrect? → TERMINATE    │      │
              │ batch < 5?    → CONTINUE ────┼──────┘
              │ ≥4 correct?   → PROMOTE      │
              │ else          → STAY         │
              └──────────┬──────────────────┘
                         │
              ┌──────────▼──────────────────┐
              │ Generate Results             │
              │ • Total score                │
              │ • Topic mastery updates      │
              │ • AI-generated roadmap       │
              └─────────────────────────────┘
```

### 2. Post-Test AI Pipeline

After test completion, the system automatically:
1. **Calculates** per-topic accuracy at each difficulty level
2. **Fetches** historical weak topics from the mastery database
3. **Sends** merged data to the LLM for topic prioritization
4. **Generates** a personalized 7-day study roadmap
5. **Stores** the roadmap in MongoDB for frontend display

---

## 🔐 Security

| Feature | Implementation |
|---|---|
| Authentication | JWT tokens with configurable expiry |
| Password Storage | bcrypt hashing (salt rounds) |
| API Protection | Rate limiting (express-rate-limit) |
| Headers | Helmet.js security headers |
| CORS | Configurable origin whitelist |
| Input Validation | Joi schemas + express-validator |
| Request Logging | Morgan + Winston with daily log rotation |

---

## 📊 Database Schema (9 Collections)

```
┌──────────┐     ┌────────────┐     ┌──────────┐
│  Users   │────▶│TestSessions│────▶│ Answers  │
│          │     │            │     │          │
│ ability  │     │ level      │     │ correct  │
│ grade    │     │ batch stats│     │ topic    │
│ exam     │     │ score      │     │ time     │
└──────────┘     └────────────┘     └──────────┘
     │                                    │
     ▼                                    ▼
┌──────────┐     ┌────────────┐     ┌──────────┐
│Questions │     │TopicMastery│     │ Roadmaps │
│          │     │            │     │          │
│ bank     │     │ score      │     │ week_plan│
│ subject  │     │ class      │     │ tasks    │
│ topic    │     │ attempts   │     │ summary  │
└──────────┘     └────────────┘     └──────────┘
     ┌──────────┐     ┌────────────┐
     │  Tests   │     │ Timetables │
     │          │     │            │
     │ results  │     │ schedule   │
     │ history  │     │ slots      │
     └──────────┘     └────────────┘
```

---

## 🔮 Future Enhancements

- [ ] Multi-language support (Hindi, regional languages)
- [ ] Peer-to-peer doubt resolution
- [ ] Gamification (streaks, badges, leaderboard)
- [ ] Mobile app (React Native)
- [ ] Real-time collaborative study rooms
- [ ] Integration with school LMS platforms

---

## 👨‍💻 Team

Built with ❤️ by **Himanshu** — for smarter, personalized education.

---

<p align="center">
  <strong>⭐ If you find this project valuable, consider giving it a star!</strong>
</p>
