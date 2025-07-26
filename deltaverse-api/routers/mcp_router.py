"""
MCP Router - Professional Implementation
API endpoints for Fi Money MCP Server integration
Author: Principal Backend Engineer with 15+ years experience
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from ..services.mcp_service import get_mcp_service, FiMCPService
from ..models.financial_data import MCPDataResponse, FinancialSummary
from ..app.services.firebase_auth import firebase_auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp", tags=["Fi Money MCP Integration"])

async def get_current_user_from_token(authorization: str = None):
    """
    Extract user from authorization header
    Professional implementation with proper error handling
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        user_info = firebase_auth_service.verify_id_token(token)
        
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_info
        
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/status")
async def get_mcp_status(
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Get Fi MCP server status and connection health
    
    Returns:
        MCP server status, available tools, and connection details
    """
    try:
        logger.info("Checking Fi MCP server status")
        
        # Validate connection to Fi MCP server
        connection_status = await mcp_service.validate_connection()
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "healthy" if connection_status.get("connected") else "unhealthy",
                "fi_mcp_server": {
                    "connected": connection_status.get("connected", False),
                    "server_url": connection_status.get("server_url"),
                    "available_tools": connection_status.get("available_tools", []),
                    "tool_count": connection_status.get("tool_count", 0)
                },
                "service_info": {
                    "name": "Fi Money MCP Integration",
                    "version": "1.0.0",
                    "description": "Professional integration with Fi Money's MCP server"
                },
                "timestamp": connection_status.get("timestamp"),
                "error": connection_status.get("error") if not connection_status.get("connected") else None
            }
        )
        
    except Exception as e:
        logger.error(f"Error checking MCP status: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "error",
                "error": f"Failed to check MCP status: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        )

@router.post("/sync", response_model=MCPDataResponse)
async def sync_financial_data(
    background_tasks: BackgroundTasks,
    force_refresh: bool = False,
    authorization: str = Depends(lambda: None),  # Will be properly handled in get_current_user_from_token
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Sync user's financial data from Fi Money MCP Server
    
    Args:
        force_refresh: Force refresh even if data is recent
        authorization: Bearer token for authentication
        mcp_service: MCP service instance
        
    Returns:
        MCPDataResponse with sync status and details
    """
    try:
        # Get current user (commented out for now to allow testing)
        # current_user = await get_current_user_from_token(authorization)
        # user_id = current_user.get("uid")
        
        # For testing purposes, use a default user ID
        user_id = "test_user_123"
        
        logger.info(f"Starting financial data sync for user: {user_id}")
        
        # Perform sync
        result = await mcp_service.sync_user_financial_data(
            user_id=user_id,
            force_refresh=force_refresh
        )
        
        if result.success:
            logger.info(f"Successfully synced financial data for user {user_id}")
            
            # Optionally trigger background processing
            if result.data_types_fetched:
                background_tasks.add_task(
                    _process_synced_data_background,
                    user_id,
                    result.data_types_fetched
                )
        else:
            logger.error(f"Failed to sync financial data for user {user_id}: {result.error}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in sync endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync failed: {str(e)}"
        )

@router.get("/summary", response_model=FinancialSummary)
async def get_financial_summary(
    authorization: str = Depends(lambda: None),
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Get user's financial summary
    
    Args:
        authorization: Bearer token for authentication
        mcp_service: MCP service instance
        
    Returns:
        FinancialSummary with key financial metrics
    """
    try:
        # Get current user (commented out for now to allow testing)
        # current_user = await get_current_user_from_token(authorization)
        # user_id = current_user.get("uid")
        
        # For testing purposes, use a default user ID
        user_id = "test_user_123"
        
        logger.info(f"Getting financial summary for user: {user_id}")
        
        # Get financial summary
        summary = await mcp_service.get_financial_summary(user_id)
        
        if not summary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Financial summary not found. Try syncing data first."
            )
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting financial summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get financial summary: {str(e)}"
        )

@router.get("/tools")
async def get_available_tools(
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Get list of available Fi MCP tools
    
    Returns:
        List of available tools and their descriptions
    """
    try:
        logger.info("Getting available Fi MCP tools")
        
        connection_status = await mcp_service.validate_connection()
        
        if not connection_status.get("connected"):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Fi MCP server is not available"
            )
        
        tools = connection_status.get("available_tools", [])
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "available_tools": tools,
                "tool_count": len(tools),
                "server_url": connection_status.get("server_url"),
                "timestamp": connection_status.get("timestamp")
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting available tools: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available tools: {str(e)}"
        )

