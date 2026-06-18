"""
Tests for Pydantic models in app.models.
Covers defaults, validation, normalization, and boundary conditions.
"""

import pytest
from app.models import CarbonInput, ChatRequest, ActionPledge, ChatMessage
from pydantic import ValidationError


def test_carbon_input_defaults():
    ci = CarbonInput()
    assert ci.daily_car_km == 0
    assert ci.car_fuel_type == 'petrol'
    assert ci.region == 'india'
    assert ci.household_size == 1


def test_carbon_input_fuel_type_normalizes():
    ci = CarbonInput(car_fuel_type='DIESEL')
    assert ci.car_fuel_type == 'diesel'


def test_carbon_input_invalid_fuel_type_falls_back():
    ci = CarbonInput(car_fuel_type='hydrogen')
    assert ci.car_fuel_type == 'petrol'


def test_carbon_input_rejects_negative_car_km():
    with pytest.raises(ValidationError):
        CarbonInput(daily_car_km=-1)


def test_carbon_input_rejects_ac_over_24():
    with pytest.raises(ValidationError):
        CarbonInput(ac_hours_daily=25)


def test_carbon_input_region_fallback():
    ci = CarbonInput(region='mars')
    assert ci.region == 'india'


def test_carbon_input_max_household():
    with pytest.raises(ValidationError):
        CarbonInput(household_size=21)


def test_chat_request_empty_message_rejected():
    with pytest.raises(ValidationError):
        ChatRequest(message='')


def test_chat_request_valid():
    cr = ChatRequest(message='Hello')
    assert cr.message == 'Hello'


def test_action_pledge_valid():
    ap = ActionPledge(action='Use public transport', estimated_co2_reduction=15.0)
    assert ap.action == 'Use public transport'
    assert ap.status == 'active'


def test_action_pledge_rejects_negative_reduction():
    with pytest.raises(ValidationError):
        ActionPledge(action='Test', estimated_co2_reduction=-5)


def test_carbon_input_transport_type_normalizes():
    ci = CarbonInput(public_transport_type='METRO')
    assert ci.public_transport_type == 'metro'
