import requests
import os
from typing import Dict, Any
from src.common.mock_agent_data import MOCK_ELEVENLABS_AUDIO_RESPONSE

class ElevenlabsApiAgent:
    def __init__(self, mcp_server_url: str, enable_mcp: bool = True):
        self.mcp_server_url = mcp_server_url # Kept for consistency, but not used for direct API calls
        self.enable_mcp = enable_mcp
        self.api_base_url = "https://api.elevenlabs.io/v1"
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.default_voice_id = "21m00Tcm4TlvDq8ikWAM" # Rachel
        self.default_model_id = "eleven_monolingual_v1"

    def text_to_speech(self, text: str, voice_id: str = None, model_id: str = None) -> Dict[str, Any]:
        """
        Converts text to speech using the ElevenLabs API.
        Returns audio data as bytes.
        """
        if not self.api_key:
            print("Error: ELEVENLABS_API_KEY environment variable not set.")
            return {"status": "error", "message": "ElevenLabs API key not configured."}

        voice_id = voice_id or self.default_voice_id
        model_id = model_id or self.default_model_id

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        data = {
            "text": text,
            "model_id": model_id,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
        url = f"{self.api_base_url}/text-to-speech/{voice_id}"

        try:
            print(f"ElevenLabs API Agent: Converting text to speech for voice {voice_id}...")
            response = requests.post(url, headers=headers, json=data, timeout=10)
            response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)

            audio_content = response.content
            print("ElevenLabs API Agent: Audio data received successfully.")
            return {"status": "success", "audio_data": audio_content}
        except requests.exceptions.HTTPError as http_err:
            print(f"ElevenLabs API Agent: HTTP error occurred: {http_err} - {response.text}")
            return {"status": "error", "message": f"HTTP error: {http_err}", "details": response.text}
        except requests.exceptions.ConnectionError as conn_err:
            print(f"ElevenLabs API Agent: Connection error occurred: {conn_err}")
            return {"status": "error", "message": f"Connection error: {conn_err}"}
        except requests.exceptions.Timeout as timeout_err:
            print(f"ElevenLabs API Agent: Timeout error occurred: {timeout_err}")
            return {"status": "error", "message": f"Timeout error: {timeout_err}"}
        except requests.exceptions.RequestException as req_err:
            print(f"ElevenLabs API Agent: An unexpected error occurred: {req_err}")
            return {"status": "error", "message": f"Request error: {req_err}"}
        except Exception as e:
            print(f"ElevenLabs API Agent: An unexpected error occurred: {e}")
            return {"status": "error", "message": f"Unexpected error: {e}"}

    def process_query(self, user_id: str, query: str) -> Dict[str, Any]:
        print(f"ElevenlabsApiAgent received query for user {user_id}: {query}")
        if not self.enable_mcp:
            print("ElevenlabsApiAgent is disabled. Returning mock response.")
            return MOCK_ELEVENLABS_AUDIO_RESPONSE

        # For demonstration, assume the query is the text to convert to speech
        # In a real scenario, an LLM would extract the text from a more complex query
        text_to_convert = query

        if not text_to_convert:
            return {"status": "error", "message": "No text provided for speech conversion."}

        print(f"ElevenLabs API Agent: Converting \"{text_to_convert[:50]}...\" to speech.")
        return self.text_to_speech(text_to_convert)
