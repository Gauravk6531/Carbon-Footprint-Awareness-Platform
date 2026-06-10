"""
Data models for the EcoMind AI application.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class CarbonInput(BaseModel):
    """User input for carbon footprint calculation."""
    
    daily_car_km: float = Field(0, ge=0, description="Daily car travel in km")
    car_fuel_type: str = Field("petrol", description="Car fuel type: petrol, diesel, or electric")
    monthly_flights: float = Field(0, ge=0, description="Number of flights per month")
    flight_type: str = Field("domestic", description="Flight type: domestic or international")
    public_transport_km: float = Field(0, ge=0, description="Monthly public transport km")
    public_transport_type: str = Field("bus", description="Public transport: bus, metro, or train")
    monthly_electricity_kwh: float = Field(0, ge=0, description="Monthly electricity in kWh")
    ac_hours_daily: float = Field(0, ge=0, description="Daily AC usage in hours")
    lpg_kg_monthly: float = Field(0, ge=0, description="Monthly LPG in kg")
    household_size: int = Field(1, ge=1, description="Household size")
    region: str = Field("india", description="Region for electricity grid mix")
    user_input_text: Optional[str] = Field(None, description="Raw user text for extraction")

class ChatMessage(BaseModel):
    """Chat message model."""
    
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    """Request for chat endpoint."""
    
    message: str = Field(..., description="User message")
    session_id: Optional[str] = None
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    
    message: str = Field(..., description="Assistant message")
    extracted_data: Optional[Dict] = None
    carbon_result: Optional[Dict] = None
    session_id: str
    follow_up_needed: bool = False
    structured_data: Optional[Dict] = None

class ActionPledge(BaseModel):
    """User action pledge."""
    
    action: str = Field(..., description="Action description")
    estimated_co2_reduction: float = Field(..., ge=0, description="Estimated CO2 reduction in kg")
    deadline: Optional[str] = None
    status: str = Field("active", description="Status: active, completed, skipped")

class UserProfile(BaseModel):
    """User profile for personalization."""
    
    user_id: str
    user_type: str = Field("general", description="Student, professional, family, traveler")
    region: str = Field("india", description="User region")
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
    scenario_changes: Dict = Field(..., description="Changes to apply")
    scenario_name: Optional[str] = None

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
    user_id: Optional[str] = None

class CalculatorResponse(BaseModel):
    """Response from calculator."""
    
    monthly_kg: float
    annual_kg: float
    annual_tonnes: float
    sources: Dict[str, float]
    major_contributors: List[tuple]
    recommendations: List[str]
    action_plan: Optional[ActionPlan] = None
