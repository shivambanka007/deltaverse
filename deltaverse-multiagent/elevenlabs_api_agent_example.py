import requests
import os
from typing import Dict, Any

class ElevenlabsApiAgent:
    def __init__(self):
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

# --- Conceptual ADK Agent Integration ---
# class MyVoiceAgent:
#     def __init__(self):
#         self.elevenlabs_api = ElevenlabsApiAgent()

#     def generate_speech_from_text(self, text: str, output_filename: str = "output.mp3"):
#         # This method would be exposed as a tool/capability of the ADK agent
#         print(f"ADK Agent: Generating speech for: {text[:50]}...")
#         speech_result = self.elevenlabs_api.text_to_speech(text)
#         if speech_result["status"] == "success":
#             audio_data = speech_result["audio_data"]
#             with open(output_filename, "wb") as f:
#                 f.write(audio_data)
#             print(f"ADK Agent: Speech saved to {output_filename}")
#             return output_filename
#         else:
#             print(f"ADK Agent: Failed to generate speech: {speech_result['message']}")
#             return None

# Example Usage (for testing outside an ADK):
if __name__ == "__main__":
    # Set your ElevenLabs API Key as an environment variable
    # os.environ["ELEVENLABS_API_KEY"] = "YOUR_ELEVENLABS_API_KEY"

    agent = ElevenlabsApiAgent()

    test_text = "Hello, this is a test of the ElevenLabs API integration."
    print("\n--- Testing Text-to-Speech ---")
    speech_result = agent.text_to_speech(test_text)
    print(f"Speech Result: {speech_result}")

    if speech_result["status"] == "success":
        output_file = "test_output.mp3"
        with open(output_file, "wb") as f:
            f.write(speech_result["audio_data"])
        print(f"Audio saved to {output_file}")

    print("\n--- Testing with missing API Key (should show error) ---")
    if "ELEVENLABS_API_KEY" in os.environ: del os.environ["ELEVENLABS_API_KEY"]
    agent_no_key = ElevenlabsApiAgent()
    speech_result_no_key = agent_no_key.text_to_speech("This should fail.")
    print(f"Speech Result (no key): {speech_result_no_key}")
