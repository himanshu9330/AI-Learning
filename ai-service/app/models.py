from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ExplanationRequest(BaseModel):
    question_text: str = Field(..., description="The question text")
    correct_answer: str = Field(..., description="The correct answer")
    student_answer: str = Field(..., description="Student's selected answer")
    topic: str = Field(..., description="Topic of the question")
    mastery_level: float = Field(..., ge=0, le=1, description="Student's mastery level (0-1)")
    difficulty: float = Field(..., ge=0, le=1, description="Question difficulty (0-1)")

class MicroPracticeQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class ExplanationResponse(BaseModel):
    explanation: str = Field(..., description="Clear explanation of the concept")
    mistake_reason: str = Field(..., description="Why the student got it wrong")
    step_by_step_solution: str = Field(..., description="Detailed step-by-step solution")
    micro_practice_questions: List[MicroPracticeQuestion] = Field(..., description="3 similar practice questions")
    recommended_next_step: str = Field(..., description="What to study next")
    youtube_link: Optional[str] = Field(None, description="A highly relevant educational YouTube video link for the topic")

class PracticeRequest(BaseModel):
    topic: str = Field(..., description="Topic for practice questions")
    difficulty: float = Field(..., ge=0, le=1, description="Desired difficulty level")
    count: int = Field(default=5, ge=1, le=10, description="Number of questions to generate")
    mastery_level: float = Field(..., ge=0, le=1, description="Student's current mastery")

class PracticeQuestion(BaseModel):
    question_text: str
    options: List[str]
    correct_option: str
    explanation: str
    difficulty: float
    topic_tags: List[str]

class PracticeResponse(BaseModel):
    questions: List[PracticeQuestion]
    count: int

class HealthResponse(BaseModel):
    status: str
    llm_provider: str
    cache_available: bool

class TopicPerformance(BaseModel):
    topic: str
    easy_accuracy: Optional[float]
    medium_accuracy: Optional[float]
    hard_accuracy: Optional[float]

class TopicPriorityRequest(BaseModel):
    topics: List[TopicPerformance]
    subject: str

class TopicPriority(BaseModel):
    topic: str
    priority_score: float = Field(..., ge=0, le=1, description="Priority score (0-1)")
    importance_score: float = Field(..., ge=0, le=1, description="Calculated importance (0-1)")
    reasoning: str

class TopicPriorityResponse(BaseModel):
    prioritized_topics: List[TopicPriority]

class TopicTimestamp(BaseModel):
    timestamp: str
    topic: str

class VideoSummarizeRequest(BaseModel):
    youtube_url: str = Field(..., description="The YouTube video URL")

class VideoSummaryResponse(BaseModel):
    main_topic: str
    key_concepts: List[str]
    definitions_and_formulas: List[str]
    step_by_step_explanations: List[str]
    timestamps: List[TopicTimestamp]
    practical_applications: List[str]
    exam_points: List[str]
    quick_revision: str

class VideoSummarizeResponse(BaseModel):
    video_id: str
    title: str
    summary: VideoSummaryResponse

class RoadmapTask(BaseModel):
    type: str = Field(..., description="Task type (concept_revision, practice, mini_test)")
    topic: str
    difficulty: str = Field(..., description="Task difficulty (easy, medium, hard)")
    question_count: Optional[int]
    duration: str
    description: str

class RoadmapDay(BaseModel):
    day: str
    focus_topic: str
    tasks: List[RoadmapTask]

class RoadmapResponse(BaseModel):
    week_plan: List[RoadmapDay]
    summary: Dict[str, Any]

class RoadmapRequest(BaseModel):
    topics: List[TopicPerformance]
    subject: str

class TimetableScheduleItem(BaseModel):
    start: str
    end: str
    task: str
    type: str = Field(..., description="Must be one of: study, practice, test, fixed, break, extra")
    subject: Optional[str] = None

class TimetableResponse(BaseModel):
    schedule: List[TimetableScheduleItem]

class TimetableRequest(BaseModel):
    subjects: List[str]
    wake_time: str
    sleep_time: str
    meal_times: str
    profile: str
    coaching_time: str
    extras: str

