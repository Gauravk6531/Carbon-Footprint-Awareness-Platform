"""
Main FastAPI application with all endpoints.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import uuid
from datetime import datetime

from app.config import settings
from app.models import (
    CarbonInput, ChatRequest, ChatResponse, CalculatorRequest, CalculatorResponse,
    ScenarioRequest, WhatIfResult, ActionPledge
)
from app.carbon_engine import CarbonCalculator
from app.gemini_ai import GeminiClient
from app.database import get_db, UserFootprint, UserPledge, ChatHistory, UserProfile

# Initialize FastAPI app
app = FastAPI(
    title="EcoMind AI",
    description="AI-powered Carbon Footprint Awareness Platform",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
calculator = CarbonCalculator()
try:
    gemini_client = GeminiClient()
except ValueError:
    print("⚠️  Warning: GEMINI_API_KEY not set. Chat features will be limited.")
    gemini_client = None

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": "EcoMind AI",
        "version": "1.0.0",
        "gemini_available": gemini_client is not None
    }

# ============================================================================
# CALCULATOR ENDPOINTS
# ============================================================================

@app.post("/api/calculate", response_model=CalculatorResponse)
async def calculate_footprint(request: CalculatorRequest, db=Depends(get_db)):
    """
    Calculate carbon footprint from structured input.
    
    Example request:
    {
        "carbon_input": {
            "daily_car_km": 18,
            "car_fuel_type": "petrol",
            "monthly_flights": 0.5,
            "monthly_electricity_kwh": 200,
            "ac_hours_daily": 8,
            "lpg_kg_monthly": 5,
            "household_size": 4,
            "region": "india"
        }
    }
    """
    try:
        # Calculate footprint
        result = calculator.calculate_full_footprint(
            daily_car_km=request.carbon_input.daily_car_km,
            car_fuel_type=request.carbon_input.car_fuel_type,
            monthly_flights=request.carbon_input.monthly_flights,
            flight_type=request.carbon_input.flight_type,
            public_transport_km=request.carbon_input.public_transport_km,
            public_transport_type=request.carbon_input.public_transport_type,
            monthly_electricity_kwh=request.carbon_input.monthly_electricity_kwh,
            ac_hours_daily=request.carbon_input.ac_hours_daily,
            lpg_kg_monthly=request.carbon_input.lpg_kg_monthly,
            household_size=request.carbon_input.household_size,
        )
        
        # Generate recommendations
        recommendations = _generate_recommendations(result.major_contributors)
        
        # Store in database
        footprint_id = str(uuid.uuid4())
        user_footprint = UserFootprint(
            id=footprint_id,
            user_id=request.user_id or "anonymous",
            monthly_kg=result.monthly_kg,
            annual_tonnes=result.annual_tonnes,
            sources=result.sources,
            assumptions=result.assumptions_used,
            confidence=result.confidence,
        )
        db.add(user_footprint)
        db.commit()
        
        return CalculatorResponse(
            monthly_kg=result.monthly_kg,
            annual_kg=result.annual_kg,
            annual_tonnes=result.annual_tonnes,
            sources=result.sources,
            major_contributors=result.major_contributors,
            recommendations=recommendations,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================================================
# CHAT ENDPOINTS
# ============================================================================

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db=Depends(get_db)):
    """
    Chat interface for conversational carbon footprint assessment.
    
    The assistant can:
    - Extract carbon data from natural language
    - Ask clarifying questions
    - Provide recommendations
    - Store conversation history
    """
    
    if not gemini_client:
        raise HTTPException(status_code=503, detail="Gemini AI is not available")
    
    try:
        session_id = request.session_id or str(uuid.uuid4())
        user_id = request.user_id or "anonymous"
        
        # Store user message
        chat_msg = ChatHistory(
            id=str(uuid.uuid4()),
            session_id=session_id,
            user_id=user_id,
            role="user",
            content=request.message,
        )
        db.add(chat_msg)
        
        # Extract carbon data from message
        extracted_data = gemini_client.extract_carbon_data(request.message)
        
        # Generate summary and response
        needs_followup = extracted_data.get("needs_followup", False)
        
        # Calculate footprint if we have enough data
        carbon_result = None
        if extracted_data.get("confidence") in ["high", "medium"]:
            result = calculator.calculate_full_footprint(
                daily_car_km=extracted_data.get("daily_car_km", 0),
                car_fuel_type=extracted_data.get("car_fuel_type", "petrol"),
                monthly_flights=extracted_data.get("monthly_flights", 0),
                flight_type=extracted_data.get("flight_type", "domestic"),
                public_transport_km=extracted_data.get("public_transport_km", 0),
                public_transport_type=extracted_data.get("public_transport_type", "bus"),
                monthly_electricity_kwh=extracted_data.get("monthly_electricity_kwh", 0),
                ac_hours_daily=extracted_data.get("ac_hours_daily", 0),
                lpg_kg_monthly=extracted_data.get("lpg_kg_monthly", 0),
                household_size=extracted_data.get("household_size", 1),
            )
            recommendations = _generate_recommendations(result.major_contributors)
            carbon_result = {
                "monthly_kg": result.monthly_kg,
                "annual_tonnes": result.annual_tonnes,
                "sources": result.sources,
                "major_contributors": result.major_contributors,
                "confidence": result.confidence,
                "recommendations": recommendations,
            }
        
        # Generate assistant response
        structured_data = None
        if carbon_result:
            structured_data = gemini_client.generate_structured_response(extracted_data, carbon_result)
            summary = gemini_client.generate_summary(extracted_data, carbon_result)
            response_msg = f"{summary}\n\nLet me share some personalized actions you can take to reduce your footprint."
        elif needs_followup:
            followup = extracted_data.get("followup_question") or gemini_client.generate_followup_questions(extracted_data)
            response_msg = f"Thanks for sharing! {followup}"
        else:
            response_msg = "I'd love to learn more about your lifestyle to estimate your carbon footprint accurately. Could you share details about your daily activities?"
        
        # Store assistant message
        assist_msg = ChatHistory(
            id=str(uuid.uuid4()),
            session_id=session_id,
            user_id=user_id,
            role="assistant",
            content=response_msg,
        )
        db.add(assist_msg)
        db.commit()
        
        return ChatResponse(
            message=response_msg,
            extracted_data=extracted_data,
            carbon_result=carbon_result,
            session_id=session_id,
            follow_up_needed=needs_followup,
            structured_data=structured_data,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/{session_id}")
async def get_chat_history(session_id: str, db=Depends(get_db)):
    """Get chat history for a session."""
    try:
        from sqlalchemy.orm import Session
        messages = db.query(ChatHistory).filter(ChatHistory.session_id == session_id).all()
        return {
            "session_id": session_id,
            "messages": [
                {
                    "role": m.role,
                    "content": m.content,
                    "timestamp": m.timestamp.isoformat() if m.timestamp else None
                }
                for m in messages
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# WHAT-IF SIMULATOR
# ============================================================================

@app.post("/api/what-if", response_model=WhatIfResult)
async def what_if_scenario(request: ScenarioRequest):
    """
    Simulate 'what-if' scenarios.
    
    Example: What if I reduce car usage by 50%?
    """
    try:
        # Calculate baseline
        baseline_result = calculator.calculate_full_footprint(
            daily_car_km=request.baseline_data.daily_car_km,
            car_fuel_type=request.baseline_data.car_fuel_type,
            monthly_flights=request.baseline_data.monthly_flights,
            flight_type=request.baseline_data.flight_type,
            public_transport_km=request.baseline_data.public_transport_km,
            public_transport_type=request.baseline_data.public_transport_type,
            monthly_electricity_kwh=request.baseline_data.monthly_electricity_kwh,
            ac_hours_daily=request.baseline_data.ac_hours_daily,
            lpg_kg_monthly=request.baseline_data.lpg_kg_monthly,
            household_size=request.baseline_data.household_size,
        )
        
        # Apply scenario changes
        scenario_data = request.baseline_data.dict()
        for key, value in request.scenario_changes.items():
            if key in scenario_data:
                scenario_data[key] = value
        
        # Calculate scenario
        scenario_result = calculator.calculate_full_footprint(
            daily_car_km=scenario_data.get("daily_car_km", 0),
            car_fuel_type=scenario_data.get("car_fuel_type", "petrol"),
            monthly_flights=scenario_data.get("monthly_flights", 0),
            flight_type=scenario_data.get("flight_type", "domestic"),
            public_transport_km=scenario_data.get("public_transport_km", 0),
            public_transport_type=scenario_data.get("public_transport_type", "bus"),
            monthly_electricity_kwh=scenario_data.get("monthly_electricity_kwh", 0),
            ac_hours_daily=scenario_data.get("ac_hours_daily", 0),
            lpg_kg_monthly=scenario_data.get("lpg_kg_monthly", 0),
            household_size=scenario_data.get("household_size", 1),
        )
        
        saved_monthly = baseline_result.monthly_kg - scenario_result.monthly_kg
        percentage = (saved_monthly / baseline_result.monthly_kg * 100) if baseline_result.monthly_kg > 0 else 0
        money_saved = saved_monthly * 15 * 12
        
        return WhatIfResult(
            baseline_monthly_kg=baseline_result.monthly_kg,
            scenario_monthly_kg=scenario_result.monthly_kg,
            saved_kg_monthly=max(0, saved_monthly),
            saved_tonnes_annually=max(0, saved_monthly * 12 / 1000),
            percentage_reduction=max(0, percentage),
            annual_money_saved=max(0, money_saved),
            scenario_name=request.scenario_name,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================================================
# PLEDGE ENDPOINTS
# ============================================================================

@app.post("/api/pledge")
async def create_pledge(pledge: ActionPledge, user_id: Optional[str] = None, db=Depends(get_db)):
    """Create a carbon action pledge."""
    try:
        user_pledge = UserPledge(
            id=str(uuid.uuid4()),
            user_id=user_id or "anonymous",
            action=pledge.action,
            estimated_co2_reduction=pledge.estimated_co2_reduction,
            deadline=pledge.deadline,
            status="active",
        )
        db.add(user_pledge)
        db.commit()
        return {
            "id": user_pledge.id,
            "status": "created",
            "message": f"Great! You've committed to: {pledge.action}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/pledges/{user_id}")
async def get_user_pledges(user_id: str, db=Depends(get_db)):
    """Get all pledges for a user."""
    try:
        pledges = db.query(UserPledge).filter(UserPledge.user_id == user_id).all()
        return {
            "user_id": user_id,
            "pledges": [
                {
                    "id": p.id,
                    "action": p.action,
                    "co2_reduction_kg": p.estimated_co2_reduction,
                    "status": p.status,
                    "deadline": p.deadline,
                }
                for p in pledges
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _generate_recommendations(major_contributors: list) -> list:
    """Generate recommendations based on major contributors."""
    recommendations = []
    
    for source, amount, percentage in major_contributors:
        if source == "car":
            recommendations.append("Switch to public transport or carpool 2-3 days per week")
            recommendations.append("Consider an electric vehicle or hybrid for your next car")
        elif source == "flights":
            recommendations.append("Combine multiple trips into fewer flights")
            recommendations.append("Try virtual meetings instead of business travel")
        elif source == "electricity":
            recommendations.append("Switch to renewable energy plan if available")
            recommendations.append("Install solar panels or use energy-efficient appliances")
        elif source == "ac":
            recommendations.append("Use AC sparingly and set temperature to 25-26°C")
            recommendations.append("Improve insulation and use fans for air circulation")
        elif source == "lpg":
            recommendations.append("Use pressure cooker and closed lids while cooking")
            recommendations.append("Consider induction cooking for better efficiency")
    
    return recommendations[:3]

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
