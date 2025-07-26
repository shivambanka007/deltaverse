import pytest
from unittest.mock import Mock, patch

@pytest.fixture(scope="session", autouse=True)
def mock_firebase():
    """Mock Firebase services for all tests"""
    mock_auth = Mock()
    mock_db = Mock()
    mock_app = Mock()

    # Create a mock firebase_admin module
    mock_firebase_admin = Mock()
    mock_firebase_admin.initialize_app.return_value = mock_app
    mock_firebase_admin.firestore.client.return_value = mock_db
    mock_firebase_admin.auth = mock_auth

    # Patch the entire firebase_admin module
    with patch.dict('sys.modules', {'firebase_admin': mock_firebase_admin}):
        yield {
            'auth': mock_auth,
            'db': mock_db,
            'app': mock_app
        }
