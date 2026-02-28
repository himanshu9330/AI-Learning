import re
import httpx
from typing import List, Optional
from youtube_transcript_api import (
    YouTubeTranscriptApi,
    TranscriptsDisabled,
    NoTranscriptFound,
)
from fastapi import HTTPException


class VideoService:

    @staticmethod
    def extract_video_id(url: str) -> str:
        """Extract video ID from various YouTube URL formats"""
        patterns = [
            r"(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)",
            r"(?:be\/)([0-9A-Za-z_-]{11})(?:\?|&|$)",
            r"(?:embed\/)([0-9A-Za-z_-]{11})(?:\?|&|$)",
            r"^([0-9A-Za-z_-]{11})$"
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    @staticmethod
    async def get_video_title(video_id: str) -> str:
        """Fetch video title using oEmbed (no API key needed)"""
        try:
            url = (
                f"https://www.youtube.com/oembed"
                f"?url=http://www.youtube.com/watch?v={video_id}&format=json"
            )

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)

                if response.status_code == 200:
                    data = response.json()
                    return data.get("title", "YouTube Video")

        except Exception:
            pass

        return "YouTube Video"

    @staticmethod
    def get_transcript(video_id: str) -> List[dict]:
        """
        Fetch transcript with intelligent fallback order:
        1. Manual English
        2. Auto English
        3. Translatable transcript → English
        4. First available transcript
        """

        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

            # 1️⃣ Try manually created English transcript
            try:
                transcript = transcript_list.find_manually_created_transcript(['en'])
                return transcript.fetch()
            except Exception:
                pass

            # 2️⃣ Try auto-generated English transcript
            try:
                transcript = transcript_list.find_generated_transcript(['en'])
                return transcript.fetch()
            except Exception:
                pass

            # 3️⃣ Try any translatable transcript → translate to English
            for t in transcript_list:
                if t.is_translatable:
                    return t.translate('en').fetch()

            # 4️⃣ Fallback: first available transcript
            return next(iter(transcript_list)).fetch()

        except TranscriptsDisabled:
            raise HTTPException(
                status_code=404,
                detail="Subtitles are disabled for this video"
            )

        except NoTranscriptFound:
            raise HTTPException(
                status_code=404,
                detail="No transcript available for this video"
            )

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Transcript retrieval failed: {str(e)}"
            )

    @staticmethod
    def get_transcript_or_none(video_id: str) -> Optional[List[dict]]:
        """Safe wrapper that returns None instead of raising exception"""
        try:
            return VideoService.get_transcript(video_id)
        except HTTPException:
            return None

    @staticmethod
    def format_transcript_with_timestamps(transcript_data: List[dict]) -> str:
        """Convert transcript list to text with timestamps"""
        formatted_text = ""

        for item in transcript_data:
            start = item['start']
            minutes = int(start // 60)
            seconds = int(start % 60)

            timestamp = f"[{minutes:02d}:{seconds:02d}]"
            formatted_text += f"{timestamp} {item['text']}\n"

        return formatted_text.strip()

    @staticmethod
    def chunk_text(text: str, max_chars: int = 15000) -> List[str]:
        """Split transcript into chunks to avoid token limits"""

        if len(text) <= max_chars:
            return [text]

        chunks = []
        current_chunk = ""
        lines = text.split('\n')

        for line in lines:
            if len(current_chunk) + len(line) < max_chars:
                current_chunk += line + '\n'
            else:
                chunks.append(current_chunk.strip())
                current_chunk = line + '\n'

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks


video_service = VideoService()