import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase with service account credentials"""
    
    # Get project ID from environment variable
    project_id = os.getenv("GCP_PROJECT_ID", "opportune-scope-466406-p6")
    
    # Try multiple service account file locations
    possible_paths = [
        # Environment-based filename
        os.path.join(os.path.dirname(__file__), f"{project_id}-firebase-adminsdk-fbsvc-584369e1bd.json"),
        # Generic filename
        os.path.join(os.path.dirname(__file__), "firebase-service-account.json"),
        # Original filename (fallback)
        os.path.join(os.path.dirname(__file__), "opportune-scope-466406-p6-firebase-adminsdk-fbsvc-584369e1bd.json"),
        # Environment variable path
        os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    ]
    
    cred_path = None
    for path in possible_paths:
        if path and os.path.exists(path):
            cred_path = path
            break
    
    if not cred_path:
        raise FileNotFoundError(
            f"Firebase service account file not found. Tried paths: {possible_paths}"
        )
    
    print(f"Using Firebase service account: {cred_path}")
    
    if not firebase_admin._apps:
        # Check if it's a JSON string (for environment variables)
        if cred_path.startswith('{'):
            cred_dict = json.loads(cred_path)
            cred = credentials.Certificate(cred_dict)
        else:
            cred = credentials.Certificate(cred_path)
            
        firebase_admin.initialize_app(cred, {
            'projectId': project_id,
        })
    
    # Return Firestore client
    return firestore.client()

# Convenience function
def get_firestore_client():
    """Get Firestore client, initializing Firebase if needed"""
    return initialize_firebase()
