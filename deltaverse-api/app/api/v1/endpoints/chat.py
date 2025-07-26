"""
Enhanced Chat API Endpoints
Intelligent chat with Fi MCP integration and AI personalization
Author: Senior Principal Architect with 15+ years experience
"""

import logging
import uuid
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, status, Header
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import asyncio

from app.models.chat import (
    ChatRequest, 
    ChatResponse, 
    ChatStreamChunk, 
    ChatHealthCheck, 
    ErrorResponse,
    ConversationSummary
)
from app.services.gemini_service import gemini_service
from app.services.firebase_auth import firebase_auth_service
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Intelligent Chat"])
security = HTTPBearer()

# Financial keywords for intelligent query detection
FINANCIAL_KEYWORDS = [
    "net worth", "portfolio", "investment", "assets", "liabilities",
    "balance", "account", "bank", "savings", "mutual fund", "mf", 
    "sip", "stock", "equity", "shares", "dividend", "returns",
    "credit score", "loan", "emi", "debt", "epf", "retirement",
    "goal", "planning", "budget", "expense", "income", "save"
]

def is_financial_query(message: str) -> bool:
    """Check if message is a financial query requiring Fi MCP data"""
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in FINANCIAL_KEYWORDS)

def requires_personal_data(message: str) -> bool:
    """Check if query requires personal financial data"""
    personal_indicators = ["my", "i have", "show me", "what's my", "how much do i"]
    message_lower = message.lower()
    return any(indicator in message_lower for indicator in personal_indicators) and is_financial_query(message)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to get current authenticated user.
    """
    # Skip authentication in debug mode
    if settings.debug:
        logger.warning("Authentication bypassed in debug mode")
        return {"uid": "dev-user", "email": "dev@example.com"}
    
    try:
        token = credentials.credentials
        user_info = firebase_auth_service.verify_id_token(token)
        
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/message", response_model=ChatResponse)
async def send_intelligent_message(
    request: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Send message to intelligent AI chat with Fi MCP integration detection
    
    Features:
    - Financial query detection
    - Personalized AI responses
    - Fi MCP authentication prompting
    - Context-aware conversations
    """
    try:
        logger.info(f"Processing intelligent chat message for user: {current_user.get('uid', 'unknown')}")
        
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Check if this is a financial query requiring personal data
        if requires_personal_data(request.message):
            # For now, we'll prompt for Fi MCP authentication
            # In a full implementation, we'd check if user is already authenticated
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "requires_fi_auth": True,
                    "message": "I need access to your financial data to answer this question accurately.",
                    "auth_url": "/api/v1/fi-auth/initiate",
                    "user": current_user,
                    "instructions": {
                        "step1": "Click 'Connect Financial Data' to authenticate",
                        "step2": "Select a test phone number (e.g., 2222222222)",
                        "step3": "Enter any OTP (development mode)",
                        "step4": "Return to chat for personalized insights"
                    },
                    "test_scenarios": [
                        {"phone": "2222222222", "description": "All Assets Connected - Large Portfolio"},
                        {"phone": "7777777777", "description": "Debt-Heavy User - Financial Challenges"},
                        {"phone": "8888888888", "description": "SIP Investor - Consistent Growth"},
                        {"phone": "1616161616", "description": "Early Retirement Dreamer"}
                    ]
                }
            )
        
        # Prepare conversation history for Gemini
        conversation_history = []
        if request.conversation_history:
            conversation_history = [
                {"role": msg.role.value, "content": msg.content}
                for msg in request.conversation_history
            ]
        
        # Enhanced prompt for financial queries
        enhanced_message = request.message
        if is_financial_query(request.message):
            enhanced_message = f"""
            You are a knowledgeable personal finance AI assistant. The user asked: "{request.message}"
            
            Provide helpful, educational financial information. Be conversational and encouraging.
            If the question requires personal financial data, gently suggest connecting their financial accounts.
            Focus on general financial education and best practices.
            """
        
        # Generate response using Gemini service
        response_text = await gemini_service.generate_response(
            message=enhanced_message,
            conversation_history=conversation_history
        )
        
        # Get model information
        model_info = gemini_service.get_model_info()
        
        # Enhanced model info with intelligent features
        enhanced_model_info = {
            **model_info,
            "features": [
                "Financial query detection",
                "Personalized responses",
                "Fi MCP integration ready",
                "Context-aware conversations"
            ],
            "query_type": "financial" if is_financial_query(request.message) else "general",
            "requires_personal_data": requires_personal_data(request.message)
        }
        
        # Create response
        response = ChatResponse(
            message=response_text,
            conversation_id=conversation_id,
            model_info=enhanced_model_info,
            usage={
                "input_tokens": len(request.message.split()),
                "output_tokens": len(response_text.split()),
                "model": model_info.get("model_name", "gemini-1.5-flash"),
                "intelligence_level": "enhanced"
            }
        )
        
        logger.info(f"Successfully generated intelligent response for conversation: {conversation_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing intelligent chat message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate response: {str(e)}"
        )


