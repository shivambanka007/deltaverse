import subprocess
import json
import os
import sys
import threading
import queue
from typing import Dict, Any
from src.common.mock_agent_data import MOCK_YAHOO_MCP_RESPONSE

class YahooMcpAgent:
    def __init__(self, mcp_server_url: str, enable_mcp: bool = True):
        self.mcp_server_url = mcp_server_url # This URL is not used for subprocess communication
        self.enable_mcp = enable_mcp
        self.server_script_path = os.path.join(os.path.dirname(__file__), "..", "..", "mcp_servers", "yfinance_mcp_server.py")
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

    def process_query(self, user_id: str, query: str) -> Dict[str, Any]:
        """
        Processes a query for Yahoo data, e.g., stock prices.
        """
        print(f"YahooMcpAgent received query for user {user_id}: {query}")
        if not self.enable_mcp:
            print("YahooMcpAgent is disabled. Returning mock response.")
            return MOCK_YAHOO_MCP_RESPONSE

        # Simple parsing: assume query contains a ticker symbol
        # In a real scenario, you'd use an LLM to extract entities
        ticker = query.split()[-1].upper() # Very basic extraction

        print(f"YahooMcpAgent: Requesting stock price for {ticker}")
        response = self._send_request("get_stock_price", {"ticker": ticker})

        if "result" in response:
            return {"status": "success", "data": response["result"]}
        elif "error" in response:
            return {"status": "error", "message": response["error"].get("message", "Unknown error"), "code": response["error"].get("code")}
        else:
            return {"status": "error", "message": "Invalid response format from Yahoo MCP server."}

    def __del__(self):
        """Ensure the subprocess is terminated when the agent is destroyed."""
        if self.process and self.process.poll() is None:
            self.process.terminate()
            self.process.wait()
            print("Yahoo MCP server subprocess terminated.")