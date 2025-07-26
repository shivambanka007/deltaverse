from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional
import logging
import os
import sys
import importlib.util
import asyncio
import aiohttp
import json
from datetime import datetime

# Completely bypass the services/__init__.py import chain by importing modules directly
def import_module_directly(module_name, file_path):
    """Import a module directly from file path to avoid import chain issues"""
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

# Get the base app directory
app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Import models directly
models_path = os.path.join(app_dir, "models", "financial_health.py")
models_module = import_module_directly("financial_health_models", models_path)
FinancialHealthScore = models_module.FinancialHealthScore
ScoreComponent = models_module.ScoreComponent
Recommendation = models_module.Recommendation

# Import database models
history_models_path = os.path.join(app_dir, "models", "financial_health_history.py")
history_models_module = import_module_directly("financial_health_history", history_models_path)
FinancialHealthHistory = history_models_module.FinancialHealthHistory
financial_health_db = history_models_module.financial_health_db

# Import FinancialHealthService directly
health_service_path = os.path.join(app_dir, "services", "financial_health_service.py")
health_service_module = import_module_directly("financial_health_service", health_service_path)
FinancialHealthService = health_service_module.FinancialHealthService

# Simple mock authentication for development - bypasses firebase_auth completely
def mock_get_current_user():
    """Mock authentication function for development"""
    return {"uid": "dev_user_123", "email": "dev@example.com"}

# Real Fi-MCP client with fallback to mock
import aiohttp
import json
from typing import Optional

# Environment-based Fi-MCP configuration
def get_fi_mcp_server_url() -> str:
    """Get Fi-MCP server URL based on environment"""
    environment = os.getenv('ENVIRONMENT', 'development')
    
    if environment == 'production':
        return os.getenv('FI_MCP_SERVER_URL', 'https://fi-mcp.deltaverse.app')
    else:
        return os.getenv('FI_MCP_SERVER_URL', 'http://localhost:8080')

