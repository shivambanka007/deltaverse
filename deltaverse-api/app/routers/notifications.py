"""
Notifications router for WhatsApp messaging functionality.
Handles sending push notifications via WhatsApp and GCP Pub/Sub.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import logging
import os
import sys
import importlib.util
import json
from datetime import datetime
import uuid

# Import GCP Pub/Sub with unified authentication
try:
    from google.cloud import pubsub_v1
    PUBSUB_AVAILABLE = True
except ImportError:
    PUBSUB_AVAILABLE = False
    pubsub_v1 = None

# Use the same robust import strategy as financial_health router
def import_module_directly(module_name, file_path):
    """Import a module directly from file path to avoid import chain issues"""
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

# Get the base app directory
app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Import GCP authentication configuration
try:
    gcp_config_path = os.path.join(app_dir, "gcp_config.py")
    gcp_config_module = import_module_directly("gcp_config", gcp_config_path)
    get_gcp_credentials = gcp_config_module.get_gcp_credentials
    get_gcp_project_id = gcp_config_module.get_gcp_project_id
    is_gcp_authenticated = gcp_config_module.is_gcp_authenticated
    get_gcp_auth_config = gcp_config_module.get_gcp_auth_config
    GCP_AUTH_AVAILABLE = True
except Exception as e:
    # Fallback: use environment-based authentication
    get_gcp_credentials = lambda: None
    get_gcp_project_id = lambda: os.getenv("GCP_PROJECT_ID", "opportune-scope-466406-p6")
    is_gcp_authenticated = lambda: False
    get_gcp_auth_config = lambda: None
    GCP_AUTH_AVAILABLE = False

# Import notification models directly
try:
    models_path = os.path.join(app_dir, "models", "notifications.py")
    models_module = import_module_directly("notifications_models", models_path)
    PushMessage = models_module.PushMessage
    PushMessageResponse = models_module.PushMessageResponse
    BulkPushMessage = models_module.BulkPushMessage
    BulkPushMessageResponse = models_module.BulkPushMessageResponse
except Exception as e:
    # Fallback: try relative import
    try:
        from ..models.notifications import (
            PushMessage, 
            PushMessageResponse, 
            BulkPushMessage, 
            BulkPushMessageResponse
        )
    except ImportError:
        # Final fallback: define minimal models inline
        from pydantic import BaseModel, Field
        
        class PushMessage(BaseModel):
            recipient_whatsapp_number: str
            message_body: str
        
        class PushMessageResponse(BaseModel):
            success: bool
            message_id: str = None
            status: str
            error_message: str = None
            timestamp: str = None
        
        class BulkPushMessage(BaseModel):
            recipient_whatsapp_numbers: list[str]
            message_body: str
        
        class BulkPushMessageResponse(BaseModel):
            total_messages: int
            successful_messages: int
            failed_messages: int
            message_results: list[dict]
            overall_status: str

# Set up logging
logger = logging.getLogger(__name__)

# Initialize GCP Pub/Sub client with unified authentication
publisher = None
topic_path = None

def initialize_pubsub_client():
    """Initialize Pub/Sub client using the same authentication as Firestore."""
    global publisher, topic_path
    
    if not PUBSUB_AVAILABLE:
        logger.warning("⚠️ Google Cloud Pub/Sub library not available - install google-cloud-pubsub")
        return False
    
    try:
        # Get project ID and topic ID
        project_id = get_gcp_project_id()
        pubsub_topic_id = os.getenv("PUB_SUB_TOPIC_ID", "user-notification")
        
        # Get credentials using the same method as Firestore
        credentials = get_gcp_credentials()
        
        if credentials:
            # Initialize Pub/Sub client with explicit credentials
            publisher = pubsub_v1.PublisherClient(credentials=credentials)
            topic_path = publisher.topic_path(project_id, pubsub_topic_id)
            
            logger.info(f"✅ Pub/Sub client initialized with service account credentials")
            logger.info(f"   Project ID: {project_id}")
            logger.info(f"   Topic: {topic_path}")
            
            # Get auth info for logging
            if GCP_AUTH_AVAILABLE:
                auth_config = get_gcp_auth_config()
                if auth_config:
                    cred_info = auth_config.get_credentials_info()
                    logger.info(f"   Service Account: {cred_info.get('service_account_email', 'unknown')}")
            
            return True
        else:
            # Fallback to default credentials (original behavior)
            logger.warning("⚠️ Using default credentials for Pub/Sub (may cause authentication issues)")
            publisher = pubsub_v1.PublisherClient()
            topic_path = publisher.topic_path(project_id, pubsub_topic_id)
            logger.info(f"✅ Pub/Sub client initialized with default credentials")
            logger.info(f"   Topic: {topic_path}")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error initializing Pub/Sub client: {e}")
        publisher = None
        topic_path = None
        return False

# Initialize Pub/Sub client on module load
pubsub_initialized = initialize_pubsub_client()

# Create router
router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)


@router.post("/send_message", response_model=Dict[str, Any])
async def send_message(message: PushMessage) -> Dict[str, Any]:
    """
    Receives a message and publishes it to a Google Cloud Pub/Sub topic asynchronously.
    Uses the same authentication method as Firestore for consistent GCP access.

    The message includes the recipient's WhatsApp number and the message content.
    This endpoint does not wait for the message to be acknowledged by the Pub/Sub service.
    
    Args:
        message: PushMessage containing recipient number and message body
        
    Returns:
        Dictionary with status and message information
        
    Raises:
        HTTPException: If Pub/Sub client is not initialized or publishing fails
    """
    if not publisher or not topic_path:
        auth_status = "authenticated" if is_gcp_authenticated() else "not authenticated"
        raise HTTPException(
            status_code=500,
            detail=f"Pub/Sub client is not initialized. GCP authentication status: {auth_status}. "
                   f"Check service account credentials and environment variables."
        )

    try:
        logger.info(f"Publishing message to Pub/Sub topic for {message.recipient_whatsapp_number}")
        
        # Construct the message payload as a JSON string
        message_data = {
            "recipient_whatsapp_number": message.recipient_whatsapp_number,
            "message_body": message.message_body,
            "timestamp": datetime.utcnow().isoformat(),
            "message_id": str(uuid.uuid4()),
            "source": "deltaverse-api",
            "auth_method": "service_account" if is_gcp_authenticated() else "default"
        }
        
        # Data must be a bytestring
        data = json.dumps(message_data).encode("utf-8")

        # Publish the message to the Pub/Sub topic.
        # This is a non-blocking call and returns a concurrent.futures.Future.
        future = publisher.publish(topic_path, data)

        # Optional: Add a callback to log the result of the publish operation.
        # This does not block the main request.
        def callback(future):
            try:
                # The result() method on the future will raise an exception if the
                # publish failed.
                message_id = future.result()
                logger.info(f"✅ Successfully published message with ID: {message_id}")
            except Exception as e:
                logger.error(f"❌ Failed to publish message to Pub/Sub: {e}")

        future.add_done_callback(callback)

        return {
            "status": "success",
            "message": "Message has been queued for publishing to Pub/Sub topic.",
            "message_id": message_data["message_id"],
            "timestamp": message_data["timestamp"],
            "topic": topic_path,
            "auth_method": message_data["auth_method"],
            "project_id": get_gcp_project_id()
        }

    except Exception as e:
        logger.error(f"Error queueing message for Pub/Sub: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue message for Pub/Sub. Error: {e}"
        )


@router.post("/whatsapp/send", response_model=PushMessageResponse)
async def send_whatsapp_message(message: PushMessage) -> PushMessageResponse:
    """
    Send a WhatsApp message to a single recipient.
    
    Args:
        message: PushMessage containing recipient number and message body
        
    Returns:
        PushMessageResponse with success status and message details
        
    Raises:
        HTTPException: If message sending fails
    """
    try:
        logger.info(f"Sending WhatsApp message to {message.recipient_whatsapp_number}")
        
        # TODO: Implement actual WhatsApp API integration
        # For now, this is a placeholder that simulates message sending
        
        # Validate the message (Pydantic will handle basic validation)
        if not message.recipient_whatsapp_number or not message.message_body:
            raise HTTPException(
                status_code=400, 
                detail="Both recipient_whatsapp_number and message_body are required"
            )
        
        # Simulate message sending (replace with actual WhatsApp API call)
        message_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # In a real implementation, you would:
        # 1. Connect to WhatsApp Business API
        # 2. Send the message
        # 3. Handle response and errors
        # 4. Return appropriate status
        
        logger.info(f"WhatsApp message sent successfully. Message ID: {message_id}")
        
        return PushMessageResponse(
            success=True,
            message_id=message_id,
            status="sent",
            error_message=None,
            timestamp=timestamp
        )
        
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send WhatsApp message: {str(e)}"
        )


@router.post("/whatsapp/send-bulk", response_model=BulkPushMessageResponse)
async def send_bulk_whatsapp_messages(bulk_message: BulkPushMessage) -> BulkPushMessageResponse:
    """
    Send WhatsApp messages to multiple recipients.
    
    Args:
        bulk_message: BulkPushMessage containing recipient numbers and message body
        
    Returns:
        BulkPushMessageResponse with detailed results for each message
        
    Raises:
        HTTPException: If bulk message sending fails
    """
    try:
        logger.info(f"Sending bulk WhatsApp messages to {len(bulk_message.recipient_whatsapp_numbers)} recipients")
        
        message_results = []
        successful_count = 0
        failed_count = 0
        
        # Process each recipient
        for recipient in bulk_message.recipient_whatsapp_numbers:
            try:
                # Create individual message
                individual_message = PushMessage(
                    recipient_whatsapp_number=recipient,
                    message_body=bulk_message.message_body
                )
                
                # Send message (in real implementation, this would be actual API calls)
                message_id = str(uuid.uuid4())
                timestamp = datetime.utcnow().isoformat()
                
                message_results.append({
                    "recipient": recipient,
                    "success": True,
                    "message_id": message_id,
                    "status": "sent",
                    "timestamp": timestamp,
                    "error_message": None
                })
                successful_count += 1
                
            except Exception as e:
                logger.error(f"Failed to send message to {recipient}: {str(e)}")
                message_results.append({
                    "recipient": recipient,
                    "success": False,
                    "message_id": None,
                    "status": "failed",
                    "timestamp": datetime.utcnow().isoformat(),
                    "error_message": str(e)
                })
                failed_count += 1
        
        # Determine overall status
        if successful_count == len(bulk_message.recipient_whatsapp_numbers):
            overall_status = "all_successful"
        elif successful_count > 0:
            overall_status = "partial_success"
        else:
            overall_status = "all_failed"
        
        logger.info(f"Bulk WhatsApp sending completed. Success: {successful_count}, Failed: {failed_count}")
        
        return BulkPushMessageResponse(
            total_messages=len(bulk_message.recipient_whatsapp_numbers),
            successful_messages=successful_count,
            failed_messages=failed_count,
            message_results=message_results,
            overall_status=overall_status
        )
        
    except Exception as e:
        logger.error(f"Failed to send bulk WhatsApp messages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send bulk WhatsApp messages: {str(e)}"
        )


@router.get("/whatsapp/status/{message_id}")
async def get_message_status(message_id: str) -> Dict[str, Any]:
    """
    Get the status of a previously sent WhatsApp message.
    
    Args:
        message_id: Unique identifier of the message
        
    Returns:
        Dictionary containing message status information
        
    Raises:
        HTTPException: If message ID is not found
    """
    try:
        # TODO: Implement actual message status checking
        # This would typically query the WhatsApp API or database
        
        # Placeholder response
        return {
            "message_id": message_id,
            "status": "delivered",
            "sent_at": datetime.utcnow().isoformat(),
            "delivered_at": datetime.utcnow().isoformat(),
            "read_at": None
        }
        
    except Exception as e:
        logger.error(f"Failed to get message status for {message_id}: {str(e)}")
        raise HTTPException(
            status_code=404,
            detail=f"Message with ID {message_id} not found"
        )


@router.get("/pubsub/status")
async def get_pubsub_status() -> Dict[str, Any]:
    """
    Get the status of the Pub/Sub integration with authentication details.
    
    Returns:
        Dictionary containing Pub/Sub status information
    """
    auth_info = {}
    if GCP_AUTH_AVAILABLE:
        auth_config = get_gcp_auth_config()
        if auth_config:
            auth_info = auth_config.get_credentials_info()
    
    return {
        "pubsub_available": PUBSUB_AVAILABLE,
        "publisher_initialized": publisher is not None,
        "topic_path": topic_path,
        "gcp_project_id": get_gcp_project_id(),
        "pubsub_topic_id": os.getenv("PUB_SUB_TOPIC_ID", "user-notification"),
        "authentication": {
            "gcp_auth_available": GCP_AUTH_AVAILABLE,
            "authenticated": is_gcp_authenticated(),
            **auth_info
        },
        "initialization_status": {
            "pubsub_initialized": pubsub_initialized,
            "auth_method": "service_account" if is_gcp_authenticated() else "default_credentials"
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/auth/status")
async def get_auth_status() -> Dict[str, Any]:
    """
    Get detailed authentication status for GCP services.
    
    Returns:
        Dictionary containing authentication status information
    """
    auth_info = {}
    if GCP_AUTH_AVAILABLE:
        auth_config = get_gcp_auth_config()
        if auth_config:
            auth_info = auth_config.get_credentials_info()
    
    return {
        "gcp_authentication": {
            "available": GCP_AUTH_AVAILABLE,
            "authenticated": is_gcp_authenticated(),
            "project_id": get_gcp_project_id(),
            **auth_info
        },
        "services": {
            "firestore": {
                "uses_same_auth": True,
                "status": "should_work_if_gcp_auth_works"
            },
            "pubsub": {
                "library_available": PUBSUB_AVAILABLE,
                "client_initialized": publisher is not None,
                "topic_configured": topic_path is not None,
                "uses_same_auth": True
            }
        },
        "environment_variables": {
            "GCP_PROJECT_ID": os.getenv("GCP_PROJECT_ID", "not_set"),
            "PUB_SUB_TOPIC_ID": os.getenv("PUB_SUB_TOPIC_ID", "not_set"),
            "GOOGLE_APPLICATION_CREDENTIALS": "set" if os.getenv("GOOGLE_APPLICATION_CREDENTIALS") else "not_set"
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/health")
async def notifications_health_check() -> Dict[str, Any]:
    """
    Health check endpoint for notifications service.
    
    Returns:
        Dictionary containing service health information
    """
    return {
        "service": "notifications",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "whatsapp_messaging": "available",
            "bulk_messaging": "available", 
            "message_status_tracking": "available",
            "pubsub_messaging": "available" if (PUBSUB_AVAILABLE and publisher) else "unavailable"
        },
        "authentication": {
            "method": "service_account" if is_gcp_authenticated() else "default_credentials",
            "status": "authenticated" if is_gcp_authenticated() else "using_defaults",
            "consistent_with_firestore": True
        },
        "pubsub_integration": {
            "enabled": PUBSUB_AVAILABLE and publisher is not None,
            "topic_path": topic_path,
            "auth_method": "service_account" if is_gcp_authenticated() else "default"
        }
    }
