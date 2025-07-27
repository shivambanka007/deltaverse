
import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any

class MCPRequest(BaseModel):
    query: str
    user_id: str

class MCPResponse(BaseModel):
    status: str
    data: Dict[str, Any]
    message: str = ""

def create_mcp_app(agent_name: str, mock_data: Dict[str, Any]):
    app = FastAPI(
        title=f"{agent_name.replace('_', ' ').title()} MCP Server",
        description=f"MCP server for {agent_name.replace('_', ' ').title()} agent.",
        version="0.1.0",
    )

    @app.post(f"/{agent_name}/query", response_model=MCPResponse)
    async def query_mcp(request: MCPRequest):
        print(f"Received query for {agent_name}: {request.query} from user {request.user_id}")
        # In a real scenario, this would call the external API
        # For now, return mock data
        return MCPResponse(
            status="success",
            data=mock_data,
            message=f"Successfully processed query for {agent_name}."
        )

    return app
