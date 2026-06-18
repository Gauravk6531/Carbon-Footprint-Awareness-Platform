"""
Data models for the EcoMind AI application.
Pydantic v2 models with strict validation and input bounds.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict
from datetime import datetime

VALID_FUEL_TYPES = {"petrol", "diesel", "electric"}
VALID_FLIGHT_TYPES = {"domestic", "international"}
VALID_TRANSPORT_TYPES = {"bus", "metro", "train"}
VALID_REGIONS = {"india", "us", "eu", "uk", "canada", "australia"}


class CarbonInput(BaseModel):
    """User input for carbon footprint calculation — all fields bounded and validated."""

    daily_car_km: float = Field(0, ge=0, le=2000, description="Daily car travel in km")
    car_fuel_type: str = Field("petrol", description="Car fuel type: petrol, diesel, or electric")
    monthly_flights: float = Field(0, ge=0, le=50, description="Number of flights per month")
    flight_type: str = Field("domestic", description="Flight type: domestic or international")
    public_transport_km: float = Field(0, ge=0, le=10000, description="Monthly public transport km")
    public_transport_type: str = Field("bus", description="Public transport: bus, metro, or train")
    monthly_electricity_kwh: float = Field(0, ge=0, le=10000, description="Monthly electricity in kWh")
    ac_hours_daily: float = Field(0, ge=0, le=24, description="Daily AC usage in hours (0–24)")
    lpg_kg_monthly: float = Field(0, ge=0, le=100, description="Monthly LPG in kg")
    household_size: int = Field(1, ge=1, le=20, description="Household size (1–20)")
    region: str = Field("india", description="Region for electricity grid mix")
    user_input_text: Optional[str] = Field(None, max_length=2000)

    @field_validator("car_fuel_type")
    @classmethod
    def validate_fuel_type(cls, v: str) -> str:
        return v.lower() if v.lower() in VALID_FUEL_TYPES else "petrol"

    @field_validator("flight_type")
    @classmethod
    def validate_flight_type(cls, v: str) -> str:
        return v.lower() if v.lower() in VALID_FLIGHT_TYPES else "domestic"

    @field_validator("public_transport_type")
    @classmethod
    def validate_transport_type(cls, v: str) -> str:
        return v.lower() if v.lower() in VALID_TRANSPORT_TYPES else "bus"

    @field_validator("region")
    @classmethod
    def validate_region(cls, v: str) -> str:
        return v.lower() if v.lower() in VALID_REGIONS else "india"


class ChatMessage(BaseModel):
    """Chat message model."""

    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., max_length=4000)
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Request for chat endpoint."""

    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = Field(None, max_length=64)
    user_id: Optional[str] = Field(None, max_length=64)


class ChatResponse(BaseModel):
    """Response from chat endpoint."""

    message: str
    extracted_data: Optional[Dict] = None
    carbon_result: Optional[Dict] = None
    session_id: str
    follow_up_needed: bool = False
    structured_data: Optional[Dict] = None


class ActionPledge(BaseModel):
    """User action pledge."""

    action: str = Field(..., min_length=1, max_length=500)
    estimated_co2_reduction: float = Field(..., ge=0, le=100000)
    deadline: Optional[str] = Field(None, max_length=20)
    status: str = Field("active")


class UserProfile(BaseModel):
    """User profile for personalization."""

    user_id: str
    user_type: str = Field("general")
    region: str = Field("india")
    goals: List[str] = Field(default_factory=list)
    pledges: List[ActionPledge] = Field(default_factory=list)
    badges: List[str] = Field(default_factory=list)
    current_streak: int = 0


class ActionPlan(BaseModel):
    """Generated action plan."""

    highest_impact_actions: List[Dict] = Field(description="3 highest impact actions")
    easiest_actions: List[Dict] = Field(description="3 easiest actions")
    start_today: Dict = Field(description="Action to start today")
    next_30_days: Dict = Field(description="Action for next 30 days")
    overall_potential_savings: float = Field(description="Total potential CO2 savings in kg/month")


class ScenarioRequest(BaseModel):
    """Request for what-if scenario."""

    baseline_data: CarbonInput
    scenario_changes: Dict = Field(..., description="Changes to apply to baseline")
    scenario_name: Optional[str] = Field(None, max_length=200)


class WhatIfResult(BaseModel):
    """Result of what-if simulation."""

    baseline_monthly_kg: float
    scenario_monthly_kg: float
    saved_kg_monthly: float
    saved_tonnes_annually: float
    percentage_reduction: float
    annual_money_saved: float
    scenario_name: Optional[str] = None


class CalculatorRequest(BaseModel):
    """Request for direct calculation."""

    carbon_input: CarbonInput
    user_id: Optional[str] = Field(None, max_length=64)


class CalculatorResponse(BaseModel):
    """Response from calculator."""

    monthly_kg: float
    annual_kg: float
    annual_tonnes: float
    sources: Dict[str, float]
    major_contributors: List[tuple]
    recommendations: List[str]
    action_plan: Optional[ActionPlan] = None
