"""
Vertex AI Service Integration with Existing Service Account
Handles Google Cloud Vertex AI model interactions for financial AI agent
Uses the existing vertexai_connect_creds.json file set up by colleague
Includes fallback mock responses for development when models are not available
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import json
import os
from pathlib import Path

from google.cloud import aiplatform
from google.oauth2 import service_account
import vertexai
from vertexai.generative_models import GenerativeModel, Part
from vertexai.language_models import TextGenerationModel, ChatModel

logger = logging.getLogger(__name__)

class VertexAIConfig:
    """Configuration for Vertex AI models with existing service account"""
    
    # Project configuration
    PROJECT_ID = os.getenv("VERTEX_AI_PROJECT_ID", "opportune-scope-466406-p6")
    LOCATION = os.getenv("VERTEX_AI_LOCATION", "us-central1")
    
    # Service Account Configuration - using existing credentials
    CREDENTIALS_PATH = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), 
        "credentials", 
        "vertexai_connect_creds.json"
    )
    
    # Model configurations - using latest available models
    USE_MOCK_RESPONSES = os.getenv("USE_MOCK_AI_RESPONSES", "false").lower() == "true"
    GEMINI_PRO_MODEL = os.getenv("GEMINI_PRO_MODEL", "gemini-1.5-pro-002")  # Latest Pro model
    GEMINI_FLASH_MODEL = os.getenv("GEMINI_FLASH_MODEL", "gemini-1.5-flash-002")  # Latest Flash model
    GEMINI_FLASH_8B_MODEL = os.getenv("GEMINI_FLASH_8B_MODEL", "gemini-1.5-flash-8b")  # New 8B model
    TEXT_BISON_MODEL = os.getenv("TEXT_BISON_MODEL", "text-bison@002")  # Latest Text Bison
    
    # Generation parameters
    TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.7"))
    MAX_OUTPUT_TOKENS = int(os.getenv("AI_MAX_OUTPUT_TOKENS", "1024"))
    TOP_P = float(os.getenv("AI_TOP_P", "0.8"))
    TOP_K = int(os.getenv("AI_TOP_K", "40"))

class MockAIResponses:
    """Mock AI responses for development when Vertex AI models are not available"""
    
    @staticmethod
    def mock_categorization(data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock categorization response"""
        transactions = data.get('transactions', [])
        categories = {}
        categories_found = set()
        
        for tx in transactions:
            tx_id = tx.get('id', str(hash(tx.get('description', ''))))
            amount = tx.get('amount', 0)
            description = tx.get('description', '').lower()
            
            # Simple rule-based categorization
            if amount > 0:
                categories[tx_id] = 'income'
                categories_found.add('income')
            elif 'grocery' in description or 'food' in description:
                categories[tx_id] = 'expenses'
                categories_found.add('expenses')
            elif 'sip' in description or 'mutual fund' in description:
                categories[tx_id] = 'investments'
                categories_found.add('investments')
            elif 'rent' in description or 'emi' in description:
                categories[tx_id] = 'expenses'
                categories_found.add('expenses')
            else:
                categories[tx_id] = 'expenses'
                categories_found.add('expenses')
        
        return {
            "categories": categories,
            "summary": {
                "total_items": len(transactions),
                "categories_found": list(categories_found)
            }
        }
    
    @staticmethod
    def mock_query_intent(query: str) -> Dict[str, Any]:
        """Generate mock query intent analysis"""
        query_lower = query.lower()
        
        # Simple keyword-based intent detection
        if any(word in query_lower for word in ['portfolio', 'investment', 'mutual fund', 'stock']):
            intent = 'investment_analysis'
            data_types = ['mutual_funds', 'stocks', 'net_worth']
            complexity = 'moderate'
        elif any(word in query_lower for word in ['spend', 'expense', 'budget']):
            intent = 'expense_tracking'
            data_types = ['bank_transactions']
            complexity = 'simple'
        elif any(word in query_lower for word in ['loan', 'afford', 'debt']):
            intent = 'debt_management'
            data_types = ['credit_report', 'bank_transactions']
            complexity = 'moderate'
        elif any(word in query_lower for word in ['retirement', 'retire']):
            intent = 'retirement_planning'
            data_types = ['epf_details', 'mutual_funds', 'net_worth']
            complexity = 'complex'
        else:
            intent = 'general_advice'
            data_types = []
            complexity = 'simple'
        
        return {
            "intent": intent,
            "data_types_needed": data_types,
            "complexity": complexity,
            "response_type": "advisory",
            "confidence": 0.85,
            "key_topics": [intent.replace('_', ' ')],
            "suggested_followups": [
                "Would you like more specific recommendations?",
                "Do you want to explore this topic further?"
            ]
        }
    
    @staticmethod
    def mock_financial_response(query: str, context_data: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock financial response"""
        
        # Extract some context for personalization
        net_worth = context_data.get('net_worth', {}).get('net_worth', 0)
        age = user_profile.get('age', 30)
        
        return {
            "main_response": f"Based on your financial profile and the question '{query}', I can provide you with personalized advice. Your current financial position shows a net worth of ₹{net_worth:,.0f}, which is a good foundation for someone at age {age}. I recommend focusing on diversified investments, maintaining an emergency fund, and regular financial planning reviews.",
            "key_insights": [
                f"Your net worth of ₹{net_worth:,.0f} indicates good financial discipline",
                "Diversification across asset classes will help reduce risk",
                "Regular monitoring and rebalancing is essential for long-term growth"
            ],
            "action_items": [
                "Review your current asset allocation",
                "Set up automatic SIP investments if not already done",
                "Create or update your financial goals",
                "Consider increasing your emergency fund to 6 months of expenses"
            ],
            "data_highlights": {
                "positive_points": [
                    "Active financial planning and tracking",
                    "Good foundation for wealth building"
                ],
                "areas_for_improvement": [
                    "Consider diversifying investment portfolio",
                    "Regular review of financial goals"
                ],
                "key_numbers": {
                    "net_worth": f"₹{net_worth:,.0f}",
                    "recommended_emergency_fund": "₹3,00,000 - ₹6,00,000"
                }
            },
            "follow_up_questions": [
                "Would you like specific investment recommendations?",
                "Do you want help with tax optimization strategies?",
                "Should we discuss retirement planning in detail?"
            ],
            "confidence_level": 0.8,
            "disclaimer": "This advice is based on general financial principles and the limited data provided. Please consult with a qualified financial advisor for personalized advice."
        }

class VertexAIAuthentication:
    """Handle Vertex AI authentication with existing service account"""
    
    @staticmethod
    def get_credentials():
        """Get credentials for Vertex AI service account"""
        try:
            config = VertexAIConfig()
            
            # Method 1: Use existing credentials file
            if os.path.exists(config.CREDENTIALS_PATH):
                logger.info(f"Using existing Vertex AI credentials: {config.CREDENTIALS_PATH}")
                credentials = service_account.Credentials.from_service_account_file(
                    config.CREDENTIALS_PATH,
                    scopes=['https://www.googleapis.com/auth/cloud-platform']
                )
                return credentials
            
            # Method 2: Use environment variable path
            env_creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            if env_creds_path and os.path.exists(env_creds_path):
                logger.info(f"Using credentials from GOOGLE_APPLICATION_CREDENTIALS: {env_creds_path}")
                credentials = service_account.Credentials.from_service_account_file(
                    env_creds_path,
                    scopes=['https://www.googleapis.com/auth/cloud-platform']
                )
                return credentials
            
            # Method 3: Use service account key from environment variable
            service_account_key = os.getenv("VERTEX_AI_SERVICE_ACCOUNT_KEY")
            if service_account_key:
                logger.info("Using service account key from environment variable")
                service_account_info = json.loads(service_account_key)
                credentials = service_account.Credentials.from_service_account_info(
                    service_account_info,
                    scopes=['https://www.googleapis.com/auth/cloud-platform']
                )
                return credentials
            
            # Method 4: Use default credentials (for Cloud Run/GCE)
            logger.info("Using default credentials")
            from google.auth import default
            credentials, _ = default(scopes=['https://www.googleapis.com/auth/cloud-platform'])
            return credentials
            
        except Exception as e:
            logger.error(f"Failed to get Vertex AI credentials: {str(e)}")
            raise

class FinancialAIModels:
    """
    Manages different AI models for financial tasks with existing service account
    Includes fallback to mock responses when models are not available
    """
    
    def __init__(self):
        self.config = VertexAIConfig()
        self.auth = VertexAIAuthentication()
        self.initialized = False
        self.models = {}
        self.credentials = None
        self.use_mock = False
        self.mock_responses = MockAIResponses()
        
    async def initialize(self):
        """Initialize Vertex AI and models with existing service account"""
        try:
            logger.info("Initializing Vertex AI with existing service account...")
            logger.info(f"Credentials path: {self.config.CREDENTIALS_PATH}")
            
            # Get credentials
            self.credentials = self.auth.get_credentials()
            logger.info(f"✅ Credentials obtained for project: {self.config.PROJECT_ID}")
            
            # Log service account email for verification
            if hasattr(self.credentials, 'service_account_email'):
                logger.info(f"Service account: {self.credentials.service_account_email}")
            
            # Try to initialize Vertex AI with credentials
            try:
                vertexai.init(
                    project=self.config.PROJECT_ID,
                    location=self.config.LOCATION,
                    credentials=self.credentials
                )
                
                # Initialize AI Platform client
                aiplatform.init(
                    project=self.config.PROJECT_ID,
                    location=self.config.LOCATION,
                    credentials=self.credentials
                )
                
                # Try to initialize models with latest versions
                self.models = {}
                
                # Try latest Gemini models first, fallback to older versions
                gemini_models_to_try = [
                    self.config.GEMINI_PRO_MODEL,  # gemini-1.5-pro-002
                    "gemini-1.5-pro-001",
                    "gemini-1.5-pro",
                    "gemini-pro"
                ]
                
                gemini_flash_models_to_try = [
                    self.config.GEMINI_FLASH_MODEL,  # gemini-1.5-flash-002
                    "gemini-1.5-flash-001", 
                    "gemini-1.5-flash",
                    self.config.GEMINI_FLASH_8B_MODEL,  # gemini-1.5-flash-8b
                ]
                
                # Initialize Gemini Pro
                for model_name in gemini_models_to_try:
                    try:
                        self.models['gemini_pro'] = GenerativeModel(model_name)
                        logger.info(f"✅ Initialized Gemini Pro: {model_name}")
                        break
                    except Exception as e:
                        logger.debug(f"Failed to initialize {model_name}: {e}")
                        continue
                
                # Initialize Gemini Flash
                for model_name in gemini_flash_models_to_try:
                    try:
                        self.models['gemini_flash'] = GenerativeModel(model_name)
                        logger.info(f"✅ Initialized Gemini Flash: {model_name}")
                        break
                    except Exception as e:
                        logger.debug(f"Failed to initialize {model_name}: {e}")
                        continue
                
                # Try Text Bison models
                text_models_to_try = [
                    self.config.TEXT_BISON_MODEL,  # text-bison@002
                    "text-bison@001",
                    "text-bison"
                ]
                
                for model_name in text_models_to_try:
                    try:
                        self.models['text_bison'] = TextGenerationModel.from_pretrained(model_name)
                        logger.info(f"✅ Initialized Text Bison: {model_name}")
                        break
                    except Exception as e:
                        logger.debug(f"Failed to initialize {model_name}: {e}")
                        continue
                
                # Test model access
                await self._test_model_access()
                
                logger.info("✅ Vertex AI models initialized successfully")
                
            except Exception as model_error:
                logger.warning(f"⚠️ Vertex AI models not available: {str(model_error)}")
                logger.info("🔄 Falling back to mock AI responses for development")
                self.use_mock = True
            
            self.initialized = True
            
        except Exception as e:
            logger.error(f"❌ Error initializing Vertex AI: {str(e)}")
            logger.info("🔄 Using mock AI responses for development")
            self.use_mock = True
            self.initialized = True
    
    async def _test_model_access(self):
        """Test access to Vertex AI models"""
        try:
            logger.info("🧪 Testing model access...")
            
            # Test Gemini Flash model with a simple prompt
            test_prompt = "Hello, this is a test. Please respond with 'Model access successful.'"
            
            response = await self._generate_with_gemini_flash(test_prompt)
            
            if "successful" in response.lower() or len(response) > 0:
                logger.info("✅ Model access test successful")
            else:
                logger.warning("⚠️ Model access test returned unexpected response")
                
        except Exception as e:
            logger.error(f"❌ Model access test failed: {str(e)}")
            raise  # This will trigger fallback to mock responses
    
    async def categorize_financial_data(self, data: Dict[str, Any]) -> Dict[str, str]:
        """
        Categorize financial data using AI or mock responses
        
        Args:
            data: Raw financial data to categorize
            
        Returns:
            Dictionary with categorized data
        """
        if not self.initialized:
            await self.initialize()
        
        if self.use_mock or self.config.USE_MOCK_RESPONSES:
            logger.info("Using mock categorization response")
            return self.mock_responses.mock_categorization(data)
        
        try:
            prompt = f"""
            Analyze the following financial data and categorize each transaction or item.
            
            Categories to use:
            - income: Salary, freelance, investments returns, etc.
            - expenses: Food, transport, utilities, entertainment, etc.
            - investments: Mutual funds, stocks, bonds, SIP, etc.
            - debts: Credit card, loans, EMI, etc.
            - assets: Bank balance, FD, property, etc.
            - insurance: Life, health, vehicle insurance, etc.
            - tax: Tax payments, refunds, etc.
            - retirement: EPF, PPF, NPS, etc.
            - emergency_fund: Emergency savings, liquid funds, etc.
            - goals: Specific financial goals, targets, etc.
            
            Financial Data:
            {json.dumps(data, indent=2)}
            
            Return only a JSON object with the categorization:
            {{
                "categories": {{
                    "item_id": "category_name",
                    ...
                }},
                "summary": {{
                    "total_items": number,
                    "categories_found": ["category1", "category2", ...]
                }}
            }}
            """
            
            response = await self._generate_with_gemini_flash(prompt)
            
            # Parse JSON response
            try:
                result = json.loads(response)
                return result
            except json.JSONDecodeError:
                logger.error("Failed to parse categorization response as JSON")
                return {"categories": {}, "summary": {"total_items": 0, "categories_found": []}}
                
        except Exception as e:
            logger.error(f"Error in financial data categorization: {str(e)}")
            logger.info("Falling back to mock categorization")
            return self.mock_responses.mock_categorization(data)
    
    async def analyze_query_intent(self, user_query: str) -> Dict[str, Any]:
        """
        Analyze user query intent using AI or mock responses
        
        Args:
            user_query: User's financial question
            
        Returns:
            Dictionary with query analysis
        """
        if not self.initialized:
            await self.initialize()
        
        if self.use_mock or self.config.USE_MOCK_RESPONSES:
            logger.info("Using mock query intent analysis")
            return self.mock_responses.mock_query_intent(user_query)
        
        try:
            prompt = f"""
            Analyze the following user query about personal finance and determine:
            1. Intent category
            2. Required data types
            3. Complexity level
            4. Response type needed
            
            Intent Categories:
            - investment_analysis: Questions about portfolio, returns, performance
            - expense_tracking: Questions about spending, budgets, categories
            - financial_planning: Questions about goals, savings, future planning
            - debt_management: Questions about loans, credit, debt optimization
            - income_analysis: Questions about salary, income sources, growth
            - net_worth: Questions about total wealth, assets, liabilities
            - tax_planning: Questions about tax optimization, deductions
            - retirement_planning: Questions about retirement corpus, planning
            - insurance_review: Questions about insurance coverage, needs
            - general_advice: General financial guidance questions
            
            Data Types Needed:
            - bank_transactions, mutual_funds, stocks, credit_report, epf_details, net_worth
            
            Complexity Levels:
            - simple: Basic data lookup or calculation
            - moderate: Analysis with trends or comparisons
            - complex: Advanced modeling, predictions, or scenarios
            
            Response Types:
            - factual: Direct data-based answer
            - analytical: Analysis with insights
            - advisory: Recommendations and suggestions
            - interactive: Follow-up questions needed
            
            User Query: "{user_query}"
            
            Return JSON:
            {{
                "intent": "category_name",
                "data_types_needed": ["type1", "type2"],
                "complexity": "simple|moderate|complex",
                "response_type": "factual|analytical|advisory|interactive",
                "confidence": 0.0-1.0,
                "key_topics": ["topic1", "topic2"],
                "suggested_followups": ["question1", "question2"]
            }}
            """
            
            response = await self._generate_with_gemini_flash(prompt)
            
            try:
                result = json.loads(response)
                return result
            except json.JSONDecodeError:
                logger.error("Failed to parse query intent response as JSON")
                return self.mock_responses.mock_query_intent(user_query)
                
        except Exception as e:
            logger.error(f"Error in query intent analysis: {str(e)}")
            logger.info("Falling back to mock query intent analysis")
            return self.mock_responses.mock_query_intent(user_query)
    
    async def generate_financial_response(
        self, 
        user_query: str, 
        context_data: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate financial response using AI or mock responses
        
        Args:
            user_query: User's question
            context_data: Relevant financial data
            user_profile: User's financial profile
            
        Returns:
            Generated response with insights
        """
        if not self.initialized:
            await self.initialize()
        
        if self.use_mock or self.config.USE_MOCK_RESPONSES:
            logger.info("Using mock financial response")
            return self.mock_responses.mock_financial_response(user_query, context_data, user_profile)
        
        try:
            prompt = f"""
            You are an expert personal finance advisor AI powered by Google's Vertex AI. 
            Analyze the user's financial data and provide a comprehensive, personalized response to their query.
            
            User Query: "{user_query}"
            
            User's Financial Context:
            {json.dumps(context_data, indent=2)}
            
            User Profile:
            {json.dumps(user_profile, indent=2)}
            
            Guidelines:
            1. Provide specific, actionable advice based on their actual data
            2. Use Indian financial context (₹, SIP, EPF, etc.)
            3. Be encouraging but realistic
            4. Suggest concrete next steps
            5. Highlight both opportunities and risks
            6. Use simple language, avoid jargon
            7. Reference specific numbers from their data when possible
            
            Structure your response as JSON:
            {{
                "main_response": "Detailed answer to the user's question",
                "key_insights": [
                    "Insight 1 based on their data",
                    "Insight 2 with specific numbers",
                    "Insight 3 with recommendations"
                ],
                "action_items": [
                    "Specific action they should take",
                    "Another actionable step",
                    "Follow-up recommendation"
                ],
                "data_highlights": {{
                    "positive_points": ["Good aspect 1", "Good aspect 2"],
                    "areas_for_improvement": ["Area 1", "Area 2"],
                    "key_numbers": {{"metric": "value with context"}}
                }},
                "follow_up_questions": [
                    "Relevant follow-up question 1",
                    "Relevant follow-up question 2"
                ],
                "confidence_level": 0.0-1.0,
                "disclaimer": "Important disclaimers or caveats"
            }}
            """
            
            response = await self._generate_with_gemini_pro(prompt)
            
            try:
                result = json.loads(response)
                return result
            except json.JSONDecodeError:
                logger.error("Failed to parse financial response as JSON")
                return self.mock_responses.mock_financial_response(user_query, context_data, user_profile)
                
        except Exception as e:
            logger.error(f"Error generating financial response: {str(e)}")
            logger.info("Falling back to mock financial response")
            return self.mock_responses.mock_financial_response(user_query, context_data, user_profile)
    
    async def _generate_with_gemini_flash(self, prompt: str) -> str:
        """Generate response using Gemini Flash model"""
        try:
            model = self.models['gemini_flash']
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 512,
                    "top_p": 0.8,
                    "top_k": 40
                }
            )
            return response.text
        except Exception as e:
            logger.error(f"Error with Gemini Flash generation: {str(e)}")
            raise
    
    async def _generate_with_gemini_pro(self, prompt: str) -> str:
        """Generate response using Gemini Pro model"""
        try:
            model = self.models['gemini_pro']
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": self.config.TEMPERATURE,
                    "max_output_tokens": self.config.MAX_OUTPUT_TOKENS,
                    "top_p": self.config.TOP_P,
                    "top_k": self.config.TOP_K
                }
            )
            return response.text
        except Exception as e:
            logger.error(f"Error with Gemini Pro generation: {str(e)}")
            raise
    
    async def generate_proactive_insights(self, financial_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate proactive financial insights using AI or mock responses
        
        Args:
            financial_data: User's complete financial data
            
        Returns:
            List of insights with recommendations
        """
        if not self.initialized:
            await self.initialize()
        
        if self.use_mock or self.config.USE_MOCK_RESPONSES:
            logger.info("Using mock proactive insights")
            return [
                {
                    "type": "spending_anomaly",
                    "title": "Dining Expenses Increased",
                    "description": "Your dining expenses have increased by 25% this month compared to your average.",
                    "priority": "medium",
                    "category": "expenses",
                    "action_required": True,
                    "recommended_actions": ["Review recent dining transactions", "Set a monthly dining budget"],
                    "potential_impact": "Could save ₹3,000-5,000 monthly",
                    "data_source": "Bank transactions analysis"
                },
                {
                    "type": "investment_opportunity",
                    "title": "SIP Performance Review",
                    "description": "Your equity SIPs are performing well. Consider increasing allocation.",
                    "priority": "low",
                    "category": "investments",
                    "action_required": False,
                    "recommended_actions": ["Consider increasing SIP amount", "Diversify into mid-cap funds"],
                    "potential_impact": "Potential 2-3% additional returns",
                    "data_source": "Investment portfolio analysis"
                }
            ]
        
        # If real AI is available, use it (implementation would be similar to other methods)
        return []
    
    def get_service_account_info(self) -> Dict[str, str]:
        """Get service account information for debugging"""
        return {
            "project_id": self.config.PROJECT_ID,
            "location": self.config.LOCATION,
            "credentials_path": self.config.CREDENTIALS_PATH,
            "credentials_exists": os.path.exists(self.config.CREDENTIALS_PATH),
            "initialized": self.initialized,
            "credentials_type": type(self.credentials).__name__ if self.credentials else "None",
            "service_account_email": getattr(self.credentials, 'service_account_email', 'Unknown') if self.credentials else "None",
            "available_models": list(self.models.keys()) if self.models else [],
            "using_mock_responses": self.use_mock or self.config.USE_MOCK_RESPONSES
        }

# Singleton instance
financial_ai_models = FinancialAIModels()

async def get_financial_ai_models() -> FinancialAIModels:
    """Get Financial AI Models instance"""
    if not financial_ai_models.initialized:
        await financial_ai_models.initialize()
    return financial_ai_models