@router.post("/stream")
async def stream_intelligent_message(
    request: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Send message with intelligent streaming response
    """
    try:
        logger.info(f"Processing streaming intelligent chat for user: {current_user.get('uid', 'unknown')}")
        
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        async def generate_intelligent_stream():
            """Generate streaming response with intelligence"""
            try:
                # Check for Fi MCP requirement
                if requires_personal_data(request.message):
                    yield f"data: {json.dumps({'type': 'auth_required', 'message': 'Financial data access needed'})}\n\n"
                    return
                
                # Send processing message
                yield f"data: {json.dumps({'type': 'processing', 'message': 'Analyzing your query...'})}\n\n"
                
                # Prepare conversation history
                conversation_history = []
                if request.conversation_history:
                    conversation_history = [
                        {"role": msg.role.value, "content": msg.content}
                        for msg in request.conversation_history
                    ]
                
                # Enhanced prompt for financial queries
                enhanced_message = request.message
                if is_financial_query(request.message):
                    enhanced_message = f"""
                    You are a knowledgeable personal finance AI assistant. The user asked: "{request.message}"
                    
                    Provide helpful, educational financial information. Be conversational and encouraging.
                    Focus on general financial education and best practices.
                    """
                
                # Generate and stream response
                async for chunk in gemini_service.generate_streaming_response(
                    message=enhanced_message,
                    conversation_history=conversation_history
                ):
                    stream_chunk = ChatStreamChunk(
                        chunk=chunk,
                        conversation_id=conversation_id,
                        is_final=False
                    )
                    yield f"data: {stream_chunk.json()}\n\n"
                
                # Send final chunk with metadata
                final_chunk = ChatStreamChunk(
                    chunk="",
                    conversation_id=conversation_id,
                    is_final=True
                )
                yield f"data: {final_chunk.json()}\n\n"
                
                # Send intelligence metadata
                yield f"data: {json.dumps({'type': 'metadata', 'intelligence': {'query_type': 'financial' if is_financial_query(request.message) else 'general', 'enhanced': True}})}\n\n"
                
            except Exception as e:
                logger.error(f"Error in intelligent streaming: {e}")
                error_chunk = ChatStreamChunk(
                    chunk=f"Error: {str(e)}",
                    conversation_id=conversation_id,
                    is_final=True
                )
                yield f"data: {error_chunk.json()}\n\n"
        
        return StreamingResponse(
            generate_intelligent_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
            }
        )
        
    except Exception as e:
        logger.error(f"Error setting up intelligent streaming: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to setup streaming: {str(e)}"
        )


@router.get("/health", response_model=ChatHealthCheck)
async def health_check():
    """
    Health check for intelligent chat service
    """
    try:
        # Validate connection to Vertex AI
        is_connected = await gemini_service.validate_connection()
        model_info = gemini_service.get_model_info()
        
        status_text = "healthy" if is_connected else "unhealthy"
        
        # Enhanced health check with intelligence features
        enhanced_model_info = {
            **model_info,
            "intelligence_features": [
                "Financial query detection",
                "Fi MCP integration ready", 
                "Context-aware responses",
                "Streaming support",
                "Authentication integration"
            ],
            "supported_queries": [
                "General financial education",
                "Investment basics",
                "Personal finance planning",
                "Fi MCP data integration (when authenticated)"
            ]
        }
        
        return ChatHealthCheck(
            status=status_text,
            model_name=model_info.get("model_name", "gemini-1.5-flash"),
            is_connected=is_connected,
            model_info=enhanced_model_info
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return ChatHealthCheck(
            status="error",
            model_name="unknown",
            is_connected=False,
            model_info={"error": str(e)}
        )


@router.get("/features")
async def get_chat_features():
    """
    Get intelligent chat features and capabilities
    """
    return {
        "intelligence_features": [
            "Financial query detection",
            "Personal data requirement analysis",
            "Fi MCP integration prompting",
            "Context-aware conversations",
            "Enhanced financial education"
        ],
        "supported_scenarios": [
            {
                "type": "general_education",
                "example": "How do mutual funds work?",
                "response": "Educational content without personal data"
            },
            {
                "type": "personal_finance",
                "example": "What's my net worth?",
                "response": "Prompts for Fi MCP authentication"
            },
            {
                "type": "planning",
                "example": "How should I plan for retirement?",
                "response": "General guidance with personalization prompts"
            }
        ],
        "fi_mcp_integration": {
            "status": "ready",
            "test_scenarios": [
                "2222222222 - All Assets Connected",
                "7777777777 - Debt-Heavy User",
                "8888888888 - SIP Investor",
                "1616161616 - Early Retirement"
            ]
        },
        "ai_models": {
            "primary": "gemini-1.5-flash",
            "capabilities": ["text_generation", "conversation", "financial_analysis"]
        }
    }


# Legacy endpoint for backward compatibility
@router.post("/message/legacy", response_model=ChatResponse)
async def send_message_legacy(
    request: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Legacy chat endpoint (backward compatibility)
    """
    try:
        logger.info(f"Processing legacy chat message for user: {current_user.get('uid', 'unknown')}")
        
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        conversation_history = []
        if request.conversation_history:
            conversation_history = [
                {"role": msg.role.value, "content": msg.content}
                for msg in request.conversation_history
            ]
        
        response_text = await gemini_service.generate_response(
            message=request.message,
            conversation_history=conversation_history
        )
        
        model_info = gemini_service.get_model_info()
        
        response = ChatResponse(
            message=response_text,
            conversation_id=conversation_id,
            model_info=model_info,
            usage={
                "input_tokens": len(request.message.split()),
                "output_tokens": len(response_text.split()),
                "model": model_info.get("model_name", "unknown")
            }
        )
        
        logger.info(f"Successfully generated legacy response for conversation: {conversation_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing legacy chat message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate response: {str(e)}"
        )