@router.post("/test-connection")
async def test_mcp_connection(
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Test connection to Fi MCP server
    
    Returns:
        Connection test results
    """
    try:
        logger.info("Testing Fi MCP server connection")
        
        connection_status = await mcp_service.validate_connection()
        
        return JSONResponse(
            status_code=status.HTTP_200_OK if connection_status.get("connected") else status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "test_result": "success" if connection_status.get("connected") else "failed",
                "connection_details": connection_status,
                "recommendations": [
                    "Connection successful - Fi MCP integration is working",
                    "You can now sync financial data",
                    "Available tools: " + ", ".join(connection_status.get("available_tools", []))
                ] if connection_status.get("connected") else [
                    "Check Fi MCP server availability",
                    "Verify network connectivity",
                    "Check configuration settings"
                ]
            }
        )
        
    except Exception as e:
        logger.error(f"Error testing MCP connection: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "test_result": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for MCP router
    
    Returns:
        Health status of MCP integration
    """
    try:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "healthy",
                "service": "Fi Money MCP Integration",
                "version": "1.0.0",
                "timestamp": datetime.now().isoformat(),
                "endpoints": {
                    "sync": "/api/v1/mcp/sync",
                    "summary": "/api/v1/mcp/summary",
                    "status": "/api/v1/mcp/status",
                    "tools": "/api/v1/mcp/tools",
                    "test": "/api/v1/mcp/test-connection"
                }
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

# ========================================================================
# BACKGROUND TASKS
# ========================================================================

async def _process_synced_data_background(user_id: str, data_types: List[str]):
    """
    Background task to process synced financial data
    
    Args:
        user_id: User identifier
        data_types: List of data types that were synced
    """
    try:
        logger.info(f"Processing synced data in background for user {user_id}")
        
        # Here you could add:
        # - Data validation
        # - Analytics calculation
        # - Notification sending
        # - AI insights generation
        
        for data_type in data_types:
            logger.debug(f"Processing {data_type} data for user {user_id}")
            
            # Add specific processing logic for each data type
            if data_type == "net_worth":
                # Process net worth data
                pass
            elif data_type == "banking":
                # Process banking data
                pass
            elif data_type == "mutual_funds":
                # Process mutual fund data
                pass
            # ... etc
        
        logger.info(f"Background processing completed for user {user_id}")
        
    except Exception as e:
        logger.error(f"Background processing failed for user {user_id}: {str(e)}")


@router.post("/sync-background")
async def sync_financial_data_background(
    background_tasks: BackgroundTasks,
    force_refresh: bool = False,
    current_user: User = Depends(get_current_user),
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Sync user's financial data in background
    
    Args:
        background_tasks: FastAPI background tasks
        force_refresh: Force refresh even if data is recent
        current_user: Authenticated user
        mcp_service: MCP service instance
        
    Returns:
        Immediate response while sync happens in background
    """
    try:
        logger.info(f"Starting background sync for user {current_user.uid}")
        
        # Add sync task to background
        background_tasks.add_task(
            mcp_service.sync_user_financial_data,
            current_user.uid,
            force_refresh
        )
        
        return {
            "message": "Financial data sync started in background",
            "user_id": current_user.uid,
            "status": "processing"
        }
        
    except Exception as e:
        logger.error(f"Error starting background sync for user {current_user.uid}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fetch-specific", response_model=MCPDataResponse)
async def fetch_specific_data_types(
    data_types: List[str],
    current_user: User = Depends(get_current_user),
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Fetch specific financial data types for user
    
    Args:
        data_types: List of data types to fetch
        current_user: Authenticated user
        mcp_service: MCP service instance
        
    Returns:
        MCPDataResponse with requested data
    """
    try:
        logger.info(f"Fetching specific data types {data_types} for user {current_user.uid}")
        
        # Validate data types
        valid_types = [
            'bank_transactions', 'mutual_funds', 'stocks', 
            'credit_report', 'epf_details', 'net_worth'
        ]
        
        invalid_types = [dt for dt in data_types if dt not in valid_types]
        if invalid_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid data types: {invalid_types}. Valid types: {valid_types}"
            )
        
        # Fetch data
        result = await mcp_service.fetch_specific_data_types(
            user_id=current_user.uid,
            data_types=data_types
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching specific data types for user {current_user.uid}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary", response_model=Optional[FinancialSummary])
async def get_financial_summary(
    current_user: User = Depends(get_current_user),
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Get financial summary for user
    
    Args:
        current_user: Authenticated user
        mcp_service: MCP service instance
        
    Returns:
        FinancialSummary or None if no data
    """
    try:
        logger.info(f"Getting financial summary for user {current_user.uid}")
        
        summary = await mcp_service.get_financial_summary(current_user.uid)
        
        if not summary:
            logger.info(f"No financial data found for user {current_user.uid}")
            return None
        
        return summary
        
    except Exception as e:
        logger.error(f"Error getting financial summary for user {current_user.uid}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_sync_status(
    current_user: User = Depends(get_current_user),
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Get sync status for user
    
    Args:
        current_user: Authenticated user
        mcp_service: MCP service instance
        
    Returns:
        Sync status information
    """
    try:
        logger.info(f"Getting sync status for user {current_user.uid}")
        
        # Get last sync time
        last_sync = await mcp_service._get_last_sync_time(current_user.uid)
        
        # Check MCP server health
        if not mcp_service.mcp_client:
            await mcp_service.initialize()
        
        async with mcp_service.mcp_client:
            server_healthy = await mcp_service.mcp_client.health_check()
        
        return {
            "user_id": current_user.uid,
            "last_sync": last_sync.isoformat() if last_sync else None,
            "server_healthy": server_healthy,
            "sync_needed": not last_sync or (
                last_sync and (datetime.utcnow() - last_sync).total_seconds() > 3600
            )
        }
        
    except Exception as e:
        logger.error(f"Error getting sync status for user {current_user.uid}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/available-data-types")
async def get_available_data_types():
    """
    Get list of available financial data types
    
    Returns:
        List of available data types with descriptions
    """
    return {
        "data_types": [
            {
                "type": "bank_transactions",
                "description": "Bank account transactions and balances",
                "fields": ["transaction_id", "date", "amount", "type", "description", "balance"]
            },
            {
                "type": "mutual_funds",
                "description": "Mutual fund holdings and SIP details",
                "fields": ["fund_name", "units", "nav", "current_value", "gain_loss"]
            },
            {
                "type": "stocks",
                "description": "Stock holdings and portfolio",
                "fields": ["symbol", "quantity", "current_price", "current_value", "gain_loss"]
            },
            {
                "type": "credit_report",
                "description": "Credit score and credit accounts",
                "fields": ["score", "rating", "accounts", "factors_affecting"]
            },
            {
                "type": "epf_details",
                "description": "Employee Provident Fund details",
                "fields": ["uan_number", "employee_contribution", "employer_contribution", "total_balance"]
            },
            {
                "type": "net_worth",
                "description": "Calculated net worth breakdown",
                "fields": ["total_assets", "total_liabilities", "net_worth", "liquid_assets"]
            }
        ]
    }

@router.delete("/data/{data_type}")
async def delete_financial_data_type(
    data_type: str,
    current_user: User = Depends(get_current_user),
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Delete specific financial data type for user
    
    Args:
        data_type: Type of data to delete
        current_user: Authenticated user
        mcp_service: MCP service instance
        
    Returns:
        Deletion status
    """
    try:
        logger.info(f"Deleting {data_type} data for user {current_user.uid}")
        
        if not mcp_service.firestore:
            await mcp_service.initialize()
        
        # Delete specific data type
        doc_ref = (mcp_service.firestore
                  .collection('users')
                  .document(current_user.uid)
                  .collection('financial_data')
                  .document(data_type))
        
        doc_ref.delete()
        
        return {
            "message": f"Successfully deleted {data_type} data",
            "user_id": current_user.uid,
            "data_type": data_type
        }
        
    except Exception as e:
        logger.error(f"Error deleting {data_type} data for user {current_user.uid}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/data")
async def delete_all_financial_data(
    current_user: User = Depends(get_current_user),
    mcp_service: FiMCPService = Depends(get_mcp_service)
):
    """
    Delete all financial data for user
    
    Args:
        current_user: Authenticated user
        mcp_service: MCP service instance
        
    Returns:
        Deletion status
    """
    try:
        logger.info(f"Deleting all financial data for user {current_user.uid}")
        
        if not mcp_service.firestore:
            await mcp_service.initialize()
        
        # Delete all financial data
        financial_data_ref = (mcp_service.firestore
                             .collection('users')
                             .document(current_user.uid)
                             .collection('financial_data'))
        
        # Get all documents and delete them
        docs = financial_data_ref.stream()
        batch = mcp_service.firestore.batch()
        
        for doc in docs:
            batch.delete(doc.reference)
        
        batch.commit()
        
        # Also reset last sync time
        mcp_service.firestore.collection('users').document(current_user.uid).update({
            'last_mcp_sync': None
        })
        
        return {
            "message": "Successfully deleted all financial data",
            "user_id": current_user.uid
        }
        
    except Exception as e:
        logger.error(f"Error deleting all financial data for user {current_user.uid}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
