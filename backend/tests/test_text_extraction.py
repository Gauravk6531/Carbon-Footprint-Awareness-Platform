"""Tests for rule-based text extraction fallback."""

import pytest

from app.text_extraction import extract_from_text, local_chat_response


class TestExtractFromText:
    def test_extracts_daily_car_km(self):
        result = extract_from_text("I drive 18 km daily to work")
        assert result["daily_car_km"] == 18.0

    def test_extracts_electricity_usage(self):
        result = extract_from_text("My electricity bill is about 200 kWh")
        assert result["monthly_electricity_kwh"] == 200.0

    def test_extracts_ac_hours(self):
        result = extract_from_text("I use AC for 8 hours daily")
        assert result["ac_hours_daily"] == 8.0

    def test_detects_electric_car(self):
        result = extract_from_text("I drive 20 km daily in my electric car")
        assert result["car_fuel_type"] == "electric"

    def test_detects_diesel_car(self):
        result = extract_from_text("I drive 10 km in my diesel car")
        assert result["car_fuel_type"] == "diesel"

    def test_converts_yearly_flights_to_monthly(self):
        result = extract_from_text("I fly 4 times a year")
        assert result["monthly_flights"] == pytest.approx(0.33, abs=0.01)

    def test_no_flights_phrase(self):
        result = extract_from_text("I never fly anywhere")
        assert result["monthly_flights"] == 0.0

    def test_high_confidence_with_multiple_fields(self):
        result = extract_from_text(
            "I drive 18 km daily, electricity is 200 kWh, AC 8 hours, fly twice a year in India"
        )
        assert result["confidence"] == "high"
        assert result["needs_followup"] is False

    def test_low_confidence_for_greeting(self):
        result = extract_from_text("Hello there!")
        assert result["confidence"] == "low"
        assert result["needs_followup"] is True

    def test_extraction_source_is_local(self):
        result = extract_from_text("I drive 5 km daily")
        assert result["extraction_source"] == "local"


class TestLocalChatResponse:
    def test_greeting_response(self):
        reply = local_chat_response("Hello!")
        assert "EcoMind AI" in reply

    def test_thanks_response(self):
        reply = local_chat_response("Thanks for the help")
        assert "welcome" in reply.lower()

    def test_carbon_footprint_explanation(self):
        reply = local_chat_response("What is carbon footprint?")
        assert "greenhouse" in reply.lower() or "CO2" in reply

    def test_low_confidence_prompts_for_details(self):
        reply = local_chat_response("Hi", {"confidence": "low"})
        assert "footprint" in reply.lower()
