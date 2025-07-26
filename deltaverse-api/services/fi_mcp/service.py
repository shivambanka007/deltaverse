from typing import Dict, Any, Optional
from .client import FiMCPClient, FiMCPError
import logging

logger = logging.getLogger(__name__)

class FiMCPService:
    def __init__(self):
        self.client = FiMCPClient()
        self._test_scenarios = {
            "8888888888": {
                "name": "SIP Samurai",
                "description": "Consistent SIP investor with moderate returns",
                "features": ["3-5 active SIPs", "8-12% XIRR", "Monthly investments"]
            },
            "2222222222": {
                "name": "Full Portfolio",
                "description": "Comprehensive portfolio with all assets",
                "features": ["9 mutual funds", "All assets connected", "Complete profile"]
            },
            "7777777777": {
                "name": "Debt-Heavy Profile",
                "description": "High liabilities and underperforming funds",
                "features": ["Poor returns", "High debt", "Credit score < 650"]
            },
            "1313131313": {
                "name": "Balanced Growth",
                "description": "Well-diversified portfolio with good growth",
                "features": ["Diversified assets", "Credit score 750+", "International exposure"]
            }
        }

    def get_available_scenarios(self) -> Dict[str, Any]:
        """Get available test scenarios"""
        return self._test_scenarios

    async def initiate_login(self, phone_number: str) -> Dict[str, Any]:
        """Initiate Fi-MCP login"""
        try:
            # Verify phone number is a valid test scenario
            if phone_number not in self._test_scenarios:
                return {
                    "status": "error",
                    "message": "Invalid test scenario phone number",
                    "available_scenarios": list(self._test_scenarios.keys())
                }

            # Make initial request to get login URL
            response = await self.client.get_net_worth()
            
            if "login_url" in response:
                return {
                    "status": "auth_required",
                    "login_url": response["login_url"],
                    "scenario": self._test_scenarios[phone_number]
                }
            
            return {
                "status": "error",
                "message": "Unexpected response from Fi-MCP server"
            }

        except FiMCPError as e:
            logger.error(f"Fi-MCP error during login: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error during login: {str(e)}")
            return {
                "status": "error",
                "message": "Internal server error"
            }

    async def get_financial_summary(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive financial summary"""
        try:
            if session_id:
                self.client.session_id = session_id

            # Fetch all financial data
            net_worth = await self.client.get_net_worth()
            bank_txns = await self.client.get_bank_transactions()
            credit_report = await self.client.get_credit_report()
            epf_details = await self.client.get_epf_details()
            mf_txns = await self.client.get_mf_transactions()

            # Check if any response requires authentication
            if any("login_url" in x for x in [net_worth, bank_txns, credit_report, epf_details, mf_txns]):
                return {
                    "status": "auth_required",
                    "login_url": next(x["login_url"] for x in [net_worth, bank_txns, credit_report, epf_details, mf_txns] if "login_url" in x)
                }

            return {
                "status": "success",
                "data": {
                    "net_worth": net_worth,
                    "bank_transactions": bank_txns,
                    "credit_report": credit_report,
                    "epf_details": epf_details,
                    "mutual_funds": mf_txns
                }
            }

        except FiMCPError as e:
            logger.error(f"Fi-MCP error fetching summary: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error fetching summary: {str(e)}")
            return {
                "status": "error",
                "message": "Internal server error"
            }
