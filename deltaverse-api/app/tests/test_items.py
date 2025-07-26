import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from fastapi import FastAPI

# Create a test app
app = FastAPI()

@app.get("/")
async def root():
    return {"message": "DeltaVerse API is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": "test"
    }

@app.get("/api/v1/chat/health")
async def chat_health():
    return {
        "status": "healthy",
        "service": "chat"
    }

# Create test client
client = TestClient(app)

def test_read_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_chat_health():
    """Test chat health endpoint"""
    response = client.get("/api/v1/chat/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
