import os
from typing import Dict, Any
from src.common.mock_agent_data import MOCK_MINT_MCP_RESPONSE

# Disclaimer: Interacting with services like Mint.com via unofficial APIs or screen scraping
# is generally NOT recommended. It can violate terms of service, is prone to breaking with
# website changes, and carries significant security risks as it often involves handling
# sensitive login credentials. This agent provides conceptual functionality only.

class MintMcpAgent:
    def __init__(self, mcp_server_url: str, enable_mcp: bool = True):
        self.mcp_server_url = mcp_server_url # Kept for consistency, but not used for real API calls
        self.enable_mcp = enable_mcp
        print("MintMcpAgent initialized. (Note: This agent provides conceptual functionality only due to unofficial API risks.)")

    def process_query(self, user_id: str, query: str) -> Dict[str, Any]:
        print(f"MintMcpAgent received query for user {user_id}: {query}")
        if not self.enable_mcp:
            print("MintMcpAgent is disabled. Returning mock response.")
            return MOCK_MINT_MCP_RESPONSE