"""
AI-Enhanced Firestore Service
Handles AI-specific data operations for intelligent chat and personalization
Author: Senior Principal Architect with 15+ years experience
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import uuid

from google.cloud import firestore
from ..firebase_config import get_firestore_client
from ..models.ai_models import (
    AIConversation, FinancialInsight, FinancialGoal, UserPersonalization,
    ChatMessage, MessageRole, ConversationType, InsightType, Priority,
    AIRecommendation, AIMetadata, UserFeedback, AICollections
)

logger = logging.getLogger(__name__)

class AIFirestoreService:
    """
    Professional AI-enhanced Firestore service
    Handles intelligent data operations for chat, insights, and personalization
    """
    
    def __init__(self):
        self.db = get_firestore_client()
        self.collections = AICollections()
    
    # ========================================================================
    # CONVERSATION MANAGEMENT
    # ========================================================================
    
    async def store_conversation_message(
        self, 
        user_id: str, 
        message: ChatMessage,
        conversation_id: Optional[str] = None
    ) -> str:
        """
        Store a conversation message and update conversation context
        
        Args:
            user_id: User identifier
            message: Chat message to store
            conversation_id: Existing conversation ID or None for new conversation
            
        Returns:
            Conversation ID
        """
        try:
            # Generate conversation ID if not provided
            if not conversation_id:
                conversation_id = f"conv_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Get or create conversation document
            conversation_ref = self.db.collection(self.collections.AI_CONVERSATIONS).document(conversation_id)
            conversation_doc = await self._get_document_async(conversation_ref)
            
            if conversation_doc.exists:
                # Update existing conversation
                conversation_data = conversation_doc.to_dict()
                conversation = AIConversation(**conversation_data)
                
                # Add new message
                conversation.recent_messages.append(message)
                
                # Keep only last 10 messages for context
                if len(conversation.recent_messages) > 10:
                    conversation.recent_messages = conversation.recent_messages[-10:]
                
                # Update metadata
                conversation.last_message_at = datetime.now()
                conversation.message_count += 1
                
            else:
                # Create new conversation
                conversation = AIConversation(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    started_at=datetime.now(),
                    last_message_at=datetime.now(),
                    message_count=1,
                    conversation_type=self._classify_conversation_type(message.content),
                    recent_messages=[message]
                )
            
            # Store updated conversation
            await self._set_document_async(conversation_ref, conversation.dict())
            
            logger.info(f"Stored message for conversation {conversation_id}")
            return conversation_id
            
        except Exception as e:
            logger.error(f"Failed to store conversation message: {str(e)}")
            raise
    
    async def get_conversation_context(self, user_id: str, limit: int = 5) -> Dict[str, Any]:
        """
        Get recent conversation context for AI personalization
        
        Args:
            user_id: User identifier
            limit: Number of recent conversations to include
            
        Returns:
            Conversation context for AI
        """
        try:
            # Get recent conversations
            conversations_ref = (
                self.db.collection(self.collections.AI_CONVERSATIONS)
                .where("user_id", "==", user_id)
                .order_by("last_message_at", direction=firestore.Query.DESCENDING)
                .limit(limit)
            )
            
            conversations = await self._get_collection_async(conversations_ref)
            
            # Build context
            context = {
                "recent_topics": [],
                "user_interests": [],
                "conversation_patterns": {},
                "preferred_response_style": "detailed",
                "last_conversation_type": None
            }
            
            for conv_doc in conversations:
                conv_data = conv_doc.to_dict()
                
                # Extract topics and interests
                if conv_data.get("ai_summary"):
                    context["recent_topics"].extend(
                        conv_data["ai_summary"].get("topics_discussed", [])
                    )
                
                # Track conversation types
                conv_type = conv_data.get("conversation_type", "general")
                if conv_type in context["conversation_patterns"]:
                    context["conversation_patterns"][conv_type] += 1
                else:
                    context["conversation_patterns"][conv_type] = 1
                
                # Get last conversation type
                if not context["last_conversation_type"]:
                    context["last_conversation_type"] = conv_type
            
            # Remove duplicates and limit
            context["recent_topics"] = list(set(context["recent_topics"]))[:10]
            context["user_interests"] = list(set(context["user_interests"]))[:5]
            
            return context
            
        except Exception as e:
            logger.error(f"Failed to get conversation context: {str(e)}")
            return {}
    
    async def update_conversation_summary(
        self, 
        conversation_id: str, 
        ai_summary: Dict[str, Any]
    ):
        """Update conversation with AI-generated summary"""
        try:
            conversation_ref = self.db.collection(self.collections.AI_CONVERSATIONS).document(conversation_id)
            
            await self._update_document_async(conversation_ref, {
                "ai_summary": ai_summary,
                "updated_at": datetime.now()
            })
            
            logger.info(f"Updated conversation summary for {conversation_id}")
            
        except Exception as e:
            logger.error(f"Failed to update conversation summary: {str(e)}")
    
    # ========================================================================
    # FINANCIAL INSIGHTS MANAGEMENT
    # ========================================================================
    
    async def store_financial_insight(self, insight: FinancialInsight) -> str:
        """
        Store AI-generated financial insight
        
        Args:
            insight: Financial insight to store
            
        Returns:
            Insight ID
        """
        try:
            insight_ref = self.db.collection(self.collections.FINANCIAL_INSIGHTS).document(insight.insight_id)
            
            await self._set_document_async(insight_ref, insight.dict())
            
            logger.info(f"Stored financial insight: {insight.insight_id}")
            return insight.insight_id
            
        except Exception as e:
            logger.error(f"Failed to store financial insight: {str(e)}")
            raise
    
    async def get_user_insights(
        self, 
        user_id: str, 
        insight_type: Optional[InsightType] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get user's financial insights
        
        Args:
            user_id: User identifier
            insight_type: Filter by insight type
            limit: Maximum number of insights
            
        Returns:
            List of financial insights
        """
        try:
            query = (
                self.db.collection(self.collections.FINANCIAL_INSIGHTS)
                .where("user_id", "==", user_id)
                .where("expires_at", ">", datetime.now())
                .order_by("expires_at")
                .order_by("ai_metadata.generated_at", direction=firestore.Query.DESCENDING)
            )
            
            if insight_type:
                query = query.where("type", "==", insight_type.value)
            
            query = query.limit(limit)
            
            insights = await self._get_collection_async(query)
            return [doc.to_dict() for doc in insights]
            
        except Exception as e:
            logger.error(f"Failed to get user insights: {str(e)}")
            return []
    
    async def update_insight_feedback(
        self, 
        insight_id: str, 
        feedback: UserFeedback
    ):
        """Update insight with user feedback"""
        try:
            insight_ref = self.db.collection(self.collections.FINANCIAL_INSIGHTS).document(insight_id)
            
            await self._update_document_async(insight_ref, {
                "user_feedback": feedback.dict(),
                "updated_at": datetime.now()
            })
            
            logger.info(f"Updated insight feedback: {insight_id}")
            
        except Exception as e:
            logger.error(f"Failed to update insight feedback: {str(e)}")
    
    # ========================================================================
    # USER PERSONALIZATION
    # ========================================================================
    
    async def get_user_personalization(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user personalization data"""
        try:
            personalization_ref = self.db.collection(self.collections.USER_PERSONALIZATION).document(user_id)
            doc = await self._get_document_async(personalization_ref)
            
            if doc.exists:
                return doc.to_dict()
            return None
            
        except Exception as e:
            logger.error(f"Failed to get user personalization: {str(e)}")
            return None
    
    async def update_user_personalization(
        self, 
        user_id: str, 
        personalization_data: Dict[str, Any]
    ):
        """Update user personalization data"""
        try:
            personalization_ref = self.db.collection(self.collections.USER_PERSONALIZATION).document(user_id)
            
            # Merge with existing data
            await self._update_document_async(personalization_ref, {
                **personalization_data,
                "last_updated": datetime.now()
            }, merge=True)
            
            logger.info(f"Updated user personalization: {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to update user personalization: {str(e)}")
    
    # ========================================================================
    # FINANCIAL GOALS MANAGEMENT
    # ========================================================================
    
    async def store_financial_goal(self, goal: FinancialGoal) -> str:
        """Store financial goal"""
        try:
            goal_ref = self.db.collection(self.collections.FINANCIAL_GOALS).document(goal.goal_id)
            
            await self._set_document_async(goal_ref, goal.dict())
            
            logger.info(f"Stored financial goal: {goal.goal_id}")
            return goal.goal_id
            
        except Exception as e:
            logger.error(f"Failed to store financial goal: {str(e)}")
            raise
    
    async def get_user_goals(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's financial goals"""
        try:
            goals_ref = (
                self.db.collection(self.collections.FINANCIAL_GOALS)
                .where("user_id", "==", user_id)
                .order_by("priority")
                .order_by("target_date")
            )
            
            goals = await self._get_collection_async(goals_ref)
            return [doc.to_dict() for doc in goals]
            
        except Exception as e:
            logger.error(f"Failed to get user goals: {str(e)}")
            return []
    
    # ========================================================================
    # UTILITY METHODS
    # ========================================================================
    
    def _classify_conversation_type(self, message_content: str) -> ConversationType:
        """Classify conversation type based on message content"""
        content_lower = message_content.lower()
        
        if any(keyword in content_lower for keyword in ["goal", "target", "plan", "future"]):
            return ConversationType.FINANCIAL_PLANNING
        elif any(keyword in content_lower for keyword in ["invest", "portfolio", "fund", "stock"]):
            return ConversationType.INVESTMENT_ADVICE
        elif any(keyword in content_lower for keyword in ["what if", "scenario", "simulate"]):
            return ConversationType.SCENARIO_ANALYSIS
        else:
            return ConversationType.GENERAL
    
    async def _get_document_async(self, doc_ref):
        """Async wrapper for Firestore document get"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, doc_ref.get)
    
    async def _set_document_async(self, doc_ref, data):
        """Async wrapper for Firestore document set"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, doc_ref.set, data)
    
    async def _update_document_async(self, doc_ref, data, merge=False):
        """Async wrapper for Firestore document update"""
        loop = asyncio.get_event_loop()
        if merge:
            return await loop.run_in_executor(None, lambda: doc_ref.set(data, merge=True))
        else:
            return await loop.run_in_executor(None, doc_ref.update, data)
    
    async def _get_collection_async(self, query):
        """Async wrapper for Firestore collection query"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: list(query.stream()))
    
    async def cleanup_expired_data(self):
        """Clean up expired insights and old conversations"""
        try:
            # Clean up expired insights
            expired_insights = (
                self.db.collection(self.collections.FINANCIAL_INSIGHTS)
                .where("expires_at", "<", datetime.now())
            )
            
            batch = self.db.batch()
            async for doc in self._get_collection_async(expired_insights):
                batch.delete(doc.reference)
            
            await asyncio.get_event_loop().run_in_executor(None, batch.commit)
            
            logger.info("Cleaned up expired data")
            
        except Exception as e:
            logger.error(f"Failed to cleanup expired data: {str(e)}")


# Global service instance
_ai_firestore_service: Optional[AIFirestoreService] = None

def get_ai_firestore_service() -> AIFirestoreService:
    """
    Get global AI Firestore service instance
    
    Returns:
        AIFirestoreService instance
    """
    global _ai_firestore_service
    if _ai_firestore_service is None:
        _ai_firestore_service = AIFirestoreService()
    return _ai_firestore_service
