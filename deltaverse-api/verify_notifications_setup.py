#!/usr/bin/env python3
"""
Verification script for notifications router setup.
Run this to diagnose any issues with the notifications router.
"""

import os
import sys

def verify_file_structure():
    """Verify all required files exist."""
    print("📁 Verifying file structure...")
    
    required_files = [
        "app/models/notifications.py",
        "app/routers/notifications.py", 
        "app/routers/__init__.py",
        "app/models/__init__.py",
        "app/gcp_config.py",
        "app/firebase_config.py",
        "app/opportune-scope-466406-p6-firebase-adminsdk-fbsvc-584369e1bd.json"
    ]
    
    all_exist = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - MISSING")
            all_exist = False
    
    return all_exist

def verify_model_content():
    """Verify the notifications model has correct content."""
    print("\n🔍 Verifying notifications model...")
    
    model_path = "app/models/notifications.py"
    if not os.path.exists(model_path):
        print("❌ Model file missing")
        return False
    
    with open(model_path, 'r') as f:
        content = f.read()
    
    required_elements = [
        "class PushMessage",
        "class PushMessageResponse", 
        "class BulkPushMessage",
        "class BulkPushMessageResponse",
        "@field_validator",
        "recipient_whatsapp_number",
        "message_body"
    ]
    
    all_found = True
    for element in required_elements:
        if element in content:
            print(f"✅ {element}")
        else:
            print(f"❌ {element} - MISSING")
            all_found = False
    
    return all_found

def verify_gcp_authentication():
    """Verify GCP authentication configuration."""
    print("\n🔐 Verifying GCP authentication...")
    
    gcp_config_path = "app/gcp_config.py"
    if not os.path.exists(gcp_config_path):
        print("❌ GCP config file missing")
        return False
    
    with open(gcp_config_path, 'r') as f:
        content = f.read()
    
    required_elements = [
        "class GCPAuthConfig",
        "get_gcp_credentials",
        "get_gcp_project_id", 
        "is_gcp_authenticated",
        "service_account.Credentials",
        "opportune-scope-466406-p6-firebase-adminsdk-fbsvc-584369e1bd.json"
    ]
    
    all_found = True
    for element in required_elements:
        if element in content:
            print(f"✅ {element}")
        else:
            print(f"❌ {element} - MISSING")
            all_found = False
    
    return all_found

def verify_router_content():
    """Verify the notifications router has correct content."""
    print("\n🔍 Verifying notifications router...")
    
    router_path = "app/routers/notifications.py"
    if not os.path.exists(router_path):
        print("❌ Router file missing")
        return False
    
    with open(router_path, 'r') as f:
        content = f.read()
    
    required_elements = [
        "router = APIRouter",
        "@router.post(\"/send_message\"",
        "@router.post(\"/whatsapp/send\"",
        "@router.post(\"/whatsapp/send-bulk\"",
        "@router.get(\"/whatsapp/status/",
        "@router.get(\"/pubsub/status\"",
        "@router.get(\"/auth/status\"",
        "@router.get(\"/health\"",
        "def send_message",
        "def send_whatsapp_message",
        "def send_bulk_whatsapp_messages",
        "def get_message_status",
        "def get_pubsub_status",
        "def get_auth_status",
        "def notifications_health_check",
        "get_gcp_credentials",
        "pubsub_v1.PublisherClient(credentials=credentials)",
        "auth_method"
    ]
    
    all_found = True
    for element in required_elements:
        if element in content:
            print(f"✅ {element}")
        else:
            print(f"❌ {element} - MISSING")
            all_found = False
    
    return all_found

def verify_main_integration():
    """Verify main.py has notifications router integration."""
    print("\n🔍 Verifying main.py integration...")
    
    main_path = "app/main.py"
    if not os.path.exists(main_path):
        print("❌ main.py not found")
        return False
    
    with open(main_path, 'r') as f:
        content = f.read()
    
    required_elements = [
        "from app.routers.notifications import router as notifications_router",
        "from routers.notifications import router as notifications_router", 
        "notifications_router",
        "app.include_router(notifications_router)",
        "from gcp_config import get_gcp_credentials"
    ]
    
    found_count = 0
    for element in required_elements:
        if element in content:
            print(f"✅ {element}")
            found_count += 1
        else:
            print(f"⚠️ {element} - not found")
    
    # At least some integration should be present
    return found_count >= 3

def provide_troubleshooting_tips():
    """Provide troubleshooting tips."""
    print("\n🔧 Troubleshooting Tips:")
    print("=" * 50)
    
    print("\n1. If you see 'Notifications router not available' warning:")
    print("   - Check that all required files exist")
    print("   - Verify GCP authentication is properly configured")
    print("   - Ensure service account file has correct permissions")
    
    print("\n2. To test the endpoints once server is running:")
    print("   - Health check: GET http://localhost:8080/notifications/health")
    print("   - Auth status: GET http://localhost:8080/notifications/auth/status")
    print("   - Pub/Sub status: GET http://localhost:8080/notifications/pubsub/status")
    print("   - Send to Pub/Sub: POST http://localhost:8080/notifications/send_message")
    print("   - Send WhatsApp: POST http://localhost:8080/notifications/whatsapp/send")
    
    print("\n3. Expected endpoints when working:")
    print("   - POST /notifications/send_message")
    print("   - POST /notifications/whatsapp/send")
    print("   - POST /notifications/whatsapp/send-bulk") 
    print("   - GET /notifications/whatsapp/status/{message_id}")
    print("   - GET /notifications/pubsub/status")
    print("   - GET /notifications/auth/status")
    print("   - GET /notifications/health")
    
    print("\n4. Authentication troubleshooting:")
    print("   - Check service account file exists in app/ directory")
    print("   - Verify GCP_PROJECT_ID environment variable is set")
    print("   - Ensure service account has pubsub.publisher role")
    print("   - Test: curl http://localhost:8080/notifications/auth/status")
    
    print("\n5. Check server logs for:")
    print("   - '✅ Notifications router imported from...'")
    print("   - '✅ Notifications router included successfully'")
    print("   - '✅ Pub/Sub client initialized with service account credentials'")
    print("   - '📱 WhatsApp notification endpoints available at /notifications/'")

def main():
    """Main verification function."""
    print("🚀 Notifications Router Setup Verification")
    print("=" * 50)
    
    file_structure_ok = verify_file_structure()
    model_content_ok = verify_model_content()
    gcp_auth_ok = verify_gcp_authentication()
    router_content_ok = verify_router_content()
    main_integration_ok = verify_main_integration()
    
    print(f"\n📊 Verification Results:")
    print(f"   File Structure: {'✅' if file_structure_ok else '❌'}")
    print(f"   Model Content: {'✅' if model_content_ok else '❌'}")
    print(f"   GCP Authentication: {'✅' if gcp_auth_ok else '❌'}")
    print(f"   Router Content: {'✅' if router_content_ok else '❌'}")
    print(f"   Main Integration: {'✅' if main_integration_ok else '❌'}")
    
    if all([file_structure_ok, model_content_ok, gcp_auth_ok, router_content_ok, main_integration_ok]):
        print("\n🎉 All verifications passed!")
        print("💡 The notifications router uses unified GCP authentication (same as Firestore).")
        print("   This should eliminate 'default credentials not found' errors.")
    else:
        print("\n❌ Some verifications failed!")
        print("   Please fix the issues above before proceeding.")
    
    provide_troubleshooting_tips()

if __name__ == "__main__":
    main()
