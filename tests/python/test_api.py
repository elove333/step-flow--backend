"""Tests for the FastAPI application endpoints."""
import pytest
from httpx import AsyncClient
from main import app


@pytest.mark.asyncio
async def test_root_endpoint():
    """Test the root endpoint returns API information."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Step-Flow Backend API"
        assert data["version"] == "1.0.0"
        assert "endpoints" in data
        assert data["endpoints"]["health"] == "/health"
        assert data["endpoints"]["sessions"] == "/api/sessions"


@pytest.mark.asyncio
async def test_health_check():
    """Test the health check endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["message"] == "Step-Flow Backend API is running"
        assert data["service"] == "step-flow-backend"


@pytest.mark.asyncio
async def test_create_session_validation():
    """Test session creation with invalid data returns validation error."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Test with missing required fields
        response = await client.post("/api/sessions", json={})
        
        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_create_session_empty_movement_data():
    """Test session creation with empty movement data."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        session_data = {
            "user_id": "test_user",
            "session_type": "walking",
            "duration": 100.0,
            "movement_data": []  # Empty list
        }
        
        response = await client.post("/api/sessions", json=session_data)
        
        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_get_user_sessions_missing_user_id():
    """Test getting sessions without user_id returns validation error."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/sessions")
        
        assert response.status_code == 422  # Validation error

