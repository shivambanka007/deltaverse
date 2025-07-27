import subprocess
import json
import os
import sys
import threading
import queue
from typing import Dict, Any

class YahooMcpAgent:
    def __init__(self, server_script_path: str = "yfinance_mcp_server.py"):
        self.server_script_path = server_script_path
        self.process = None
        self.response_queue = queue.Queue()
        self.lock = threading.Lock() # To ensure only one request is sent at a time

    def _start_server(self):
        """Starts the yfinance MCP server as a subprocess."""
        if self.process is None or self.process.poll() is not None:
            print(f"Starting Yahoo MCP server: {self.server_script_path}")
            try:
                self.process = subprocess.Popen(
                    [sys.executable, self.server_script_path],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True, # For text-based communication
                    bufsize=1 # Line-buffered
                )
                # Start a thread to read stdout asynchronously
                threading.Thread(target=self._read_stdout, daemon=True).start()
                # Start a thread to read stderr asynchronously
                threading.Thread(target=self._read_stderr, daemon=True).start()
                print("Yahoo MCP server started.")
            except FileNotFoundError:
                print(f"Error: Server script not found at {self.server_script_path}")
                self.process = None
            except Exception as e:
                print(f"Error starting Yahoo MCP server: {e}")
                self.process = None

    def _read_stdout(self):
        """Reads responses from the server's stdout."""
        while self.process and self.process.poll() is None:
            try:
                line = self.process.stdout.readline()
                if line:
                    self.response_queue.put(json.loads(line))
            except json.JSONDecodeError:
                print(f"Yahoo MCP Agent: Invalid JSON from server stdout: {line.strip()}")
            except Exception as e:
                print(f"Yahoo MCP Agent: Error reading stdout: {e}")
                break

    def _read_stderr(self):
        """Reads errors from the server's stderr."""
        while self.process and self.process.poll() is None:
            try:
                line = self.process.stderr.readline()
                if line:
                    print(f"Yahoo MCP Server (stderr): {line.strip()}")
            except Exception as e:
                print(f"Yahoo MCP Agent: Error reading stderr: {e}")
                break

    def _send_request(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Sends a JSON-RPC request to the server and waits for a response."""
        self._start_server() # Ensure server is running
        if not self.process:
            return {"status": "error", "message": "Yahoo MCP server not running."}

        request_id = os.getpid() # Simple ID, could be a UUID
        json_rpc_request = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": request_id
        }

        with self.lock:
            try:
                self.process.stdin.write(json.dumps(json_rpc_request) + "\n")
                self.process.stdin.flush()
                print(f"Sent request to Yahoo MCP server: {json_rpc_request}")

                # Wait for the response with the matching ID
                while True:
                    try:
                        response = self.response_queue.get(timeout=10) # Wait for up to 10 seconds
                        if response.get("id") == request_id:
                            return response
                    except queue.Empty:
                        return {"status": "error", "message": "Timeout waiting for Yahoo MCP server response."}
            except Exception as e:
                print(f"Error sending request to Yahoo MCP server: {e}")
                return {"status": "error", "message": f"Communication error: {e}"}

    def get_stock_price(self, ticker: str) -> Dict[str, Any]:
        """
        Retrieves the current stock price for a given ticker from the Yahoo MCP server.
        """
        print(f"YahooMcpAgent: Requesting stock price for {ticker}")
        response = self._send_request("get_stock_price", {"ticker": ticker})

        if "result" in response:
            return {"status": "success", "data": response["result"]}
        elif "error" in response:
            return {"status": "error", "message": response["error"].get("message", "Unknown error"), "code": response["error"].get("code")}
        else:
            return {"status": "error", "message": "Invalid response format from Yahoo MCP server."}

# --- Conceptual ADK Agent Integration ---
# An ADK agent would instantiate this class and call its methods.
# For example, in an ADK agent's 'tool' or 'service' definition:

# class MyFinancialAgent:
#     def __init__(self):
#         self.yahoo_mcp = YahooMcpAgent(server_script_path="./yfinance_mcp_server.py") # Adjust path as needed

#     def get_latest_stock_info(self, ticker: str):
#         # This method would be exposed as a tool/capability of the ADK agent
#         print(f"ADK Agent: Getting stock info for {ticker}")
#         result = self.yahoo_mcp.get_stock_price(ticker)
#         if result["status"] == "success":
#             print(f"ADK Agent: Successfully retrieved price: {result['data']['price']}")
#             return result['data']['price']
#         else:
#             print(f"ADK Agent: Failed to get stock price: {result['message']}")
#             return None

# Example Usage (for testing outside an ADK):
if __name__ == "__main__":
    # To run this example:
    # 1. Save the conceptual yfinance_mcp_server.py code to a file named 'yfinance_mcp_server.py'
    # 2. Make sure 'yfinance' is installed (pip install yfinance)
    # 3. Run this script: python yahoo_mcp_agent_example.py

    agent = YahooMcpAgent(server_script_path="/Users/166984/IdeaProjects/deltaverse-multiagent/yfinance_mcp_server.py") # Adjust path if necessary

    print("\n--- Testing AAPL ---")
    aapl_price = agent.get_stock_price("AAPL")
    print(f"AAPL Price Result: {aapl_price}")

    print("\n--- Testing GOOG ---")
    goog_price = agent.get_stock_price("GOOG")
    print(f"GOOG Price Result: {goog_price}")

    print("\n--- Testing Invalid Ticker ---")
    invalid_price = agent.get_stock_price("INVALIDTICKER123")
    print(f"Invalid Ticker Result: {invalid_price}")

    # Clean up subprocess
    if agent.process:
        agent.process.terminate()
        agent.process.wait()
        print("\nYahoo MCP server terminated.")