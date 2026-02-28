from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models import (
    ExplanationRequest, ExplanationResponse,
    PracticeRequest, PracticeResponse,
    TopicPriorityRequest, TopicPriorityResponse,
    HealthResponse,
    VideoSummarizeRequest, VideoSummarizeResponse,
    RoadmapRequest, RoadmapResponse,
    TimetableRequest, TimetableResponse
)
from app.services.llm_service import llm_service
from app.services.cache_service import cache_service
from app.services.video_service import video_service
from app.services.whisper_service import whisper_service

app = FastAPI(
    title="AI Adaptive Learning - AI Service",
    description="AI microservice for generating explanations and practice questions",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "llm_provider": settings.LLM_PROVIDER,
        "cache_available": cache_service.is_available()
    }

@app.post("/api/ai/prioritize-topics", response_model=TopicPriorityResponse)
async def prioritize_topics(request: TopicPriorityRequest):
    """
    Prioritize topics for roadmap
    """
    try:
        return llm_service.prioritize_topics(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/explain", response_model=ExplanationResponse)
async def generate_explanation(request: ExplanationRequest):
    """
    Generate AI explanation for incorrect answer
    
    - Checks cache first
    - Calls LLM if not cached
    - Validates JSON response
    - Caches result for 24 hours
    """
    try:
        # Check cache
        cache_data = {
            "question": request.question_text,
            "student_answer": request.student_answer,
            "correct_answer": request.correct_answer
        }
        
        cached_response = cache_service.get("explanation", cache_data)
        if cached_response:
            print("Cache hit for explanation")
            return ExplanationResponse(**cached_response)
        
        # Generate explanation
        print("Cache miss - generating explanation")
        response = llm_service.generate_explanation(request)
        
        # Cache response
        cache_service.set("explanation", cache_data, response.dict())
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate explanation: {str(e)}")

@app.post("/api/ai/practice", response_model=PracticeResponse)
async def generate_practice(request: PracticeRequest):
    """
    Generate practice questions for a topic
    
    - Generates questions based on difficulty and mastery
    - Returns specified count of questions
    """
    try:
        # Check cache
        cache_data = {
            "topic": request.topic,
            "difficulty": request.difficulty,
            "count": request.count
        }
        
        cached_response = cache_service.get("practice", cache_data)
        if cached_response:
            print("Cache hit for practice questions")
            return PracticeResponse(**cached_response)
        
        # Generate questions
        print("Cache miss - generating practice questions")
        questions = llm_service.generate_practice_questions(request)
        
        response = PracticeResponse(
            questions=questions,
            count=len(questions)
        )
        
        # Cache response
        cache_service.set("practice", cache_data, response.dict())
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate practice questions: {str(e)}")

@app.post("/api/ai/summarize-video", response_model=VideoSummarizeResponse)
async def summarize_video(request: VideoSummarizeRequest):
    """
    Summarize an educational YouTube video
    """

    try:
        # 1️⃣ Extract video ID
        video_id = video_service.extract_video_id(request.youtube_url)

        # 2️⃣ Get title
        title = await video_service.get_video_title(video_id)

        # 3️⃣ Check cache
        cache_data = {"video_id": video_id}
        cached_response = cache_service.get("video_summary", cache_data)

        if cached_response:
            print(f"Cache hit for video summary: {video_id}")
            return VideoSummarizeResponse(**cached_response)

        # 4️⃣ Try transcript safely
        transcript_data = video_service.get_transcript_or_none(video_id)

        if not transcript_data:
            print(f"Subtitles disabled for {video_id}. Using Whisper fallback...")
            try:
                transcript_data = whisper_service.transcribe(video_id)
            except Exception as e:
                raise HTTPException(
                    status_code=404,
                    detail=f"Subtitles unavailable and audio transcription failed: {str(e)}"
                )

        # 5️⃣ Format transcript
        full_transcript = video_service.format_transcript_with_timestamps(transcript_data)

        # 6️⃣ Summarize using LLM
        print(f"Cache miss - summarizing video: {video_id}")

        summary = llm_service.summarize_video_transcript(
            full_transcript,
            title
        )

        response = VideoSummarizeResponse(
            video_id=video_id,
            title=title,
            summary=summary
        )

        # 7️⃣ Cache for 7 days
        cache_service.set(
            "video_summary",
            cache_data,
            response.dict(),
            expire=604800
        )

        return response

    except HTTPException as he:
        raise he

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Summarization error: {str(e)}"
        )

@app.post("/api/ai/generate-roadmap", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    """
    Generate a 7-day personalized study roadmap using AI
    """
    try:
        return llm_service.generate_roadmap(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")

@app.post("/api/ai/generate-timetable", response_model=TimetableResponse)
async def generate_timetable(request: TimetableRequest):
    """
    Generate a personalized daily study timetable using AI
    """
    from app.services.scheduler import scheduler_service
    try:
        return scheduler_service.generate_timetable(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Timetable generation failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "AI Service",
        "llm_provider": settings.LLM_PROVIDER,
        "cache_available": cache_service.is_available(),
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
