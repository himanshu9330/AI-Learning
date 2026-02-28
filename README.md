# AI-Powered Adaptive Learning Platform

## 🎯 Project Overview

An intelligent adaptive learning system that dynamically adjusts question difficulty, tracks topic mastery, provides AI-generated explanations, and generates personalized weekly study roadmaps.

## 🚀 Features

- **Adaptive Testing**: Real-time difficulty adjustment based on student performance
- **Topic Mastery Tracking**: Automatic calculation and classification of topic proficiency
- **Ability Score System**: 0-1 scale tracking student capability
- **Weekly Roadmaps**: AI-generated personalized study plans
- **Analytics Dashboard**: Comprehensive performance tracking and insights
- **Smart Question Selection**: ±0.05 difficulty range with gradual expansion

## 📦 Tech Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate Limiting

### AI Service
- **Framework**: FastAPI (Python)
- **LLM**: Groq (Llama 3 / Mixtral)
- **Caching**: Redis
- **Features**: Explanations, Practice Generation, Video Summarization, Roadmap Generation

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Framer Motion
- **Features**: Interactive Dashboard, Heatmap, Ability Meter, Adaptive Test Interface

## 🏗️ Project Structure

```
AI-learning/
├── backend/                 # Express.js API (✅ COMPLETE)
│   ├── src/
│   │   ├── models/         # 5 Mongoose models
│   │   ├── services/       # Business logic
│   │   ├── controllers/    # HTTP handlers
│   │   ├── routes/         # API routes
│   │   ├── validators/     # Input validation
│   │   ├── utils/          # Algorithms & utilities
│   │   ├── middlewares/    # Express middlewares
│   │   └── config/         # Configuration
│   └── package.json
│
├── ai-service/             # Python FastAPI (✅ COMPLETE)
│   ├── app/
│   │   ├── main.py         # FastAPI endpoints
│   │   ├── services/       # LLM, Video, Whisper services
│   │   └── models.py       # Pydantic models
│   └── requirements.txt
│
├── frontend/               # Next.js (✅ COMPLETE)
│   ├── app/                # App Router pages (Dashboard, Test, Profile)
│   ├── components/         # React Components (UI, Dashboard, Landing)
│   └── lib/                # Utilities and API clients
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get profile
- `PUT /api/v1/auth/profile` - Update profile

### Adaptive Testing
- `POST /api/v1/test/start` - Start adaptive test
- `POST /api/v1/test/answer` - Submit answer
- `GET /api/v1/test/result/:testId` - Get results
- `GET /api/v1/test/history` - Test history

### Analytics
- `GET /api/v1/analytics/ability-history` - Ability over time
- `GET /api/v1/analytics/topic-growth` - Topic mastery growth
- `GET /api/v1/analytics/performance` - Performance stats
- `GET /api/v1/analytics/improvement` - Improvement metrics

### Roadmap
- `GET /api/v1/roadmap/generate` - Generate weekly plan
- `GET /api/v1/roadmap/mastery` - Topic mastery summary
- `GET /api/v1/roadmap/focus-topics` - Recommended topics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Python 3.10+ (for AI service)

### Backend Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**
```bash
mongod
```

4. **Run backend**
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/adaptive_learning
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

## 📊 Database Models

### User
- Ability score (0-1)
- Grade & target exam
- Authentication credentials

### Question
- Difficulty (0-1)
- Subject & topic tags
- Options & correct answer
- Explanation

### Test
- User reference
- Ability before/after
- Questions attempted
- Final score

### Answer
- User & question reference
- Response time
- Correctness
- Topic tags

### TopicMastery
- User & topic
- Mastery score (0-1)
- Classification (weak/moderate/strong)
- Attempts tracking

## 🧠 Adaptive Algorithm

### Question Selection
```
1. Start with ±0.05 difficulty range from user ability
2. If no questions found, expand by 0.05
3. Maximum expansion: ±0.3
4. Random selection from available questions
```

### Ability Update
```
If correct:
  new_ability = current + 0.05 * (1 - difficulty)

If incorrect:
  new_ability = current - 0.05 * difficulty

Clamp between 0 and 1
```

### Mastery Calculation
```
mastery_score = correct_attempts / total_attempts

Classification:
  < 0.4: weak
  < 0.7: moderate
  ≥ 0.7: strong
```

## 📈 Usage Example

### 1. Register & Login
```javascript
// Register
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "grade": "12th",
  "target_exam": "JEE"
}

// Login
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "Password123"
}
// Returns: { token, user }
```

### 2. Start Adaptive Test
```javascript
POST /api/v1/test/start
Authorization: Bearer <token>
{
  "subject": "Mathematics"
}
// Returns: { test, current_question, ability_score }
```

### 3. Submit Answer
```javascript
POST /api/v1/test/answer
Authorization: Bearer <token>
{
  "test_id": "TEST-xxx",
  "question_id": "Q001",
  "selected_option": "x = 2, 3",
  "response_time_ms": 15000
}
// Returns: { is_correct, new_ability, next_question }
```

### 4. Get Weekly Roadmap
```javascript
GET /api/v1/roadmap/generate
Authorization: Bearer <token>
// Returns: { week_plan: [...], summary }
```

## 🔐 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention

## 📝 Development Status

- ✅ **Phase 1**: Database models & setup
- ✅ **Phase 2**: Adaptive engine & test system
- ✅ **Phase 3**: AI microservice (Python/FastAPI)
- ✅ **Phase 4**: Topic mastery & analytics
- ✅ **Phase 5**: Weekly roadmap generator
- ✅ **Phase 6**: API routes & integration
- ✅ **Phase 7**: Frontend (Next.js Dashboard & Test Interface)
- ⏳ **Phase 8**: Testing & deployment

## 🤝 Contributing

This is a production-ready adaptive learning platform. Contributions welcome!

## 📄 License

MIT License

## 👨‍💻 Author

Built with ❤️ for intelligent education by Himanshu

---

**Project Status**: ✅ MVP Complete  
**Next**: Comprehensive Testing & Deployment
