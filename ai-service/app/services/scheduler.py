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
        """Generate a personalized adaptive timetable"""
        subjects_str = ", ".join(request.subjects)
        
        prompt = f"""
You are an expert personalized time management coach and learning designer.
Your goal is to build a highly realistic, conflict-free, 1-day study timetable for a student.

Student Constraints:
- Profile: {request.profile}
- Wake Time: {request.wake_time}
- Sleep Time: {request.sleep_time}
- Meal Times: {request.meal_times}
- External Coaching/Commitments: {request.coaching_time}
- Hobbies/Extras: {request.extras}
- Subjects to Study: {subjects_str}

CRITICAL RULES YOU MUST FOLLOW to ensure a concise output:
1. EQUAL DISTRIBUTION: Time MUST be divided equally among all provided subjects ({subjects_str}).
2. LARGER BLOCKS: Use 1 to 2 hour blocks for study/practice to save JSON generation length. Do NOT create tiny 15-minute segments for every break. Combines breaks into larger chunks.
3. COMPREHENSIVE STRUCTURE: For EACH subject, you must ensure there is time scheduled for "study", "practice", and "test".
4. NO OVERLAP: Ensure strict chronological order. Keep descriptions short and simple to save text length. Format times as "HH:MM AM/PM".

Output the schedule as a JSON object with this exact structure:
{{
  "schedule": [
    {{
      "start": "07:00 AM",
      "end": "07:30 AM",
      "task": "Wake up and Morning Routine",
      "type": "fixed"
    }},
    {{
      "start": "07:30 AM",
      "end": "09:00 AM",
      "task": "Physics Concept Revision",
      "type": "study",
      "subject": "Physics"
    }}
  ]
}}

"type" must strictly be one of: "study", "practice", "test", "fixed", "break", "extra".
"subject" is optional and should only be included if the type is study, practice, or test.

IMPORTANT: Return ONLY valid JSON. No markdown formatting, no code blocks, no trailing text.
"""
        
        response_text = self._call_llm(prompt)
        
        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            response_data = json.loads(cleaned)
            return TimetableResponse(**response_data)
        except Exception as e:
            print(f"Failed to parse timetable JSON: {e}")
            print(f"Raw Output: {response_text}")
            raise Exception("LLM failed to generate a structured timetable. Please try again.")

scheduler_service = SchedulerService()
