"""
Real Fi MCP Dev Service
Integrates with the actual fi-mcp-dev server running on port 8080
Uses real MCP protocol for authentic financial data access
"""

import asyncio
import httpx
import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from firebase_config import get_firestore_client
from fi_mcp_client import fi_mcp_client

logger = logging.getLogger(__name__)

class RealFiMCPDevService:
    """Service to integrate with real fi-mcp-dev server using MCP protocol"""
    
    def __init__(self):
        # Real Fi MCP Dev server configuration
        self.fi_mcp_client = fi_mcp_client
        self.sessions = {}  # Track active sessions
        
        # Available test scenarios from fi-mcp-dev README
        self.test_scenarios = {
            "1111111111": "No assets connected. Only saving account balance present",
            "2222222222": "All assets connected (Banks account, EPF, Indian stocks, US stocks, Credit report). Large mutual fund portfolio with 9 funds",
            "3333333333": "All assets connected (Banks account, EPF, Indian stocks, US stocks, Credit report). Small mutual fund portfolio with only 1 fund",
            "4444444444": "All assets connected (Banks account, EPF, Indian stocks, US stocks). Small mutual fund portfolio with only 1 fund. With 2 UAN account connected. With 3 different bank with multiple account in them. Only have transactions for 2 bank accounts",
            "5555555555": "All assets connected except credit score (Banks account, EPF, Indian stocks, US stocks). Small mutual fund portfolio with only 1 fund. With 3 different bank with multiple account in them. Only have transactions for 2 bank accounts",
            "6666666666": "All assets connected except bank account (EPF, Indian stocks, US stocks). Large mutual fund portfolio with 9 funds. No bank account connected",
            "7777777777": "Debt-Heavy Low Performer. A user with mostly underperforming mutual funds, high liabilities (credit card & personal loans). Poor MF returns (XIRR < 5%). No diversification (all equity, few funds). Credit score < 650. High credit card usage, multiple loans. Negligible net worth or negative.",
            "8888888888": "SIP Samurai. Consistently invests every month in multiple mutual funds via SIP. 3–5 active SIPs in MFs. Moderate returns (XIRR 8–12%).",
            "9999999999": "Fixed Income Fanatic. Strong preference for low-risk investments like debt mutual funds and fixed deposits. 80% of investments in debt MFs. Occasional gold ETF (Optional). Consistent but slow net worth growth (XIRR ~ 8-10%).",
            "1010101010": "Precious Metal Believer. High allocation to gold and fixed deposits, minimal equity exposure. Gold MFs/ETFs ~50% of investment. Conservative SIPs in gold funds. FDs and recurring deposits. Minimal equity exposure.",
            "1212121212": "Dormant EPF Earner. Has EPF account but employer stopped contributing; balance stagnant. EPF balance > ₹2 lakh. Interest not being credited. No private investment.",
            "1414141414": "Salary Sinkhole. User's salary is mostly consumed by EMIs and credit card bills. Salary credit every month. 70% goes to EMIs and credit card dues. Low or zero investment. Credit score ~600–650.",
            "1313131313": "Balanced Growth Tracker. Well-diversified portfolio with EPF, MFs, stocks, and some US exposure. High EPF contribution. SIPs in equity & hybrid MFs. International MFs/ETFs 10–20%. Healthy net worth growth. Good credit score (750+).",
            "2020202020": "Starter Saver. Recently started investing, low ticket sizes, few transactions. Just 1–2 MFs, started < 6 months ago. SIP ₹500–₹1000. Minimal bank balance, no debt.",
            "1515151515": "Ghost Portfolio. Has old investments but hasn't made any changes in years. No MF purchase/redemption in 3 years. EPF stagnant or partially withdrawn. No SIPs or salary inflow. Flat or declining net worth.",
            "1616161616": "Early Retirement Dreamer. Optimizing investments to retire by 40. High savings rate, frugal lifestyle. Aggressive equity exposure (80–90%). Lean monthly expenses. Heavy SIPs + NPS + EPF contributions. No loans, no luxury spending. Targets 30x yearly expenses net worth.",
            "1717171717": "The Swinger. Regularly buys/sells MFs and stocks, seeks short-term gains. Many MF redemptions within 6 months. Equity funds only, high churn. No SIPs. Short holding periods. High txn volume in bank account.",
            "1818181818": "Passive Contributor. No personal income, but has EPF from a past job and joint bank accounts. Old EPF, no current contributions. No active SIPs. Transactions reflect shared household spending. No credit score record (no loans/credit card).",
            "1919191919": "Section 80C Strategist. Uses ELSS, EPF, NPS primarily to optimize taxes. ELSS SIPs in Q4 (Jan–Mar). EPF active. NPS data if available. No non-tax-saving investments. Low-risk debt funds as balance.",
            "2121212121": "Dual Income Dynamo. Has freelance + salary income; cash flow is uneven but investing steadily. Salary + multiple credits from UPI apps. MF investments irregular but increasing. High liquidity in bank accounts. Credit score above 700. Occasional business loans or overdraft.",
            "2222222222": "Sudden Wealth Receiver. Recently inherited wealth, learning how to manage it. Lump sum investments across categories. High idle cash in bank. Recent MF purchases, no SIPs yet. No credit history or debt. EPF missing or dormant.",
            "2323232323": "Overseas Optimizer. NRI who continues to manage Indian EPF, MFs, and bank accounts. Large EPF corpus. No salary inflows, occasional foreign remittances. MF transactions in bulk. Indian address missing or outdated. No credit card usage in India.",
            "2424242424": "Mattress Money Mindset. Doesn't trust the market; everything is in bank savings and FDs. 95% net worth in FDs/savings. No mutual funds or stocks. EPF maybe present. No debt or credit score. Low but consistent net worth growth.",
            "2525252525": "Live-for-Today. High income but spends it all. Investments are negligible or erratic. Salary > ₹2L/month. High food, shopping, travel spends. No SIPs, maybe one-time MF buy. Credit card dues often roll over. Credit score < 700, low or zero net worth."
        }
        
        # Available MCP tools
        self.available_tools = [
            "fetch_net_worth",
            "fetch_credit_report", 
            "fetch_epf_details",
            "fetch_mf_transactions",
            "fetch_bank_transactions",
            "fetch_stock_transactions"
        ]
    
    async def check_fi_mcp_dev_status(self) -> Dict[str, Any]:
        """Check if the real Fi MCP dev server is running"""
        try:
            status = self.fi_mcp_client.check_server_status()
            return {
                "status": status["status"],
                "server": "fi-mcp-dev-real",
                "url": self.fi_mcp_client.mcp_url,
                "message": status["message"],
                "available_tools": self.available_tools
            }
        except Exception as e:
            logger.error(f"Error checking Fi MCP dev status: {e}")
            return {
                "status": "error",
                "server": "fi-mcp-dev-real", 
                "error": str(e)
            }
    
    async def get_available_scenarios(self) -> Dict[str, str]:
        """Get available test scenarios"""
        return self.test_scenarios
    
    async def initiate_fi_login(self, user_id: str, scenario_phone: str = "2222222222") -> Dict[str, Any]:
        """Initiate Fi login flow with real MCP server"""
        try:
            # Generate session ID
            session_id = f"fi-session-{uuid.uuid4()}"
            
            # Store session info
            self.sessions[session_id] = {
                "user_id": user_id,
                "scenario_phone": scenario_phone,
                "created_at": datetime.now(),
                "status": "initiated"
            }
            
            # Get login URL from real MCP client
            login_url = self.fi_mcp_client.get_login_url(session_id)
            
            return {
                "session_id": session_id,
                "login_url": login_url,
                "scenario": {
                    "phone": scenario_phone,
                    "description": self.test_scenarios.get(scenario_phone, "Unknown scenario")
                },
                "instructions": [
                    f"1. Click the login URL: {login_url}",
                    f"2. Enter phone number: {scenario_phone}",
                    "3. Enter any 6-digit OTP (e.g., 123456)",
                    "4. Complete authentication",
                    "5. Return to DeltaVerse for financial data access"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error initiating Fi login: {e}")
            raise Exception(f"Failed to initiate Fi login: {e}")
    
    async def complete_fi_login(self, session_id: str, phone_number: str) -> Dict[str, Any]:
        """Complete Fi login and fetch initial data - Fixed for correct Fi-MCP flow"""
        try:
            if session_id not in self.sessions:
                # Create session info if it doesn't exist (for direct Fi-MCP flow)
                self.sessions[session_id] = {
                    "user_id": "fi_mcp_user",  # Generic user for Fi-MCP sessions
                    "scenario_phone": phone_number,
                    "created_at": datetime.now(),
                    "status": "initiated"
                }
            
            session_info = self.sessions[session_id]
            
            # Update session status with Fi-MCP authentication
            session_info["status"] = "authenticated"
            session_info["phone_number"] = phone_number
            session_info["authenticated_at"] = datetime.now()
            
            # The Fi-MCP server should now have the session authenticated
            # Try to fetch net worth as a test
            net_worth_result = self.fi_mcp_client.get_financial_data("fetch_net_worth", session_id)
            
            scenario_info = self.test_scenarios.get(phone_number, "Unknown scenario")
            
            if net_worth_result.get("success"):
                return {
                    "status": "success",
                    "message": "Fi login completed successfully",
                    "user_id": session_info.get("user_id", "fi_mcp_user"),
                    "scenario": {
                        "phone": phone_number,
                        "description": scenario_info
                    },
                    "financial_summary": {
                        "net_worth": net_worth_result.get("data", {}),
                        "data_source": "fi-mcp-dev-real"
                    },
                    "data_source": "fi-mcp-dev-real"
                }
            elif net_worth_result.get("requires_authentication"):
                return {
                    "status": "authentication_pending", 
                    "message": "Please complete authentication in the Fi-MCP popup window",
                    "user_id": session_info.get("user_id", "fi_mcp_user"),
                    "scenario": {
                        "phone": phone_number,
                        "description": scenario_info
                    },
                    "financial_summary": {},
                    "data_source": "fi-mcp-dev-real",
                    "login_url": net_worth_result.get("login_url")
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to fetch data: {net_worth_result.get('error', 'Unknown error')}",
                    "user_id": session_info.get("user_id", "fi_mcp_user"),
                    "scenario": {
                        "phone": phone_number, 
                        "description": scenario_info
                    },
                    "financial_summary": {},
                    "data_source": "fi-mcp-dev-real"
                }
                
        except Exception as e:
            logger.error(f"Error completing Fi login: {e}")
            raise Exception(f"Failed to complete Fi login: {e}")
    
    async def get_financial_data(self, session_id: str, data_type: str = "net_worth") -> Dict[str, Any]:
        """Get financial data using real MCP tools"""
        try:
            if session_id not in self.sessions:
                raise Exception("Invalid session ID")
            
            # Map data types to MCP tools
            tool_mapping = {
                "net_worth": "fetch_net_worth",
                "credit_report": "fetch_credit_report",
                "epf_details": "fetch_epf_details", 
                "mf_transactions": "fetch_mf_transactions",
                "bank_transactions": "fetch_bank_transactions",
                "stock_transactions": "fetch_stock_transactions"
            }
            
            tool_name = tool_mapping.get(data_type, "fetch_net_worth")
            
            # Call the MCP tool
            result = self.fi_mcp_client.get_financial_data(tool_name, session_id)
            
            if result.get("success"):
                return {
                    "status": "success",
                    "data_type": data_type,
                    "tool_name": tool_name,
                    "data": result["data"],
                    "session_id": session_id
                }
            elif result.get("requires_authentication"):
                return {
                    "status": "authentication_required",
                    "login_url": result["login_url"],
                    "message": "Please authenticate with Fi Money first",
                    "session_id": session_id
                }
            else:
                return {
                    "status": "error",
                    "error": result.get("error", "Unknown error"),
                    "session_id": session_id
                }
                
        except Exception as e:
            logger.error(f"Error getting financial data: {e}")
            return {
                "status": "error",
                "error": str(e),
                "session_id": session_id
            }
    
    async def get_all_financial_data(self, session_id: str) -> Dict[str, Any]:
        """Get all available financial data for a session"""
        try:
            if session_id not in self.sessions:
                raise Exception("Invalid session ID")
            
            # Use the MCP client to get all data
            result = self.fi_mcp_client.get_all_financial_data(session_id)
            
            if result.get("success"):
                return {
                    "status": "success",
                    "session_id": session_id,
                    "phone_number": self.sessions[session_id].get("phone_number"),
                    "scenario": self.sessions[session_id].get("scenario_phone"),
                    "data": result["data"],
                    "errors": result.get("errors")
                }
            elif result.get("requires_authentication"):
                return {
                    "status": "authentication_required",
                    "login_url": result["login_url"],
                    "message": "Please authenticate with Fi Money first",
                    "session_id": session_id
                }
            else:
                return {
                    "status": "error",
                    "error": result.get("error", "Unknown error"),
                    "session_id": session_id
                }
                
        except Exception as e:
            logger.error(f"Error getting all financial data: {e}")
            return {
                "status": "error",
                "error": str(e),
                "session_id": session_id
            }
    
    async def cleanup_expired_sessions(self):
        """Clean up expired sessions (older than 1 hour)"""
        try:
            current_time = datetime.now()
            expired_sessions = []
            
            for session_id, session_info in self.sessions.items():
                if current_time - session_info["created_at"] > timedelta(hours=1):
                    expired_sessions.append(session_id)
            
            for session_id in expired_sessions:
                del self.sessions[session_id]
                
            logger.info(f"Cleaned up {len(expired_sessions)} expired Fi MCP sessions")
            
        except Exception as e:
            logger.error(f"Error cleaning up sessions: {e}")

# Global instance
real_fi_mcp_dev_service = RealFiMCPDevService()

async def test_real_fi_mcp_service():
    """Test the real Fi MCP service"""
    print("🔗 Testing Real Fi MCP Service")
    print("=" * 50)
    
    # Test server status
    status = await real_fi_mcp_dev_service.check_fi_mcp_dev_status()
    print(f"Server Status: {status}")
    
    # Test scenarios
    scenarios = await real_fi_mcp_dev_service.get_available_scenarios()
    print(f"\nAvailable Scenarios: {len(scenarios)}")
    
    # Test login initiation
    login_result = await real_fi_mcp_dev_service.initiate_fi_login("test_user", "2222222222")
    print(f"\nLogin Initiated: {login_result['session_id']}")
    print(f"Login URL: {login_result['login_url']}")
    
    return True

if __name__ == "__main__":
    asyncio.run(test_real_fi_mcp_service())
