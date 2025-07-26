from typing import Dict, Any, Optional
import httpx
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class FiMCPRequest(BaseModel):
    jsonrpc: str = "2.0"
    id: int = 1
    method: str = "tools/call"
    params: Dict[str, Any]

class FiMCPError(Exception):
    """Fi MCP specific error"""
    pass

class FiMCPClient:
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
        self.session_id = None

    async def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make request to Fi-MCP server"""
        headers = {}
        if self.session_id:
            headers["Mcp-Session-Id"] = self.session_id

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/{endpoint}",
                    json=data,
                    headers=headers
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error: {str(e)}")
            raise FiMCPError(f"HTTP error: {str(e)}")
        except Exception as e:
            logger.error(f"Error making request: {str(e)}")
            raise FiMCPError(f"Error: {str(e)}")

    async def fetch_data(self, tool_name: str, arguments: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Fetch data using Fi-MCP tool"""
        request = FiMCPRequest(
            params={
                "name": tool_name,
                "arguments": arguments or {}
            }
        )
        
        response = await self._make_request("mcp/stream", request.dict())
        
        # Check if we need to authenticate
        if "login_url" in response:
            logger.info(f"Authentication required. Login URL: {response['login_url']}")
            return {
                "status": "auth_required",
                "login_url": response["login_url"]
            }
            
        return response

    async def get_net_worth(self) -> Dict[str, Any]:
        """Get user's net worth"""
        return await self.fetch_data("fetch_net_worth")

    async def get_bank_transactions(self) -> Dict[str, Any]:
        """Get bank transactions"""
        return await self.fetch_data("fetch_bank_transactions")

    async def get_credit_report(self) -> Dict[str, Any]:
        """Get credit report"""
        return await self.fetch_data("fetch_credit_report")

    async def get_epf_details(self) -> Dict[str, Any]:
        """Get EPF details"""
        return await self.fetch_data("fetch_epf_details")

    async def get_mf_transactions(self) -> Dict[str, Any]:
        """Get mutual fund transactions"""
        return await self.fetch_data("fetch_mf_transactions")