class FiMcpClient:
    """Real Fi-MCP client with fallback to mock data"""
    
    def __init__(self, base_url: str = None, session_id: Optional[str] = None):
        self.base_url = base_url or get_fi_mcp_server_url()
        self.session_id = session_id or f"mcp-session-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        self.headers = {
            "Content-Type": "application/json",
            "Mcp-Session-Id": self.session_id
        }
        
        # Log configuration for debugging
        environment = os.getenv('ENVIRONMENT', 'development')
        print(f"🔧 Fi-MCP Client initialized:")
        print(f"   Environment: {environment}")
        print(f"   Server URL: {self.base_url}")
        print(f"   Session ID: {self.session_id}")
    
    async def _make_mcp_request(self, tool_name: str, arguments: Dict = None) -> Dict:
        """Make a request to Fi-MCP server"""
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments or {}
            }
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/mcp/stream",
                    headers=self.headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        if "result" in result and "content" in result["result"]:
                            return result["result"]["content"][0]["text"]
                        elif "login_url" in result:
                            logger.warning(f"Fi-MCP authentication required: {result['login_url']}")
                            return None
                    else:
                        logger.error(f"Fi-MCP request failed with status {response.status}")
                        return None
        except Exception as e:
            logger.error(f"Fi-MCP request error: {str(e)}")
            return None
    
    async def get_net_worth(self) -> Optional[Dict]:
        """Fetch net worth data from Fi-MCP"""
        return await self._make_mcp_request("fetch_net_worth")
    
    async def get_credit_report(self) -> Optional[Dict]:
        """Fetch credit report from Fi-MCP"""
        return await self._make_mcp_request("fetch_credit_report")
    
    async def get_bank_transactions(self) -> Optional[Dict]:
        """Fetch bank transactions from Fi-MCP"""
        return await self._make_mcp_request("fetch_bank_transactions")
    
    async def get_mf_transactions(self) -> Optional[Dict]:
        """Fetch mutual fund transactions from Fi-MCP"""
        return await self._make_mcp_request("fetch_mf_transactions")
    
    async def get_epf_details(self) -> Optional[Dict]:
        """Fetch EPF details from Fi-MCP"""
        return await self._make_mcp_request("fetch_epf_details")
    
    async def get_user_financial_data(self, user_id: str, phone_number: str = "2222222222") -> Dict:
        """Get comprehensive financial data from Fi-MCP with fallback to mock"""
        try:
            # Try to fetch real data from Fi-MCP
            net_worth_data = await self.get_net_worth()
            credit_data = await self.get_credit_report()
            bank_data = await self.get_bank_transactions()
            mf_data = await self.get_mf_transactions()
            epf_data = await self.get_epf_details()
            
            if net_worth_data:
                # Parse real Fi-MCP data
                net_worth = json.loads(net_worth_data) if isinstance(net_worth_data, str) else net_worth_data
                credit_report = json.loads(credit_data) if isinstance(credit_data, str) and credit_data else {}
                
                return self._parse_fi_mcp_data(net_worth, credit_report, user_id)
            else:
                logger.warning("Fi-MCP data not available, using mock data")
                return self._get_mock_data_by_scenario(phone_number, user_id)
                
        except Exception as e:
            logger.error(f"Error fetching Fi-MCP data: {str(e)}")
            return self._get_mock_data_by_scenario(phone_number, user_id)
    
    def _parse_fi_mcp_data(self, net_worth: Dict, credit_report: Dict, user_id: str) -> Dict:
        """Parse real Fi-MCP data into our expected format"""
        try:
            # Extract net worth components
            assets = net_worth.get("netWorthResponse", {}).get("assetValues", [])
            liabilities = net_worth.get("netWorthResponse", {}).get("liabilityValues", [])
            
            # Calculate totals
            total_assets = sum(float(asset.get("value", {}).get("units", 0)) for asset in assets)
            total_liabilities = sum(float(liability.get("value", {}).get("units", 0)) for liability in liabilities)
            
            # Extract specific asset types
            mf_amount = next((float(a.get("value", {}).get("units", 0)) for a in assets 
                            if a.get("netWorthAttribute") == "ASSET_TYPE_MUTUAL_FUND"), 0)
            epf_amount = next((float(a.get("value", {}).get("units", 0)) for a in assets 
                             if a.get("netWorthAttribute") == "ASSET_TYPE_EPF"), 0)
            savings_amount = next((float(a.get("value", {}).get("units", 0)) for a in assets 
                                 if a.get("netWorthAttribute") == "ASSET_TYPE_SAVINGS_ACCOUNTS"), 0)
            equity_amount = next((float(a.get("value", {}).get("units", 0)) for a in assets 
                                if a.get("netWorthAttribute") == "ASSET_TYPE_INDIAN_SECURITIES"), 0)
            
            # Extract credit score
            credit_score = 720  # Default
            if credit_report and "creditReports" in credit_report:
                score_data = credit_report["creditReports"][0].get("creditReportData", {}).get("score", {})
                credit_score = int(score_data.get("bureauScore", 720))
            
            # Estimate monthly income and expenses (simplified calculation)
            estimated_monthly_income = max(80000, total_assets * 0.1)  # Rough estimate
            estimated_monthly_expenses = estimated_monthly_income * 0.75  # Assume 75% expense ratio
            estimated_monthly_savings = estimated_monthly_income - estimated_monthly_expenses
            
            return {
                "user_id": user_id,
                "income": {
                    "monthly_average": estimated_monthly_income,
                    "annual": estimated_monthly_income * 12
                },
                "savings": {
                    "monthly_average": estimated_monthly_savings,
                    "emergency_fund": savings_amount
                },
                "expenses": {
                    "monthly_average": estimated_monthly_expenses
                },
                "liabilities": {
                    "total": total_liabilities
                },
                "investments": {
                    "portfolio": [
                        {"asset_class": "equity", "amount": equity_amount},
                        {"asset_class": "debt", "amount": mf_amount * 0.3},  # Assume 30% debt
                        {"asset_class": "mutual_funds", "amount": mf_amount},
                        {"asset_class": "epf", "amount": epf_amount}
                    ]
                },
                "credit": {
                    "score": credit_score
                },
                "raw_data": {
                    "net_worth": net_worth,
                    "credit_report": credit_report
                }
            }
        except Exception as e:
            logger.error(f"Error parsing Fi-MCP data: {str(e)}")
            return self._get_mock_data_by_scenario("2222222222", user_id)
    
    def _get_mock_data_by_scenario(self, phone_number: str, user_id: str) -> Dict:
        """Get mock data based on user scenario"""
        scenarios = {
            "1111111111": {  # No assets connected
                "income": {"monthly_average": 50000, "annual": 600000},
                "savings": {"monthly_average": 5000, "emergency_fund": 50000},
                "expenses": {"monthly_average": 45000},
                "liabilities": {"total": 0},
                "investments": {"portfolio": []},
                "credit": {"score": 650}
            },
            "2222222222": {  # All assets connected, large portfolio
                "income": {"monthly_average": 120000, "annual": 1440000},
                "savings": {"monthly_average": 25000, "emergency_fund": 300000},
                "expenses": {"monthly_average": 95000},
                "liabilities": {"total": 500000},
                "investments": {"portfolio": [
                    {"asset_class": "equity", "amount": 800000},
                    {"asset_class": "debt", "amount": 400000},
                    {"asset_class": "mutual_funds", "amount": 600000},
                    {"asset_class": "epf", "amount": 300000}
                ]},
                "credit": {"score": 780}
            },
            "7777777777": {  # Debt-heavy low performer
                "income": {"monthly_average": 60000, "annual": 720000},
                "savings": {"monthly_average": 2000, "emergency_fund": 20000},
                "expenses": {"monthly_average": 58000},
                "liabilities": {"total": 2000000},
                "investments": {"portfolio": [
                    {"asset_class": "equity", "amount": 50000},
                    {"asset_class": "debt", "amount": 30000}
                ]},
                "credit": {"score": 580}
            },
            "8888888888": {  # SIP Samurai
                "income": {"monthly_average": 85000, "annual": 1020000},
                "savings": {"monthly_average": 20000, "emergency_fund": 200000},
                "expenses": {"monthly_average": 65000},
                "liabilities": {"total": 800000},
                "investments": {"portfolio": [
                    {"asset_class": "equity", "amount": 400000},
                    {"asset_class": "debt", "amount": 200000},
                    {"asset_class": "mutual_funds", "amount": 500000}
                ]},
                "credit": {"score": 720}
            },
            "1616161616": {  # Early retirement dreamer
                "income": {"monthly_average": 150000, "annual": 1800000},
                "savings": {"monthly_average": 75000, "emergency_fund": 500000},
                "expenses": {"monthly_average": 75000},
                "liabilities": {"total": 200000},
                "investments": {"portfolio": [
                    {"asset_class": "equity", "amount": 1500000},
                    {"asset_class": "debt", "amount": 200000},
                    {"asset_class": "mutual_funds", "amount": 1000000},
                    {"asset_class": "epf", "amount": 400000}
                ]},
                "credit": {"score": 800}
            }
        }
        
        scenario_data = scenarios.get(phone_number, scenarios["2222222222"])
        scenario_data["user_id"] = user_id
        return scenario_data

