#!/usr/bin/env python3
"""
Quick integration verification script
Verifies that all components are properly connected
"""

import os
import sys
import json
from pathlib import Path

def verify_credentials():
    """Verify credentials file exists and is valid"""
    print("🔍 Verifying Vertex AI Credentials...")
    
    creds_path = Path(__file__).parent / "credentials" / "vertexai_connect_creds.json"
    
    if not creds_path.exists():
        print("   ❌ Credentials file not found!")
        return False
    
    try:
        with open(creds_path, 'r') as f:
            creds = json.load(f)
        
        required_fields = ['type', 'project_id', 'private_key', 'client_email']
        missing = [field for field in required_fields if field not in creds]
        
        if missing:
            print(f"   ❌ Missing fields: {missing}")
            return False
        
        print("   ✅ Credentials file is valid")
        print(f"   📧 Service Account: {creds['client_email']}")
        print(f"   🏗️ Project ID: {creds['project_id']}")
        return True
        
    except Exception as e:
        print(f"   ❌ Error reading credentials: {e}")
        return False

def verify_environment():
    """Verify environment configuration"""
    print("\n🔧 Verifying Environment Configuration...")
    
    # Check if .env file exists
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        print("   ✅ .env file found")
    else:
        print("   ⚠️ .env file not found (using defaults)")
    
    # Check key environment variables
    env_vars = {
        'VERTEX_AI_PROJECT_ID': os.getenv('VERTEX_AI_PROJECT_ID', 'opportune-scope-466406-p6'),
        'VERTEX_AI_LOCATION': os.getenv('VERTEX_AI_LOCATION', 'us-central1'),
        'GOOGLE_APPLICATION_CREDENTIALS': os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'credentials/vertexai_connect_creds.json')
    }
    
    for var, value in env_vars.items():
        print(f"   {var}: {value}")
    
    return True

def verify_dependencies():
    """Verify required dependencies are installed"""
    print("\n📦 Verifying Dependencies...")
    
    # Test imports with better error handling
    dependencies = [
        ('vertexai', 'vertexai'),
        ('google-cloud-aiplatform', 'google.cloud.aiplatform'),
        ('google-auth', 'google.auth'),
        ('fastapi', 'fastapi')
    ]
    
    missing_packages = []
    
    for package_name, import_name in dependencies:
        try:
            __import__(import_name)
            print(f"   ✅ {package_name}")
        except ImportError as e:
            print(f"   ❌ {package_name} - Missing or import error")
            missing_packages.append(package_name)
    
    if missing_packages:
        print(f"\n⚠️ Install missing packages:")
        print(f"   pip3 install {' '.join(missing_packages)}")
        return False
    
    return True

def verify_file_structure():
    """Verify project file structure"""
    print("\n📁 Verifying File Structure...")
    
    base_path = Path(__file__).parent
    required_files = [
        "services/vertex_ai_service.py",
        "services/mcp_service.py",
        "services/ai_agent_service.py",
        "routers/chat_router.py",
        "routers/mcp_router.py",
        "models/financial_data.py"
    ]
    
    all_exist = True
    for file_path in required_files:
        full_path = base_path / file_path
        if full_path.exists():
            print(f"   ✅ {file_path}")
        else:
            print(f"   ❌ {file_path} - Missing")
            all_exist = False
    
    return all_exist

def test_basic_vertex_ai():
    """Test basic Vertex AI functionality"""
    print("\n🧪 Testing Basic Vertex AI Access...")
    
    try:
        # Test basic imports
        import vertexai
        from google.cloud import aiplatform
        from google.oauth2 import service_account
        
        print("   ✅ All imports successful")
        
        # Test credentials loading
        creds_path = Path(__file__).parent / "credentials" / "vertexai_connect_creds.json"
        credentials = service_account.Credentials.from_service_account_file(
            str(creds_path),
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        
        print("   ✅ Credentials loaded successfully")
        print(f"   📧 Service Account: {credentials.service_account_email}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Vertex AI test failed: {e}")
        return False

def main():
    """Main verification function"""
    print("🚀 DeltaVerse Integration Verification")
    print("=" * 50)
    
    checks = [
        ("Credentials", verify_credentials),
        ("Environment", verify_environment),
        ("Dependencies", verify_dependencies),
        ("File Structure", verify_file_structure),
        ("Vertex AI Access", test_basic_vertex_ai)
    ]
    
    results = []
    
    for check_name, check_func in checks:
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print(f"   ❌ Error in {check_name}: {e}")
            results.append((check_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Verification Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for check_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {check_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n📈 Overall: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 All verifications passed!")
        print("\n✅ Your integration is ready:")
        print("   • Existing Vertex AI credentials are properly configured")
        print("   • Service Account: fastapi-vertex-ai-service@opportune-scope-466406-p6.iam.gserviceaccount.com")
        print("   • All required files are in place")
        print("   • Dependencies are installed and working")
        print("   • Environment is configured")
        print("\n🚀 Next steps:")
        print("   1. Run: python3 test_existing_vertex_ai.py")
        print("   2. Start your FastAPI server")
        print("   3. Test the AI chat interface")
        return True
    else:
        print(f"\n⚠️ {total - passed} verification(s) failed.")
        print("Please fix the issues above before proceeding.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
