#!/usr/bin/env python3
"""
Real Fi-MCP Client Integration
Connects to the actual Fi-MCP dev server running on port 8080
"""

import json
import requests
import uuid
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

class FiMCPClient:
    """Real Fi-MCP client that connects to the Fi-MCP dev server"""
    
    def __init__(self, mcp_url: str = "http://localhost:8080"):
        self.mcp_url = mcp_url
        self.stream_endpoint = f"{mcp_url}/mcp/stream"
        self.login_endpoint = f"{mcp_url}/mockWebPage"
        self.sessions = {}  # Store session information
        
    def _make_mcp_request(self, method: str, params: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Make a JSON-RPC request to the MCP server"""
        payload = {
            "jsonrpc": "2.0",
            "id": str(uuid.uuid4()),
            "method": method,
            "params": params
        }
        
        headers = {
            "Content-Type": "application/json",
            "Mcp-Session-Id": session_id
        }
        
        try:
            response = requests.post(
                self.stream_endpoint,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"MCP request failed: {response.status_code} - {response.text}")
                return {"error": f"HTTP {response.status_code}: {response.text}"}
                
        except Exception as e:
            logger.error(f"MCP request exception: {e}")
            return {"error": str(e)}
    
    def get_available_tools(self, session_id: str) -> Dict[str, Any]:
        """Get list of available MCP tools"""
        return self._make_mcp_request("tools/list", {}, session_id)
    
    def call_tool(self, tool_name: str, arguments: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Call a specific MCP tool"""
        params = {
            "name": tool_name,
            "arguments": arguments
        }
        return self._make_mcp_request("tools/call", params, session_id)
    
    def get_login_url(self, session_id: str) -> str:
        """Get the login URL for Fi authentication"""
        return f"{self.login_endpoint}?sessionId={session_id}"
    
    def check_server_status(self) -> Dict[str, Any]:
        """Check if the Fi-MCP server is running"""
        try:
            # Test with a dummy session to see if server responds
            test_session = f"health-check-{uuid.uuid4()}"
            response = self.get_available_tools(test_session)
            
            if "error" in response:
                if "Invalid session ID" in str(response.get("error", "")):
                    return {
                        "status": "running",
                        "message": "Fi-MCP server is running and responding",
                        "url": self.mcp_url
                    }
                else:
                    return {
                        "status": "error",
                        "message": f"Server error: {response['error']}",
                        "url": self.mcp_url
                    }
            else:
                return {
                    "status": "running",
                    "message": "Fi-MCP server is running",
                    "url": self.mcp_url
                }
                
        except Exception as e:
            return {
                "status": "offline",
                "message": f"Fi-MCP server not accessible: {e}",
                "url": self.mcp_url
            }
    
    def get_financial_data(self, tool_name: str, session_id: str, phone_number: str = None) -> Dict[str, Any]:
        """
        Get financial data using MCP tools
        
        Available tools:
        - fetch_net_worth
        - fetch_credit_report  
        - fetch_epf_details
        - fetch_mf_transactions
        - fetch_bank_transactions
        - fetch_stock_transactions
        """
        
        # First check if session is authenticated
        tools_response = self.get_available_tools(session_id)
        
        if "error" in tools_response:
            error_msg = str(tools_response.get("error", ""))
            if "Invalid session ID" in error_msg or "login_required" in error_msg:
                return {
                    "requires_authentication": True,
                    "login_url": self.get_login_url(session_id),
                    "message": "Please authenticate with Fi Money first",
                    "session_id": session_id
                }
            else:
                return {
                    "error": f"MCP server error: {error_msg}",
                    "session_id": session_id
                }
        
        # If authenticated, call the requested tool
        result = self.call_tool(tool_name, {}, session_id)
        
        if "error" in result:
            return {
                "error": f"Tool call failed: {result['error']}",
                "tool_name": tool_name,
                "session_id": session_id
            }
        
        # Parse the result
        if "result" in result:
            try:
                # The result might be JSON string or already parsed
                if isinstance(result["result"], str):
                    financial_data = json.loads(result["result"])
                else:
                    financial_data = result["result"]
                
                return {
                    "success": True,
                    "tool_name": tool_name,
                    "data": financial_data,
                    "session_id": session_id
                }
            except json.JSONDecodeError as e:
                return {
                    "error": f"Failed to parse financial data: {e}",
                    "raw_result": result["result"],
                    "session_id": session_id
                }
        
        return {
            "error": "Unexpected response format",
            "raw_response": result,
            "session_id": session_id
        }
    
    def get_all_financial_data(self, session_id: str) -> Dict[str, Any]:
        """Get all available financial data for a user"""
        tools = [
            "fetch_net_worth",
            "fetch_credit_report", 
            "fetch_epf_details",
            "fetch_mf_transactions",
            "fetch_bank_transactions",
            "fetch_stock_transactions"
        ]
        
        results = {}
        errors = []
        
        for tool in tools:
            result = self.get_financial_data(tool, session_id)
            
            if result.get("success"):
                results[tool] = result["data"]
            elif result.get("requires_authentication"):
                return result  # Return auth requirement immediately
            else:
                errors.append(f"{tool}: {result.get('error', 'Unknown error')}")
        
        return {
            "success": True,
            "data": results,
            "errors": errors if errors else None,
            "session_id": session_id
        }

# Global instance
fi_mcp_client = FiMCPClient()

def test_fi_mcp_integration():
    """Test the Fi-MCP integration"""
    print("🔗 Testing Fi-MCP Integration")
    print("=" * 50)
    
    # Test server status
    status = fi_mcp_client.check_server_status()
    print(f"Server Status: {status['status']}")
    print(f"Message: {status['message']}")
    
    if status['status'] != 'running':
        return False
    
    # Test with a new session
    test_session = f"test-session-{uuid.uuid4()}"
    print(f"\nTest Session: {test_session}")
    
    # Try to get net worth (should require authentication)
    result = fi_mcp_client.get_financial_data("fetch_net_worth", test_session)
    
    if result.get("requires_authentication"):
        print(f"✅ Authentication required (expected)")
        print(f"Login URL: {result['login_url']}")
        return True
    else:
        print(f"❌ Unexpected result: {result}")
        return False

if __name__ == "__main__":
    test_fi_mcp_integration()