router = APIRouter(prefix="/api/v1/financial-health", tags=["Financial Health"])
logger = logging.getLogger(__name__)

@router.get("/score", response_model=FinancialHealthScore)
async def get_financial_health_score(
    phone_number: str = "2222222222",
    current_user: Dict = Depends(mock_get_current_user)
):
    """
    Calculate and return the user's financial health score with component breakdowns
    and personalized recommendations for improvement.
    
    Args:
        phone_number: Fi-MCP test scenario phone number (default: 2222222222)
    """
    try:
        user_id = current_user.get("uid")
        logger.info(f"Calculating financial health score for user {user_id} with scenario {phone_number}")
        
        # Get financial data from Fi-MCP (with fallback to mock)
        fi_mcp_client = FiMcpClient()
        financial_data = await fi_mcp_client.get_user_financial_data(user_id, phone_number)
        
        # Calculate financial health score
        health_service = FinancialHealthService()
        health_score = health_service.calculate_health_score(financial_data)
        
        # Save to database
        try:
            history_entry = FinancialHealthHistory(
                user_id=user_id,
                phone_number=phone_number,
                overall_score=health_score.overall_score,
                components=[comp.dict() for comp in health_score.components],
                recommendations=[rec.dict() for rec in health_score.recommendations],
                raw_financial_data=financial_data,
                calculated_at=datetime.now(),
                fi_mcp_session_id=fi_mcp_client.session_id
            )
            await financial_health_db.save_health_score(history_entry)
            logger.info(f"Saved health score to database for user {user_id}")
        except Exception as db_error:
            logger.error(f"Failed to save to database: {str(db_error)}")
            # Continue without failing the request
        
        return health_score
    except Exception as e:
        logger.error(f"Error calculating financial health score: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate financial health score: {str(e)}")

