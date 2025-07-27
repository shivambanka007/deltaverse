
import os
import json
import tempfile
from google.cloud import secretmanager

def setup_gcp_service_account():
    """
    Sets up Google Cloud service account credentials from an environment variable.
    """
    service_account_json = os.getenv("GCP_SERVICE_ACCOUNT_KEY_JSON")
    if service_account_json:
        try:
            # Create a temporary file to store the service account key
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_file:
                json.dump(json.loads(service_account_json), temp_file, indent=2)
                temp_file_path = temp_file.name
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_file_path
            print(f"Google Application Credentials set from environment variable to {temp_file_path}")
        except json.JSONDecodeError:
            print("Error: GCP_SERVICE_ACCOUNT_KEY_JSON is not a valid JSON string.")
        except Exception as e:
            print(f"Error setting up GCP service account: {e}")
    else:
        print("GCP_SERVICE_ACCOUNT_KEY_JSON environment variable not found. Using default GCP authentication.")

def get_secret(secret_id: str) -> str:
    """
    Retrieves a secret from Google Secret Manager.
    """
    project_id = os.getenv("GCP_PROJECT_ID")
    if not project_id:
        raise ValueError("GCP_PROJECT_ID environment variable not set.")

    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
    try:
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        print(f"Error accessing secret {secret_id}: {e}")
        # Fallback to environment variable for local development
        return os.getenv(secret_id.upper(), f"MOCK_SECRET_{secret_id}")
