"""
Intelligent Chat Service
Combines Fi MCP data with Vertex AI/Gemini for personalized financial conversations
Author: Senior Principal Architect with 15+ years experience
"""

import asyncio
import logging
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union

from .fi_mcp_client import get_fi_mcp_client
from .ai_firestore_service import get_ai_firestore_service
from .integrated_auth_service import get_integrated_auth_service
from ..app.services.gemini_service import get_gemini_service
from ..models.ai_models import (
    ChatMessage, MessageRole, ConversationType, FinancialInsight,
    InsightType, Priority, AIRecommendation, AIMetadata, UserFeedback
)

logger = logging.getLogger(__name__)

class IntelligentChatService:
    """
    Professional intelligent chat service
    Provides AI-powered financial conversations using real Fi MCP data
    """
    
    def __init__(self):
        self.fi_mcp_client = get_fi_mcp_client()
        self.ai_firestore = get_ai_firestore_service()
        self.integrated_auth = get_integrated_auth_service()
        self.gemini_service = get_gemini_service()
        
        # Financial keywords for query classification
        self.financial_keywords = [
            # Net worth and portfolio
            "net worth", "portfolio", "investment", "assets", "liabilities",
            "balance", "account", "bank", "savings", "mutual fund", "mf", 
            "sip", "stock", "equity", "shares", "dividend", "returns",
            "credit score", "loan", "emi", "debt", "epf", "retirement",
            "goal", "planning", "budget", "expense", "income", "save"
        ]
    
    async def process_chat_message(
        self, 
        user_message: str, 
        firebase_token: str,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process chat message with intelligent Fi MCP integration
        
        Args:
            user_message: User's message
            firebase_token: Firebase authentication token
            conversation_id: Existing conversation ID
            
        Returns:
            Intelligent chat response with financial data
        """
        try:
            start_time = datetime.now()
            
            # Step 1: Authenticate and check access
            access_check = await self.integrated_auth.check_user_access(
                firebase_token, user_message
            )
            
            if access_check["access"] == "denied":
                return {
                    "success": False,
                    "error": access_check["error"],
                    "requires_auth": "firebase"
                }
            
            user_info = access_check["user"]
            
            # Step 2: Check if financial data is required
            if access_check["access"] == "requires_fi_auth":
                return {
                    "success": True,
                    "requires_fi_auth": True,
                    "message": access_check["message"],
                    "auth_url": "/api/v1/fi-auth/initiate",
                    "user": user_info
                }
            
            # Step 3: Build conversation context
            conversation_context = await self._build_conversation_context(
                user_info["uid"], conversation_id
            )
            
            # Step 4: Process message based on access level
            if access_check["access"] == "general":
                response = await self._process_general_query(
                    user_message, user_info, conversation_context
                )
            else:  # full_financial access
                response = await self._process_financial_query(
                    user_message, user_info, access_check["fi_session"], conversation_context
                )
            
            # Step 5: Store conversation
            user_msg = ChatMessage(
                message_id=f"msg_{uuid.uuid4().hex[:8]}",
                timestamp=datetime.now(),
                role=MessageRole.USER,
                content=user_message,
                intent=self._classify_message_intent(user_message)
            )
            
            ai_msg = ChatMessage(
                message_id=f"msg_{uuid.uuid4().hex[:8]}",
                timestamp=datetime.now(),
                role=MessageRole.ASSISTANT,
                content=response["content"],
                ai_processing={
                    "model_used": response.get("model_used", "gemini-1.5-flash"),
                    "processing_time_ms": int((datetime.now() - start_time).total_seconds() * 1000),
                    "data_sources_used": response.get("data_sources", []),
                    "confidence_level": response.get("confidence", 0.8)
                },
                structured_response=response.get("structured_data", {})
            )
            
            # Store both messages
            conversation_id = await self.ai_firestore.store_conversation_message(
                user_info["uid"], user_msg, conversation_id
            )
            await self.ai_firestore.store_conversation_message(
                user_info["uid"], ai_msg, conversation_id
            )
            
            # Step 6: Generate insights if applicable
            if access_check["access"] == "full_financial" and response.get("generate_insight"):
                await self._generate_and_store_insight(
                    user_info["uid"], user_message, response
                )
            
            return {
                "success": True,
                "response": response["content"],
                "conversation_id": conversation_id,
                "user": user_info,
                "data_source": response.get("data_source", "ai"),
                "structured_data": response.get("structured_data", {}),
                "recommendations": response.get("recommendations", []),
                "confidence": response.get("confidence", 0.8)
            }
            
        except Exception as e:
            logger.error(f"Chat processing failed: {str(e)}")
            return {
                "success": False,
                "error": f"Chat processing failed: {str(e)}"
            }
    
    async def _build_conversation_context(
        self, 
        user_id: str, 
        conversation_id: Optional[str]
    ) -> Dict[str, Any]:
        """Build comprehensive conversation context"""
        try:
            # Get conversation history
            conversation_context = await self.ai_firestore.get_conversation_context(user_id)
            
            # Get user personalization
            personalization = await self.ai_firestore.get_user_personalization(user_id)
            
            # Get recent insights
            recent_insights = await self.ai_firestore.get_user_insights(user_id, limit=3)
            
            # Get user goals
            user_goals = await self.ai_firestore.get_user_goals(user_id)
            
            return {
                "conversation_history": conversation_context,
                "personalization": personalization or {},
                "recent_insights": [insight.get("title", "") for insight in recent_insights],
                "active_goals": [goal.get("title", "") for goal in user_goals],
                "user_preferences": personalization.get("communication_profile", {}) if personalization else {}
            }
            
        except Exception as e:
            logger.error(f"Failed to build conversation context: {str(e)}")
            return {}
    
    async def _process_general_query(
        self, 
        user_message: str, 
        user_info: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process general (non-financial) queries"""
        try:
            # Build AI prompt for general financial education
            ai_prompt = f"""
            You are a helpful personal finance AI assistant. The user asked: "{user_message}"
            
            User Context:
            - Name: {user_info.get('name', 'User')}
            - Recent topics: {context.get('conversation_history', {}).get('recent_topics', [])}
            
            Provide helpful, educational financial information. Be conversational and encouraging.
            If the question requires personal financial data, gently suggest connecting their financial accounts.
            """
            
            response = await self.gemini_service.generate_response(
                ai_prompt,
                temperature=0.7,
                max_tokens=1000
            )
            
            return {
                "content": response,
                "model_used": "gemini-1.5-flash",
                "data_source": "general_ai",
                "confidence": 0.8,
                "data_sources": ["general_knowledge"]
            }
            
        except Exception as e:
            logger.error(f"General query processing failed: {str(e)}")
            return {
                "content": "I'm here to help with your financial questions! Could you please rephrase your question?",
                "model_used": "fallback",
                "confidence": 0.5
            }
    
    async def _process_financial_query(
        self, 
        user_message: str, 
        user_info: Dict[str, Any],
        fi_session: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process financial queries with real Fi MCP data"""
        try:
            # Get fresh financial data from Fi MCP
            financial_data = await self._get_financial_data_for_query(
                user_message, fi_session
            )
            
            # Build comprehensive AI prompt
            ai_prompt = self._build_financial_ai_prompt(
                user_message, user_info, financial_data, context
            )
            
            # Generate AI response
            response = await self.gemini_service.generate_response(
                ai_prompt,
                temperature=0.7,
                max_tokens=1500
            )
            
            # Extract structured data and recommendations
            structured_data = self._extract_structured_data(response, financial_data)
            recommendations = self._extract_recommendations(response)
            
            return {
                "content": response,
                "model_used": "gemini-1.5-pro",
                "data_source": "fi_mcp_real_data",
                "confidence": 0.9,
                "data_sources": ["fi_mcp", "user_context", "ai_analysis"],
                "structured_data": structured_data,
                "recommendations": recommendations,
                "generate_insight": self._should_generate_insight(user_message),
                "financial_data": financial_data
            }
            
        except Exception as e:
            logger.error(f"Financial query processing failed: {str(e)}")
            return {
                "content": "I'm having trouble accessing your financial data right now. Please try again in a moment.",
                "model_used": "fallback",
                "confidence": 0.3
            }
    
    async def _get_financial_data_for_query(
        self, 
        query: str, 
        fi_session: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get relevant financial data based on query type"""
        try:
            query_lower = query.lower()
            data = {}
            
            # Always get net worth for context
            net_worth = await self.fi_mcp_client.fetch_net_worth(fi_session)
            if net_worth:
                data["net_worth"] = {
                    "total": net_worth.total_net_worth_value.amount,
                    "currency": net_worth.total_net_worth_value.currency_code,
                    "assets": [{"type": asset.net_worth_attribute, "value": asset.value.amount} 
                              for asset in net_worth.asset_values],
                    "liabilities": [{"type": liability.net_worth_attribute, "value": liability.value.amount} 
                                   for liability in net_worth.liability_values]
                }
            
            # Get specific data based on query
            if any(keyword in query_lower for keyword in ["transaction", "bank", "account", "balance"]):
                bank_data = await self.fi_mcp_client.fetch_bank_transactions(fi_session)
                if bank_data:
                    data["banking"] = {
                        "accounts": len(bank_data),
                        "total_balance": sum(tx.amount for tx in bank_data),
                        "recent_transactions": [
                            {"amount": tx.amount, "description": tx.description, "date": tx.date.isoformat()}
                            for tx in bank_data[:5]
                        ]
                    }
            
            if any(keyword in query_lower for keyword in ["mutual fund", "mf", "sip", "investment"]):
                mf_data = await self.fi_mcp_client.fetch_mutual_fund_transactions(fi_session)
                if mf_data:
                    data["mutual_funds"] = {
                        "total_transactions": len(mf_data),
                        "total_invested": sum(tx.transaction_amount for tx in mf_data if tx.order_type == 1),
                        "funds": list(set([tx.scheme_name for tx in mf_data]))
                    }
            
            if any(keyword in query_lower for keyword in ["credit", "score", "loan"]):
                credit_data = await self.fi_mcp_client.fetch_credit_report(fi_session)
                if credit_data:
                    data["credit"] = {
                        "score": credit_data.score.bureau_score,
                        "report_date": credit_data.report_date
                    }
            
            if any(keyword in query_lower for keyword in ["epf", "retirement", "provident"]):
                epf_data = await self.fi_mcp_client.fetch_epf_details(fi_session)
                if epf_data:
                    data["epf"] = {
                        "accounts": len(epf_data),
                        "total_balance": sum(acc.total_balance for acc in epf_data)
                    }
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to get financial data: {str(e)}")
            return {}
    
    def _build_financial_ai_prompt(
        self, 
        user_message: str, 
        user_info: Dict[str, Any],
        financial_data: Dict[str, Any],
        context: Dict[str, Any]
    ) -> str:
        """Build comprehensive AI prompt for financial queries"""
        
        return f"""
        You are an expert personal finance AI assistant for {user_info.get('name', 'the user')}.
        
        USER QUERY: "{user_message}"
        
        CURRENT FINANCIAL DATA (from Fi MCP):
        {json.dumps(financial_data, indent=2)}
        
        USER CONTEXT:
        - Recent conversation topics: {context.get('conversation_history', {}).get('recent_topics', [])}
        - Active financial goals: {context.get('active_goals', [])}
        - Recent insights: {context.get('recent_insights', [])}
        - Communication preference: {context.get('user_preferences', {}).get('explanation_style', 'detailed')}
        
        INSTRUCTIONS:
        1. Use the REAL financial data provided above in your response
        2. Be specific with numbers and calculations
        3. Provide actionable recommendations
        4. Reference their actual portfolio/accounts when relevant
        5. Be conversational but professional
        6. If making projections, show your assumptions
        7. Include specific next steps they can take
        
        Provide a comprehensive, personalized response that demonstrates you understand their complete financial picture.
        """
    
    def _extract_structured_data(self, response: str, financial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract structured data from AI response"""
        try:
            # Extract key financial metrics mentioned in response
            structured = {
                "timestamp": datetime.now().isoformat(),
                "financial_snapshot": financial_data,
                "response_type": self._classify_response_type(response)
            }
            
            # Extract any numbers or percentages mentioned
            import re
            numbers = re.findall(r'₹[\d,]+', response)
            percentages = re.findall(r'\d+\.?\d*%', response)
            
            if numbers:
                structured["amounts_mentioned"] = numbers[:5]  # Top 5
            if percentages:
                structured["percentages_mentioned"] = percentages[:3]  # Top 3
            
            return structured
            
        except Exception as e:
            logger.error(f"Failed to extract structured data: {str(e)}")
            return {}
    
    def _extract_recommendations(self, response: str) -> List[Dict[str, Any]]:
        """Extract actionable recommendations from AI response"""
        try:
            recommendations = []
            
            # Look for recommendation patterns
            lines = response.split('\n')
            for line in lines:
                line = line.strip()
                if any(indicator in line.lower() for indicator in ['recommend', 'suggest', 'consider', 'should']):
                    if len(line) > 20 and len(line) < 200:  # Reasonable length
                        recommendations.append({
                            "text": line,
                            "priority": "medium",
                            "actionable": True
                        })
            
            return recommendations[:3]  # Top 3 recommendations
            
        except Exception as e:
            logger.error(f"Failed to extract recommendations: {str(e)}")
            return []
    
    def _classify_message_intent(self, message: str) -> str:
        """Classify user message intent"""
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in ["what", "how much", "show"]):
            return "information_request"
        elif any(keyword in message_lower for keyword in ["should", "recommend", "advice"]):
            return "advice_seeking"
        elif any(keyword in message_lower for keyword in ["what if", "scenario", "simulate"]):
            return "scenario_analysis"
        elif any(keyword in message_lower for keyword in ["goal", "plan", "target"]):
            return "goal_planning"
        else:
            return "general_inquiry"
    
    def _classify_response_type(self, response: str) -> str:
        """Classify AI response type"""
        response_lower = response.lower()
        
        if "net worth" in response_lower:
            return "net_worth_analysis"
        elif any(keyword in response_lower for keyword in ["portfolio", "investment"]):
            return "investment_analysis"
        elif any(keyword in response_lower for keyword in ["goal", "target"]):
            return "goal_analysis"
        elif any(keyword in response_lower for keyword in ["recommend", "suggest"]):
            return "recommendation"
        else:
            return "general_response"
    
    def _should_generate_insight(self, message: str) -> bool:
        """Determine if message should generate a stored insight"""
        insight_triggers = [
            "portfolio", "investment", "goal", "retirement", "net worth",
            "performance", "allocation", "risk", "recommendation"
        ]
        
        return any(trigger in message.lower() for trigger in insight_triggers)
    
    async def _generate_and_store_insight(
        self, 
        user_id: str, 
        user_message: str, 
        response_data: Dict[str, Any]
    ):
        """Generate and store financial insight based on conversation"""
        try:
            insight = FinancialInsight(
                insight_id=f"insight_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                user_id=user_id,
                type=InsightType.PORTFOLIO_ANALYSIS,  # Default, could be smarter
                category="investment",
                priority=Priority.MEDIUM,
                confidence_score=response_data.get("confidence", 0.8),
                title=f"Insight from: {user_message[:50]}...",
                summary=response_data["content"][:200] + "...",
                detailed_analysis=response_data["content"],
                recommendations=[
                    AIRecommendation(
                        action_type="review",
                        description=rec["text"],
                        impact="Improved financial health",
                        urgency=rec["priority"]
                    ) for rec in response_data.get("recommendations", [])
                ],
                data_snapshot=response_data.get("structured_data", {}),
                ai_metadata=AIMetadata(
                    model_used=response_data.get("model_used", "gemini-1.5-pro"),
                    processing_time_ms=1000,  # Approximate
                    data_sources_used=response_data.get("data_sources", []),
                    confidence_level=response_data.get("confidence", 0.8),
                    generated_at=datetime.now()
                ),
                expires_at=datetime.now() + timedelta(days=30)
            )
            
            await self.ai_firestore.store_financial_insight(insight)
            logger.info(f"Generated insight for user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to generate insight: {str(e)}")


# Global service instance
_intelligent_chat_service: Optional[IntelligentChatService] = None

def get_intelligent_chat_service() -> IntelligentChatService:
    """
    Get global intelligent chat service instance
    
    Returns:
        IntelligentChatService instance
    """
    global _intelligent_chat_service
    if _intelligent_chat_service is None:
        _intelligent_chat_service = IntelligentChatService()
    return _intelligent_chat_service
