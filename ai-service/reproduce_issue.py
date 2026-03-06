import json
import os
from dotenv import load_dotenv
from app.services.scheduler import scheduler_service
from app.models import TimetableRequest

# Load .env for API keys
load_dotenv()

def test_generation():
    req = TimetableRequest(
        subjects=["Physics", "Mathematics"],
        wake_time="06:00 AM",
        sleep_time="11:00 PM",
        meal_times="Breakfast 8AM, Lunch 1PM, Dinner 8PM",
        profile="Dropper",
        coaching_time="1pm-2pm Physics Monday",
        extras=""
    )
    
    print("Starting generation...")
    try:
        response = scheduler_service.generate_timetable(req)
        print("SUCCESS!")
        print(json.dumps(response.dict(), indent=2))
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_generation()
