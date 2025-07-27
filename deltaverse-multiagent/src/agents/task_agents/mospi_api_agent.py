import requests
import os
from typing import Dict, Any
from src.common.mock_agent_data import MOCK_MOSPI_API_RESPONSE

class MospiApiAgent:
    def __init__(self, mcp_server_url: str, enable_mcp: bool = True):
        self.mcp_server_url = mcp_server_url # Kept for consistency, but not used for direct API calls
        self.enable_mcp = enable_mcp
        self.api_base_url = "https://api.mospi.gov.in/v1/data" # Hypothetical API endpoint
        self.api_key = os.getenv("MOSPI_API_KEY")

    def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Helper to make authenticated GET requests to the MoSPI API."""
        if not self.api_key:
            print("Error: MOSPI_API_KEY environment variable not set.")
            return {"status": "error", "message": "API key not configured."}

        headers = {"X-API-Key": self.api_key}
        url = f"{self.api_base_url}/{endpoint}"

        try:
            print(f"MoSPI API Agent: Making request to {url} with params {params}")
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
            data = response.json()
            return {"status": "success", "data": data}
        except requests.exceptions.HTTPError as http_err:
            print(f"MoSPI API Agent: HTTP error occurred: {http_err} - {response.text}")
            return {"status": "error", "message": f"HTTP error: {http_err}", "details": response.text}
        except requests.exceptions.ConnectionError as conn_err:
            print(f"MoSPI API Agent: Connection error occurred: {conn_err}")
            return {"status": "error", "message": f"Connection error: {conn_err}"}
        except requests.exceptions.Timeout as timeout_err:
            print(f"MoSPI API Agent: Timeout error occurred: {timeout_err}")
            return {"status": "error", "message": f"Timeout error: {timeout_err}"}
        except requests.exceptions.RequestException as req_err:
            print(f"MoSPI API Agent: An unexpected error occurred: {req_err}")
            return {"status": "error", "message": f"Request error: {req_err}"}
        except Exception as e:
            print(f"MoSPI API Agent: An unexpected error occurred: {e}")
            return {"status": "error", "message": f"Unexpected error: {e}"}

    def process_query(self, user_id: str, query: str) -> Dict[str, Any]:
        print(f"MospiApiAgent received query for user {user_id}: {query}")
        if not self.enable_mcp:
            print("MospiApiAgent is disabled. Returning mock response.")
            return MOCK_MOSPI_API_RESPONSE

        # For demonstration, let's assume the query is like "GDP growth for 2023"
        # In a real scenario, an LLM would parse this query to extract data_type and year
        data_type = "GDP_GROWTH" # Default hypothetical data type
        year = 2023 # Default hypothetical year

        if "GDP" in query.upper():
            data_type = "GDP_GROWTH"
        if "20" in query:
            try:
                # Attempt to extract a year from the query
                words = query.split()
                for word in words:
                    if word.isdigit() and len(word) == 4 and word.startswith("20"):
                        year = int(word)
                        break
            except ValueError:
                pass # Keep default year if parsing fails

        print(f"MoSPI API Agent: Fetching {data_type} for {year}...")
        return self._make_request("data", {"type": data_type, "year": year})
