import requests
import os
from typing import Dict, Any, List
from src.common.mock_agent_data import MOCK_YNAB_LIST_BUDGETS_RESPONSE, MOCK_YNAB_TRANSACTIONS_RESPONSE

class YnabMcpAgent:
    def __init__(self, mcp_server_url: str, enable_mcp: bool = True):
        self.mcp_server_url = mcp_server_url # Kept for consistency, but not used for direct API calls
        self.enable_mcp = enable_mcp
        self.api_base_url = "https://api.ynab.com/v1"
        self.access_token = os.getenv("YNAB_ACCESS_TOKEN")

    def _make_request(self, endpoint: str) -> Dict[str, Any]:
        """Helper to make authenticated GET requests to the YNAB API."""
        if not self.access_token:
            print("Error: YNAB_ACCESS_TOKEN environment variable not set.")
            return {"status": "error", "message": "YNAB access token not configured."}

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        url = f"{self.api_base_url}/{endpoint}"

        try:
            print(f"YNAB MCP Agent: Making request to {url}")
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
            data = response.json()
            return {"status": "success", "data": data}
        except requests.exceptions.HTTPError as http_err:
            print(f"YNAB MCP Agent: HTTP error occurred: {http_err} - {response.text}")
            return {"status": "error", "message": f"HTTP error: {http_err}", "details": response.text}
        except requests.exceptions.ConnectionError as conn_err:
            print(f"YNAB MCP Agent: Connection error occurred: {conn_err}")
            return {"status": "error", "message": f"Connection error: {conn_err}"}
        except requests.exceptions.Timeout as timeout_err:
            print(f"YNAB MCP Agent: Timeout error occurred: {timeout_err}")
            return {"status": "error", "message": f"Timeout error: {timeout_err}"}
        except requests.exceptions.RequestException as req_err:
            print(f"YNAB MCP Agent: An unexpected error occurred: {req_err}")
            return {"status": "error", "message": f"Request error: {req_err}"}
        except Exception as e:
            print(f"YNAB MCP Agent: An unexpected error occurred: {e}")
            return {"status": "error", "message": f"Unexpected error: {e}"}

    def list_budgets(self) -> Dict[str, Any]:
        """
        Lists budgets for the authenticated user.
        """
        print("YNAB MCP Agent: Listing budgets...")
        return self._make_request("budgets")

    def get_transactions_for_budget(self, budget_id: str) -> Dict[str, Any]:
        """
        Gets transactions for a specific budget.
        """
        print(f"YNAB MCP Agent: Getting transactions for budget ID: {budget_id}")
        return self._make_request(f"budgets/{budget_id}/transactions")

    def process_query(self, user_id: str, query: str) -> Dict[str, Any]:
        print(f"YnabMcpAgent received query for user {user_id}: {query}")
        if not self.enable_mcp:
            print("YnabMcpAgent is disabled. Returning mock response.")
            query_lower = query.lower()
            if "list budgets" in query_lower:
                return MOCK_YNAB_LIST_BUDGETS_RESPONSE
            elif "transactions for budget" in query_lower:
                return MOCK_YNAB_TRANSACTIONS_RESPONSE
            else:
                return {"status": "disabled", "message": "YNAB MCP server connection is disabled by feature flag. Unsupported mock query.", "data": {}}

        # Simple query parsing for demonstration
        query_lower = query.lower()
        if "list budgets" in query_lower:
            return self.list_budgets()
        elif "transactions for budget" in query_lower:
            # This is a very basic way to extract budget_id. An LLM would be better.
            parts = query_lower.split("transactions for budget")
            if len(parts) > 1:
                budget_id = parts[1].strip()
                return self.get_transactions_for_budget(budget_id)
            else:
                return {"status": "error", "message": "Please specify a budget ID for transactions."}
        else:
            return {"status": "error", "message": "Unsupported YNAB query."}
