#!/usr/bin/env python3
"""
AI-Powered Chat Service
Simplified version with real Gemini AI integration for root API
"""

import asyncio
import logging
import json
import uuid
import os
from datetime import datetime
from typing import Dict, List, Optional, Any

# Try to import Vertex AI
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
    VERTEX_AI_AVAILABLE = True
    print("🤖 Vertex AI available - Real AI integration enabled!")
except ImportError:
    VERTEX_AI_AVAILABLE = False
    print("⚠️ Vertex AI not available - Using mock responses")

logger = logging.getLogger(__name__)

class AIFinancialChatService:
    """AI-powered financial chat service with real Gemini integration"""
    
    def __init__(self):
        # Environment-based configuration for production flexibility
        self.project_id = os.getenv("VERTEX_AI_PROJECT_ID", "opportune-scope-466406-p6")
        self.location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        # Use the working Gemini model we confirmed
        self.model_name = "gemini-2.0-flash-exp"
        self.model = None
        
        # Model configuration from environment
        self.temperature = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
        self.max_tokens = int(os.getenv("GEMINI_MAX_TOKENS", "1024"))
        self.top_p = float(os.getenv("GEMINI_TOP_P", "0.8"))
        self.top_k = int(os.getenv("GEMINI_TOP_K", "40"))
        
        # Financial keywords for query classification
        self.financial_keywords = [
            "portfolio", "investment", "net worth", "balance", "mutual fund",
            "sip", "stock", "loan", "debt", "savings", "expense", "income"
        ]
        
        # Personal query keywords
        self.personal_keywords = [
            "my portfolio", "my investment", "my net worth", "my balance", 
            "my mutual fund", "my sip", "my stock", "my loan", "my debt", 
            "my savings", "my expense", "my income", "what's my", "show my",
            "how much do i", "my current", "my account"
        ]
        
        self.mock_fi_sessions = {}  # Store mock Fi MCP sessions
        
        # Initialize Vertex AI if available
        if VERTEX_AI_AVAILABLE:
            self._initialize_vertex_ai()
        
    async def get_financial_context(self, user_id: str = None) -> Dict[str, Any]:
        """Get user's financial context from Fi MCP data"""
        try:
            # Import here to avoid circular imports
            from firebase_config import get_firestore_client
            
            db = get_firestore_client()
            # Use provided user_id or fall back to default_user
            doc_user_id = user_id or 'default_user'
            doc_ref = db.collection('financial_profiles').document(doc_user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                profile_data = doc.to_dict()
                
                # Extract relevant financial context
                net_worth = profile_data.get('net_worth', {})
                accounts = profile_data.get('accounts', [])
                transactions = profile_data.get('transactions', [])
                
                context = {
                    "has_data": True,
                    "data_source": profile_data.get('data_source', 'unknown'),
                    "last_sync": profile_data.get('last_sync'),
                    "net_worth": net_worth.get('total', 0),  # Fi service uses 'total' not 'total_net_worth'
                    "total_assets": net_worth.get('assets', 0),
                    "total_liabilities": net_worth.get('liabilities', 0),
                    "account_count": len(accounts),
                    "account_types": [acc.get('type') for acc in accounts],
                    "recent_transaction_count": len(transactions),
                    "sync_status": profile_data.get('sync_status', 'unknown'),
                    "scenario_description": profile_data.get('scenario_description', 'Unknown scenario')
                }
                
                return context
            else:
                return {
                    "has_data": False,
                    "data_source": "none",
                    "message": "No financial data available"
                }
                
        except Exception as e:
            logger.error(f"Error getting financial context: {str(e)}")
            return {
                "has_data": False,
                "data_source": "error",
                "error": str(e)
            }
    
    def _initialize_vertex_ai(self):
        """Initialize Vertex AI with service account and environment-based configuration"""
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project_id, location=self.location)
            self.model = GenerativeModel(self.model_name)
            print(f"✅ Vertex AI {self.model_name} model initialized successfully!")
            print(f"📍 Project: {self.project_id}, Location: {self.location}")
            print(f"⚙️ Config: temp={self.temperature}, max_tokens={self.max_tokens}")
        except Exception as e:
            print(f"⚠️ Vertex AI initialization failed: {e}")
            self.model = None
    
    def is_financial_query(self, message: str) -> bool:
        """Check if message contains financial keywords"""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in self.financial_keywords)
    
    def is_personal_financial_query(self, message: str) -> bool:
        """Check if message is asking for personal financial data"""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in self.personal_keywords)
    
    async def generate_ai_response(self, prompt: str, context: str = "") -> str:
        """Generate AI response using Gemini with Fi MCP financial context"""
        
        # Get user's financial context from Fi MCP data
        financial_context = await self.get_financial_context()
        
        if VERTEX_AI_AVAILABLE and self.model:
            try:
                # Build enhanced prompt with financial context
                if financial_context.get("has_data"):
                    # User has connected Fi MCP data - provide personalized responses
                    context_info = f"""
PERSONALIZED FINANCIAL CONTEXT:
- Net Worth: ₹{financial_context.get('net_worth', 0):,.2f}
- Total Assets: ₹{financial_context.get('total_assets', 0):,.2f}
- Total Liabilities: ₹{financial_context.get('total_liabilities', 0):,.2f}
- Connected Accounts: {financial_context.get('account_count', 0)}
- Account Types: {', '.join(financial_context.get('account_types', []))}
- Data Source: {financial_context.get('data_source')}
- Last Updated: {financial_context.get('last_sync', 'Unknown')}

You can now provide PERSONALIZED advice based on this real financial data.
"""
                else:
                    # No Fi MCP data - provide general advice
                    context_info = """
GENERAL CONTEXT:
- User has not connected their Fi Money account yet
- Provide general financial education and advice
- Encourage connecting Fi account for personalized insights
- Use hypothetical examples when explaining concepts
"""

                full_prompt = f"""
You are DeltaVerse AI, a professional financial advisor assistant powered by Fi Money integration.

{context_info}

Additional Context: {context}

User Query: {prompt}

RESPONSE FORMATTING REQUIREMENTS:
1. Keep responses under 200 words
2. Use 2-3 short paragraphs maximum
3. Use bullet points (•) for lists, not asterisks
4. No markdown formatting (**, ##, etc.)
5. End with ONE clear next step
6. Use conversational, friendly tone
7. Include specific numbers when available
8. Avoid repetitive explanations

RESPONSE STRUCTURE:
- Start with direct answer to the question
- Add 2-3 key insights or recommendations
- End with one actionable next step

Instructions:
1. If user has financial data, provide SPECIFIC, PERSONALIZED advice based on their actual numbers
2. If no financial data, provide general education and encourage Fi account connection
3. Be helpful, accurate, and professional
4. Keep responses concise but comprehensive
5. Use Indian financial context (₹, SIP, EPF, etc.)
6. If asked about specific accounts/investments, reference their actual data when available
"""
                
                # Use environment-configured parameters with shorter responses
                generation_config = {
                    "temperature": self.temperature,
                    "top_p": self.top_p,
                    "top_k": self.top_k,
                    "max_output_tokens": min(self.max_tokens, 800),  # Limit to 800 tokens for conciseness
                }
                
                response = await asyncio.to_thread(
                    self.model.generate_content, 
                    full_prompt,
                    generation_config=generation_config
                )
                
                # Post-process response for better formatting
                formatted_response = self._format_ai_response(response.text)
                return formatted_response
                
            except Exception as e:
                logger.error(f"AI generation error: {e}")
                return self._get_fallback_response(prompt, financial_context)
        else:
            return self._get_fallback_response(prompt, financial_context)
    
    def _format_ai_response(self, response_text: str) -> str:
        """Format AI response for better readability"""
        if not response_text:
            return response_text
            
        # Clean up the response
        formatted = response_text.strip()
        
        # Replace markdown bullet points with clean bullets
        formatted = formatted.replace('* ', '• ')
        formatted = formatted.replace('- ', '• ')
        
        # Fix common formatting issues
        formatted = formatted.replace('**', '')  # Remove bold markdown
        formatted = formatted.replace('##', '')  # Remove header markdown
        
        # Ensure proper spacing around bullet points
        lines = formatted.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if line:
                # Add spacing before bullet points
                if line.startswith('•') and cleaned_lines and not cleaned_lines[-1].startswith('•'):
                    cleaned_lines.append('')
                cleaned_lines.append(line)
        
        formatted = '\n'.join(cleaned_lines)
        
        # Limit to reasonable length (about 400 words for better UX)
        words = formatted.split()
        if len(words) > 400:
            # Find a good breaking point
            truncated = ' '.join(words[:400])
            last_sentence = truncated.rfind('.')
            if last_sentence > len(truncated) * 0.8:  # If we can find a sentence end near the end
                formatted = truncated[:last_sentence + 1]
            else:
                formatted = truncated + '...'
        
        return formatted

    def _get_fallback_response(self, prompt: str, financial_context: Dict[str, Any] = None) -> str:
        """Enhanced fallback response with financial context"""
        prompt_lower = prompt.lower()
        
        # If user has Fi MCP data, provide personalized fallback
        if financial_context and financial_context.get("has_data"):
            net_worth = financial_context.get('net_worth', 0)
            account_count = financial_context.get('account_count', 0)
            
            if "portfolio" in prompt_lower or "investment" in prompt_lower:
                return f"Based on your connected Fi Money account, you have {account_count} investment accounts with a total net worth of ₹{net_worth:,.2f}. For detailed portfolio analysis, I can help you understand your asset allocation and performance."
            
            elif "net worth" in prompt_lower:
                return f"Your current net worth is ₹{net_worth:,.2f} based on your connected Fi Money account data. This includes all your assets minus liabilities across {account_count} connected accounts."
            
            elif "expense" in prompt_lower or "spending" in prompt_lower:
                return f"I can see your financial data from Fi Money. Based on your transaction history, I can help analyze your spending patterns and suggest optimizations."
        
        # General fallback responses for users without Fi MCP data
        if "mutual fund" in prompt_lower:
            return "Mutual funds are investment vehicles that pool money from many investors to purchase securities. They offer diversification and professional management. Connect your Fi Money account to get personalized advice based on your actual mutual fund holdings."
        
        elif "sip" in prompt_lower:
            return "SIP (Systematic Investment Plan) allows you to invest a fixed amount regularly in mutual funds. It helps with rupee cost averaging and disciplined investing. Connect your Fi account to track your existing SIPs and get personalized recommendations."
        
        elif "portfolio" in prompt_lower:
            return "A well-diversified portfolio typically includes equity, debt, and other asset classes based on your risk profile and goals. Connect your Fi Money account to get a detailed analysis of your current portfolio allocation."
        
        elif "investment" in prompt_lower:
            return "Investment strategies should align with your financial goals, risk tolerance, and time horizon. Popular options in India include mutual funds, stocks, PPF, and ELSS. Connect your Fi account for personalized investment recommendations."
        
        elif any(word in prompt_lower for word in ["my", "i have", "should i"]):
            return "For personalized financial advice based on your specific situation, please connect your Fi Money account. This will allow me to provide tailored recommendations based on your actual financial data."
        
        else:
            return "I'm here to help with your financial questions! For general advice, I can provide educational information. For personalized recommendations based on your actual financial situation, please connect your Fi Money account through the 'Connect Your Account' option."
    
    async def process_general_query(self, message: str, user_id: str = None) -> Dict[str, Any]:
        """Process general financial queries with Fi MCP context awareness"""
        
        # Get financial context to determine response type
        financial_context = await self.get_financial_context(user_id)
        
        if self.is_personal_financial_query(message):
            # Personal financial query - check if Fi MCP data is available
            if financial_context.get("has_data"):
                # User has Fi MCP data - provide personalized response
                context = f"Personal financial query with Fi MCP data available"
                response_text = await self.generate_ai_response(message, context)
                requires_auth = False
                insights = [
                    f"Based on your Fi Money account data (Net Worth: ₹{financial_context.get('net_worth', 0):,.2f})",
                    f"Last updated: {financial_context.get('last_sync', 'Unknown')}",
                    "This is personalized advice based on your actual financial data"
                ]
            else:
                # No Fi MCP data - suggest connection
                response_text = "To provide personalized insights about your financial data, please connect your Fi Money account first."
                requires_auth = True
                insights = [
                    "Connect your Fi Money account for personalized advice",
                    "Get real-time portfolio analysis and spending insights",
                    "Receive AI-powered recommendations based on your actual data"
                ]
        else:
            # General financial education query - use AI
            context = "General financial education query - no personal data needed"
            response_text = await self.generate_ai_response(message, context)
            requires_auth = False
            
            if financial_context.get("has_data"):
                insights = [
                    "This is AI-generated financial guidance",
                    f"Your Fi account is connected ({financial_context.get('account_count', 0)} accounts)",
                    "Ask personal questions to get insights based on your data"
                ]
            else:
                insights = [
                    "This is AI-generated financial guidance",
                    "Connect your Fi Money account for personalized recommendations",
                    "Get tailored advice based on your actual financial situation"
                ]
        
        return {
            "response": response_text,
            "requires_fi_auth": requires_auth,
            "conversation_id": str(uuid.uuid4()),
            "insights": insights,
            "timestamp": datetime.utcnow().isoformat(),
            "ai_powered": VERTEX_AI_AVAILABLE and self.model is not None,
            "financial_context": {
                "has_data": financial_context.get("has_data", False),
                "data_source": financial_context.get("data_source", "none"),
                "account_count": financial_context.get("account_count", 0)
            }
        }
    
    async def process_financial_query(self, message: str, user_id: str = None) -> Dict[str, Any]:
        """Process financial queries that require Fi MCP authentication"""
        if not user_id or user_id not in self.mock_fi_sessions:
            return {
                "response": "To provide personalized financial insights, please authenticate with Fi MCP first.",
                "requires_fi_auth": True,
                "conversation_id": str(uuid.uuid4()),
                "insights": [],
                "timestamp": datetime.utcnow().isoformat(),
                "ai_powered": False
            }
        
        # Mock response with Fi MCP data + AI enhancement
        fi_data = self.mock_fi_sessions.get(user_id, {})
        
        # Create AI prompt with real financial data
        context = f"""
User's Financial Data:
- Net Worth: ₹{fi_data.get('net_worth', '0')}
- Portfolio Value: ₹{fi_data.get('portfolio_value', '0')}
- Monthly Expenses: ₹{fi_data.get('monthly_expenses', '0')}
- Connected Accounts: {fi_data.get('accounts', 0)}
"""
        
        ai_response = await self.generate_ai_response(message, context)
        
        return {
            "response": ai_response,
            "requires_fi_auth": False,
            "conversation_id": str(uuid.uuid4()),
            "insights": [
                f"Portfolio value: ₹{fi_data.get('portfolio_value', '0')}",
                f"Monthly expenses: ₹{fi_data.get('monthly_expenses', '0')}",
                "AI-powered analysis of your financial data"
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "ai_powered": VERTEX_AI_AVAILABLE and self.model is not None
        }
    
    async def authenticate_fi_mcp(self, phone_number: str, otp: str) -> Dict[str, Any]:
        """Mock Fi MCP authentication"""
        if otp == "123456":
            user_id = f"user_{phone_number}"
            
            # Mock financial data based on phone number
            mock_data = {
                "2222222222": {
                    "net_worth": "15,50,000",
                    "portfolio_value": "12,00,000", 
                    "monthly_expenses": "45,000",
                    "accounts": 8,
                    "description": "All Assets Connected - Large MF portfolio"
                },
                "3333333333": {
                    "net_worth": "5,25,000",
                    "portfolio_value": "3,50,000",
                    "monthly_expenses": "25,000", 
                    "accounts": 5,
                    "description": "All Assets Connected - Small MF portfolio"
                }
            }
            
            fi_data = mock_data.get(phone_number, {
                "net_worth": "2,50,000",
                "portfolio_value": "1,50,000",
                "monthly_expenses": "20,000",
                "accounts": 3,
                "description": "Basic portfolio"
            })
            
            self.mock_fi_sessions[user_id] = fi_data
            
            return {
                "success": True,
                "user_id": user_id,
                "message": "Fi MCP authentication successful",
                "data": fi_data
            }
        else:
            return {
                "success": False,
                "message": "Invalid OTP. Use 123456 for testing."
            }

# Global instance - recreated to pick up model changes
ai_chat_service = AIFinancialChatService()
