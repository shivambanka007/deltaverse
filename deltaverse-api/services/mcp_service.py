from typing import Dict, Any, Optional
from services.fi_mcp_client import get_fi_mcp_client, FiMCPClientError
from config.fi_mcp_config import fi_mcp_settings

class FiMCPService:
    def __init__(self):
        self.client = None

    async def initialize(self):
        if not self.client:
            self.client = await get_fi_mcp_client()

    async def get_financial_data(self, user_id: str, data_type: str) -> Dict[str, Any]:
        """Get financial data from Fi-MCP server"""
        try:
            await self.initialize()
            return await self.client.fetch_data(data_type, {"user_id": user_id})
        except FiMCPClientError as e:
            raise FiMCPClientError(f"Error fetching {data_type}: {str(e)}")
        except Exception as e:
            raise Exception(f"Unexpected error fetching {data_type}: {str(e)}")

    async def get_bank_transactions(self, user_id: str) -> Dict[str, Any]:
        return await self.get_financial_data(user_id, "fetch_bank_transactions")

    async def get_net_worth(self, user_id: str) -> Dict[str, Any]:
        return await self.get_financial_data(user_id, "fetch_net_worth")

    async def get_credit_report(self, user_id: str) -> Dict[str, Any]:
        return await self.get_financial_data(user_id, "fetch_credit_report")
