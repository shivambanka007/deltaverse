from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import asyncio
import json
import logging
import uuid
from datetime import datetime
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

# Global connection manager (simplified version)
class SimpleConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.mock_sessions: Dict[str, Dict] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"WebSocket connected: {session_id}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.mock_sessions:
            del self.mock_sessions[session_id]
        logger.info(f"WebSocket disconnected: {session_id}")

    async def send_message(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {session_id}: {e}")
                self.disconnect(session_id)

    async def start_mock_recognition(self, session_id: str, preferences: VoicePreferences):
        """Start mock speech recognition for testing"""
        if session_id in self.mock_sessions:
            return False  # Already running
        
        # Create mock session data
        session_data = {
            'session_id': session_id,
            'preferences': preferences,
            'is_listening': True,
            'is_paused': False,
            'start_time': datetime.now()
        }
        
        self.mock_sessions[session_id] = session_data
        
        # Start mock recognition
        asyncio.create_task(self._mock_recognition_worker(session_id, preferences))
        
        return True

    async def _mock_recognition_worker(self, session_id: str, preferences: VoicePreferences):
        """Mock worker that simulates speech recognition"""
        try:
            session = self.mock_sessions.get(session_id)
            if not session:
                return

            logger.info(f"Starting mock speech recognition for session {session_id}")
            
            # Send status update
            await self.send_message(session_id, {
                'type': 'status',
                'status': 'listening',
                'message': 'Mock speech recognition started'
            })
            
            # Simulate speech recognition with mock data
            mock_phrases = [
                "Hello, this is a test of the voice recognition system.",
                "The weather is nice today.",
                "I would like to check my financial health.",
                "Can you show me my account balance?",
                "Thank you for testing the voice system."
            ]
            
            phrase_index = 0
            start_time = datetime.now()
            
            while session_id in self.mock_sessions:
                session = self.mock_sessions[session_id]
                
                # Check for timeout
                elapsed = (datetime.now() - start_time).total_seconds()
                if elapsed > preferences.maxListeningTime:
                    logger.info(f"Mock session {session_id} timed out")
                    break
                
                # Check if paused
                if session.get('is_paused'):
                    await asyncio.sleep(1)
                    continue
                
                # Send mock transcript every 5 seconds
                if int(elapsed) % 5 == 0 and int(elapsed) > 0:
                    if phrase_index < len(mock_phrases):
                        confidence = 75 + (phrase_index * 5)  # Increasing confidence
                        await self.send_message(session_id, {
                            'type': 'transcript',
                            'text': mock_phrases[phrase_index],
                            'confidence': min(confidence, 95),
                            'timestamp': datetime.now().isoformat()
                        })
                        phrase_index += 1
                
                await asyncio.sleep(1)
            
        except Exception as e:
            logger.error(f"Mock recognition worker error for session {session_id}: {e}")
            await self.send_message(session_id, {
                'type': 'error',
                'message': f'Mock recognition error: {str(e)}'
            })

    def stop_recognition(self, session_id: str):
        """Stop mock speech recognition for a session"""
        if session_id in self.mock_sessions:
            del self.mock_sessions[session_id]
            return True
        return False

    def pause_recognition(self, session_id: str):
        """Pause mock speech recognition for a session"""
        if session_id in self.mock_sessions:
            self.mock_sessions[session_id]['is_paused'] = True
            return True
        return False

    def resume_recognition(self, session_id: str):
        """Resume mock speech recognition for a session"""
        if session_id in self.mock_sessions:
            self.mock_sessions[session_id]['is_paused'] = False
            return True
        return False

# Global connection manager instance
manager = SimpleConnectionManager()

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
                
                success = await manager.start_mock_recognition(session_id, preferences)
                
                if success:
                    await manager.send_message(session_id, {
                        'type': 'status',
                        'status': 'started',
                        'sessionId': session_id,
                        'message': 'Mock voice recognition started'
                    })
                else:
                    await manager.send_message(session_id, {
                        'type': 'error',
                        'message': 'Failed to start mock voice recognition'
                    })
            
            elif action == 'stop':
                success = manager.stop_recognition(session_id)
                await manager.send_message(session_id, {
                    'type': 'status',
                    'status': 'stopped' if success else 'error',
                    'message': 'Mock voice recognition stopped' if success else 'Failed to stop'
                })
            
            elif action == 'pause':
                success = manager.pause_recognition(session_id)
                await manager.send_message(session_id, {
                    'type': 'status',
                    'status': 'paused' if success else 'error',
                    'message': 'Mock voice recognition paused' if success else 'Failed to pause'
                })
            
            elif action == 'resume':
                success = manager.resume_recognition(session_id)
                await manager.send_message(session_id, {
                    'type': 'status',
                    'status': 'resumed' if success else 'error',
                    'message': 'Mock voice recognition resumed' if success else 'Failed to resume'
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
        
        return VoiceResponse(
            status="success",
            message="Mock voice recognition session created. Use WebSocket for real-time communication.",
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
        recognition_sessions = len(manager.mock_sessions)
        
        return {
            "status": "online",
            "mode": "mock",
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
        return {
            "status": "healthy",
            "mode": "mock",
            "microphone_available": "simulated",
            "speech_recognition": "mock",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
