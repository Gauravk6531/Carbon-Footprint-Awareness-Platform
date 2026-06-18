"""
Tests for API endpoints.
Covers happy paths, error handling, input validation, and security.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import CarbonInput

client = TestClient(app)

BASE_INPUT = {
    "daily_car_km": 18,
    "car_fuel_type": "petrol",
    "monthly_flights": 0.5,
    "monthly_electricity_kwh": 200,
    "ac_hours_daily": 8,
    "lpg_kg_monthly": 5,
    "household_size": 1,
    "region": "india",
}


# ── Health ────────────────────────────────────────────────────────────────────

def test_health_check():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["app"] == "EcoMind AI"
    assert data["status"] == "ok"
    assert "gemini_available" in data


# ── Calculate ─────────────────────────────────────────────────────────────────

def test_calculate_returns_expected_fields():
    r = client.post("/api/calculate", json={"carbon_input": BASE_INPUT})
    assert r.status_code == 200
    data = r.json()
    for field in ["monthly_kg", "annual_kg", "annual_tonnes", "sources", "recommendations"]:
        assert field in data

def test_calculate_positive_emissions():
    r = client.post("/api/calculate", json={"carbon_input": BASE_INPUT})
    assert r.status_code == 200
    data = r.json()
    assert data["monthly_kg"] > 0
    assert data["annual_tonnes"] > 0

def test_calculate_zero_inputs_returns_zero():
    r = client.post("/api/calculate", json={"carbon_input": {"household_size": 1, "region": "india"}})
    assert r.status_code == 200
    assert r.json()["monthly_kg"] == 0.0

def test_calculate_electric_car_lower_than_petrol():
    r_petrol = client.post("/api/calculate", json={"carbon_input": {**BASE_INPUT, "car_fuel_type": "petrol"}})
    r_elec = client.post("/api/calculate", json={"carbon_input": {**BASE_INPUT, "car_fuel_type": "electric"}})
    assert r_elec.json()["monthly_kg"] < r_petrol.json()["monthly_kg"]

def test_calculate_annual_equals_monthly_times_12():
    r = client.post("/api/calculate", json={"carbon_input": BASE_INPUT})
    data = r.json()
    assert abs(data["annual_kg"] - data["monthly_kg"] * 12) < 0.1

def test_calculate_recommendations_is_list():
    r = client.post("/api/calculate", json={"carbon_input": BASE_INPUT})
    assert isinstance(r.json()["recommendations"], list)

def test_calculate_india_higher_than_eu_electricity_only():
    """Isolate electricity to verify region-specific grid factor is applied."""
    elec_only = {"household_size": 1, "monthly_electricity_kwh": 500}
    r_india = client.post("/api/calculate", json={"carbon_input": {**elec_only, "region": "india"}})
    r_eu = client.post("/api/calculate", json={"carbon_input": {**elec_only, "region": "eu"}})
    assert r_india.json()["monthly_kg"] > r_eu.json()["monthly_kg"]

def test_calculate_stores_and_retrieves_history():
    uid = "history-test-user-api"
    client.post("/api/calculate", json={"carbon_input": BASE_INPUT, "user_id": uid})
    r = client.get(f"/api/footprints/{uid}")
    assert r.status_code == 200
    assert len(r.json()["footprints"]) >= 1


# ── What-If ───────────────────────────────────────────────────────────────────

def test_what_if_no_car_reduces_emissions():
    payload = {
        "baseline_data": {**BASE_INPUT, "daily_car_km": 20},
        "scenario_changes": {"daily_car_km": 0},
        "scenario_name": "No car",
    }
    r = client.post("/api/what-if", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["scenario_monthly_kg"] < data["baseline_monthly_kg"]
    assert data["percentage_reduction"] > 0
    assert data["saved_kg_monthly"] >= 0
    assert data["annual_money_saved"] >= 0

def test_what_if_electric_car_reduces_emissions():
    payload = {
        "baseline_data": BASE_INPUT,
        "scenario_changes": {"car_fuel_type": "electric"},
        "scenario_name": "Switch to EV",
    }
    r = client.post("/api/what-if", json=payload)
    assert r.status_code == 200
    assert r.json()["scenario_monthly_kg"] < r.json()["baseline_monthly_kg"]

def test_what_if_scenario_name_preserved():
    payload = {
        "baseline_data": BASE_INPUT,
        "scenario_changes": {"monthly_flights": 0},
        "scenario_name": "No flights",
    }
    r = client.post("/api/what-if", json=payload)
    assert r.status_code == 200
    assert r.json()["scenario_name"] == "No flights"

def test_what_if_percentage_between_0_and_100():
    payload = {
        "baseline_data": BASE_INPUT,
        "scenario_changes": {"daily_car_km": 0},
        "scenario_name": "No car",
    }
    r = client.post("/api/what-if", json=payload)
    assert r.status_code == 200
    pct = r.json()["percentage_reduction"]
    assert 0 <= pct <= 100


# ── Chat ──────────────────────────────────────────────────────────────────────

def test_chat_graceful_without_gemini():
    r = client.post("/api/chat", json={"message": "I drive 20 km daily"})
    assert r.status_code in (200, 503)

def test_chat_empty_message_rejected():
    r = client.post("/api/chat", json={"message": ""})
    assert r.status_code == 422

def test_chat_returns_session_id_when_available():
    r = client.post("/api/chat", json={"message": "I drive 15 km daily"})
    if r.status_code == 200:
        assert "session_id" in r.json()
        assert "message" in r.json()


# ── Pledges ───────────────────────────────────────────────────────────────────

def test_pledge_creation_returns_id_and_status():
    r = client.post("/api/pledge", json={
        "action": "Switch to public transport",
        "estimated_co2_reduction": 50,
    }, params={"user_id": "pledge-test-user"})
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "created"
    assert "id" in data

def test_pledge_retrieval_after_creation():
    uid = "pledge-retrieval-user"
    client.post("/api/pledge", json={
        "action": "Use LED bulbs",
        "estimated_co2_reduction": 10,
    }, params={"user_id": uid})
    r = client.get(f"/api/pledges/{uid}")
    assert r.status_code == 200
    assert any(p["action"] == "Use LED bulbs" for p in r.json()["pledges"])

def test_pledge_fields_present():
    uid = "pledge-fields-user"
    client.post("/api/pledge", json={
        "action": "Take public transit",
        "estimated_co2_reduction": 25,
    }, params={"user_id": uid})
    r = client.get(f"/api/pledges/{uid}")
    pledge = r.json()["pledges"][0]
    for field in ["id", "action", "co2_reduction_kg", "status"]:
        assert field in pledge
    assert pledge["status"] == "active"

def test_multiple_pledges_stored():
    uid = "multi-pledge-user"
    for action, reduction in [("Carpool", 30), ("LED bulbs", 10), ("Reduce AC", 20)]:
        client.post("/api/pledge", json={
            "action": action, "estimated_co2_reduction": reduction,
        }, params={"user_id": uid})
    r = client.get(f"/api/pledges/{uid}")
    assert len(r.json()["pledges"]) >= 3


# ── Input validation (Pydantic model) ─────────────────────────────────────────

def test_invalid_fuel_type_coerced_to_petrol():
    m = CarbonInput(daily_car_km=10, car_fuel_type="hydrogen")
    assert m.car_fuel_type == "petrol"

def test_invalid_region_coerced_to_india():
    m = CarbonInput(region="mars")
    assert m.region == "india"

def test_invalid_flight_type_coerced_to_domestic():
    m = CarbonInput(flight_type="supersonic")
    assert m.flight_type == "domestic"

def test_invalid_transport_type_coerced_to_bus():
    m = CarbonInput(public_transport_type="helicopter")
    assert m.public_transport_type == "bus"

def test_ac_hours_above_24_rejected():
    with pytest.raises(Exception):
        CarbonInput(ac_hours_daily=25)

def test_negative_car_km_rejected():
    with pytest.raises(Exception):
        CarbonInput(daily_car_km=-1)

def test_household_size_zero_rejected():
    with pytest.raises(Exception):
        CarbonInput(household_size=0)

def test_household_size_above_20_rejected():
    with pytest.raises(Exception):
        CarbonInput(household_size=21)

def test_monthly_flights_above_50_rejected():
    with pytest.raises(Exception):
        CarbonInput(monthly_flights=51)


# ── Security ──────────────────────────────────────────────────────────────────

def test_error_response_does_not_leak_stack_trace():
    r = client.post("/api/chat", json={"message": ""})
    assert "Traceback" not in r.text
    assert 'File "' not in r.text

def test_footprint_history_returns_list():
    r = client.get("/api/footprints/anonymous")
    assert r.status_code == 200
    assert isinstance(r.json()["footprints"], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
