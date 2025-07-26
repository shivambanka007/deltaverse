"""
Vertex AI Gemini service for chat functionality.
Handles communication with Google Cloud's Gemini model through Vertex AI.
"""

import os
import logging
from typing import List, Dict, Any, Optional, AsyncGenerator
import asyncio
from concurrent.futures import ThreadPoolExecutor

import vertexai
from vertexai.preview.generative_models import GenerativeModel, ChatSession, Part, HarmCategory, HarmBlockThreshold
from google.auth import default
from google.auth.exceptions import DefaultCredentialsError

from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for interacting with Vertex AI Gemini model."""
    
    def __init__(self):
        """Initialize the Gemini service with environment-based configuration."""
        self.project_id = settings.gcp_project_id
        self.location = settings.gcp_location
        
        # Environment-based model configuration for production flexibility
        self.model_name = os.getenv("GEMINI_MODEL_NAME", settings.gemini_model_name)
        self.temperature = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
        self.max_tokens = int(os.getenv("GEMINI_MAX_TOKENS", "1024"))
        self.top_p = float(os.getenv("GEMINI_TOP_P", "0.8"))
        self.top_k = int(os.getenv("GEMINI_TOP_K", "40"))
        
        self.model = None
        self.executor = ThreadPoolExecutor(max_workers=4)
        self._initialize_vertex_ai()
    
    def _initialize_vertex_ai(self):
        """Initialize Vertex AI with proper authentication and environment configuration."""
        try:
            # Skip initialization in test environment
            if os.getenv("TESTING") == "true":
                logger.info("Skipping Vertex AI initialization in test environment")
                return
                
            logger.info(f"Initializing Vertex AI with model: {self.model_name}")
            logger.info(f"Configuration: temp={self.temperature}, max_tokens={self.max_tokens}")
                
            # Set up Google Cloud credentials if provided
            if settings.google_application_credentials:
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = settings.google_application_credentials
            
            # Initialize Vertex AI
            vertexai.init(project=self.project_id, location=self.location)
            
            # Initialize the generative model
            generation_config = {
                "max_output_tokens": settings.gemini_max_tokens,
                "temperature": settings.gemini_temperature,
                "top_p": settings.gemini_top_p,
                "top_k": settings.gemini_top_k,
            }
            
            # Safety settings are temporarily disabled due to SafetySetting object requirement
            # This can be re-enabled once the proper SafetySetting class is available
            # or when using a newer version of the Vertex AI SDK
            safety_settings = None
            logger.info("Safety settings disabled - using default Gemini safety settings")
            
            # Initialize model with or without safety settings
            model_kwargs = {
                "model_name": self.model_name,
                "generation_config": generation_config
            }
            
            if safety_settings is not None:
                model_kwargs["safety_settings"] = safety_settings
            
            self.model = GenerativeModel(**model_kwargs)
            
            logger.info(f"Vertex AI initialized successfully with model: {self.model_name}")
            
        except DefaultCredentialsError as e:
            logger.error(f"Google Cloud credentials not found: {e}")
            raise Exception("Google Cloud credentials not configured properly")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {e}")
            raise Exception(f"Vertex AI initialization failed: {str(e)}")
    
    def _run_sync_in_executor(self, func, *args):
        """Run synchronous function in thread executor."""
        loop = asyncio.get_event_loop()
        return loop.run_in_executor(self.executor, func, *args)
    
    async def generate_response(self, message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> str:
        """
        Generate a response using Gemini model.
        
        Args:
            message: User's input message
            conversation_history: Previous conversation messages
            
        Returns:
            Generated response from Gemini
        """
        try:
            if not self.model:
                raise Exception("Gemini model not initialized")
            
            # Create chat session if conversation history exists
            if conversation_history:
                chat_session = await self._create_chat_session(conversation_history)
                response = await self._run_sync_in_executor(
                    chat_session.send_message, message
                )
            else:
                # Single message generation with configurable parameters
                generation_config = {
                    "temperature": self.temperature,
                    "top_p": self.top_p,
                    "top_k": self.top_k,
                    "max_output_tokens": self.max_tokens,
                }
                
                response = await self._run_sync_in_executor(
                    lambda: self.model.generate_content(
                        message, 
                        generation_config=generation_config
                    )
                )
            
            # Extract text from response
            if hasattr(response, 'text'):
                return response.text
            elif hasattr(response, 'candidates') and response.candidates:
                return response.candidates[0].content.parts[0].text
            else:
                logger.warning("Unexpected response format from Gemini")
                return "I apologize, but I couldn't generate a proper response. Please try again."
                
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise Exception(f"Failed to generate response: {str(e)}")
    
    async def _create_chat_session(self, conversation_history: List[Dict[str, str]]) -> ChatSession:
        """
        Create a chat session with conversation history.
        
        Args:
            conversation_history: List of messages with 'role' and 'content' keys
            
        Returns:
            ChatSession object
        """
        try:
            chat_session = self.model.start_chat()
            
            # Add conversation history to the chat session
            for message in conversation_history[:-1]:  # Exclude the last message as it will be sent separately
                role = message.get('role', 'user')
                content = message.get('content', '')
                
                if role == 'user':
                    # Send user message and get response to maintain conversation flow
                    await self._run_sync_in_executor(chat_session.send_message, content)
                # Note: Assistant messages are automatically added to history by Gemini
            
            return chat_session
            
        except Exception as e:
            logger.error(f"Error creating chat session: {e}")
            raise Exception(f"Failed to create chat session: {str(e)}")
    
    async def generate_streaming_response(self, message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> AsyncGenerator[str, None]:
        """
        Generate a streaming response using Gemini model.
        
        Args:
            message: User's input message
            conversation_history: Previous conversation messages
            
        Yields:
            Chunks of the generated response
        """
        try:
            if not self.model:
                raise Exception("Gemini model not initialized")
            
            # Create chat session if conversation history exists
            if conversation_history:
                chat_session = await self._create_chat_session(conversation_history)
                response_stream = await self._run_sync_in_executor(
                    lambda: chat_session.send_message(message, stream=True)
                )
            else:
                # Single message generation with streaming
                response_stream = await self._run_sync_in_executor(
                    lambda: self.model.generate_content(message, stream=True)
                )
            
            # Stream the response chunks
            for chunk in response_stream:
                if hasattr(chunk, 'text') and chunk.text:
                    yield chunk.text
                elif hasattr(chunk, 'candidates') and chunk.candidates:
                    for candidate in chunk.candidates:
                        if hasattr(candidate.content, 'parts'):
                            for part in candidate.content.parts:
                                if hasattr(part, 'text') and part.text:
                                    yield part.text
                                    
        except Exception as e:
            logger.error(f"Error generating streaming response: {e}")
            yield f"Error: {str(e)}"
    
    async def validate_connection(self) -> bool:
        """
        Validate the connection to Vertex AI Gemini.
        
        Returns:
            True if connection is valid, False otherwise
        """
        try:
            test_response = await self.generate_response("Hello, this is a connection test.")
            return bool(test_response and len(test_response.strip()) > 0)
        except Exception as e:
            logger.error(f"Connection validation failed: {e}")
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model configuration.
        
        Returns:
            Dictionary containing model information
        """
        return {
            "model_name": self.model_name,
            "project_id": self.project_id,
            "location": self.location,
            "max_tokens": settings.gemini_max_tokens,
            "temperature": settings.gemini_temperature,
            "top_p": settings.gemini_top_p,
            "top_k": settings.gemini_top_k,
            "is_initialized": self.model is not None
        }


# Global service instance
gemini_service = GeminiService()
