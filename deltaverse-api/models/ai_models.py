"""
AI-Specific Data Models for Firestore
Enhanced models for intelligent chat and personalization
Author: Senior Principal Architect
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from enum import Enum

class ConversationType(str, Enum):
    """Types of conversations"""
    GENERAL = "general"
    FINANCIAL_PLANNING = "financial_planning"
    INVESTMENT_ADVICE = "investment_advice"
    GOAL_REVIEW = "goal_review"
    SCENARIO_ANALYSIS = "scenario_analysis"

class MessageRole(str, Enum):
    """Message roles in conversation"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class InsightType(str, Enum):
    """Types of AI-generated insights"""
    PORTFOLIO_ANALYSIS = "portfolio_analysis"
    GOAL_PROGRESS = "goal_progress"
    RISK_ASSESSMENT = "risk_assessment"
    OPPORTUNITY = "opportunity"
    ALERT = "alert"
    RECOMMENDATION = "recommendation"

class Priority(str, Enum):
    """Priority levels"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ChatMessage(BaseModel):
    """Individual chat message model"""
    message_id: str
    timestamp: datetime
    role: MessageRole
    content: str
    intent: Optional[str] = None  # AI-classified intent
    
    # Financial context at time of message
    financial_context_snapshot: Optional[Dict[str, Any]] = None
    
    # AI processing details (for assistant messages)
    ai_processing: Optional[Dict[str, Any]] = None
    
    # Structured response data
    structured_response: Optional[Dict[str, Any]] = None

class ConversationSummary(BaseModel):
    """AI-generated conversation summary"""
    topics_discussed: List[str]
    key_insights_shared: List[str]
    user_sentiment: str = "neutral"  # positive, neutral, concerned, confused
    follow_up_needed: bool = False
    next_suggested_topics: List[str] = []

class ConversationContext(BaseModel):
    """Context for next conversation"""
    user_interests: List[str]
    pending_questions: List[str] = []
    user_sophistication_level: str = "intermediate"  # beginner, intermediate, advanced
    preferred_response_style: str = "detailed"

class AIConversation(BaseModel):
    """Complete conversation model for Firestore"""
    conversation_id: str
    user_id: str
    
    # Conversation metadata
    started_at: datetime
    last_message_at: datetime
    message_count: int = 0
    conversation_type: ConversationType = ConversationType.GENERAL
    session_duration_seconds: Optional[int] = None
    
    # Conversation summary (AI-generated)
    ai_summary: Optional[ConversationSummary] = None
    
    # Recent messages (last 10 for context)
    recent_messages: List[ChatMessage] = []
    
    # Context for next conversation
    conversation_context: Optional[ConversationContext] = None

class AIRecommendation(BaseModel):
    """AI-generated recommendation"""
    action_type: str
    description: str
    impact: str
    urgency: str = "medium"
    estimated_effort: str = "5 minutes"

class AIMetadata(BaseModel):
    """AI processing metadata"""
    model_used: str
    processing_time_ms: int
    data_sources_used: List[str] = []
    confidence_level: float = Field(ge=0.0, le=1.0)
    generated_at: datetime

class UserFeedback(BaseModel):
    """User feedback on insights"""
    viewed: bool = False
    viewed_at: Optional[datetime] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    helpful: Optional[bool] = None
    implemented: bool = False
    feedback_text: Optional[str] = None

class FinancialInsight(BaseModel):
    """AI-generated financial insight for Firestore"""
    insight_id: str
    user_id: str
    
    # Insight classification
    type: InsightType
    category: str  # investment, banking, credit, planning, tax
    priority: Priority
    confidence_score: float = Field(ge=0.0, le=1.0)
    
    # AI-generated content
    title: str
    summary: str
    detailed_analysis: str
    
    # Actionable recommendations
    recommendations: List[AIRecommendation] = []
    
    # Data snapshot (for context)
    data_snapshot: Dict[str, Any] = {}
    
    # AI processing metadata
    ai_metadata: AIMetadata
    
    # User interaction tracking
    user_feedback: Optional[UserFeedback] = None
    
    # Expiry
    expires_at: datetime

class FinancialGoal(BaseModel):
    """Financial goal with AI tracking"""
    goal_id: str
    user_id: str
    
    # Goal definition
    goal_type: str  # retirement, home_purchase, education, emergency_fund
    title: str
    description: str
    target_amount: float
    target_date: datetime
    priority: Priority
    created_at: datetime
    
    # AI-calculated progress
    current_progress: Dict[str, Any] = {}
    
    # AI scenario projections
    ai_projections: Dict[str, Any] = {}
    
    # AI optimization suggestions
    ai_recommendations: List[AIRecommendation] = []

class UserPersonalization(BaseModel):
    """User personalization data for AI"""
    user_id: str
    
    # Interaction patterns
    interaction_patterns: Dict[str, Any] = {}
    
    # Communication preferences (learned)
    communication_profile: Dict[str, Any] = {}
    
    # Financial personality (AI-inferred)
    financial_personality: Dict[str, Any] = {}
    
    # AI model performance tracking
    model_performance: Dict[str, Any] = {}
    
    # Personalization improvements
    personalization_data: Dict[str, Any] = {}
    
    last_updated: datetime

# Firestore collection names
class AICollections:
    """AI-specific Firestore collection names"""
    AI_CONVERSATIONS = "ai_conversations"
    FINANCIAL_INSIGHTS = "financial_insights"
    FINANCIAL_GOALS = "financial_goals"
    USER_PERSONALIZATION = "user_personalization"
    MARKET_INTELLIGENCE = "market_intelligence"
    FINANCIAL_SCENARIOS = "financial_scenarios"
