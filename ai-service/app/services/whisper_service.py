import yt_dlp
import whisper
import os
import tempfile
import shutil
from typing import List, Dict, Any

# --- ffmpeg discovery ---
# Whisper/yt-dlp need ffmpeg. If not in PATH, try to find it in common WinGet locations.
if not shutil.which("ffmpeg"):
    winget_base = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages")
    if os.path.exists(winget_base):
        # Scan for ffmpeg.exe in WinGet packages
        for root, dirs, files in os.walk(winget_base):
            if "ffmpeg.exe" in files:
                ffmpeg_dir = root
                print(f"Found ffmpeg in WinGet: {ffmpeg_dir}")
                os.environ["PATH"] += os.pathsep + ffmpeg_dir
                break
# ------------------------

class WhisperService:
    def __init__(self, model_name: str = "base"):
        self.model_name = model_name
        self._model = None

    @property
    def model(self):
        if self._model is None:
            print(f"Loading Whisper model: {self.model_name}")
            self._model = whisper.load_model(self.model_name)
        return self._model

    def transcribe(self, video_id: str) -> List[Dict[str, Any]]:
        """
        Download audio from YouTube and transcribe using Whisper.
        Returns a list of segments matching youtube-transcript-api format.
        """
        video_url = f"https://www.youtube.com/watch?v={video_id}"

        with tempfile.TemporaryDirectory() as tmpdir:
            # Use a generic name for the output
            audio_path_base = os.path.join(tmpdir, "audio")
            
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': audio_path_base + '.%(ext)s',
                'quiet': True,
                'cookiesfrombrowser': ('chrome',),
                'no_warnings': True,
                'nocheckcertificate': True,
                'ignoreerrors': False,
                'logtostderr': False,
                'add_header': [
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language: en-US,en;q=0.5',
                    'Sec-Fetch-Mode: navigate',
                ],
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            }

            # Try to use cookies from browser to bypass bot detection if possible
            # We try chrome, edge, and firefox in order
            browsers = ['chrome', 'edge', 'firefox']
            downloaded = False
            
            for browser in browsers:
                try:
                    print(f"Attempting to use cookies from {browser}...")
                    temp_opts = ydl_opts.copy()
                    temp_opts['cookiesfrombrowser'] = (browser,)
                    with yt_dlp.YoutubeDL(temp_opts) as ydl:
                        ydl.download([video_url])
                    print(f"Successfully downloaded using {browser} cookies.")
                    downloaded = True
                    break
                except Exception as e:
                    print(f"Failed to use cookies from {browser}: {e}")
                    continue
            
            if not downloaded:
                # If all browser cookie attempts fail, try one last time without cookies but with the new headers
                print("Falling back to download without browser cookies...")
                try:
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([video_url])
                except Exception as e:
                    print(f"Download without cookies failed: {e}")
                    raise Exception(f"Failed to download audio after multiple attempts: {str(e)}")
            
            try:
                audio_path = audio_path_base + ".mp3"
                if not os.path.exists(audio_path):
                    # Try to find any audio file if .mp3 wasn't created for some reason
                    files = [f for f in os.listdir(tmpdir) if f.startswith("audio")]
                    if files:
                        audio_path = os.path.join(tmpdir, files[0])
                    else:
                        raise Exception("Audio file not found after download")

                print(f"Transcribing audio with Whisper ({self.model_name})...")
                result = self.model.transcribe(audio_path)

                # Convert Whisper segments to match youtube-transcript-api format
                formatted_segments = []
                for segment in result.get("segments", []):
                    formatted_segments.append({
                        "text": segment["text"].strip(),
                        "start": segment["start"],
                        "duration": segment["end"] - segment["start"]
                    })

                # If no segments, return the whole text as one segment
                if not formatted_segments and result.get("text"):
                    formatted_segments.append({
                        "text": result["text"].strip(),
                        "start": 0,
                        "duration": 0
                    })

                return formatted_segments

            except Exception as e:
                print(f"Whisper transcription failed: {e}")
                raise Exception(f"Failed to transcribe audio: {str(e)}")

# Create a singleton instance
whisper_service = WhisperService()