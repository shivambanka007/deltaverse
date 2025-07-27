import os
from kiteconnect import KiteConnect
from typing import Dict, Any
from src.common.mock_agent_data import MOCK_ZERODHA_PROFILE_RESPONSE

class ZerodhaCoinMcpAgent:
    def __init__(self, mcp_server_url: str, enable_mcp: bool = True):
        self.mcp_server_url = mcp_server_url # Kept for consistency, but not used for direct API calls
        self.enable_mcp = enable_mcp
        self.api_key = os.getenv("KITE_API_KEY")
        self.api_secret = os.getenv("KITE_API_SECRET")
        self.request_token = os.getenv("KITE_REQUEST_TOKEN") # This would come from the OAuth callback
        self.access_token = None
        self.kite = None

        if not self.enable_mcp:
            print("ZerodhaCoinMcpAgent is disabled. Skipping KiteConnect initialization.")
            return

        if not self.api_key or not self.api_secret:
            print("Error: KITE_API_KEY or KITE_API_SECRET environment variables not set. Zerodha functionality will be limited.")
            return

        self.kite = KiteConnect(api_key=self.api_key)

        # In a real application, the login flow would be handled by redirecting the user
        # to kite.login_url(), getting the request_token from the callback, and then
        # generating the access token.
        if self.request_token:
            try:
                print("Zerodha Coin MCP Agent: Attempting to generate access token...")
                data = self.kite.generate_session(self.request_token, api_secret=self.api_secret)
                self.access_token = data["access_token"]
                self.kite.set_access_token(self.access_token)
                print("Zerodha Coin MCP Agent: Access token generated and set.")
            except Exception as e:
                print(f"Zerodha Coin MCP Agent: Error generating access token: {e}")
        else:
            print("Zerodha Coin MCP Agent: KITE_REQUEST_TOKEN not found. User login required for full functionality.")
            print(f"Zerodha Kite Login URL: {self.kite.login_url()}")

    def get_user_profile(self) -> Dict[str, Any]:
        """
        Retrieves the user's profile information after successful login.
        """
        if not self.kite or not self.access_token:
            return {"status": "error", "message": "KiteConnect not initialized or not authenticated."}

        try:
            print("Zerodha Coin MCP Agent: Fetching user profile...")
            profile = self.kite.profile()
            print("Zerodha Coin MCP Agent: User profile fetched successfully.")
            return {"status": "success", "data": profile}
        except Exception as e:
            print(f"Zerodha Coin MCP Agent: Error fetching user profile: {e}")
            return {"status": "error", "message": f"Error: {e}"}

    def process_query(self, user_id: str, query: str) -> Dict[str, Any]:
        print(f"ZerodhaCoinMcpAgent received query for user {user_id}: {query}")
        if not self.enable_mcp:
            print("ZerodhaCoinMcpAgent is disabled. Returning mock response.")
            return MOCK_ZERODHA_PROFILE_RESPONSE

        if not self.kite or not self.access_token:
            return {"status": "error", "message": "Zerodha Kite not authenticated. Please complete the login flow.", "login_url": self.kite.login_url() if self.kite else "N/A"}

        query_lower = query.lower()
        if "profile" in query_lower or "user info" in query_lower:
            return self.get_user_profile()
        else:
            return {"status": "error", "message": "Unsupported Zerodha Coin query. Try 'get profile'."}
