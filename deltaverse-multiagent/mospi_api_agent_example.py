import requests
import os
from typing import Dict, Any

class MospiApiAgent:
    def __init__(self):
        self.api_base_url = "https://api.mospi.gov.in/v1/data" # Hypothetical API endpoint
        self.api_key = os.getenv("MOSPI_API_KEY")

    def fetch_statistical_data(self, data_type: str, year: int) -> Dict[str, Any]:
        """
        Fetches hypothetical statistical data from the MoSPI API.
        """
        if not self.api_key:
            print("Error: MOSPI_API_KEY environment variable not set.")
            return {"status": "error", "message": "API key not configured."}

        headers = {"X-API-Key": self.api_key}
        params = {"type": data_type, "year": year} # Hypothetical parameters

        try:
            print(f"MoSPI API Agent: Fetching {data_type} for {year}...")
            response = requests.get(self.api_base_url, headers=headers, params=params, timeout=10)
            response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
            data = response.json()
            print("MoSPI API Agent: Data fetched successfully.")
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

# --- Conceptual ADK Agent Integration ---
# class MyStatisticalAgent:
#     def __init__(self):
#         self.mospi_api = MospiApiAgent()

#     def get_gdp_data(self, year: int):
#         # This method would be exposed as a tool/capability of the ADK agent
#         print(f"ADK Agent: Getting GDP data for {year}")
#         result = self.mospi_api.fetch_statistical_data("GDP_GROWTH", year)
#         if result["status"] == "success":
#             print(f"ADK Agent: Successfully retrieved GDP data: {result['data']}")
#             return result['data']
#         else:
#             print(f"ADK Agent: Failed to get GDP data: {result['message']}")
#             return None

# Example Usage (for testing outside an ADK):
if __name__ == "__main__":
    # Set a dummy API key for testing (replace with your actual key in .env or environment)
    # os.environ["MOSPI_API_KEY"] = "your_dummy_mospi_api_key"

    agent = MospiApiAgent()

    print("\n--- Testing GDP Growth for 2023 ---")
    gdp_data = agent.fetch_statistical_data("GDP_GROWTH", 2023)
    print(f"GDP Data Result: {gdp_data}")

    print("\n--- Testing with missing API Key (should show error) ---")
    del os.environ["MOSPI_API_KEY"] # Temporarily unset for testing error case
    gdp_data_no_key = agent.fetch_statistical_data("GDP_GROWTH", 2022)
    print(f"GDP Data (no key) Result: {gdp_data_no_key}")
