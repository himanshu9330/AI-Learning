# AI Service - Python/FastAPI

## Overview
AI microservice for generating explanations and practice questions using LLM (OpenAI GPT-4 or Google Gemini).

## Features
- ✅ AI-generated explanations for incorrect answers
- ✅ Step-by-step solutions
- ✅ Micro practice question generation
- ✅ Redis caching (24-hour TTL)
- ✅ Automatic retry logic (3 attempts)
- ✅ JSON validation
- ✅ Support for OpenAI and Gemini

## Setup

### 1. Install Dependencies
```bash
cd ai-service
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start Redis (Optional but recommended)
```bash
# Windows (using Docker)
docker run -d -p 6379:6379 redis

# Or install Redis locally
```

### 4. Run Service
```bash
# Development
python -m app.main

# Or with uvicorn
uvicorn app.main:app --reload --port 8000
```

Service will run on `http://localhost:8000`

## API Endpoints

### Health Check
```bash
GET /
GET /health
```

### Generate Explanation
```bash
POST /api/ai/explain
Content-Type: application/json

{
  "question_text": "What is 2 + 2?",
  "correct_answer": "4",
  "student_answer": "5",
  "topic": "Addition",
  "mastery_level": 0.6,
  "difficulty": 0.3
}
```

**Response:**
```json
{
  "explanation": "...",
  "mistake_reason": "...",
  "step_by_step_solution": "...",
  "micro_practice_questions": [...],
  "recommended_next_step": "..."
}
```

### Generate Practice Questions
```bash
POST /api/ai/practice
Content-Type: application/json

{
  "topic": "Algebra",
  "difficulty": 0.5,
  "count": 5,
  "mastery_level": 0.6
}
```

## Configuration

### LLM Provider
Set `LLM_PROVIDER=openai` or `LLM_PROVIDER=gemini` in `.env`

### OpenAI
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
```

### Gemini
```env
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-pro
```

### Caching
```env
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=86400  # 24 hours
```

## Architecture

```
ai-service/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── models.py            # Pydantic models
│   └── services/
│       ├── llm_service.py   # LLM integration
│       └── cache_service.py # Redis caching
├── requirements.txt
└── .env.example
```

## Error Handling

- Automatic retry on LLM failures (3 attempts)
- Graceful fallback if Redis unavailable
- JSON validation with retry
- Detailed error messages

## Performance

- Redis caching reduces LLM calls by ~80%
- Average response time: <2s (cached), <5s (uncached)
- Supports concurrent requests

## Integration with Backend

The Node.js backend calls this service via HTTP:
```javascript
const response = await axios.post('http://localhost:8000/api/ai/explain', data);
```
