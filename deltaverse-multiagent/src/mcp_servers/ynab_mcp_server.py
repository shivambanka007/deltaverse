from src.mcp_servers.mcp_server_template import create_mcp_app
import json
import os

# Load mock data
with open(os.path.join(os.path.dirname(__file__), 'ynab_mock_data.json'), 'r') as f:
    YNAB_MOCK_DATA = json.load(f)

app = create_mcp_app("ynab_mcp_server", YNAB_MOCK_DATA)