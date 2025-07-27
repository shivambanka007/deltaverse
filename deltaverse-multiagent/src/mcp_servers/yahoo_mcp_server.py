from src.mcp_servers.mcp_server_template import create_mcp_app
import json
import os

# Load mock data
with open(os.path.join(os.path.dirname(__file__), 'yahoo_mock_data.json'), 'r') as f:
    YAHOO_MOCK_DATA = json.load(f)

app = create_mcp_app("yahoo_mcp_server", YAHOO_MOCK_DATA)