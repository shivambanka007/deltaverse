from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse
from firebase_config import get_firestore_client
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from models.notifications import PushMessage
import uvicorn
import os
import json
import asyncio
import logging
import uuid
from datetime import datetime
import sys

# Environment-aware Pub/Sub import
try:
    from google.cloud import pubsub_v1
    PUBSUB_AVAILABLE = True
    print("✅ Google Cloud Pub/Sub available")
except ImportError as e:
    print(f"⚠️ Google Cloud Pub/Sub not available: {e}")
    print("   Notification features will be disabled")
    pubsub_v1 = None
    PUBSUB_AVAILABLE = False

# Add the current directory to the Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Environment validation for production
if os.getenv("ENVIRONMENT") == "production":
    required_vars = ["GCP_PROJECT_ID", "FI_MCP_URL"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise ValueError(f"Missing required environment variables for production: {missing_vars}")
    print("✅ Production environment variables validated")
    print(f"🔧 Fi-MCP URL: {os.getenv('FI_MCP_URL')}")
    print(f"🔧 Environment: {os.getenv('ENVIRONMENT')}")
else:
    print("🔧 Development mode - using localhost defaults")

# Fi Money OAuth Integration
from fi_oauth_service import fi_oauth_service
from fi_oauth_config import validate_fi_oauth_config

from fi_mcp_dev_service_real import real_fi_mcp_dev_service as fi_mcp_dev_service

# Firebase Authentication Middleware
from auth_middleware import (
    verify_firebase_user,
    get_current_user,
    optional_firebase_user,
    dev_bypass_auth,
    create_test_user_dependency
)

# Add after existing imports
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import Financial Health Router with robust import strategy
try:
    # Production environment (Docker container)
    from app.routers.financial_health import router as financial_health_router
    from app.routers.voice_simple import router as voice_router
except ImportError:
    try:
        # Local development environment
        from routers.financial_health import router as financial_health_router
        from routers.voice_simple import router as voice_router
    except ImportError:
        # Fallback import strategy
        import importlib.util
        spec = importlib.util.spec_from_file_location("financial_health",
                                                      os.path.join(os.path.dirname(__file__), "routers", "financial_health.py"))
        router_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(router_module)
        financial_health_router = router_module.router
        
        # Voice router fallback (simplified version)
        voice_spec = importlib.util.spec_from_file_location("voice_simple", 
                                                           os.path.join(os.path.dirname(__file__), "routers", "voice_simple.py"))
        voice_module = importlib.util.module_from_spec(voice_spec)
        voice_spec.loader.exec_module(voice_module)
        voice_router = voice_module.router

# --- Environment-Aware Pub/Sub Publisher Client ---
publisher = None
topic_path = None

if PUBSUB_AVAILABLE:
    try:
        # Import unified GCP authentication
        from gcp_config import get_gcp_credentials, get_gcp_project_id, is_gcp_authenticated
        
        gcp_project_id = get_gcp_project_id()
        pubsub_topic_id = os.getenv("PUB_SUB_TOPIC_ID", "user-notification")
        
        # Get credentials using the same method as Firestore
        credentials = get_gcp_credentials()
        
        if credentials:
            # Initialize with explicit credentials (same as Firestore)
            publisher = pubsub_v1.PublisherClient(credentials=credentials)
            topic_path = publisher.topic_path(gcp_project_id, pubsub_topic_id)
            print(f"✅ Pub/Sub client initialized with service account credentials")
            print(f"   Project: {gcp_project_id}, Topic: {pubsub_topic_id}")
        else:
            # Fallback to default credentials
            print("⚠️ Using default credentials for Pub/Sub (may cause authentication issues)")
            publisher = pubsub_v1.PublisherClient()
            topic_path = publisher.topic_path(gcp_project_id, pubsub_topic_id)
            print(f"✅ Pub/Sub client initialized with default credentials")
            
    except Exception as e:
        # This will help in debugging if the environment variables are not set
        publisher = None
        topic_path = None
        print(f"❌ Error initializing Pub/Sub client: {e}")
        print("   Please ensure service account credentials are properly configured.")
        print("   The same credentials used for Firestore should work for Pub/Sub.")
else:
    print("ℹ️ Pub/Sub functionality disabled - google-cloud-pubsub not available")
    print("   Install with: pip install google-cloud-pubsub>=2.18.0")


# Import Spend Analysis Router with same robust strategy
try:
    # Production environment (Docker container)
    from app.routers.spend_analysis_router import router as spend_analysis_router
except ImportError:
    try:
        # Local development environment
        from routers.spend_analysis_router import router as spend_analysis_router
    except ImportError:
        logger.warning("Spend analysis router not available")
        spend_analysis_router = None

# Import Notifications Router with same robust strategy
try:
    # Production environment (Docker container)
    from app.routers.notifications import router as notifications_router
    logger.info("✅ Notifications router imported from app.routers.notifications")
except ImportError as e1:
    try:
        # Local development environment
        from routers.notifications import router as notifications_router
        logger.info("✅ Notifications router imported from routers.notifications")
    except ImportError as e2:
        try:
            # Fallback: direct import using importlib
            import importlib.util
            notifications_router_path = os.path.join(os.path.dirname(__file__), "routers", "notifications.py")
            if os.path.exists(notifications_router_path):
                spec = importlib.util.spec_from_file_location("notifications_router", notifications_router_path)
                notifications_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(notifications_module)
                notifications_router = notifications_module.router
                logger.info("✅ Notifications router imported via direct file import")
            else:
                raise ImportError(f"Notifications router file not found at {notifications_router_path}")
        except Exception as e3:
            logger.warning(f"⚠️ Notifications router not available. Errors: {e1}, {e2}, {e3}")
            notifications_router = None

# Development mode configuration
DEVELOPMENT_MODE = os.getenv("DEVELOPMENT_MODE", "true").lower() == "true"
logger.info(f"Development mode: {DEVELOPMENT_MODE}")

# Choose authentication dependency based on mode
if DEVELOPMENT_MODE:
    logger.warning("🚨 DEVELOPMENT MODE: Using bypass authentication")
    auth_dependency = dev_bypass_auth
else:
    logger.info("🔐 PRODUCTION MODE: Using Firebase authentication")
    auth_dependency = verify_firebase_user

app = FastAPI(
    title="DeltaVerse API",
    description="""
    # 🚀 DeltaVerse Financial Advisory Platform API

    ## Core Features
    - 💰 Fi Money MCP Integration: Secure financial data access
    - 🤖 AI-Powered Advisory: Personalized financial insights using Vertex AI
    - 📊 Portfolio Analysis: Real-time tracking and analysis
    - 💡 Smart Insights: Data-driven financial recommendations
    - 🔐 Enterprise Security: Firebase Authentication & secure data handling
    - 💰 AI Spend Analysis: Intelligent transaction categorization and spending insights

    ## Authentication
    All endpoints require Firebase authentication in production:
    ```python
    headers = {
        'Authorization': 'Bearer your-firebase-token'
    }
    ```

    ## Quick Start Guide
    1. **Initialize Fi Money Connection**
       ```http
       POST /api/v1/fi/login/initiate
       {
           "scenario_phone": "2222222222"  # For testing
       }
       ```

    2. **Complete Authentication**
       ```http
       POST /api/v1/fi/login/complete
       {
           "session_id": "session_from_step_1",
           "phone_number": "your_phone_number"
       }
       ```

    3. **Get Financial Insights**
       ```http
       GET /api/v1/chat/insights
       ```

    4. **Chat with AI Advisor**
       ```http
       POST /api/v1/chat/message
       {
           "message": "How is my portfolio performing?"
       }
       ```

    5. **Public Chat (No Authentication)**
       ```http
       POST /api/v1/public/chat/message
       {
           "message": "What is a mutual fund?",
           "conversation_id": "optional-conversation-id"
       }
       ```

    ## Environment Modes
    - **Development**: 
      - Authentication bypassed
      - Mock data available
      - Enhanced logging
      - Swagger UI accessible
    
    - **Production**:
      - Full security enforced
      - Real Fi-MCP integration
      - Rate limiting enabled
      - Performance optimized

    ## Data Sources
    1. **Fi Money MCP Server**
       - Real-time financial data
       - Account aggregation
       - Transaction history
    
    2. **Firebase Firestore**
       - User profiles
       - Financial summaries
       - Chat history
    
    3. **Vertex AI / Gemini**
       - AI-powered insights
       - Natural language processing
       - Financial analysis

    ## Rate Limits
    - Authentication endpoints: 5 requests/minute
    - Chat endpoints: 60 requests/minute
    - Data sync: 30 requests/hour

    ## Best Practices
    1. Always check response status
    2. Implement proper error handling
    3. Use appropriate timeout values
    4. Cache responses when possible
    5. Follow security guidelines

    ## Support & Documentation
    - 📚 [Full Documentation](https://deltaverse.app/docs)
    - 💬 [Support Portal](https://deltaverse.app/support)
    - 📧 [Email Support](mailto:support@deltaverse.app)
    """,
    version="1.0.0",
    terms_of_service="https://deltaverse.app/terms",
    contact={
        "name": "DeltaVerse Support",
        "url": "https://deltaverse.app/support",
        "email": "support@deltaverse.app",
    },
    license_info={
        "name": "Private License",
        "url": "https://deltaverse.app/license",
    },
    openapi_tags=[
        {
            "name": "Authentication",
            "description": """
            Firebase authentication and session management endpoints.
            
            **Features:**
            - Secure token-based authentication
            - Session management
            - Role-based access control
            
            **Best Practices:**
            - Always use HTTPS
            - Implement token refresh
            - Handle session timeouts
            """,
            "externalDocs": {
                "description": "Authentication Documentation",
                "url": "https://deltaverse.app/docs/auth",
            },
        },
        {
            "name": "Chat",
            "description": """
            AI-powered financial chat and insights using Vertex AI.
            
            **Features:**
            - Natural language processing
            - Personalized financial advice
            - Real-time responses
            - Context-aware conversations
            
            **Models:**
            - Primary: Gemini Pro
            - Fallback: GPT-3.5 Turbo
            
            **Example Usage:**
            ```python
            POST /api/v1/chat/message
            {
                "message": "How is my portfolio performing?",
                "conversation_id": "optional-conversation-id"
            }
            ```
            """,
        },
        {
            "name": "Fi Integration",
            "description": """
            Fi Money MCP integration for financial data access.
            
            **Features:**
            - Account aggregation
            - Real-time data sync
            - Secure data access
            - Multiple account support
            
            **Available Test Scenarios:**
            1. SIP Samurai (8888888888)
            2. Large Portfolio (2222222222)
            3. Small Portfolio (3333333333)
            4. Multiple Banks (4444444444)
            
            **Integration Flow:**
            1. Initiate login
            2. Complete authentication
            3. Sync financial data
            4. Access insights
            """,
        },
        {
            "name": "Financial Data",
            "description": """
            Portfolio analysis and financial insights engine.
            
            **Features:**
            - Portfolio tracking
            - Investment analysis
            - Expense categorization
            - Goal tracking
            - Risk assessment
            
            **Data Points:**
            - Net worth calculation
            - Asset allocation
            - Investment performance
            - Expense patterns
            - Credit score monitoring
            
            **Example Insights:**
            ```json
            {
                "portfolio_health": "Good",
                "risk_score": 75,
                "recommendations": [
                    "Increase equity allocation",
                    "Review high-fee mutual funds"
                ]
            }
            ```
            """,
        },
        {
            "name": "Financial Health",
            "description": """
            Financial health score and personalized recommendations.
            
            **Features:**
            - Comprehensive financial health assessment
            - Component-based scoring system
            - Personalized recommendations
            - Historical score tracking
            
            **Score Components:**
            - Savings Rate
            - Debt Ratio
            - Investment Diversification
            - Emergency Fund
            - Credit Health
            
            **Example Score:**
            ```json
            {
                "overall_score": 75.5,
                "components": [
                    {
                        "name": "Savings Rate",
                        "score": 85,
                        "status": "good"
                    },
                    {
                        "name": "Debt Ratio",
                        "score": 70,
                        "status": "fair"
                    }
                ],
                "recommendations": [
                    {
                        "title": "Increase Your Emergency Fund",
                        "impact": "high",
                        "difficulty": "moderate"
                    }
                ]
            }
            ```
            """,
        },
        {
            "name": "System",
            "description": """
            System health monitoring and status endpoints.
            
            **Features:**
            - Health checks
            - Service status
            - Performance metrics
            - Error monitoring
            
            **Monitoring:**
            - API response times
            - Error rates
            - Service dependencies
            - Resource utilization
            
            **Health Check Response:**
            ```json
            {
                "status": "healthy",
                "services": {
                    "fi_mcp": "connected",
                    "database": "healthy",
                    "ai_service": "operational"
                },
                "version": "1.0.0"
            }
            ```
            """,
        },
    ],
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for React frontend - Smart environment-based configuration
allowed_origins = [
    "https://deltaverse-ui-*.run.app",  # Cloud Run frontend
    "https://opportune-scope-466406-p6.web.app",  # Firebase hosting
    "https://opportune-scope-466406-p6.firebaseapp.com",  # Firebase hosting alternate domain
]

# Add localhost for development environment only
if os.getenv("ENVIRONMENT", "development") == "development":
    allowed_origins.extend([
        "http://localhost:3000",  # React dev server
        "http://localhost:3001",  # Alternative React dev port
        "http://127.0.0.1:3000",  # Alternative localhost format
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(financial_health_router)
app.include_router(voice_router)
app.include_router(voice_router)

# Include spend analysis router if available
if spend_analysis_router and spend_analysis_router is not None:
    app.include_router(spend_analysis_router)
    logger.info("âœ… Spend analysis router included")
else:
    logger.warning("âš ï¸ Spend analysis router not available")


# Pydantic models
class DocumentData(BaseModel):
    data: Dict[str, Any]

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    requires_fi_auth: bool = False
    conversation_id: Optional[str] = None
    insights: List[str] = []
    timestamp: str

class StreamingChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None

class FiAuthRequest(BaseModel):
    phone_number: str
    otp: str

class SimpleIntelligentChatService:
    """Simplified intelligent chat service for testing"""

    def __init__(self):
        self.financial_keywords = [
            "portfolio", "investment", "net worth", "balance", "mutual fund",
            "sip", "stock", "loan", "debt", "savings", "expense", "income"
        ]
        self.mock_fi_sessions = {}  # Store mock Fi MCP sessions

    def is_financial_query(self, message: str) -> bool:
        """Check if message contains financial keywords"""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in self.financial_keywords)

    def is_personal_financial_query(self, message: str) -> bool:
        """Check if message is asking for personal financial data"""
        personal_keywords = [
            "my portfolio", "my investment", "my net worth", "my balance",
            "my mutual fund", "my sip", "my stock", "my loan", "my debt",
            "my savings", "my expense", "my income", "what's my", "show my",
            "how much do i", "my current", "my account"
        ]
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in personal_keywords)

    async def process_general_query(self, message: str) -> Dict[str, Any]:
        """Process general financial queries without Fi MCP data"""
        if self.is_personal_financial_query(message):
            # Personal financial query - requires Fi MCP
            return {
                "response": f"To provide personalized insights about your financial data, please connect your Fi account first.",
                "requires_fi_auth": True,
                "conversation_id": str(uuid.uuid4()),
                "insights": [
                    "Connect your financial accounts for personalized advice",
                    "I can provide general guidance, but specific recommendations need your data"
                ],
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            # General financial education query
            return {
                "response": f"I can help explain: '{message}'. Mutual funds are investment vehicles that pool money from many investors to purchase securities. They offer diversification and professional management. For personalized advice based on your portfolio, please connect your Fi account.",
                "requires_fi_auth": False,
                "conversation_id": str(uuid.uuid4()),
                "insights": [
                    "This is general financial education",
                    "Connect your accounts for personalized recommendations"
                ],
                "timestamp": datetime.utcnow().isoformat()
            }

    async def process_financial_query(self, message: str, user_id: str = None) -> Dict[str, Any]:
        """Process financial queries that require Fi MCP authentication"""
        if not user_id or user_id not in self.mock_fi_sessions:
            return {
                "response": "To provide personalized financial insights, please authenticate with Fi MCP first.",
                "requires_fi_auth": True,
                "conversation_id": str(uuid.uuid4()),
                "insights": [],
                "timestamp": datetime.utcnow().isoformat()
            }

        # Mock response with Fi MCP data
        fi_data = self.mock_fi_sessions.get(user_id, {})
        return {
            "response": f"Based on your financial data: {message}. Your net worth is ₹{fi_data.get('net_worth', '0')} with {fi_data.get('accounts', 0)} connected accounts.",
            "requires_fi_auth": False,
            "conversation_id": str(uuid.uuid4()),
            "insights": [
                f"Portfolio value: ₹{fi_data.get('portfolio_value', '0')}",
                f"Monthly expenses: ₹{fi_data.get('monthly_expenses', '0')}",
                "Consider diversifying your investment portfolio"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }

    async def authenticate_fi_mcp(self, phone_number: str, otp: str) -> Dict[str, Any]:
        """Mock Fi MCP authentication"""
        # Mock authentication logic
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

# Import AI-powered chat service
from ai_chat_service import AIFinancialChatService

# Create fresh instance to ensure latest model configuration
chat_service = AIFinancialChatService()

print("🤖 AI-Powered Chat Service Loaded!")

@app.get("/")
async def root():
    project_id = os.getenv("GCP_PROJECT_ID", "deltaverse-project")
    return {
        "message": "DeltaVerse API is running!",
        "project": project_id,
        "version": "1.0.0",
        "features": [
            "Fi MCP Integration",
            "Financial Data Management",
            "AI Financial Advisory",
            "Real-time Portfolio Tracking",
            "AI Spend Analysis"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint to verify all services"""
    try:
        db = get_firestore_client()
        # Try to access a collection (this will verify connection)
        collections = db.collections()

        # Check environment variables
        fi_mcp_url = os.getenv("FI_MCP_URL", "http://localhost:8080")  # Fixed default port
        project_id = os.getenv("GCP_PROJECT_ID", "deltaverse-project")

        return {
            "status": "healthy",
            "firestore": "connected",
            "project": project_id,
            "fi_mcp_server": fi_mcp_url,
            "environment": os.getenv("ENVIRONMENT", "development"),
            "development_mode": DEVELOPMENT_MODE,
            "authentication": "bypass" if DEVELOPMENT_MODE else "firebase_required",
            "security_level": "development" if DEVELOPMENT_MODE else "production"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# ============================================================================
# LEGACY FIRESTORE ENDPOINTS (for backward compatibility)
# ============================================================================

@app.post("/collections/{collection_name}/documents")
async def create_document(collection_name: str, document: DocumentData):
    """Create a new document in the specified collection"""
    try:
        db = get_firestore_client()
        doc_ref = db.collection(collection_name).document()
        doc_ref.set(document.data)
        return {
            "message": "Document created successfully",
            "document_id": doc_ref.id,
            "collection": collection_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create document: {str(e)}")

@app.get("/collections/{collection_name}/documents")
async def get_documents(collection_name: str):
    """Get all documents from the specified collection"""
    try:
        db = get_firestore_client()
        docs = db.collection(collection_name).stream()
        documents = []
        for doc in docs:
            documents.append({
                "id": doc.id,
                "data": doc.to_dict()
            })
        return {
            "collection": collection_name,
            "documents": documents,
            "count": len(documents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")

@app.get("/collections/{collection_name}/documents/{document_id}")
async def get_document(collection_name: str, document_id: str):
    """Get a specific document by ID"""
    try:
        db = get_firestore_client()
        doc_ref = db.collection(collection_name).document(document_id)
        doc = doc_ref.get()

        if doc.exists:
            return {
                "id": doc.id,
                "data": doc.to_dict()
            }
        else:
            raise HTTPException(status_code=404, detail="Document not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch document: {str(e)}")

# ============================================================================
# INTELLIGENT CHAT ENDPOINTS
# ============================================================================

@app.get("/api/v1/chat/health")
async def chat_health_check():
    """Health check for intelligent chat system"""
    return {
        "status": "healthy",
        "service": "intelligent_chat",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "chat_service": "healthy",
            "fi_mcp_mock": "ready",
            "ai_processing": "ready"
        }
    }

@app.post("/api/v1/chat/test-gemini")
async def test_gemini_direct(request: dict):
    """Direct test of Gemini model"""
    try:
        import vertexai
        from vertexai.generative_models import GenerativeModel
        import asyncio

        # Initialize Vertex AI
        vertexai.init(project="opportune-scope-466406-p6", location="us-central1")
        model = GenerativeModel("gemini-2.0-flash-exp")

        # Generate response
        response = await asyncio.to_thread(
            model.generate_content,
            f"You are DeltaVerse AI. Answer this financial question: {request.get('message', 'Hello')}",
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 1024,
            }
        )

        return {
            "message": response.text,
            "model": "gemini-2.0-flash-exp",
            "direct_test": True
        }

    except Exception as e:
        return {
            "error": str(e),
            "message": "Direct Gemini test failed",
            "direct_test": True
        }

@app.post("/api/v1/chat/message")
async def process_chat_message(
        chat_message: ChatMessage,
        firebase_user_id: str = Depends(auth_dependency)
):
    """Process chat message with AI-powered intelligent routing and MCP integration"""
    try:
        logger.info(f"Processing chat message for user {firebase_user_id}: {chat_message.message[:50]}...")

        # Check if user has Fi MCP data available
        db = get_firestore_client()
        user_doc = db.collection('financial_profiles').document(firebase_user_id).get()
        firestore_has_data = user_doc.exists and user_doc.to_dict().get('sync_status') == 'success'
        
        # Also check Fi-MCP dev server data (for development)
        fi_mcp_has_data = False
        try:
            # Import the chat service to check for Fi-MCP data
            from app.services.intelligent_chat_service import IntelligentChatService
            temp_chat_service = IntelligentChatService()
            
            # Check if we can get financial context from Fi-MCP
            test_response = await temp_chat_service.process_general_query("test", chat_message.user_id)
            financial_context = test_response.get("financial_context", {})
            fi_mcp_has_data = financial_context.get("has_data", False) and financial_context.get("account_count", 0) > 0
            
            logger.info(f"🔍 Fi-MCP Data Check: firestore={firestore_has_data}, fi_mcp={fi_mcp_has_data}")
        except Exception as e:
            logger.warning(f"⚠️ Could not check Fi-MCP data: {e}")
            fi_mcp_has_data = False
        
        # User has data if either Firestore OR Fi-MCP has data
        has_fi_data = firestore_has_data or fi_mcp_has_data
        
        # Determine query type and routing
        if chat_service.is_personal_financial_query(chat_message.message):
            if has_fi_data:
                # User has Fi MCP data - provide AI-powered personalized response
                logger.info("Personal query with Fi MCP data - using AI with financial context")
                response = await chat_service.process_general_query(chat_message.message, chat_message.user_id)
                response["mcp_status"] = "connected"
                response["data_source"] = "fi_mcp_with_ai"
            else:
                # Personal query but no Fi MCP data - use AI with connection prompt
                logger.info("Personal query without Fi MCP data - using AI with connection prompt")

                # Modify the message to include connection context
                enhanced_message = f"""
                The user asked: "{chat_message.message}"
                
                This is a personal financial query, but the user hasn't connected their Fi Money account yet.
                Provide helpful general advice about this topic, and gently suggest connecting their Fi account 
                for personalized insights. Be encouraging and educational.
                """

                ai_response = await chat_service.generate_ai_response(enhanced_message)
                response = {
                    "message": ai_response,
                    "requires_fi_auth": True,
                    "conversation_id": str(uuid.uuid4()),
                    "insights": [
                        "This is AI-generated financial guidance",
                        "Connect your Fi Money account for personalized recommendations",
                        "Get tailored advice based on your actual financial situation"
                    ],
                    "timestamp": datetime.utcnow().isoformat(),
                    "ai_powered": True,
                    "mcp_status": "not_connected",
                    "data_source": "ai_general_with_connection_prompt",
                    "connection_prompt": "Connect your Fi Money account for personalized insights based on your actual financial data."
                }
        else:
            # General financial education query - always use AI
            logger.info("General financial query - using AI")
            response = await chat_service.process_general_query(chat_message.message, chat_message.user_id)
            response["mcp_status"] = "connected" if has_fi_data else "not_connected"
            response["data_source"] = "ai_general"

        # Enhanced response format
        return {
            "message": response.get("response") or response.get("message"),
            "requires_fi_auth": response.get("requires_fi_auth", False),
            "conversation_id": response.get("conversation_id"),
            "insights": response.get("insights", []),
            "timestamp": response.get("timestamp"),
            "model_info": {
                "model_name": "Gemini-2.0-Flash-Exp" if response.get("ai_powered") else "DeltaVerse-Mock",
                "version": "1.0.0",
                "ai_powered": response.get("ai_powered", False)
            },
            "mcp_integration": {
                "status": "connected" if has_fi_data else "not_connected",
                "data_source": response.get("data_source", "unknown"),
                "has_financial_data": has_fi_data,
                "financial_context": response.get("financial_context", {})
            }
        }

    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/chat/query")
async def process_chat_query(chat_message: ChatMessage):
    """Process chat query with intelligent routing (legacy endpoint)"""
    return await process_chat_message(chat_message)

@app.post("/api/v1/chat/stream")
async def stream_chat_response(request: StreamingChatRequest):
    """Stream chat response for real-time experience"""
    try:
        async def generate_stream():
            # Process the query
            if chat_service.is_financial_query(request.message):
                response = await chat_service.process_financial_query(
                    request.message,
                    request.user_id
                )
            else:
                response = await chat_service.process_general_query(request.message)

            # Stream the response word by word
            words = response["response"].split()
            for i, word in enumerate(words):
                chunk = {
                    "word": word,
                    "position": i,
                    "is_final": i == len(words) - 1,
                    "timestamp": datetime.utcnow().isoformat()
                }
                if i == len(words) - 1:
                    # Include full response data in final chunk
                    chunk.update({
                        "full_response": response,
                        "conversation_id": response.get("conversation_id"),
                        "insights": response.get("insights", [])
                    })

                yield f"data: {json.dumps(chunk)}\n\n"
                await asyncio.sleep(0.1)  # Simulate streaming delay

        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache"}
        )

    except Exception as e:
        logger.error(f"Error streaming chat response: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/public/chat/message")
async def process_public_chat_message(chat_message: ChatMessage):
    """
    Public chat endpoint without authentication - mirrors /api/v1/chat/message functionality
    but without requiring user authentication. Provides AI-powered responses for both
    general financial education and personal financial queries (with connection prompts).
    """
    try:
        logger.info(f"Processing public chat message: {chat_message.message[:50]}...")

        # For public endpoint, we don't have user authentication
        # So we can't check user-specific Fi MCP data or Firestore data
        has_fi_data = False
        
        # Determine query type and routing (same logic as authenticated endpoint)
        if chat_service.is_personal_financial_query(chat_message.message):
            # Personal query but no authentication - use AI with connection prompt
            logger.info("Public personal query - using AI with connection prompt")

            # Modify the message to include connection context
            enhanced_message = f"""
            The user asked: "{chat_message.message}"
            
            This is a personal financial query from a public (unauthenticated) user.
            Provide helpful general advice about this topic, and suggest creating an account 
            and connecting their Fi Money account for personalized insights. Be encouraging and educational.
            """

            ai_response = await chat_service.generate_ai_response(enhanced_message)
            response = {
                "message": ai_response,
                "requires_fi_auth": True,
                "conversation_id": chat_message.conversation_id or str(uuid.uuid4()),
                "insights": [
                    "This is AI-generated financial guidance",
                    "Create an account and connect your Fi Money account for personalized recommendations",
                    "Get tailored advice based on your actual financial situation"
                ],
                "timestamp": datetime.utcnow().isoformat(),
                "ai_powered": True,
                "mcp_status": "not_connected",
                "data_source": "ai_general_with_connection_prompt_public",
                "connection_prompt": "Create an account and connect your Fi Money account for personalized insights based on your actual financial data."
            }
        else:
            # General financial education query - always use AI
            logger.info("Public general financial query - using AI")
            response = await chat_service.process_general_query(chat_message.message, chat_message.user_id)
            response["mcp_status"] = "not_connected"
            response["data_source"] = "ai_general_public"

        # Enhanced response format (same as authenticated endpoint)
        return {
            "message": response.get("response") or response.get("message"),
            "requires_fi_auth": response.get("requires_fi_auth", False),
            "conversation_id": response.get("conversation_id"),
            "insights": response.get("insights", []),
            "timestamp": response.get("timestamp"),
            "model_info": {
                "model_name": "Gemini-2.0-Flash-Exp" if response.get("ai_powered") else "DeltaVerse-Mock",
                "version": "1.0.0",
                "ai_powered": response.get("ai_powered", False)
            },
            "mcp_integration": {
                "status": "not_connected",
                "data_source": response.get("data_source", "unknown"),
                "has_financial_data": False,
                "financial_context": {},
                "public_endpoint": True
            }
        }
        
    except Exception as e:
        logger.error(f"Error processing public chat message: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process chat message: {str(e)}"
        )

@app.post("/api/v1/fi-auth/authenticate")
async def authenticate_fi_mcp(auth_request: FiAuthRequest):
    """Authenticate with Fi MCP (mock implementation)"""
    try:
        logger.info(f"Fi MCP authentication attempt for phone: {auth_request.phone_number}")

        result = await chat_service.authenticate_fi_mcp(
            auth_request.phone_number,
            auth_request.otp
        )

        if result["success"]:
            return {
                "success": True,
                "user_id": result["user_id"],
                "message": result["message"],
                "financial_summary": result["data"]
            }
        else:
            raise HTTPException(status_code=401, detail=result["message"])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Fi MCP authentication: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/chat/insights")
async def get_ai_insights_general(
        firebase_user_id: str = Depends(auth_dependency)
):
    """Get AI-generated insights for authenticated user with Fi-MCP integration"""
    try:
        # Check if user has Fi-MCP data available
        db = get_firestore_client()
        user_doc = db.collection('financial_profiles').document(firebase_user_id).get()
        firestore_has_data = user_doc.exists and user_doc.to_dict().get('sync_status') == 'success'
        
        # Also check Fi-MCP dev server data (for development)
        fi_mcp_has_data = False
        try:
            from app.services.intelligent_chat_service import IntelligentChatService
            temp_chat_service = IntelligentChatService()
            test_response = await temp_chat_service.process_general_query("test", firebase_user_id)
            financial_context = test_response.get("financial_context", {})
            fi_mcp_has_data = financial_context.get("has_data", False) and financial_context.get("account_count", 0) > 0
            logger.info(f"🔍 Insights Fi-MCP Data Check: firestore={firestore_has_data}, fi_mcp={fi_mcp_has_data}")
        except Exception as e:
            logger.warning(f"⚠️ Could not check Fi-MCP data in insights: {e}")
            fi_mcp_has_data = False
        
        # User has data if either Firestore OR Fi-MCP has data
        has_fi_data = firestore_has_data or fi_mcp_has_data
        
        if has_fi_data:
            # User has Fi-MCP data - return personalized insights
            user_data = user_doc.to_dict()

            # Generate insights based on actual Fi-MCP data
            insights = []

            # SIP Optimization Insight
            if user_data.get('portfolio', {}).get('sip_amount', 0) > 0:
                insights.append({
                    "id": "fi_sip_optimization",
                    "type": "investment_opportunity",
                    "title": "SIP Portfolio Optimization",
                    "description": f"Your current SIP of ₹{user_data.get('portfolio', {}).get('sip_amount', 0):,} can be optimized. Consider increasing allocation to equity funds for better returns.",
                    "priority": "high",
                    "confidence": "high",
                    "action": "Increase equity allocation by 20%",
                    "impact": "₹3,50,000 additional returns over 10 years",
                    "category": "sip_optimization"
                })

            # Expense Analysis Insight
            monthly_expenses = user_data.get('expenses', {}).get('total', 0)
            if monthly_expenses > 0:
                insights.append({
                    "id": "fi_expense_analysis",
                    "type": "spending_optimization",
                    "title": "Expense Optimization Opportunity",
                    "description": f"Your monthly expenses of ₹{monthly_expenses:,} can be reduced by 15% through smart budgeting and category-wise tracking.",
                    "priority": "medium",
                    "confidence": "high",
                    "action": "Implement 50/30/20 budgeting rule",
                    "impact": f"₹{int(monthly_expenses * 0.15 * 12):,} annual savings",
                    "category": "expense_reduction"
                })

            # Tax Planning Insight
            annual_income = user_data.get('income', {}).get('annual', 0)
            if annual_income > 500000:  # Above tax exemption limit
                insights.append({
                    "id": "fi_tax_planning",
                    "type": "tax_optimization",
                    "title": "Tax Saving Opportunity",
                    "description": f"With annual income of ₹{annual_income:,}, you can save up to ₹46,800 in taxes through 80C investments.",
                    "priority": "high",
                    "confidence": "high",
                    "action": "Maximize 80C deductions (₹1.5L limit)",
                    "impact": "₹46,800 tax savings annually",
                    "category": "tax_planning"
                })

            # Credit Score Insight
            credit_score = user_data.get('credit_score', 750)
            if credit_score < 800:
                insights.append({
                    "id": "fi_credit_improvement",
                    "type": "credit_optimization",
                    "title": "Credit Score Enhancement",
                    "description": f"Your credit score of {credit_score} can be improved to 800+ for better loan rates and credit card offers.",
                    "priority": "medium",
                    "confidence": "medium",
                    "action": "Pay all bills on time, reduce credit utilization",
                    "impact": "Better loan rates, premium credit cards",
                    "category": "credit_maintenance"
                })

            return {
                "success": True,
                "data": {
                    "insights": insights,
                    "total_insights": len(insights),
                    "high_priority_count": len([i for i in insights if i.get('priority') == 'high']),
                    "status": "fi_connected",
                    "data_source": "fi_mcp_personalized",
                    "user_profile": {
                        "fi_connected": True,
                        "sync_status": user_data.get('sync_status'),
                        "last_updated": user_data.get('last_updated')
                    }
                }
            }
        else:
            # User hasn't connected Fi-MCP - return connection prompt with general insights
            return {
                "success": True,
                "data": {
                    "insights": [
                        {
                            "id": "connect_fi_prompt",
                            "type": "connection_required",
                            "title": "Connect Your Financial Data",
                            "description": "Connect your Fi Money account to get personalized AI-powered insights based on your actual financial data.",
                            "priority": "high",
                            "confidence": "high",
                            "action": "Click 'Connect Fi Money' to get started",
                            "impact": "Unlock personalized financial recommendations",
                            "category": "connection_prompt"
                        },
                        {
                            "id": "general_financial_tip",
                            "type": "financial_education",
                            "title": "Financial Wellness Tip",
                            "description": "Creating a budget is the first step toward financial freedom. Track your income and expenses to understand your spending patterns.",
                            "priority": "medium",
                            "confidence": "high",
                            "action": "Start with a simple 50/30/20 budget",
                            "impact": "Better financial awareness and control",
                            "category": "financial_education"
                        }
                    ],
                    "total_insights": 2,
                    "high_priority_count": 1,
                    "status": "fi_not_connected",
                    "data_source": "general_education",
                    "user_profile": {
                        "fi_connected": False,
                        "sync_status": "not_connected"
                    }
                }
            }

    except Exception as e:
        logger.error(f"Error getting insights: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "insights": [],
                "status": "error"
            }
        }
@app.get("/api/v1/chat/insights/{user_id}")
async def get_ai_insights_by_user(user_id: str):
    """Get AI-generated insights for specific user"""
    try:
        if user_id not in chat_service.mock_fi_sessions:
            raise HTTPException(status_code=404, detail="User not authenticated with Fi MCP")

        fi_data = chat_service.mock_fi_sessions[user_id]

        # Generate mock insights
        insights = [
            {
                "type": "portfolio_analysis",
                "title": "Portfolio Performance",
                "description": f"Your portfolio value of ₹{fi_data['portfolio_value']} shows steady growth",
                "priority": "medium",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "type": "expense_optimization",
                "title": "Expense Management",
                "description": f"Monthly expenses of ₹{fi_data['monthly_expenses']} can be optimized by 15%",
                "priority": "high",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "type": "investment_recommendation",
                "title": "Investment Opportunity",
                "description": "Consider increasing SIP allocation to large-cap funds",
                "priority": "low",
                "timestamp": datetime.utcnow().isoformat()
            }
        ]

        return {
            "user_id": user_id,
            "insights": insights,
            "count": len(insights),
            "generated_at": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting AI insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/chat/suggestions")
async def get_query_suggestions():
    """Get suggested financial queries"""
    return {
        "suggestions": {
            "portfolio_analysis": [
                "How is my portfolio performing?",
                "Which mutual funds are underperforming?",
                "Should I increase my SIP amount?",
                "What's my asset allocation?"
            ],
            "expense_tracking": [
                "Where am I overspending?",
                "Show me my spending trends",
                "How can I reduce expenses?",
                "What are my biggest expense categories?"
            ],
            "financial_planning": [
                "How much will I have at retirement?",
                "Can I afford a home loan?",
                "What should be my emergency fund?",
                "How much to save for goals?"
            ]
        }
    }

# ============================================================================
# FI MCP INTEGRATION ENDPOINTS
# ============================================================================

@app.get("/fi-mcp/test-connection")
async def test_fi_mcp_connection():
    """Test connection to Fi MCP server"""
    try:
        import aiohttp
        
        fi_mcp_url = os.getenv("FI_MCP_URL", "http://localhost:8080")  # Fixed default port
        
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{fi_mcp_url}/") as response:
                health = response.status == 404  # 404 is expected for root path

        return {
            "fi_mcp_server": fi_mcp_url,
            "status": "connected" if health else "disconnected",
            "health": health
        }
    except Exception as e:
        return {
            "fi_mcp_server": fi_mcp_url,
            "status": "error",
            "error": str(e)
        }

@app.get("/fi-mcp/test-users")
async def get_test_users():
    """Get list of available test users from Fi MCP"""
    return {
        "test_users": [
            {"phone": "1111111111", "description": "No assets connected"},
            {"phone": "2222222222", "description": "All assets connected - Large MF portfolio"},
            {"phone": "3333333333", "description": "All assets connected - Small MF portfolio"},
            {"phone": "7777777777", "description": "Debt-Heavy Low Performer"},
            {"phone": "8888888888", "description": "SIP Samurai"},
            {"phone": "9999999999", "description": "Fixed Income Fanatic"},
            {"phone": "1313131313", "description": "Balanced Growth Tracker"},
        ],
        "usage": "Use these phone numbers to test Fi MCP integration"
    }

# Simple test endpoint to fetch data from Fi MCP
@app.get("/fi-mcp/fetch-test-data/{phone_number}")
async def fetch_test_data(phone_number: str):
    """Fetch test data from Fi MCP server"""
    try:
        import aiohttp
        
        fi_mcp_url = os.getenv("FI_MCP_URL", "http://localhost:8080")  # Fixed default port
        
        async with aiohttp.ClientSession() as session:
            # Try to fetch net worth data
            url = f"{fi_mcp_url}/fetch_net_worth?phone_number={phone_number}"
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "phone_number": phone_number,
                        "status": "success",
                        "data": data
                    }
                else:
                    return {
                        "phone_number": phone_number,
                        "status": "error",
                        "error": f"HTTP {response.status}"
                    }
    except Exception as e:
        return {
            "phone_number": phone_number,
            "status": "error",
            "error": str(e)
        }

# ============================================================================
# MCP API Endpoints (Frontend Integration)
# ============================================================================

@app.get("/test-reload")
async def test_reload():
    """Test endpoint to verify server reload"""
    return {"status": "server_reloaded", "timestamp": datetime.now().isoformat()}

@app.get("/api/v1/mcp/fi-data")
async def get_fi_mcp_data(mobile: str = None):
    """Get Fi-MCP data for a specific mobile number"""
    try:
        if not mobile:
            return {"error": "Mobile number is required"}

        # Use the global Fi-MCP service
        fi_mcp_service = fi_mcp_dev_service

        # Check Fi-MCP status
        status = await fi_mcp_service.check_fi_mcp_dev_status()
        if status["status"] != "healthy":
            return {
                "error": "Fi-MCP service not available",
                "status": status
            }

        # Get scenario data based on mobile number
        scenario_data = fi_mcp_service.test_scenarios.get(mobile, "Default scenario")

        # Initiate Fi login with the mobile number
        login_result = await fi_mcp_service.initiate_fi_login("user_" + mobile, mobile)

        return {
            "mobile": mobile,
            "scenario": scenario_data,
            "fi_mcp_status": status,
            "login_result": login_result,
            "available_scenarios": len(fi_mcp_service.test_scenarios)
        }

    except Exception as e:
        logger.error(f"Error getting Fi-MCP data: {e}")
        return {
            "error": str(e),
            "mobile": mobile
        }

@app.get("/fi-login")
async def fi_login_page(sessionId: str = None):
    """Clean Fi Money login page without f-string issues"""
    if not sessionId:
        sessionId = "default-session"

    # Create HTML content as a separate string to avoid syntax issues
    html_template = """<!DOCTYPE html>
<html>
    <head>
        <title>Fi Money - Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;
            }
            .login-container {
                background: white; border-radius: 16px; padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 400px; width: 100%;
            }
            .fi-logo { text-align: center; margin-bottom: 30px; }
            .fi-logo h1 { color: #6366f1; font-size: 32px; font-weight: 700; margin-bottom: 8px; }
            .fi-logo p { color: #6b7280; font-size: 16px; }
            .form-group { margin-bottom: 24px; }
            .form-label { display: block; color: #374151; font-weight: 500; margin-bottom: 8px; font-size: 14px; }
            .form-input {
                width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;
                font-size: 16px; transition: border-color 0.2s ease;
            }
            .form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
            .otp-container { display: none; }
            .otp-inputs { display: flex; gap: 12px; justify-content: center; margin: 16px 0; }
            .otp-input {
                width: 50px; height: 50px; text-align: center; border: 2px solid #e5e7eb;
                border-radius: 8px; font-size: 20px; font-weight: 600;
            }
            .otp-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
            .btn {
                width: 100%; padding: 14px; background: #6366f1; color: white; border: none;
                border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s ease;
            }
            .btn:hover { background: #5856eb; }
            .demo-info {
                background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;
                padding: 12px; margin-bottom: 20px; font-size: 14px; color: #92400e;
            }
            .success-message { display: none; text-align: center; color: #10b981; margin: 20px 0; }
            .loading { display: none; text-align: center; color: #6b7280; margin: 20px 0; }
            .back-link { text-align: center; margin-top: 20px; }
            .back-link a { color: #6366f1; text-decoration: none; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="fi-logo">
                <h1>Fi Money</h1>
                <p>Secure Login</p>
            </div>
            
            <div class="demo-info">
                <strong>Demo Mode:</strong> Use any 10-digit mobile number. OTP will be auto-filled as 123456.
            </div>
            
            <div id="mobile-step">
                <div class="form-group">
                    <label class="form-label" for="mobile">Mobile Number</label>
                    <input type="tel" id="mobile" class="form-input" placeholder="Enter your mobile number" maxlength="10">
                </div>
                <button class="btn" onclick="sendOTP()">Send OTP</button>
            </div>
            
            <div id="otp-step" class="otp-container">
                <div class="form-group">
                    <label class="form-label">Enter OTP</label>
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                        OTP sent to <span id="mobile-display"></span>
                    </p>
                    <div class="otp-inputs">
                        <input type="text" class="otp-input" maxlength="1" oninput="moveToNext(this, 0)">
                        <input type="text" class="otp-input" maxlength="1" oninput="moveToNext(this, 1)">
                        <input type="text" class="otp-input" maxlength="1" oninput="moveToNext(this, 2)">
                        <input type="text" class="otp-input" maxlength="1" oninput="moveToNext(this, 3)">
                        <input type="text" class="otp-input" maxlength="1" oninput="moveToNext(this, 4)">
                        <input type="text" class="otp-input" maxlength="1" oninput="moveToNext(this, 5)">
                    </div>
                </div>
                <button class="btn" onclick="verifyOTP()">Verify & Login</button>
                <p style="text-align: center; margin-top: 16px;">
                    <a href="#" onclick="goBackToMobile()">← Change mobile number</a>
                </p>
            </div>
            
            <div id="loading" class="loading">
                <p>🔄 Authenticating...</p>
            </div>
            
            <div id="success" class="success-message">
                <h3>✅ Login Successful!</h3>
                <p id="success-text">Connecting to DeltaVerse...</p>
            </div>
            
            <div class="back-link">
                <a href="https://opportune-scope-466406-p6.web.app">← Back to DeltaVerse</a>
            </div>
        </div>
        
        <script>
            let currentMobile = '';
            const SESSION_ID = 'SESSION_PLACEHOLDER';
            
            function sendOTP() {
                const mobile = document.getElementById('mobile').value;
                
                if (!mobile || mobile.length !== 10 || !/^[0-9]+$/.test(mobile)) {
                    alert('Please enter a valid 10-digit mobile number');
                    return;
                }
                
                currentMobile = mobile;
                document.getElementById('mobile-display').textContent = 
                    mobile.substring(0, 2) + 'XXXXXX' + mobile.substring(8);
                
                document.getElementById('mobile-step').style.display = 'none';
                document.getElementById('loading').style.display = 'block';
                
                setTimeout(function() {
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('otp-step').style.display = 'block';
                    
                    setTimeout(function() {
                        const otpInputs = document.querySelectorAll('.otp-input');
                        const demoOTP = '123456';
                        otpInputs.forEach(function(input, index) {
                            input.value = demoOTP[index];
                        });
                    }, 1000);
                }, 1500);
            }
            
            function verifyOTP() {
                const otpInputs = document.querySelectorAll('.otp-input');
                const otp = Array.from(otpInputs).map(function(input) { return input.value; }).join('');
                
                if (otp.length !== 6) {
                    alert('Please enter complete OTP');
                    return;
                }
                
                document.getElementById('otp-step').style.display = 'none';
                document.getElementById('loading').style.display = 'block';
                
                setTimeout(function() {
                    const loginData = {
                        isLoggedIn: true,
                        mobile: currentMobile,
                        sessionId: SESSION_ID,
                        loginTime: new Date().toISOString(),
                        provider: 'fi-money'
                    };
                    
                    localStorage.setItem('fi_login_state', JSON.stringify(loginData));
                    
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('success').style.display = 'block';
                    
                    if (window.opener && window.opener !== window) {
                        try {
                            window.opener.postMessage({
                                type: 'FI_LOGIN_SUCCESS',
                                data: loginData
                            }, 'https://opportune-scope-466406-p6.web.app');
                            
                            setTimeout(function() {
                                window.close();
                            }, 1500);
                        } catch (error) {
                            setTimeout(function() {
                                window.location.href = 'https://opportune-scope-466406-p6.web.app';
                            }, 2000);
                        }
                    } else {
                        setTimeout(function() {
                            window.location.href = 'https://opportune-scope-466406-p6.web.app';
                        }, 2000);
                    }
                }, 2000);
            }
            
            function moveToNext(current, index) {
                if (current.value.length === 1 && index < 5) {
                    document.querySelectorAll('.otp-input')[index + 1].focus();
                }
            }
            
            function goBackToMobile() {
                document.getElementById('otp-step').style.display = 'none';
                document.getElementById('mobile-step').style.display = 'block';
                document.querySelectorAll('.otp-input').forEach(function(input) { input.value = ''; });
            }
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace') {
                    const otpInputs = document.querySelectorAll('.otp-input');
                    const currentIndex = Array.from(otpInputs).indexOf(e.target);
                    if (currentIndex > 0 && e.target.value === '') {
                        otpInputs[currentIndex - 1].focus();
                    }
                }
            });
            
            if (window.opener && window.opener !== window) {
                document.getElementById('success-text').textContent = 'This window will close automatically...';
                const backLink = document.querySelector('.back-link');
                if (backLink) backLink.style.display = 'none';
            }
            
            document.getElementById('mobile').focus();
        </script>
    </body>
</html>"""

    # Replace the session ID placeholder
    html_content = html_template.replace('SESSION_PLACEHOLDER', sessionId)

    return HTMLResponse(html_content)

@app.get("/test-fi-login")
async def test_fi_login():
    """Simple test version of Fi login to debug sendOTP issue"""
    return HTMLResponse("""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fi Login Test</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 400px; margin: 0 auto; }
                .form-group { margin-bottom: 20px; }
                .form-input { width: 100%; padding: 12px; border: 2px solid #ccc; border-radius: 8px; }
                .btn { width: 100%; padding: 14px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; }
                .btn:hover { background: #5856eb; }
                .hidden { display: none; }
            </style>
        </head>
        <body>
            <h2>Fi Login Test</h2>
            
            <div id="mobile-step">
                <div class="form-group">
                    <label>Mobile Number</label>
                    <input type="tel" id="mobile" class="form-input" placeholder="Enter 10-digit mobile" maxlength="10">
                </div>
                <button class="btn" onclick="testSendOTP()">Send OTP</button>
            </div>
            
            <div id="otp-step" class="hidden">
                <h3>OTP Sent!</h3>
                <p>OTP sent to <span id="mobile-display"></span></p>
                <div class="form-group">
                    <input type="text" id="otp" class="form-input" placeholder="Enter OTP" maxlength="6">
                </div>
                <button class="btn" onclick="testVerifyOTP()">Verify OTP</button>
            </div>
            
            <div id="success-step" class="hidden">
                <h3>✅ Success!</h3>
                <p>Login successful!</p>
            </div>
            
            <script>
                console.log('Script loaded');
                
                function testSendOTP() {
                    console.log('testSendOTP called');
                    
                    const mobile = document.getElementById('mobile').value;
                    console.log('Mobile value:', mobile);
                    
                    if (!mobile || mobile.length !== 10) {
                        alert('Please enter a valid 10-digit mobile number');
                        return;
                    }
                    
                    // Hide mobile step, show OTP step
                    document.getElementById('mobile-step').style.display = 'none';
                    document.getElementById('otp-step').style.display = 'block';
                    
                    // Update mobile display
                    document.getElementById('mobile-display').textContent = 
                        mobile.substring(0, 2) + 'XXXXXX' + mobile.substring(8);
                    
                    // Auto-fill OTP after 2 seconds
                    setTimeout(() => {
                        document.getElementById('otp').value = '123456';
                        console.log('OTP auto-filled');
                    }, 2000);
                }
                
                function testVerifyOTP() {
                    console.log('testVerifyOTP called');
                    
                    const otp = document.getElementById('otp').value;
                    console.log('OTP value:', otp);
                    
                    if (otp !== '123456') {
                        alert('Invalid OTP. Use 123456');
                        return;
                    }
                    
                    // Show success
                    document.getElementById('otp-step').style.display = 'none';
                    document.getElementById('success-step').style.display = 'block';
                    
                    console.log('Login successful');
                }
                
                // Focus mobile input on load
                document.getElementById('mobile').focus();
                console.log('Mobile input focused');
            </script>
        </body>
        </html>
    """)

async def get_fi_login_status():
    """Get Fi Money login status and user data"""
    try:
        # In a real implementation, you'd check session/token
        # For demo, we'll return mock personalized data
        return {
            "isLoggedIn": True,
            "user": {
                "mobile": "98XXXXXX21",
                "name": "Demo User",
                "verified": True
            },
            "financialData": {
                "netWorth": 2850000,
                "totalAssets": 3200000,
                "totalLiabilities": 350000,
                "creditScore": 785,
                "monthlyIncome": 125000,
                "monthlyExpenses": 85000,
                "savingsRate": 32,
                "investments": {
                    "stocks": 1200000,
                    "mutualFunds": 800000,
                    "fixedDeposits": 600000,
                    "gold": 150000,
                    "crypto": 50000
                },
                "accounts": [
                    {"bank": "HDFC Bank", "type": "Savings", "balance": 245000},
                    {"bank": "ICICI Bank", "type": "Current", "balance": 85000},
                    {"bank": "SBI", "type": "Fixed Deposit", "balance": 600000}
                ]
            },
            "insights": [
                {
                    "type": "positive",
                    "title": "Excellent Credit Score",
                    "message": "Your credit score of 785 is excellent! This puts you in the top 20% of borrowers.",
                    "action": "Consider applying for premium credit cards with better rewards."
                },
                {
                    "type": "suggestion",
                    "title": "Investment Diversification",
                    "message": "Your portfolio is well-diversified across asset classes. Consider increasing your equity allocation by 5-10%.",
                    "action": "Explore large-cap mutual funds or index funds for stable growth."
                },
                {
                    "type": "warning",
                    "title": "Emergency Fund Check",
                    "message": "Your liquid savings can cover 3.5 months of expenses. Consider building it to 6 months.",
                    "action": "Set up an automatic transfer of ₹15,000 monthly to your emergency fund."
                },
                {
                    "type": "opportunity",
                    "title": "Tax Saving Opportunity",
                    "message": "You can save up to ₹46,800 in taxes by maximizing your 80C investments.",
                    "action": "Consider ELSS mutual funds or increase your PPF contribution."
                }
            ],
            "recommendations": [
                "Increase SIP amount by ₹10,000 to reach your retirement goal faster",
                "Consider a health insurance top-up of ₹10 lakhs for better coverage",
                "Your debt-to-income ratio is healthy at 12%. You can take on more strategic debt if needed."
            ]
        }
    except Exception as e:
        logger.error(f"Error getting Fi login status: {e}")
        return {
            "isLoggedIn": False,
            "error": str(e)
        }

@app.get("/api/v1/fi/insights")
async def get_personalized_insights():
    """Get personalized financial insights after Fi login"""
    try:
        return {
            "personalizedInsights": [
                {
                    "priority": "high",
                    "category": "Investment Growth",
                    "title": "Your Portfolio Performance",
                    "message": "Your investments have grown by 18.5% this year, outperforming the market by 3.2%.",
                    "details": "Your equity allocation of 65% is driving strong returns. Consider rebalancing if it exceeds 70%.",
                    "actionable": True,
                    "action": "Review and rebalance your portfolio"
                },
                {
                    "priority": "medium",
                    "category": "Expense Optimization",
                    "title": "Spending Pattern Analysis",
                    "message": "Your monthly expenses have increased by 8% compared to last quarter.",
                    "details": "Major increase in dining out (₹12,000) and entertainment (₹8,000). Consider setting monthly limits.",
                    "actionable": True,
                    "action": "Set category-wise spending limits"
                },
                {
                    "priority": "high",
                    "category": "Goal Planning",
                    "title": "Home Purchase Goal",
                    "message": "You're 73% towards your home purchase goal of ₹50 lakhs.",
                    "details": "At current savings rate, you'll reach your goal in 14 months. Consider increasing SIP by ₹5,000.",
                    "actionable": True,
                    "action": "Increase monthly SIP contribution"
                },
                {
                    "priority": "low",
                    "category": "Credit Management",
                    "title": "Credit Utilization",
                    "message": "Your credit utilization is at 23% - within the healthy range.",
                    "details": "Maintaining utilization below 30% is helping your credit score. Current score: 785.",
                    "actionable": False,
                    "action": "Continue current credit habits"
                }
            ],
            "summary": {
                "totalInsights": 4,
                "highPriority": 2,
                "actionableItems": 3,
                "overallScore": 8.2,
                "trend": "improving"
            }
        }
    except Exception as e:
        logger.error(f"Error getting personalized insights: {e}")
        return {"error": str(e)}

@app.get("/api/v1/mcp/summary")
async def get_mcp_summary():
    """Get financial summary from MCP data"""
    try:
        db = get_firestore_client()

        # Get financial summaries from Firestore
        summaries = []
        docs = db.collection('financial_summaries').limit(10).stream()

        for doc in docs:
            data = doc.to_dict()
            summaries.append({
                "user_id": doc.id,
                "net_worth": data.get('total_net_worth', 0),
                "credit_score": data.get('credit_score', 0),
                "total_assets": data.get('total_assets', 0),
                "total_liabilities": data.get('total_liabilities', 0),
                "last_updated": data.get('created_at')
            })

        return {
            "status": "success",
            "summary": {
                "total_users": len(summaries),
                "users": summaries,
                "data_source": "firestore"
            }
        }

    except Exception as e:
        logger.error(f"Error getting MCP summary: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

@app.post("/api/v1/mcp/connect")
async def connect_fi_mcp(request: dict):
    """Connect to Fi MCP and sync financial data"""
    try:
        provider = request.get("provider", "fi-money")
        user_id = request.get("user_id", "default_user")

        logger.info(f"Connecting Fi MCP for user: {user_id}, provider: {provider}")

        # Step 1: Attempt to sync Fi MCP data
        try:
            # Try to import Fi MCP client (will fail gracefully if not available)
            try:
                from deltaverse_api.services.fi_mcp_client import get_fi_mcp_client
                from deltaverse_api.services.mcp_service import MCPDataProcessor
                fi_client = await get_fi_mcp_client()
            except ImportError:
                # Fi MCP client not available, use mock data
                fi_client = None

            if fi_client:
                # Real Fi MCP connection
                logger.info("Attempting real Fi MCP connection...")

                # Get financial data
                net_worth_data = await fi_client.get_net_worth()
                portfolio_data = await fi_client.get_portfolio_summary()
                transactions_data = await fi_client.get_recent_transactions(limit=50)

                # Store in Firestore
                db = get_firestore_client()
                user_profile = {
                    "user_id": user_id,
                    "provider": provider,
                    "net_worth": net_worth_data,
                    "portfolio": portfolio_data,
                    "recent_transactions": transactions_data,
                    "last_sync": datetime.now().isoformat(),
                    "data_source": "fi_mcp_server",
                    "sync_status": "success",
                    "connection_timestamp": datetime.now().isoformat()
                }

                doc_ref = db.collection('financial_profiles').document(user_id)
                doc_ref.set(user_profile, merge=True)

                return {
                    "status": "success",
                    "message": f"Successfully connected to {provider}",
                    "data_source": "fi_mcp_server",
                    "user_id": user_id,
                    "sync_details": {
                        "net_worth": net_worth_data.get('total_net_worth', 0) if net_worth_data else 0,
                        "accounts_connected": len(portfolio_data.get('accounts', [])) if portfolio_data else 0,
                        "transactions_synced": len(transactions_data) if transactions_data else 0
                    },
                    "ai_integration": {
                        "enabled": True,
                        "personalized_responses": True,
                        "message": "AI will now provide personalized advice based on your financial data"
                    }
                }

            else:
                # Fallback to mock data for demonstration
                logger.info("Fi MCP client not available, using mock data for demo")

                # Create mock financial profile
                mock_profile = {
                    "user_id": user_id,
                    "provider": provider,
                    "net_worth": {
                        "total_net_worth": 850000,
                        "total_assets": 950000,
                        "total_liabilities": 100000
                    },
                    "portfolio": {
                        "accounts": [
                            {"type": "savings", "balance": 150000},
                            {"type": "mutual_fund", "balance": 400000},
                            {"type": "stocks", "balance": 300000},
                            {"type": "epf", "balance": 100000}
                        ]
                    },
                    "recent_transactions": [
                        {"description": "SIP Investment", "amount": -5000, "category": "investment"},
                        {"description": "Salary Credit", "amount": 75000, "category": "income"},
                        {"description": "Grocery Shopping", "amount": -3500, "category": "food"}
                    ],
                    "last_sync": datetime.now().isoformat(),
                    "data_source": "mock_data",
                    "sync_status": "success",
                    "connection_timestamp": datetime.now().isoformat()
                }

                # Store mock data
                db = get_firestore_client()
                doc_ref = db.collection('financial_profiles').document(user_id)
                doc_ref.set(mock_profile, merge=True)

                logger.info(f"Mock financial profile created for user: {user_id}")

                return {
                    "status": "success",
                    "message": f"Connected to {provider} (Demo Mode)",
                    "data_source": "mock_data",
                    "user_id": user_id,
                    "sync_details": {
                        "net_worth": 850000,
                        "accounts_connected": 4,
                        "transactions_synced": 3
                    },
                    "ai_integration": {
                        "enabled": True,
                        "personalized_responses": True,
                        "message": "AI will now provide personalized advice based on your demo financial data"
                    }
                }

        except Exception as mcp_error:
            logger.error(f"Fi MCP connection error: {str(mcp_error)}")

            # Even if MCP fails, we can still enable AI with general guidance
            return {
                "status": "partial_success",
                "message": f"Connection to {provider} partially successful",
                "error": str(mcp_error),
                "data_source": "ai_only",
                "user_id": user_id,
                "ai_integration": {
                    "enabled": True,
                    "personalized_responses": False,
                    "message": "AI is available for general financial guidance. Connect your account for personalized advice."
                }
            }

    except Exception as e:
        logger.error(f"Error in MCP connect: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to connect to Fi MCP",
            "ai_integration": {
                "enabled": True,
                "personalized_responses": False,
                "message": "AI is still available for general financial guidance"
            }
        }

@app.post("/api/v1/mcp/sync")
async def sync_mcp_data():
    """Sync financial data from Fi Money MCP server"""
    try:
        logger.info("Starting Fi MCP data sync...")

        # Import Fi MCP client
        from deltaverse_api.services.fi_mcp_client import get_fi_mcp_client
        from deltaverse_api.services.mcp_service import MCPDataProcessor

        # Get Fi MCP client
        fi_client = await get_fi_mcp_client()

        if not fi_client:
            logger.warning("Fi MCP client not available, using mock data")
            return {
                "status": "partial_success",
                "message": "Using mock data - Fi MCP server not available",
                "data_source": "mock_data",
                "last_sync": datetime.now().isoformat()
            }

        # Sync financial data from Fi MCP
        try:
            # Get user's financial profile
            net_worth_data = await fi_client.get_net_worth()
            portfolio_data = await fi_client.get_portfolio_summary()
            transactions_data = await fi_client.get_recent_transactions(limit=100)

            # Process and store data
            processor = MCPDataProcessor()

            # Store in Firestore
            db = get_firestore_client()

            # Create/update user financial profile
            user_profile = {
                "user_id": "default_user",  # In production, get from auth
                "net_worth": net_worth_data,
                "portfolio": portfolio_data,
                "recent_transactions": transactions_data,
                "last_sync": datetime.now().isoformat(),
                "data_source": "fi_mcp_server",
                "sync_status": "success"
            }

            # Store in Firestore
            doc_ref = db.collection('financial_profiles').document('default_user')
            doc_ref.set(user_profile, merge=True)

            logger.info("Fi MCP data sync completed successfully")

            return {
                "status": "success",
                "message": "Financial data synced from Fi Money MCP server",
                "data_source": "fi_mcp_server",
                "last_sync": datetime.now().isoformat(),
                "net_worth": net_worth_data.get('total_net_worth', 0) if net_worth_data else 0,
                "accounts_synced": len(portfolio_data.get('accounts', [])) if portfolio_data else 0,
                "transactions_synced": len(transactions_data) if transactions_data else 0
            }

        except Exception as mcp_error:
            logger.error(f"Fi MCP sync error: {str(mcp_error)}")

            # Fallback to mock data with error info
            return {
                "status": "fallback_success",
                "message": "Fi MCP sync failed, using mock data for demonstration",
                "error": str(mcp_error),
                "data_source": "mock_data_fallback",
                "last_sync": datetime.now().isoformat()
            }

    except Exception as e:
        logger.error(f"Error in MCP sync: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "message": "MCP sync failed",
            "last_sync": datetime.now().isoformat()
        }

@app.get("/api/v1/mcp/financial-summary")
async def get_financial_summary():
    """Get personalized financial summary from Fi MCP data"""
    try:
        db = get_firestore_client()

        # Get user's financial profile
        doc_ref = db.collection('financial_profiles').document('default_user')
        doc = doc_ref.get()

        if doc.exists:
            profile_data = doc.to_dict()

            # Extract key metrics
            net_worth = profile_data.get('net_worth', {})
            portfolio = profile_data.get('portfolio', {})

            summary = {
                "status": "success",
                "data_source": profile_data.get('data_source', 'unknown'),
                "last_sync": profile_data.get('last_sync'),
                "financial_summary": {
                    "total_net_worth": net_worth.get('total_net_worth', 0),
                    "total_assets": net_worth.get('total_assets', 0),
                    "total_liabilities": net_worth.get('total_liabilities', 0),
                    "investment_accounts": len(portfolio.get('accounts', [])),
                    "account_types": list(set([acc.get('type') for acc in portfolio.get('accounts', [])])),
                    "sync_status": profile_data.get('sync_status', 'unknown')
                },
                "insights": [
                    f"Net worth: ₹{net_worth.get('total_net_worth', 0):,.2f}",
                    f"Connected accounts: {len(portfolio.get('accounts', []))}",
                    f"Last updated: {profile_data.get('last_sync', 'Never')}"
                ]
            }

            return summary
        else:
            # No data available, suggest connection
            return {
                "status": "no_data",
                "message": "No financial data available. Please connect your Fi Money account.",
                "financial_summary": {
                    "total_net_worth": 0,
                    "total_assets": 0,
                    "total_liabilities": 0,
                    "investment_accounts": 0,
                    "account_types": [],
                    "sync_status": "not_connected"
                },
                "insights": [
                    "Connect your Fi Money account to get personalized insights",
                    "Real-time portfolio tracking available after connection",
                    "Automated expense categorization and analysis"
                ]
            }

    except Exception as e:
        logger.error(f"Error getting financial summary: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to retrieve financial summary"
        }

@app.get("/api/v1/mcp/status")
async def get_mcp_status():
    """Get MCP server status"""
    try:
        return {
            "status": "healthy",
            "mcp_server": "fi_money_mcp",
            "connection": "active",
            "last_check": datetime.now().isoformat(),
            "features": [
                "financial_data_sync",
                "portfolio_analysis",
                "transaction_history",
                "credit_monitoring"
            ]
        }

    except Exception as e:
        logger.error(f"Error getting MCP status: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

# Fi MCP Dev Login Endpoints
@app.get("/api/v1/fi/scenarios")
async def get_fi_scenarios():
    """Get available Fi MCP Dev test scenarios"""
    try:
        scenarios = await fi_mcp_dev_service.get_available_scenarios()
        return {
            "status": "success",
            "scenarios": scenarios,
            "total_scenarios": len(scenarios),
            "server_status": await fi_mcp_dev_service.check_fi_mcp_dev_status()
        }
    except Exception as e:
        logger.error(f"Error getting Fi scenarios: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/fi/login/initiate")
async def initiate_fi_login(
        request: dict,
        firebase_user_id: str = Depends(auth_dependency)
):
    """Initiate Fi login flow with fi-mcp-dev server"""
    try:
        scenario_phone = request.get("scenario_phone", "2222222222")  # Default to full scenario

        logger.info(f"Initiating Fi login for Firebase user: {firebase_user_id}, scenario: {scenario_phone}")

        # Check if fi-mcp-dev server is available
        server_status = await fi_mcp_dev_service.check_fi_mcp_dev_status()
        # Note: We proceed with login initiation regardless of server status
        # The fi_mcp_dev_service can work with mock data even if server is unavailable

        # Initiate real Fi login flow
        login_result = await fi_mcp_dev_service.initiate_fi_login(firebase_user_id, scenario_phone)

        return {
            "status": "login_initiated",
            "message": "Fi login flow started",
            "login_url": login_result.get("login_url"),
            "session_id": login_result.get("session_id"),
            "scenario": login_result.get("scenario", {}),
            "instructions": login_result.get("instructions", []),
            "server_info": server_status
        }

    except Exception as e:
        logger.error(f"Error initiating Fi login: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/fi/login/complete")
async def complete_fi_login(
        request: dict,
        firebase_user_id: str = Depends(auth_dependency)
):
    """Complete Fi login after user authentication"""
    try:
        session_id = request.get("session_id")
        phone_number = request.get("phone_number")

        if not session_id or not phone_number:
            raise HTTPException(status_code=400, detail="session_id and phone_number are required")

        logger.info(f"Completing Fi login for session: {session_id}, phone: {phone_number}")

        # Complete Fi login and fetch data
        login_result = await fi_mcp_dev_service.complete_fi_login(session_id, phone_number)

        # Store user financial profile in Firestore for insights
        if login_result.get("status") == "success":
            db = get_firestore_client()

            # Create comprehensive financial profile based on Fi-MCP scenario
            scenario_profiles = {
                "8888888888": {  # SIP Samurai
                    "portfolio": {"sip_amount": 25000, "equity_allocation": 70, "debt_allocation": 30},
                    "expenses": {"total": 45000, "categories": {"food": 12000, "transport": 8000, "entertainment": 5000}},
                    "income": {"annual": 1200000, "monthly": 100000},
                    "credit_score": 785,
                    "investments": {"mutual_funds": 450000, "stocks": 150000, "fd": 200000},
                    "goals": ["emergency_fund", "home_purchase", "retirement"]
                },
                "2222222222": {  # Full scenario
                    "portfolio": {"sip_amount": 15000, "equity_allocation": 60, "debt_allocation": 40},
                    "expenses": {"total": 35000, "categories": {"food": 10000, "transport": 6000, "entertainment": 4000}},
                    "income": {"annual": 800000, "monthly": 67000},
                    "credit_score": 750,
                    "investments": {"mutual_funds": 300000, "stocks": 100000, "fd": 150000},
                    "goals": ["emergency_fund", "vacation"]
                }
            }

            # Get scenario data or use default
            scenario_data = scenario_profiles.get(phone_number, scenario_profiles["8888888888"])

            # Create user financial profile
            user_profile = {
                "user_id": firebase_user_id,
                "fi_connected": True,
                "sync_status": "success",
                "last_updated": datetime.now().isoformat(),
                "scenario_phone": phone_number,
                "session_id": session_id,
                **scenario_data
            }

            # Store in Firestore
            doc_ref = db.collection('financial_profiles').document(firebase_user_id)
            doc_ref.set(user_profile, merge=True)

            logger.info(f"✅ Financial profile created for user {firebase_user_id} with scenario {phone_number}")

        return {
            "status": "success",
            "message": login_result["message"],
            "user_id": login_result["user_id"],
            "scenario": login_result["scenario"],
            "financial_summary": login_result["financial_summary"],
            "data_source": login_result["data_source"],
            "ai_integration": {
                "enabled": True,
                "personalized_responses": True,
                "message": f"AI will now provide personalized advice based on your {login_result['scenario']['description']}"
            }
        }

    except Exception as e:
        logger.error(f"Error completing Fi login: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/fi/connect")
async def connect_fi_account(request: dict):
    """Enhanced Fi connection with login flow"""
    try:
        user_id = request.get("user_id", "default_user")
        scenario_phone = request.get("scenario_phone", "2222222222")
        login_mode = request.get("login_mode", "auto")  # auto, manual, mock

        logger.info(f"Connecting Fi account for user: {user_id}, mode: {login_mode}")

        if login_mode == "mock":
            # Use existing mock connection
            return await connect_fi_mcp(request)

        elif login_mode == "manual":
            # Return login initiation for manual completion
            return await initiate_fi_login(request)

        else:  # auto mode
            # Check if fi-mcp-dev is available
            server_status = await fi_mcp_dev_service.check_fi_mcp_dev_status()

            # Always use fi_mcp_dev_service for scenario data, regardless of server status
            # Auto-complete login with scenario data
            session_id = f"auto_{user_id}_{datetime.now().timestamp()}"

            # Store auto session
            db = get_firestore_client()
            auto_session = {
                "user_id": user_id,
                "session_id": session_id,
                "scenario_phone": scenario_phone,
                "status": "auto_completed",
                "created_at": datetime.now().isoformat()
            }

            doc_ref = db.collection('fi_login_sessions').document(session_id)
            doc_ref.set(auto_session)

            # Complete login automatically using fi_mcp_dev_service
            login_result = await fi_mcp_dev_service.complete_fi_login(session_id, scenario_phone)

            return {
                "status": "success",
                "message": f"Successfully connected to Fi Money (Auto-login with scenario {scenario_phone})",
                "user_id": login_result["user_id"],
                "scenario": login_result["scenario"],
                "financial_summary": login_result["financial_summary"],
                "data_source": "fi_mcp_dev_auto",
                "ai_integration": {
                    "enabled": True,
                    "personalized_responses": True,
                    "message": f"AI will now provide personalized advice based on your {login_result['scenario']['description']}"
                }
            }

    except Exception as e:
        logger.error(f"Error connecting Fi account: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send_message/")
async def send_message(message: PushMessage):
    """
    Receives a message and publishes it to a Google Cloud Pub/Sub topic asynchronously.
    Environment-aware: Gracefully handles cases where Pub/Sub is not available.

    The message includes the recipient's WhatsApp number and the message content.
    This endpoint does not wait for the message to be acknowledged by the Pub/Sub service.
    """
    # Check if Pub/Sub is available
    if not PUBSUB_AVAILABLE:
        logger.warning("Pub/Sub not available - message queuing disabled")
        return {
            "status": "warning",
            "message": "Message received but Pub/Sub is not available. Install google-cloud-pubsub for full functionality.",
            "recipient": message.recipient_whatsapp_number,
            "environment": os.getenv("ENVIRONMENT", "development")
        }
    
    if not publisher or not topic_path:
        logger.error("Pub/Sub client not initialized")
        raise HTTPException(
            status_code=500,
            detail="Pub/Sub client is not initialized. Check server logs and ensure google-cloud-pubsub is installed."
        )

    try:
        # Construct the message payload as a JSON string
        message_data = {
            "recipient_whatsapp_number": message.recipient_whatsapp_number,
            "message_body": message.message_body,
            "timestamp": datetime.utcnow().isoformat(),
            "environment": os.getenv("ENVIRONMENT", "development")
        }
        # Data must be a bytestring
        data = json.dumps(message_data).encode("utf-8")

        # Publish the message to the Pub/Sub topic.
        # This is a non-blocking call and returns a concurrent.futures.Future.
        future = publisher.publish(topic_path, data)

        # Optional: Add a callback to log the result of the publish operation.
        # This does not block the main request.
        def callback(future):
            try:
                # The result() method on the future will raise an exception if the
                # publish failed.
                message_id = future.result()
                logger.info(f"Successfully published message with ID: {message_id}")
            except Exception as e:
                logger.error(f"Failed to publish message to Pub/Sub: {e}")

        future.add_done_callback(callback)

        return {
            "status": "success",
            "message": "Message has been queued for publishing."
        }

    except Exception as e:
        print(f"Error queueing message for Pub/Sub: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue message for Pub/Sub. Error: {e}"
        )

# Include notifications router if available (added after main endpoints)
if notifications_router and notifications_router is not None:
    try:
        app.include_router(notifications_router)
        logger.info("✅ Notifications router included successfully")
        logger.info("📱 WhatsApp notification endpoints available at /notifications/")
    except Exception as e:
        logger.error(f"❌ Failed to include notifications router: {e}")
else:
    logger.warning("⚠️ Notifications router not available - WhatsApp features disabled")

if __name__ == "__main__":
    # Use PORT from environment (Cloud Run) or default to 8080
    port = int(os.getenv("PORT", "8080"))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)