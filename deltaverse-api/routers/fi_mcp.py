from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.fi_mcp.service import FiMCPService

router = APIRouter(prefix="/api/v1/fi", tags=["Fi Integration"])

class LoginRequest(BaseModel):
    phone_number: str

class SessionRequest(BaseModel):
    session_id: str

fi_mcp_service = FiMCPService()

@router.get("/scenarios")
async def get_scenarios():
    """Get available Fi-MCP test scenarios"""
    return {
        "scenarios": fi_mcp_service.get_available_scenarios()
    }

@router.post("/login/initiate")
async def initiate_login(request: LoginRequest):
    """Initiate Fi-MCP login with test scenario"""
    response = await fi_mcp_service.initiate_login(request.phone_number)
    
    if response["status"] == "error":
        raise HTTPException(status_code=400, detail=response["message"])
        
    return response

@router.post("/data/summary")
async def get_financial_summary(request: SessionRequest):
    """Get comprehensive financial summary"""
    response = await fi_mcp_service.get_financial_summary(request.session_id)
    
    if response["status"] == "error":
        raise HTTPException(status_code=400, detail=response["message"])
        
    return response
