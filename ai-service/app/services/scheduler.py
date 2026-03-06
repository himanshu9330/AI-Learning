import json
import time
from typing import Dict, Any
from app.config import settings
from app.models import TimetableRequest, TimetableResponse, TimetableScheduleItem

class SchedulerService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        
        if self.provider == "groq":
            from groq import Groq
            self.client = Groq(api_key=settings.GROQ_API_KEY)
            self.model = settings.GROQ_MODEL
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    def _call_groq(self, prompt: str) -> str:
        """Call Groq API"""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3, # Low temperature for strict structured format
            max_tokens=settings.GROQ_MAX_TOKENS
        )
        return response.choices[0].message.content
    
    def _call_llm(self, prompt: str) -> str:
        """Call LLM with retry logic"""
        for attempt in range(settings.MAX_RETRIES):
            try:
                if self.provider == "groq":
                    return self._call_groq(prompt)
            except Exception as e:
                print(f"LLM call attempt {attempt + 1} failed: {e}")
                if attempt < settings.MAX_RETRIES - 1:
                    time.sleep(settings.RETRY_DELAY * (attempt + 1))
                else:
                    raise Exception(f"LLM call failed after {settings.MAX_RETRIES} attempts: {e}")

    def generate_timetable(self, request: TimetableRequest) -> TimetableResponse:
        """Generate a personalized adaptive weekly timetable"""
        subjects_str = ", ".join(request.subjects)
        
        prompt = f"""You are an expert personalized time management coach.
Build a realistic, conflict-free, FULL 7-DAY weekly study timetable (Mon-Sun).

Student Info:
- Profile: {request.profile}
- Wake/Sleep: {request.wake_time} to {request.sleep_time}
- Meals: {request.meal_times}
- Coaching: {request.coaching_time}
- Extras: {request.extras}
- Subjects: {subjects_str}

RULES:
1. COACHING: Parse '{request.coaching_time}'. Place 'fixed' items ONLY on specific days mentioned (e.g. 'Monday'). If no day, apply daily.
2. VARIATION: Weekdays focus on study/practice. Weekends focus on test/revision.
3. BLOCKS: Use 1-2 hour blocks for study. Keep task names VERY SHORT.
4. EQUAL TIME: Divide study hours equally among {subjects_str}.
5. FORMAT: JSON ONLY.

JSON Schema:
{{
  "weekly_schedule": {{
    "Monday": [
      {{ "start": "07:00 AM", "end": "08:30 AM", "task": "Subject Study", "type": "study", "subject": "SubjectName" }}
    ],
    "Tuesday": [], 
    "Wednesday": [], 
    "Thursday": [], 
    "Friday": [], 
    "Saturday": [], 
    "Sunday": []
  }}
}}

"type" enum: "study", "practice", "test", "fixed", "break", "extra".

IMPORTANT: RETURN ONLY VALID JSON. NO CONVERSATION. NO MARKDOWN."""
        
        response_text = self._call_llm(prompt)
        
        try:
            # Robust JSON extraction
            cleaned = response_text.strip()
            if "```" in cleaned:
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            cleaned = cleaned.strip()
            
            # Find the first { and last }
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1:
                cleaned = cleaned[start:end+1]
            
            response_data = json.loads(cleaned)
            return TimetableResponse(**response_data)
        except Exception as e:
            print(f"Failed to parse timetable JSON: {str(e)}")
            print(f"Full Raw Output for debugging:\n{response_text}")
            raise Exception(f"AI Generation failed to produce valid JSON: {str(e)}")

scheduler_service = SchedulerService()