@router.get("/scenarios", response_model=List[Dict])
async def get_available_scenarios():
    """
    Get list of available Fi-MCP test scenarios
    """
    scenarios = [
        {"phone_number": "1111111111", "name": "No Assets Connected", "description": "Only saving account balance present"},
        {"phone_number": "2222222222", "name": "All Assets Connected", "description": "Banks, EPF, stocks, credit report, large MF portfolio"},
        {"phone_number": "3333333333", "name": "Small Portfolio", "description": "All assets connected with small MF portfolio"},
        {"phone_number": "7777777777", "name": "Debt-Heavy Low Performer", "description": "High liabilities, poor MF returns, low credit score"},
        {"phone_number": "8888888888", "name": "SIP Samurai", "description": "Consistent monthly investments via SIP"},
        {"phone_number": "9999999999", "name": "Fixed Income Fanatic", "description": "Strong preference for low-risk investments"},
        {"phone_number": "1616161616", "name": "Early Retirement Dreamer", "description": "Optimizing investments to retire by 40"},
        {"phone_number": "1414141414", "name": "Salary Sinkhole", "description": "70% salary goes to EMIs and credit card bills"},
        {"phone_number": "1313131313", "name": "Balanced Growth Tracker", "description": "Well-diversified portfolio with healthy growth"},
        {"phone_number": "2020202020", "name": "Starter Saver", "description": "Recently started investing, low ticket sizes"}
    ]
    return scenarios

@router.get("/mock-score", response_model=FinancialHealthScore)
async def get_mock_financial_health_score(phone_number: str = "2222222222"):
    """
    Return a mock financial health score for testing or when Fi-MCP data is not available.
    
    Args:
        phone_number: Fi-MCP test scenario phone number (default: 2222222222)
    """
    try:
        # Create Fi-MCP client and get mock data for scenario
        fi_mcp_client = FiMcpClient()
        mock_data = fi_mcp_client._get_mock_data_by_scenario(phone_number, "mock-user")
        
        # Calculate financial health score
        health_service = FinancialHealthService()
        health_score = health_service.calculate_health_score(mock_data)
        
        return health_score
    except Exception as e:
        logger.error(f"Error calculating mock financial health score: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate mock financial health score: {str(e)}")

@router.get("/history", response_model=List[Dict])
async def get_user_financial_health_history(
    limit: int = 30,
    current_user: Dict = Depends(mock_get_current_user)
):
    """Get user's financial health score history"""
    try:
        user_id = current_user.get("uid")
        history = await financial_health_db.get_user_history(user_id, limit)
        
        # Convert to dict format for response
        history_data = []
        for entry in history:
            history_data.append({
                "overall_score": entry.overall_score,
                "calculated_at": entry.calculated_at.isoformat(),
                "phone_number": entry.phone_number,
                "components_count": len(entry.components),
                "recommendations_count": len(entry.recommendations)
            })
        
        return history_data
    except Exception as e:
        logger.error(f"Error getting user history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get user history: {str(e)}")

@router.get("/historical-scores", response_model=Dict[str, float])
async def get_historical_scores(
    days: int = 90,
    current_user: Dict = Depends(mock_get_current_user)
):
    """Get historical scores for chart display"""
    try:
        user_id = current_user.get("uid")
        historical_scores = await financial_health_db.get_historical_scores(user_id, days)
        return historical_scores
    except Exception as e:
        logger.error(f"Error getting historical scores: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get historical scores: {str(e)}")

