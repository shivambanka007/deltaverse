from src.mcp_servers.mcp_server_template import create_mcp_app
import json
import os

# Load mock data
with open(os.path.join(os.path.dirname(__file__), 'fi_mock_data.json'), 'r') as f:
    FI_MOCK_DATA = json.load(f)

app = create_mcp_app("fi_mcp_server", FI_MOCK_DATA)