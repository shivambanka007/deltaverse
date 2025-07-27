from src.mcp_servers.mcp_server_template import create_mcp_app
import json
import os

# Load mock data
with open(os.path.join(os.path.dirname(__file__), 'mint_mock_data.json'), 'r') as f:
    MINT_MOCK_DATA = json.load(f)

app = create_mcp_app("mint_mcp_server", MINT_MOCK_DATA)