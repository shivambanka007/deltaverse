"""
AI Agent Service
Orchestrates MCP data fetching, AI model interactions, and response generation
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

from .mcp_service import get_mcp_service, FiMCPService
from .vertex_ai_service import get_financial_ai_models, FinancialAIModels
from ..models.financial_data import (
    UserQuery, AIResponse, ConversationHistory, FinancialInsight,
    FinancialDataCategory
)
from ..firebase_config import get_firestore_client

logger = logging.getLogger(__name__)

class FinancialAIAgent:
    """
    Main AI Agent for personal finance conversations
    Combines MCP data with Vertex AI models for intelligent responses
    """
    
    def __init__(self):
        self.mcp_service: Optional[FiMCPService] = None
        self.ai_models: Optional[FinancialAIModels] = None
        self.firestore = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize all service dependencies"""
        try:
            self.mcp_service = await get_mcp_service()
            self.ai_models = await get_financial_ai_models()
            self.firestore = get_firestore_client()
            self.initialized = True
            logger.info("✅ Financial AI Agent initialized successfully")
        except Exception as e:
            logger.error(f"❌ Error initializing AI Agent: {str(e)}")
            raise
    
    async def process_user_query(
        self, 
        user_id: str, 
        query_text: str,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Main method to process user queries and generate intelligent responses
        
        Args:
            user_id: User identifier
            query_text: User's financial question
            conversation_id: Optional conversation context
            
        Returns:
            Complete response with AI-generated insights
        """
        if not self.initialized:
            await self.initialize()
        
        try:
            logger.info(f"Processing query for user {user_id}: {query_text[:100]}...")
            
            # Step 1: Analyze query intent using Gemma (free)
            query_analysis = await self.ai_models.analyze_query_intent(query_text)
            logger.info(f"Query intent: {query_analysis.get('intent', 'unknown')}")
            
            # Step 2: Fetch relevant financial data based on intent
            context_data = await self._get_relevant_context(user_id, query_analysis)
            
            # Step 3: Get user's financial profile
            user_profile = await self._get_user_profile(user_id)
            
            # Step 4: Generate response using Gemini Pro
            ai_response = await self.ai_models.generate_financial_response(
                user_query=query_text,
                context_data=context_data,
                user_profile=user_profile
            )
            
            # Step 5: Store conversation
            query_id = str(uuid.uuid4())
            response_id = str(uuid.uuid4())
            
            await self._store_conversation(
                user_id=user_id,
                query_id=query_id,
                response_id=response_id,
                query_text=query_text,
                query_analysis=query_analysis,
                ai_response=ai_response,
                conversation_id=conversation_id
            )
            
            # Step 6: Prepare final response
            final_response = {
                "query_id": query_id,
                "response_id": response_id,
                "user_id": user_id,
                "query": query_text,
                "intent": query_analysis.get('intent'),
                "response": ai_response.get('main_response'),
                "insights": ai_response.get('key_insights', []),
                "action_items": ai_response.get('action_items', []),
                "data_highlights": ai_response.get('data_highlights', {}),
                "follow_up_questions": ai_response.get('follow_up_questions', []),
                "confidence": ai_response.get('confidence_level', 0.8),
                "timestamp": datetime.utcnow().isoformat(),
                "data_sources": list(context_data.keys()),
                "conversation_id": conversation_id
            }
            
            logger.info(f"✅ Successfully processed query for user {user_id}")
            return final_response
            
        except Exception as e:
            logger.error(f"❌ Error processing query for user {user_id}: {str(e)}")
            return {
                "error": str(e),
                "query": query_text,
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def generate_proactive_insights(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Generate proactive financial insights for user
        
        Args:
            user_id: User identifier
            
        Returns:
            List of proactive insights
        """
        if not self.initialized:
            await self.initialize()
        
        try:
            logger.info(f"Generating proactive insights for user {user_id}")
            
            # Get user's complete financial data
            financial_data = await self._get_complete_financial_data(user_id)
            
            if not financial_data:
                logger.info(f"No financial data available for user {user_id}")
                return []
            
            # Generate insights using AI
            insights = await self.ai_models.generate_proactive_insights(financial_data)
            
            # Store insights in Firestore
            await self._store_insights(user_id, insights)
            
            logger.info(f"✅ Generated {len(insights)} insights for user {user_id}")
            return insights
            
        except Exception as e:
            logger.error(f"❌ Error generating proactive insights for user {user_id}: {str(e)}")
            return []
    
    async def simulate_financial_scenario(
        self, 
        user_id: str, 
        scenario: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Simulate financial scenarios using AI
        
        Args:
            user_id: User identifier
            scenario: Scenario parameters
            
        Returns:
            Simulation results
        """
        if not self.initialized:
            await self.initialize()
        
        try:
            logger.info(f"Simulating scenario for user {user_id}: {scenario.get('type', 'unknown')}")
            
            # Get current financial data
            current_data = await self._get_complete_financial_data(user_id)
            
            # Create scenario simulation prompt
            prompt = f"""
            Simulate the following financial scenario for the user:
            
            Current Financial Data:
            {current_data}
            
            Scenario to Simulate:
            {scenario}
            
            Provide detailed analysis including:
            1. Impact on net worth
            2. Cash flow changes
            3. Risk assessment
            4. Timeline projections
            5. Recommendations
            
            Return JSON with simulation results.
            """
            
            # Use Gemini Pro for complex scenario analysis
            response = await self.ai_models._generate_with_gemini_pro(prompt)
            
            # Parse and return results
            import json
            try:
                simulation_results = json.loads(response)
                simulation_results['user_id'] = user_id
                simulation_results['scenario'] = scenario
                simulation_results['timestamp'] = datetime.utcnow().isoformat()
                return simulation_results
            except json.JSONDecodeError:
                return {
                    "error": "Failed to parse simulation results",
                    "raw_response": response,
                    "user_id": user_id,
                    "scenario": scenario
                }
                
        except Exception as e:
            logger.error(f"❌ Error simulating scenario for user {user_id}: {str(e)}")
            return {
                "error": str(e),
                "user_id": user_id,
                "scenario": scenario
            }
    
    async def _get_relevant_context(
        self, 
        user_id: str, 
        query_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Get relevant financial data based on query analysis
        
        Args:
            user_id: User identifier
            query_analysis: Analysis of user's query
            
        Returns:
            Relevant financial context data
        """
        try:
            # Determine what data types are needed
            data_types_needed = query_analysis.get('data_types_needed', [])
            intent = query_analysis.get('intent', 'general_advice')
            
            # Default data types based on intent
            if not data_types_needed:
                intent_data_map = {
                    'investment_analysis': ['mutual_funds', 'stocks', 'net_worth'],
                    'expense_tracking': ['bank_transactions'],
                    'financial_planning': ['net_worth', 'bank_transactions', 'mutual_funds'],
                    'debt_management': ['credit_report', 'bank_transactions'],
                    'retirement_planning': ['epf_details', 'mutual_funds', 'net_worth'],
                    'net_worth': ['net_worth', 'bank_transactions', 'mutual_funds', 'stocks']
                }
                data_types_needed = intent_data_map.get(intent, ['net_worth'])
            
            # Fetch relevant data from Firestore
            context_data = {}
            
            if self.firestore:
                user_doc = self.firestore.collection('users').document(user_id)
                financial_data_ref = user_doc.collection('financial_data')
                
                for data_type in data_types_needed:
                    doc = financial_data_ref.document(data_type).get()
                    if doc.exists:
                        data = doc.to_dict()
                        if data.get('success', False) and data.get('data'):
                            context_data[data_type] = data['data']
            
            # Also get conversation history for context
            recent_conversations = await self._get_recent_conversations(user_id, limit=3)
            if recent_conversations:
                context_data['recent_conversations'] = recent_conversations
            
            return context_data
            
        except Exception as e:
            logger.error(f"Error getting relevant context for user {user_id}: {str(e)}")
            return {}
    
    async def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user's financial profile and preferences"""
        try:
            if not self.firestore:
                return {}
            
            user_doc = self.firestore.collection('users').document(user_id).get()
            if user_doc.exists:
                profile = user_doc.to_dict()
                return {
                    'user_id': user_id,
                    'financial_goals': profile.get('financial_goals', []),
                    'risk_profile': profile.get('risk_profile', 'moderate'),
                    'age': profile.get('age'),
                    'income_range': profile.get('income_range'),
                    'last_mcp_sync': profile.get('last_mcp_sync')
                }
            
            return {'user_id': user_id}
            
        except Exception as e:
            logger.error(f"Error getting user profile for {user_id}: {str(e)}")
            return {'user_id': user_id}
    
    async def _get_complete_financial_data(self, user_id: str) -> Dict[str, Any]:
        """Get user's complete financial data"""
        try:
            if not self.firestore:
                return {}
            
            financial_data = {}
            user_doc = self.firestore.collection('users').document(user_id)
            financial_data_ref = user_doc.collection('financial_data')
            
            docs = financial_data_ref.stream()
            for doc in docs:
                data = doc.to_dict()
                if data.get('success', False) and data.get('data'):
                    financial_data[doc.id] = data['data']
            
            return financial_data
            
        except Exception as e:
            logger.error(f"Error getting complete financial data for {user_id}: {str(e)}")
            return {}
    
    async def _get_recent_conversations(self, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent conversation history"""
        try:
            if not self.firestore:
                return []
            
            conversations_ref = (self.firestore
                               .collection('users')
                               .document(user_id)
                               .collection('conversations')
                               .order_by('timestamp', direction='DESCENDING')
                               .limit(limit))
            
            conversations = []
            docs = conversations_ref.stream()
            for doc in docs:
                conversations.append(doc.to_dict())
            
            return conversations
            
        except Exception as e:
            logger.error(f"Error getting recent conversations for {user_id}: {str(e)}")
            return []
    
    async def _store_conversation(
        self,
        user_id: str,
        query_id: str,
        response_id: str,
        query_text: str,
        query_analysis: Dict[str, Any],
        ai_response: Dict[str, Any],
        conversation_id: Optional[str] = None
    ):
        """Store conversation in Firestore"""
        try:
            if not self.firestore:
                return
            
            conversation_data = {
                'query_id': query_id,
                'response_id': response_id,
                'user_id': user_id,
                'query_text': query_text,
                'query_analysis': query_analysis,
                'ai_response': ai_response,
                'timestamp': datetime.utcnow(),
                'conversation_id': conversation_id or query_id
            }
            
            # Store in conversations collection
            self.firestore.collection('users').document(user_id).collection('conversations').document(query_id).set(conversation_data)
            
        except Exception as e:
            logger.error(f"Error storing conversation for user {user_id}: {str(e)}")
    
    async def _store_insights(self, user_id: str, insights: List[Dict[str, Any]]):
        """Store proactive insights in Firestore"""
        try:
            if not self.firestore or not insights:
                return
            
            batch = self.firestore.batch()
            
            for insight in insights:
                insight_id = str(uuid.uuid4())
                insight_data = {
                    **insight,
                    'insight_id': insight_id,
                    'user_id': user_id,
                    'generated_at': datetime.utcnow(),
                    'status': 'active'
                }
                
                doc_ref = (self.firestore
                          .collection('users')
                          .document(user_id)
                          .collection('insights')
                          .document(insight_id))
                
                batch.set(doc_ref, insight_data)
            
            batch.commit()
            
        except Exception as e:
            logger.error(f"Error storing insights for user {user_id}: {str(e)}")

# Singleton instance
financial_ai_agent = FinancialAIAgent()

async def get_financial_ai_agent() -> FinancialAIAgent:
    """Get Financial AI Agent instance"""
    if not financial_ai_agent.initialized:
        await financial_ai_agent.initialize()
    return financial_ai_agent
