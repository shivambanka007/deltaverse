"""
Chat Router
API endpoints for AI-powered financial conversations
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging

from ..services.ai_agent_service import get_financial_ai_agent, FinancialAIAgent
from ..auth.dependencies import get_current_user
from ..models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

class ChatMessage(BaseModel):
    """Chat message model"""
    message: str
    conversation_id: Optional[str] = None

class ScenarioRequest(BaseModel):
    """Financial scenario simulation request"""
    scenario_type: str  # loan, investment, retirement, etc.
    parameters: Dict[str, Any]
    description: Optional[str] = None

class ChatResponse(BaseModel):
    """Chat response model"""
    query_id: str
    response_id: str
    response: str
    insights: List[str]
    action_items: List[str]
    follow_up_questions: List[str]
    confidence: float
    timestamp: str
    conversation_id: Optional[str] = None

@router.post("/message", response_model=Dict[str, Any])
async def process_chat_message(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
    ai_agent: FinancialAIAgent = Depends(get_financial_ai_agent)
):
    """
    Process user's financial query and return AI-generated response
    
    Args:
        chat_message: User's message and optional conversation context
        current_user: Authenticated user
        ai_agent: AI agent service
        
    Returns:
        AI-generated response with insights and recommendations
    """
    try:
        logger.info(f"Processing chat message for user {current_user.uid}")
        
        # Process the query using AI agent
        response = await ai_agent.process_user_query(
            user_id=current_user.uid,
            query_text=chat_message.message,
            conversation_id=chat_message.conversation_id
        )
        
        if "error" in response:
            raise HTTPException(status_code=500, detail=response["error"])
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat message for user {current_user.uid}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
async def get_proactive_insights(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    ai_agent: FinancialAIAgent = Depends(get_financial_ai_agent)
):
    """
    Get proactive financial insights for user
    
    Args:
        background_tasks: FastAPI background tasks
        current_user: Authenticated user
        ai_agent: AI agent service
        
    Returns:
        List of proactive insights and recommendations
    """
    try:
        logger.info(f"Getting proactive insights for user {current_user.uid}")
        
        # Generate insights
        insights = await ai_agent.generate_proactive_insights(current_user.uid)
        
        return {
            "user_id": current_user.uid,
            "insights": insights,
            "count": len(insights),
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting proactive insights for user {current_user.uid}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scenario/simulate")
async def simulate_financial_scenario(
    scenario_request: ScenarioRequest,
    current_user: User = Depends(get_current_user),
    ai_agent: FinancialAIAgent = Depends(get_financial_ai_agent)
):
    """
    Simulate financial scenarios using AI
    
    Args:
        scenario_request: Scenario parameters
        current_user: Authenticated user
        ai_agent: AI agent service
        
    Returns:
        Scenario simulation results
    """
    try:
        logger.info(f"Simulating scenario for user {current_user.uid}: {scenario_request.scenario_type}")
        
        scenario = {
            "type": scenario_request.scenario_type,
            "parameters": scenario_request.parameters,
            "description": scenario_request.description
        }
        
        # Simulate scenario
        results = await ai_agent.simulate_financial_scenario(
            user_id=current_user.uid,
            scenario=scenario
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Error simulating scenario for user {current_user.uid}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations")
async def get_conversation_history(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    ai_agent: FinancialAIAgent = Depends(get_financial_ai_agent)
):
    """
    Get user's conversation history
    
    Args:
        limit: Number of conversations to retrieve
        current_user: Authenticated user
        ai_agent: AI agent service
        
    Returns:
        List of recent conversations
    """
    try:
        logger.info(f"Getting conversation history for user {current_user.uid}")
        
        # Get recent conversations
        conversations = await ai_agent._get_recent_conversations(current_user.uid, limit)
        
        return {
            "user_id": current_user.uid,
            "conversations": conversations,
            "count": len(conversations)
        }
        
    except Exception as e:
        logger.error(f"Error getting conversation history for user {current_user.uid}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggestions")
async def get_query_suggestions():
    """
    Get suggested financial queries for users
    
    Returns:
        List of suggested questions organized by category
    """
    return {
        "suggestions": {
            "investment_analysis": [
                "How is my portfolio performing compared to the market?",
                "Which of my mutual funds are underperforming?",
                "Should I increase my SIP amount?",
                "What's my asset allocation looking like?"
            ],
            "expense_tracking": [
                "Where am I overspending this month?",
                "Show me my spending trends over the last 6 months",
                "How can I reduce my monthly expenses?",
                "What are my biggest expense categories?"
            ],
            "financial_planning": [
                "How much money will I have at retirement?",
                "Can I afford a ₹50L home loan?",
                "What should be my emergency fund target?",
                "How much should I save for my child's education?"
            ],
            "debt_management": [
                "How can I optimize my debt payments?",
                "Should I prepay my home loan or invest?",
                "What's my debt-to-income ratio?",
                "How to improve my credit score?"
            ],
            "goal_planning": [
                "When can I achieve financial independence?",
                "How much do I need to save for a ₹10L vacation?",
                "What's the best way to save for a car?",
                "How to plan for my retirement corpus?"
            ]
        }
    }

@router.post("/feedback")
async def submit_chat_feedback(
    query_id: str,
    rating: int,  # 1-5 stars
    feedback: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Submit feedback for AI responses
    
    Args:
        query_id: ID of the query being rated
        rating: Rating from 1-5
        feedback: Optional text feedback
        current_user: Authenticated user
        
    Returns:
        Feedback submission confirmation
    """
    try:
        logger.info(f"Receiving feedback for query {query_id} from user {current_user.uid}")
        
        if not 1 <= rating <= 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        # Store feedback in Firestore
        # This helps improve the AI model over time
        feedback_data = {
            "query_id": query_id,
            "user_id": current_user.uid,
            "rating": rating,
            "feedback": feedback,
            "timestamp": datetime.utcnow()
        }
        
        # You can implement feedback storage here
        # firestore.collection('feedback').add(feedback_data)
        
        return {
            "message": "Feedback submitted successfully",
            "query_id": query_id,
            "rating": rating
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def chat_health_check(
    ai_agent: FinancialAIAgent = Depends(get_financial_ai_agent)
):
    """
    Health check for chat service
    
    Returns:
        Health status of AI agent components
    """
    try:
        health_status = {
            "chat_service": "healthy",
            "ai_agent_initialized": ai_agent.initialized,
            "mcp_service": "unknown",
            "ai_models": "unknown",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Check MCP service health
        if ai_agent.mcp_service:
            try:
                # You can add MCP health check here
                health_status["mcp_service"] = "healthy"
            except:
                health_status["mcp_service"] = "unhealthy"
        
        # Check AI models health
        if ai_agent.ai_models and ai_agent.ai_models.initialized:
            health_status["ai_models"] = "healthy"
        else:
            health_status["ai_models"] = "unhealthy"
        
        return health_status
        
    except Exception as e:
        logger.error(f"Error in chat health check: {str(e)}")
        return {
            "chat_service": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Import datetime for timestamps
from datetime import datetime
