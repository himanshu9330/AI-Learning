import json
import time
from typing import Dict, Any
from app.config import settings
from app.models import (
    ExplanationRequest, ExplanationResponse, 
    PracticeRequest, PracticeQuestion,
    TopicPriorityRequest, TopicPriority, TopicPriorityResponse,
    VideoSummarizeRequest, VideoSummarizeResponse, VideoSummaryResponse,
    RoadmapRequest, RoadmapResponse, RoadmapDay, RoadmapTask, TopicPerformance
)

class LLMService:
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
            temperature=settings.GROQ_TEMPERATURE,
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
    
    def generate_explanation(self, request: ExplanationRequest) -> ExplanationResponse:
        """Generate explanation for incorrect answer"""
        prompt = f"""
You are an expert tutor helping a student understand their mistake.

Question: {request.question_text}
Correct Answer: {request.correct_answer}
Student's Answer: {request.student_answer}
Topic: {request.topic}
Student's Mastery Level: {request.mastery_level:.2f} (0=beginner, 1=expert)
Question Difficulty: {request.difficulty:.2f}

Provide a detailed explanation in JSON format with these exact keys:
{{
  "explanation": "Clear explanation of the concept (2-3 sentences)",
  "mistake_reason": "Why the student likely chose the wrong answer",
  "step_by_step_solution": "Detailed step-by-step solution with clear steps",
  "micro_practice_questions": [
    {{
      "question": "Similar practice question 1",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option X"
    }},
    {{
      "question": "Similar practice question 2",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option X"
    }},
    {{
      "question": "Similar practice question 3",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option X"
    }}
  ],
  "recommended_next_step": "What the student should study or practice next",
  "youtube_link": "A highly relevant educational YouTube video link (e.g., from Khan Academy, Physics Wallah, or similar) explaining the concept"
}}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, just pure JSON.
"""
        
        # Call LLM with retry
        response_text = self._call_llm(prompt)
        
        # Parse JSON with retry
        for attempt in range(settings.MAX_RETRIES):
            try:
                # Clean response (remove markdown if present)
                cleaned = response_text.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                if cleaned.startswith("```"):
                    cleaned = cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
                
                response_data = json.loads(cleaned)
                
                # Validate required keys
                required_keys = ['explanation', 'mistake_reason', 'step_by_step_solution', 
                               'micro_practice_questions', 'recommended_next_step', 'youtube_link']
                if all(key in response_data for key in required_keys):
                    return ExplanationResponse(**response_data)
                else:
                    raise ValueError("Missing required keys in response")
            
            except (json.JSONDecodeError, ValueError) as e:
                print(f"JSON parse attempt {attempt + 1} failed: {e}")
                if attempt < settings.MAX_RETRIES - 1:
                    # Retry with more explicit prompt
                    prompt += "\n\nREMINDER: Return ONLY valid JSON without any markdown formatting."
                    response_text = self._call_llm(prompt)
                else:
                    raise Exception(f"Failed to parse valid JSON after {settings.MAX_RETRIES} attempts")
    
    def prioritize_topics(self, request: TopicPriorityRequest) -> TopicPriorityResponse:
        """Prioritize topics based on performance and importance"""
        topics_json = [t.dict() for t in request.topics]
        
        prompt = f"""
You are an expert curriculum designer for {request.subject}. 
Given the following student performance data on specific topics, analyze which topics should be prioritized in their personalized study roadmap.

Topics data:
{json.dumps(topics_json, indent=2)}

Analysis criteria:
1. Topic Difficulty (from data): If accuracy is low on Easy/Medium, it's a priority.
2. Topic Importance: Based on your expert knowledge of {request.subject} (e.g., JEE/NEET exams), some topics are more fundamental or weightier in exams.
3. Logical Progression: Prerequisite topics should come first.

Calculate a priority_score (0-1, where 1 is highest priority) and an importance_score (0-1) for each topic.
Provide a brief reasoning for each.

Return a JSON object with this exact structure:
{{
  "prioritized_topics": [
    {{
      "topic": "Topic Name",
      "priority_score": 0.95,
      "importance_score": 0.9,
      "reasoning": "Topic is fundamental and student has low accuracy."
    }}
  ]
}}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks.
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
            return TopicPriorityResponse(**response_data)
        except Exception as e:
            print(f"Failed to parse topic priority: {e}")
            # Fallback: simple priority based on available data if LLM fails
            prioritized = []
            for t in request.topics:
                avg_acc = ( (t.easy_accuracy or 1) + (t.medium_accuracy or 1) + (t.hard_accuracy or 1) ) / 3
                prioritized.append(TopicPriority(
                    topic=t.topic,
                    priority_score=1.0 - avg_acc,
                    importance_score=0.5,
                    reasoning="Fallback priority calculation."
                ))
            return TopicPriorityResponse(prioritized_topics=prioritized_topics)

    def summarize_video_transcript(self, transcript_text: str, title: str) -> VideoSummaryResponse:
        """Analyze transcript and generate structured educational summary"""
        prompt = f"""
