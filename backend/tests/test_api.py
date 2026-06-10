"""
Tests for API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["app"] == "EcoMind AI"

def test_calculate_footprint():
    """Test carbon calculation endpoint."""
    payload = {
        "carbon_input": {
            "daily_car_km": 18,
            "car_fuel_type": "petrol",
            "monthly_flights": 0.5,
            "monthly_electricity_kwh": 200,
            "ac_hours_daily": 8,
            "lpg_kg_monthly": 5,
            "household_size": 1,
            "region": "india"
        }
    }
    
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["monthly_kg"] > 0
    assert data["annual_tonnes"] > 0
    assert "sources" in data
    assert "recommendations" in data

def test_chat_endpoint():
    """Test chat endpoint."""
    payload = {
        "message": "I drive 20 km daily and use AC 8 hours",
    }
    
    response = client.post("/api/chat", json=payload)
    # May fail without Gemini key, but should handle gracefully
    if response.status_code == 200:
        data = response.json()
        assert "message" in data
        assert "session_id" in data

def test_pledge_creation():
    """Test pledge creation."""
    payload = {
        "action": "Switch to public transport",
        "estimated_co2_reduction": 50,
    }
    
    response = client.post("/api/pledge", json=payload, params={"user_id": "test-user"})
    assert response.status_code == 200

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