@router.get("/fi-mcp-status")
async def check_fi_mcp_status():
    """Check if Fi-MCP server is available"""
    try:
        fi_mcp_client = FiMcpClient()
        
        # Try to make a simple tools/list request to check connectivity
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list",
            "params": {}
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{fi_mcp_client.base_url}/mcp/stream",
                headers=fi_mcp_client.headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=5)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    
                    # Check if we got a login URL (authentication required)
                    if isinstance(result, dict) and "login_url" in result:
                        return {
                            "status": "authentication_required",
                            "url": fi_mcp_client.base_url,
                            "message": "Fi-MCP server is running but requires authentication",
                            "login_url": result.get("login_url"),
                            "session_id": fi_mcp_client.session_id
                        }
                    # Check if we got tools list (already authenticated)
                    elif isinstance(result, dict) and "result" in result:
                        return {
                            "status": "available",
                            "url": fi_mcp_client.base_url,
                            "message": "Fi-MCP server is running and authenticated",
                            "session_id": fi_mcp_client.session_id
                        }
                    else:
                        return {
                            "status": "available",
                            "url": fi_mcp_client.base_url,
                            "message": "Fi-MCP server is running",
                            "session_id": fi_mcp_client.session_id
                        }
                else:
                    # Check if it's a text response (like "Invalid session ID")
                    response_text = await response.text()
                    if "Invalid session ID" in response_text:
                        return {
                            "status": "authentication_required",
                            "url": fi_mcp_client.base_url,
                            "message": "Fi-MCP server is running but session is invalid",
                            "session_id": fi_mcp_client.session_id
                        }
                    else:
                        return {
                            "status": "unavailable",
                            "url": fi_mcp_client.base_url,
                            "message": f"Fi-MCP server returned status {response.status}: {response_text}"
                        }
    except aiohttp.ClientConnectorError:
        return {
            "status": "unavailable",
            "url": "http://localhost:8080",
            "message": "Fi-MCP server is not running. Please start it with: cd fi-mcp-dev-master && FI_MCP_PORT=8080 go run ."
        }
    except Exception as e:
        return {
            "status": "unavailable",
            "url": "http://localhost:8080",
            "message": f"Fi-MCP server not reachable: {str(e)}"
        }

@router.post("/fi-mcp-connect")
async def connect_to_fi_mcp(phone_number: str = "2222222222"):
    """Initiate connection to Fi-MCP server with authentication"""
    try:
        fi_mcp_client = FiMcpClient()
        
        # Try to fetch data which will trigger authentication if needed
        result = await fi_mcp_client.get_net_worth()
        
        if result is None:
            # Check if we need authentication
            status_response = await check_fi_mcp_status()
            if status_response.get("status") == "authentication_required":
                return {
                    "status": "authentication_required",
                    "message": "Please complete authentication in the browser",
                    "login_url": status_response.get("login_url"),
                    "session_id": status_response.get("session_id"),
                    "instructions": f"1. Open the login URL\n2. Enter phone number: {phone_number}\n3. Enter any OTP/passcode\n4. Return here and refresh"
                }
            else:
                return {
                    "status": "error",
                    "message": "Failed to connect to Fi-MCP server"
                }
        else:
            return {
                "status": "connected",
                "message": "Successfully connected to Fi-MCP server",
                "session_id": fi_mcp_client.session_id,
                "data_available": True
            }
    except Exception as e:
        logger.error(f"Error connecting to Fi-MCP: {str(e)}")
        return {
            "status": "error",
            "message": f"Connection failed: {str(e)}"
        }

@router.delete("/user-data")
async def delete_user_financial_data(current_user: Dict = Depends(mock_get_current_user)):
    """Delete all financial health data for the current user"""
    try:
        user_id = current_user.get("uid")
        success = await financial_health_db.delete_user_data(user_id)
        
        if success:
            return {"message": f"All financial health data deleted for user {user_id}"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete user data")
    except Exception as e:
        logger.error(f"Error deleting user data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete user data: {str(e)}")

@router.get("/health")
async def financial_health_service_health():
    """Health check endpoint for the financial health service"""
    return {
        "status": "healthy",
        "service": "financial_health",
        "timestamp": datetime.now().isoformat(),
        "message": "Financial Health Score service is running"
    }