You are an expert AI Educator. Analyze the following transcript of an educational video titled "{title}".
Generate a comprehensive, structured educational summary optimized for student learning.

Transcript with Timestamps:
{transcript_text}

Provide the response in JSON format with the following exact keys:
{{
  "main_topic": "Detailed overview of the main subject/topic",
  "key_concepts": ["Concept 1 explained", "Concept 2 explained", ...],
  "definitions_and_formulas": ["Definition or formula 1", ...],
  "step_by_step_explanations": ["Step 1 of an example/process", "Step 2", ...],
  "timestamps": [
    {{"timestamp": "MM:SS", "topic": "Brief topic at this timestamp"}}
  ],
  "practical_applications": ["Real-world application 1", ...],
  "exam_points": ["Potential exam question or key point to remember"],
  "quick_revision": "A short, concise revision version of the entire content"
}}

REQUIREMENTS:
1. Use clear academic language.
2. Ensure formulas (if any) are written clearly.
3. Pick the most important 5-8 timestamps.
4. If the video is purely theoretical, focus on concepts. If it's problem-solving, focus on steps.
5. Return ONLY valid JSON.
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
            return VideoSummaryResponse(**response_data)
        except Exception as e:
            print(f"Failed to parse video summary JSON: {e}")
            raise Exception("LLM failed to generate a structured summary")

    def generate_roadmap(self, request: RoadmapRequest) -> RoadmapResponse:
        """Generate a personalized 7-day study roadmap"""
        topics_json = [t.dict() for t in request.topics]
        
        prompt = f"""
You are an expert personalized learning designer for {request.subject}. 
Your goal is to build a "Recovery and Mastery Path" for a student based on their recent test results.

Student Performance Data (Accuracy per topic/level):
{json.dumps(topics_json, indent=2)}

CRITICAL GUIDELINES:
1. IDENTIFY WEAKNESSES: Analyze the data to find topics with < 80% accuracy. These ARE the absolute priority.
2. MENTION TOPICS EXPLICITLY: The `focus_topic` and individual `tasks` MUST explicitly name the weak topics found in the data.
3. RECOVERY PROGRESSION: 
   - Days 1-3: Review fundamentals and fix easy/medium level gaps for weak topics.
   - Days 4-6: Practice and consolidate, moving toward the hard level for those topics.
   - Day 7: Cumulative mastery review.
4. ACTIONABLE TASKS: Use `concept_revision` for theoretical gaps and `practice` for problem-solving.
5. PERSONALIZED COACHING: In the task `description`, mention WHY the student is studying this (e.g., "Since your accuracy in X was low, let's strengthen it today").

Return a JSON object with this exact structure:
{{
  "week_plan": [
    {{
      "day": "Monday",
      "focus_topic": "Main topic of the day",
      "tasks": [
        {{
          "type": "concept_revision",
          "topic": "Specific Topic",
          "difficulty": "easy",
          "question_count": 0,
          "duration": "30 mins",
          "description": "Short encouraging description of what to do"
        }}
      ]
    }}
  ],
  "summary": {{
    "total_topics": 5,
    "total_practice_questions": 50,
    "total_study_hours": 10,
    "goal": "Brief summary of what this plan achieves"
  }}
}}

IMPORTANT: Return ONLY valid JSON.
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
            return RoadmapResponse(**response_data)
        except Exception as e:
            print(f"Failed to parse roadmap JSON: {e}")
            # Fallback simple summary if LLM fails
            return RoadmapResponse(
                week_plan=[],
                summary={"error": "Failed to generate AI roadmap", "goal": "Manual revision recommended."}
            )

# Global LLM service instance
llm_service = LLMService()
