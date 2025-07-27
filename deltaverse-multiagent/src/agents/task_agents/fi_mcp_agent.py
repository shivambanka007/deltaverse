import requests
import os
import uuid
from typing import Dict, Any
from src.common.mock_agent_data import MOCK_FI_MCP_RESPONSE

class FiMcpAgent:
    def __init__(self, mcp_server_url: str, enable_mcp: bool = True):
        self.mcp_server_url = mcp_server_url
        self.enable_mcp = enable_mcp

    def process_query(self, user_id: str, query: str) -> Dict[str, Any]:
        print(f"FiMcpAgent received query for user {user_id}: {query}")
        if not self.enable_mcp:
            print("FiMcpAgent is disabled. Returning mock response.")
            return MOCK_FI_MCP_RESPONSE
        try:
            # Construct JSON-RPC request as expected by fi-mcp-dev-master
            # For simplicity, mapping the 'query' to a generic 'fetch_net_worth' method
            # In a real scenario, the query would be parsed to determine the correct method and arguments
            json_rpc_payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {
                    "name": "fetch_bank_transactions", # Using a method from README example
                    "arguments": {}
                }
            }
            response = requests.post(
                f"{self.mcp_server_url}/mcp/stream",
                json=json_rpc_payload,
                headers={
                    "Mcp-Session-Id": f"mcp-session-{uuid.uuid4()}" # Generate a new UUID with the required prefix
                }
            )
            response.raise_for_status()  # Raise an exception for HTTP errors
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error communicating with Fi MCP server: {e}")
            return {"status": "error", "message": str(e), "data": {}}