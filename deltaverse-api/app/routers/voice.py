from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import asyncio
import json
import logging
import uuid
from datetime import datetime
import speech_recognition as sr
import threading
import queue
import time
import sys
import os

# Add the parent directory to the Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import authentication middleware with fallback
try:
    from auth_middleware import get_current_user, optional_firebase_user
except ImportError:
    try:
        from app.auth_middleware import get_current_user, optional_firebase_user
    except ImportError:
        # Fallback for development
        def optional_firebase_user():
            return {"uid": "dev_user", "email": "dev@example.com"}
        
        def get_current_user():
            return {"uid": "dev_user", "email": "dev@example.com"}

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voice", tags=["voice"])

# Pydantic models
class VoicePreferences(BaseModel):
    confidenceThreshold: int = 70
    maxListeningTime: int = 60
    language: str = "en-US"
    pauseOnLowConfidence: bool = True
    enableVisualFeedback: bool = True

class VoiceStartRequest(BaseModel):
    preferences: VoicePreferences

class VoiceResponse(BaseModel):
    status: str
    message: Optional[str] = None
    sessionId: Optional[str] = None

# Global connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.recognition_sessions: Dict[str, Dict] = {}
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Adjust for ambient noise
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"WebSocket connected: {session_id}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.recognition_sessions:
            # Stop any active recognition
            session = self.recognition_sessions[session_id]
            if session.get('stop_listening'):
                session['stop_listening']()
            del self.recognition_sessions[session_id]
        logger.info(f"WebSocket disconnected: {session_id}")

    async def send_message(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {session_id}: {e}")
                self.disconnect(session_id)

    async def broadcast_message(self, message: dict):
        for session_id in list(self.active_connections.keys()):
            await self.send_message(session_id, message)

    def start_recognition(self, session_id: str, preferences: VoicePreferences):
        """Start speech recognition in a separate thread"""
        if session_id in self.recognition_sessions:
            return False  # Already running
        
        # Create session data
        session_data = {
            'session_id': session_id,
            'preferences': preferences,
            'is_listening': True,
            'is_paused': False,
            'start_time': datetime.now(),
            'stop_listening': None
        }
        
        self.recognition_sessions[session_id] = session_data
        
        # Start recognition thread
        recognition_thread = threading.Thread(
            target=self._recognition_worker,
            args=(session_id, preferences),
            daemon=True
        )
        recognition_thread.start()
        
        return True

    def _recognition_worker(self, session_id: str, preferences: VoicePreferences):
        """Worker thread for continuous speech recognition"""
        try:
            session = self.recognition_sessions.get(session_id)
            if not session:
                return

            logger.info(f"Starting speech recognition for session {session_id}")
            
            # Create a stop listening function
            stop_listening = self.recognizer.listen_in_background(
                self.microphone,
                lambda recognizer, audio: asyncio.create_task(
                    self._process_audio(session_id, recognizer, audio, preferences)
                ),
                phrase_time_limit=5
            )
            
            # Store the stop function
            session['stop_listening'] = stop_listening
            
            # Send status update
            asyncio.create_task(self.send_message(session_id, {
                'type': 'status',
                'status': 'listening',
                'message': 'Speech recognition started'
            }))
            
            # Monitor session timeout
            start_time = time.time()
            while session_id in self.recognition_sessions:
                session = self.recognition_sessions[session_id]
                
                # Check for timeout
                if time.time() - start_time > preferences.maxListeningTime:
                    logger.info(f"Session {session_id} timed out")
                    break
                
                # Check if paused
                if session.get('is_paused'):
                    time.sleep(0.1)
                    continue
                
                time.sleep(0.1)
            
            # Cleanup
            if stop_listening:
                stop_listening(wait_for_stop=False)
            
        except Exception as e:
            logger.error(f"Recognition worker error for session {session_id}: {e}")
            asyncio.create_task(self.send_message(session_id, {
                'type': 'error',
                'message': f'Recognition error: {str(e)}'
            }))

    async def _process_audio(self, session_id: str, recognizer, audio, preferences: VoicePreferences):
        """Process audio and send transcript"""
        try:
            session = self.recognition_sessions.get(session_id)
            if not session or session.get('is_paused'):
                return

            # Recognize speech
            try:
                text = recognizer.recognize_google(
                    audio, 
                    language=preferences.language,
                    show_all=True
                )
                
                if isinstance(text, dict) and 'alternative' in text:
                    # Get the best alternative
                    alternatives = text['alternative']
                    if alternatives:
                        best_alternative = alternatives[0]
                        transcript = best_alternative.get('transcript', '')
                        confidence = int(best_alternative.get('confidence', 0) * 100)
                        
                        # Only send if confidence meets threshold
                        if confidence >= preferences.confidenceThreshold:
                            await self.send_message(session_id, {
                                'type': 'transcript',
                                'text': transcript,
                                'confidence': confidence,
                                'timestamp': datetime.now().isoformat()
                            })
                        else:
                            await self.send_message(session_id, {
                                'type': 'confidence',
                                'confidence': confidence,
                                'message': 'Low confidence, not transcribing'
                            })
                
            except sr.UnknownValueError:
                # Speech was unintelligible
                await self.send_message(session_id, {
                    'type': 'status',
                    'status': 'no_speech',
                    'message': 'Could not understand audio'
                })
            except sr.RequestError as e:
                # API error
                await self.send_message(session_id, {
                    'type': 'error',
                    'message': f'Speech recognition service error: {e}'
                })
                
        except Exception as e:
            logger.error(f"Audio processing error for session {session_id}: {e}")
            await self.send_message(session_id, {
                'type': 'error',
                'message': f'Audio processing error: {str(e)}'
            })

    def stop_recognition(self, session_id: str):
        """Stop speech recognition for a session"""
        if session_id in self.recognition_sessions:
            session = self.recognition_sessions[session_id]
            if session.get('stop_listening'):
                session['stop_listening'](wait_for_stop=False)
            del self.recognition_sessions[session_id]
            return True
        return False

    def pause_recognition(self, session_id: str):
        """Pause speech recognition for a session"""
        if session_id in self.recognition_sessions:
            self.recognition_sessions[session_id]['is_paused'] = True
            return True
        return False

    def resume_recognition(self, session_id: str):
        """Resume speech recognition for a session"""
        if session_id in self.recognition_sessions:
            self.recognition_sessions[session_id]['is_paused'] = False
            return True
        return False

# Global connection manager instance
manager = ConnectionManager()

# WebSocket endpoint
@router.websocket("/ws/speech")
async def websocket_endpoint(websocket: WebSocket):
    session_id = str(uuid.uuid4())
    await manager.connect(websocket, session_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            action = message.get('action')
            
            if action == 'start':
                preferences_data = message.get('preferences', {})
                preferences = VoicePreferences(**preferences_data)
                
                success = manager.start_recognition(session_id, preferences)
                
                if success:
                    await manager.send_message(session_id, {
                        'type': 'status',
                        'status': 'started',
                        'sessionId': session_id,
                        'message': 'Voice recognition started'
                    })
                else:
                    await manager.send_message(session_id, {
                        'type': 'error',
                        'message': 'Failed to start voice recognition'
                    })
            
            elif action == 'stop':
                success = manager.stop_recognition(session_id)
                await manager.send_message(session_id, {
                    'type': 'status',
                    'status': 'stopped' if success else 'error',
                    'message': 'Voice recognition stopped' if success else 'Failed to stop'
                })
            
            elif action == 'pause':
                success = manager.pause_recognition(session_id)
                await manager.send_message(session_id, {
                    'type': 'status',
                    'status': 'paused' if success else 'error',
                    'message': 'Voice recognition paused' if success else 'Failed to pause'
                })
            
            elif action == 'resume':
                success = manager.resume_recognition(session_id)
                await manager.send_message(session_id, {
                    'type': 'status',
                    'status': 'resumed' if success else 'error',
                    'message': 'Voice recognition resumed' if success else 'Failed to resume'
                })
            
            elif action == 'update_transcript':
                transcript = message.get('transcript', '')
                # Handle user-edited transcript
                await manager.send_message(session_id, {
                    'type': 'status',
                    'status': 'transcript_updated',
                    'message': f'Transcript updated: {len(transcript)} characters'
                })
            
            else:
                await manager.send_message(session_id, {
                    'type': 'error',
                    'message': f'Unknown action: {action}'
                })
                
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
        manager.disconnect(session_id)

# REST API endpoints for voice control
@router.post("/start", response_model=VoiceResponse)
async def start_voice_recognition(
    request: VoiceStartRequest,
    current_user: dict = Depends(optional_firebase_user)
):
    """Start voice recognition via REST API"""
    try:
        session_id = str(uuid.uuid4())
        
        # For REST API, we'll need to handle this differently
        # This is mainly for compatibility
        
        return VoiceResponse(
            status="success",
            message="Voice recognition session created. Use WebSocket for real-time communication.",
            sessionId=session_id
        )
    except Exception as e:
        logger.error(f"Error starting voice recognition: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stop", response_model=VoiceResponse)
async def stop_voice_recognition(
    current_user: dict = Depends(optional_firebase_user)
):
    """Stop voice recognition via REST API"""
    try:
        return VoiceResponse(
            status="success",
            message="Use WebSocket for real-time voice control"
        )
    except Exception as e:
        logger.error(f"Error stopping voice recognition: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_voice_status(
    current_user: dict = Depends(optional_firebase_user)
):
    """Get voice recognition service status"""
    try:
        active_sessions = len(manager.active_connections)
        recognition_sessions = len(manager.recognition_sessions)
        
        return {
            "status": "online",
            "active_connections": active_sessions,
            "recognition_sessions": recognition_sessions,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting voice status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def voice_health_check():
    """Health check endpoint for voice service"""
    try:
        # Test microphone availability
        mic_available = True
        try:
            mic = sr.Microphone()
            with mic as source:
                pass  # Just test if we can access the microphone
        except Exception:
            mic_available = False
        
        return {
            "status": "healthy",
            "microphone_available": mic_available,
            "speech_recognition": "available",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
