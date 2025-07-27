import requests
import os
from typing import Dict, Any, List

class YnabMcpAgent:
    def __init__(self):
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

# --- Conceptual ADK Agent Integration ---
# class MyBudgetAgent:
#     def __init__(self):
#         self.ynab_mcp = YnabMcpAgent()

#     def get_my_budgets_and_transactions(self):
#         # This method would be exposed as a tool/capability of the ADK agent
#         print("ADK Agent: Getting YNAB budgets and transactions...")
#         budgets_result = self.ynab_mcp.list_budgets()
#         if budgets_result["status"] == "success" and budgets_result["data"] and budgets_result["data"]["data"]["budgets"]:
#             budgets = budgets_result["data"]["data"]["budgets"]
#             print(f"ADK Agent: Found {len(budgets)} budgets.")
#             all_transactions = {}
#             for budget in budgets:
#                 print(f"ADK Agent: Getting transactions for budget: {budget['name']}")
#                 transactions_result = self.ynab_mcp.get_transactions_for_budget(budget['id'])
#                 if transactions_result["status"] == "success":
#                     all_transactions[budget['name']] = transactions_result["data"]["data"]["transactions"]
#                 else:
#                     print(f"ADK Agent: Failed to get transactions for {budget['name']}: {transactions_result['message']}")
#             return {"budgets": budgets, "transactions": all_transactions}
#         else:
#             print(f"ADK Agent: Failed to list budgets: {budgets_result['message']}")
#             return None

# Example Usage (for testing outside an ADK):
if __name__ == "__main__":
    # Set your YNAB Personal Access Token as an environment variable
    # os.environ["YNAB_ACCESS_TOKEN"] = "YOUR_YNAB_PERSONAL_ACCESS_TOKEN"

    agent = YnabMcpAgent()

    print("\n--- Testing List Budgets ---")
    budgets_result = agent.list_budgets()
    print(f"Budgets Result: {budgets_result}")

    if budgets_result["status"] == "success" and budgets_result["data"] and budgets_result["data"]["data"]["budgets"]:
        first_budget_id = budgets_result["data"]["data"]["budgets"][0]["id"]
        print(f"\n--- Testing Get Transactions for first budget ({first_budget_id}) ---")
        transactions_result = agent.get_transactions_for_budget(first_budget_id)
        print(f"Transactions Result: {transactions_result}")
    else:
        print("\nSkipping transaction test as no budgets were found or an error occurred.")

    print("\n--- Testing with missing Access Token (should show error) ---")
    if "YNAB_ACCESS_TOKEN" in os.environ: del os.environ["YNAB_ACCESS_TOKEN"]
    agent_no_token = YnabMcpAgent()
    budgets_no_token = agent_no_token.list_budgets()
    print(f"Budgets (no token) Result: {budgets_no_token}")