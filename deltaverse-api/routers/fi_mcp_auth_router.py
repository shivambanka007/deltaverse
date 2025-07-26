"""
Fi MCP Authentication Router
API endpoints for Fi MCP user authentication flow
Author: Principal Backend Engineer with 15+ years experience
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Form
from fastapi.responses import JSONResponse, RedirectResponse, HTMLResponse
from typing import Optional, Dict, Any
import logging

from ..services.fi_mcp_auth import get_fi_mcp_auth_service, FiMCPAuthService
from ..config.fi_mcp_config import fi_mcp_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fi-auth", tags=["Fi MCP Authentication"])

@router.post("/initiate")
async def initiate_fi_authentication(
    authorization: str = Header(..., description="Firebase JWT token"),
    auth_service: FiMCPAuthService = Depends(get_fi_mcp_auth_service)
):
    """
    Initiate Fi MCP authentication for a Firebase-authenticated user
    
    Args:
        authorization: Firebase JWT token (Bearer token)
        
    Returns:
        Authentication initiation response with login URL
    """
    try:
        # Extract Firebase token
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format"
            )
        
        firebase_token = authorization.replace("Bearer ", "")
        
        # Verify Firebase token (simplified - you'd use Firebase Admin SDK)
        # For now, extract user ID from token or use a mock verification
        try:
            # TODO: Implement proper Firebase token verification
            # firebase_user = firebase_admin.auth.verify_id_token(firebase_token)
            # firebase_uid = firebase_user['uid']
            
            # For development, extract from token or use mock
            firebase_uid = "firebase_user_123"  # Mock Firebase UID
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token"
            )
        
        logger.info(f"Initiating Fi MCP authentication for Firebase user: {firebase_uid}")
        
        result = await auth_service.initiate_authentication(firebase_uid)
        
        if result["success"]:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "success": True,
                    "session_id": result["session_id"],
                    "login_url": result["login_url"],
                    "auth_type": result["auth_type"],
                    "firebase_uid": result["firebase_uid"],
                    "instructions": result["instructions"],
                    "test_scenarios": result.get("test_phone_numbers", []),
                    "message": "Fi MCP authentication initiated successfully"
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fi MCP authentication initiation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication initiation failed: {str(e)}"
        )

@router.get("/login-page")
async def get_login_page(
    session_id: str = Query(..., description="Session ID for authentication"),
    auth_service: FiMCPAuthService = Depends(get_fi_mcp_auth_service)
):
    """
    Get Fi MCP login page (for development)
    This mimics the Fi MCP dev server's login page
    """
    try:
        # Check if session exists
        session_info = auth_service.get_session_info(session_id)
        if not session_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or expired"
            )
        
        # Generate login page HTML
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fi MCP Authentication - DeltaVerse</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    max-width: 500px;
                    margin: 50px auto;
                    padding: 20px;
                    background: #f5f5f5;
                }}
                .container {{
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .form-group {{
                    margin-bottom: 20px;
                }}
                label {{
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                }}
                input {{
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 16px;
                    box-sizing: border-box;
                }}
                button {{
                    width: 100%;
                    padding: 12px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                }}
                button:hover {{
                    background: #0056b3;
                }}
                .test-numbers {{
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }}
                .test-numbers h4 {{
                    margin: 0 0 10px 0;
                    color: #495057;
                }}
                .test-number {{
                    display: inline-block;
                    background: #e9ecef;
                    padding: 5px 10px;
                    margin: 2px;
                    border-radius: 3px;
                    font-family: monospace;
                    cursor: pointer;
                }}
                .test-number:hover {{
                    background: #dee2e6;
                }}
                .note {{
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🏦 Fi MCP Authentication</h2>
                    <p>Connect your financial data to DeltaVerse</p>
                </div>
                
                <div class="note">
                    <strong>Development Mode:</strong> This is a test environment. Use any test phone number below and any OTP.
                </div>
                
                <div class="test-numbers">
                    <h4>📱 Test Phone Numbers (Click to use):</h4>
                    <div class="test-number" onclick="setPhoneNumber('2222222222')">2222222222 - All Assets</div>
                    <div class="test-number" onclick="setPhoneNumber('3333333333')">3333333333 - Small Portfolio</div>
                    <div class="test-number" onclick="setPhoneNumber('7777777777')">7777777777 - Debt Heavy</div>
                    <div class="test-number" onclick="setPhoneNumber('8888888888')">8888888888 - SIP Investor</div>
                    <div class="test-number" onclick="setPhoneNumber('1616161616')">1616161616 - Early Retirement</div>
                </div>
                
                <form id="authForm" method="post" action="/api/v1/fi-auth/callback">
                    <input type="hidden" name="session_id" value="{session_id}">
                    
                    <div class="form-group">
                        <label for="phone_number">Phone Number:</label>
                        <input type="tel" id="phone_number" name="phone_number" 
                               placeholder="Enter test phone number" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="otp">OTP (Any value in dev mode):</label>
                        <input type="text" id="otp" name="otp" 
                               placeholder="Enter any OTP" required>
                    </div>
                    
                    <button type="submit">🔐 Authenticate</button>
                </form>
            </div>
            
            <script>
                function setPhoneNumber(number) {{
                    document.getElementById('phone_number').value = number;
                }}
                
                // Auto-fill OTP for convenience
                document.getElementById('otp').value = '123456';
            </script>
        </body>
        </html>
        """
        
        return HTMLResponse(content=html_content)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login page generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login page generation failed"
        )

