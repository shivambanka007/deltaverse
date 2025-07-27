import os
from kiteconnect import KiteConnect
from typing import Dict, Any

class ZerodhaCoinMcpAgent:
    def __init__(self):
        self.api_key = os.getenv("KITE_API_KEY")
        self.api_secret = os.getenv("KITE_API_SECRET")
        self.request_token = os.getenv("KITE_REQUEST_TOKEN") # This would come from the OAuth callback
        self.access_token = None
        self.kite = None

        if not self.api_key or not self.api_secret:
            print("Error: KITE_API_KEY or KITE_API_SECRET environment variables not set.")
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
            print("Zerodha Coin MCP Agent: KITE_REQUEST_TOKEN not found. User login required.")
            print(f"Login URL: {self.kite.login_url()}")

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

# --- Conceptual ADK Agent Integration ---
# class MyInvestmentAgent:
#     def __init__(self):
#         self.zerodha_coin_mcp = ZerodhaCoinMcpAgent()

#     def get_my_zerodha_profile(self):
#         # This method would be exposed as a tool/capability of the ADK agent
#         print("ADK Agent: Getting Zerodha profile...")
#         profile_result = self.zerodha_coin_mcp.get_user_profile()
#         if profile_result["status"] == "success":
#             print(f"ADK Agent: Zerodha Profile: {profile_result['data']}")
#             return profile_result['data']
#         else:
#             print(f"ADK Agent: Failed to get Zerodha profile: {profile_result['message']}")
#             return None

# Example Usage (for testing outside an ADK):
if __name__ == "__main__":
    # To run this example:
    # 1. Register your application with Zerodha Kite Connect to get API Key and Secret.
    # 2. Set KITE_API_KEY and KITE_API_SECRET environment variables.
    # 3. Manually get a KITE_REQUEST_TOKEN by navigating to the login_url printed by the script,
    #    logging in, and extracting the 'request_token' from the redirect URL.
    # 4. Set KITE_REQUEST_TOKEN environment variable.

    # os.environ["KITE_API_KEY"] = "YOUR_KITE_API_KEY"
    # os.environ["KITE_API_SECRET"] = "YOUR_KITE_API_SECRET"
    # os.environ["KITE_REQUEST_TOKEN"] = "YOUR_KITE_REQUEST_TOKEN_FROM_OAUTH_CALLBACK"

    agent = ZerodhaCoinMcpAgent()

    print("\n--- Testing Get User Profile ---")
    profile_data = agent.get_user_profile()
    print(f"User Profile Result: {profile_data}")