@router.post("/callback")
async def handle_authentication_callback(
    session_id: str = Form(...),
    phone_number: str = Form(...),
    otp: str = Form(...),
    auth_service: FiMCPAuthService = Depends(get_fi_mcp_auth_service)
):
    """
    Handle authentication callback from login form
    
    Args:
        session_id: Session ID from authentication flow
        phone_number: User's phone number
        otp: OTP code
        
    Returns:
        Authentication result or redirect
    """
    try:
        logger.info(f"Processing authentication callback for session: {session_id}")
        
        result = await auth_service.handle_authentication_callback(
            session_id, phone_number, otp
        )
        
        if result["success"]:
            # Return success page
            success_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Successful - DeltaVerse</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {{
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        max-width: 500px;
                        margin: 50px auto;
                        padding: 20px;
                        background: #f5f5f5;
                        text-align: center;
                    }}
                    .container {{
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }}
                    .success {{
                        color: #28a745;
                        font-size: 48px;
                        margin-bottom: 20px;
                    }}
                    .scenario {{
                        background: #e7f3ff;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }}
                    button {{
                        padding: 12px 24px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-size: 16px;
                        cursor: pointer;
                        margin: 10px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success">✅</div>
                    <h2>Authentication Successful!</h2>
                    <p>Your financial data is now connected to DeltaVerse.</p>
                    
                    <div class="scenario">
                        <strong>Test Scenario:</strong><br>
                        📱 {result['phone_number']}<br>
                        📊 {result['scenario']}
                    </div>
                    
                    <p>You can now close this window and return to DeltaVerse.</p>
                    
                    <button onclick="window.close()">Close Window</button>
                    <button onclick="testConnection()">Test Connection</button>
                </div>
                
                <script>
                    function testConnection() {{
                        fetch('/api/v1/mcp/status')
                            .then(response => response.json())
                            .then(data => {{
                                alert('MCP Status: ' + data.status);
                            }})
                            .catch(error => {{
                                alert('Error testing connection: ' + error);
                            }});
                    }}
                    
                    // Auto-close after 10 seconds
                    setTimeout(() => {{
                        if (confirm('Close this window and return to DeltaVerse?')) {{
                            window.close();
                        }}
                    }}, 10000);
                </script>
            </body>
            </html>
            """
            
            return HTMLResponse(content=success_html)
        else:
            # Return error page
            error_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Failed - DeltaVerse</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {{
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        max-width: 500px;
                        margin: 50px auto;
                        padding: 20px;
                        background: #f5f5f5;
                        text-align: center;
                    }}
                    .container {{
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }}
                    .error {{
                        color: #dc3545;
                        font-size: 48px;
                        margin-bottom: 20px;
                    }}
                    .error-message {{
                        background: #f8d7da;
                        color: #721c24;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }}
                    button {{
                        padding: 12px 24px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-size: 16px;
                        cursor: pointer;
                        margin: 10px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error">❌</div>
                    <h2>Authentication Failed</h2>
                    
                    <div class="error-message">
                        {result['error']}
                    </div>
                    
                    <button onclick="history.back()">Try Again</button>
                    <button onclick="window.close()">Close Window</button>
                </div>
            </body>
            </html>
            """
            
            return HTMLResponse(content=error_html, status_code=400)
            
    except Exception as e:
        logger.error(f"Authentication callback failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication callback failed: {str(e)}"
        )

@router.get("/status/{session_id}")
async def get_authentication_status(
    session_id: str,
    auth_service: FiMCPAuthService = Depends(get_fi_mcp_auth_service)
):
    """
    Get authentication status for a session
    
    Args:
        session_id: Session ID
        
    Returns:
        Authentication status
    """
    try:
        session_info = auth_service.get_session_info(session_id)
        
        if not session_info:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={
                    "authenticated": False,
                    "error": "Session not found or expired"
                }
            )
        
        user_context = auth_service.get_user_context(session_id)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "authenticated": user_context is not None,
                "session_id": session_id,
                "status": session_info["status"],
                "phone_number": session_info.get("phone_number"),
                "scenario": session_info.get("scenario"),
                "created_at": session_info["created_at"].isoformat(),
                "expires_at": session_info["expires_at"].isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"Status check failed for session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Status check failed: {str(e)}"
        )

@router.post("/logout/{session_id}")
async def logout_user(
    session_id: str,
    auth_service: FiMCPAuthService = Depends(get_fi_mcp_auth_service)
):
    """
    Logout user and clear session
    
    Args:
        session_id: Session ID
        
    Returns:
        Logout result
    """
    try:
        result = await auth_service.logout_user(session_id)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK if result["success"] else status.HTTP_400_BAD_REQUEST,
            content=result
        )
        
    except Exception as e:
        logger.error(f"Logout failed for session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )

@router.get("/firebase-status")
async def get_firebase_user_fi_status(
    authorization: str = Header(..., description="Firebase JWT token"),
    auth_service: FiMCPAuthService = Depends(get_fi_mcp_auth_service)
):
    """
    Check Fi MCP authentication status for a Firebase user
    
    Args:
        authorization: Firebase JWT token
        
    Returns:
        Fi MCP authentication status for the Firebase user
    """
    try:
        # Extract Firebase token
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format"
            )
        
        firebase_token = authorization.replace("Bearer ", "")
        
        # Verify Firebase token (simplified)
        try:
            # TODO: Implement proper Firebase token verification
            firebase_uid = "firebase_user_123"  # Mock Firebase UID
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token"
            )
        
        # Check Fi MCP authentication status
        fi_session = auth_service.get_fi_session_by_firebase_uid(firebase_uid)
        is_authenticated = auth_service.is_firebase_user_authenticated(firebase_uid)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "firebase_uid": firebase_uid,
                "fi_mcp_authenticated": is_authenticated,
                "fi_session": {
                    "phone_number": fi_session.get("phone_number") if fi_session else None,
                    "authenticated_at": fi_session.get("authenticated_at") if fi_session else None
                } if fi_session else None,
                "message": "Connected to financial data" if is_authenticated else "Financial data not connected"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Firebase Fi status check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Status check failed: {str(e)}"
        )
async def get_test_scenarios():
    """
    Get available test scenarios for development
    
    Returns:
        List of test phone numbers and their scenarios
    """
    try:
        scenarios = []
        
        for phone_number in fi_mcp_settings.test_phone_numbers:
            scenarios.append({
                "phone_number": phone_number,
                "description": fi_mcp_settings.get_test_scenario_description(phone_number)
            })
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "total_scenarios": len(scenarios),
                "environment": fi_mcp_settings.ENVIRONMENT,
                "server_type": fi_mcp_settings.server_type,
                "scenarios": scenarios
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get test scenarios: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get test scenarios: {str(e)}"
        )
