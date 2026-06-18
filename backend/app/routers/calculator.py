"""Carbon footprint calculator endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc

from app.carbon_engine import CarbonCalculator
from app.database import UserFootprint, get_db
from app.models import CalculatorRequest, CalculatorResponse
from app.recommendations import generate_recommendations
from app.security import validate_user_id

router = APIRouter(prefix="/api", tags=["Calculator"])


@router.post("/calculate", response_model=CalculatorResponse)
async def calculate_footprint(request: CalculatorRequest, db=Depends(get_db)):
    """Calculate carbon footprint from structured input."""
    try:
        calc = CarbonCalculator(region=request.carbon_input.region)
        result = calc.calculate_full_footprint(
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

        recommendations = generate_recommendations(result.major_contributors)

        db.add(UserFootprint(
            id=str(uuid.uuid4()),
            user_id=request.user_id or "anonymous",
            monthly_kg=result.monthly_kg,
            annual_tonnes=result.annual_tonnes,
            sources=result.sources,
            assumptions=result.assumptions_used,
            confidence=result.confidence,
        ))
        db.commit()

        return CalculatorResponse(
            monthly_kg=result.monthly_kg,
            annual_kg=result.annual_kg,
            annual_tonnes=result.annual_tonnes,
            sources=result.sources,
            major_contributors=result.major_contributors,
            recommendations=recommendations,
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Calculation failed. Please check your inputs.")


@router.get("/footprints/{user_id}")
async def get_user_footprints(user_id: str, db=Depends(get_db)):
    """Get all footprint history for a user."""
    try:
        validate_user_id(user_id)
        footprints = (
            db.query(UserFootprint)
            .filter(UserFootprint.user_id == user_id)
            .order_by(desc(UserFootprint.timestamp))
            .all()
        )
        return {
            "user_id": user_id,
            "footprints": [
                {
                    "id": f.id,
                    "timestamp": f.timestamp.isoformat() if f.timestamp else None,
                    "monthly_kg": f.monthly_kg,
                    "annual_tonnes": f.annual_tonnes,
                    "sources": f.sources,
                }
                for f in footprints
            ],
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve footprint history.")
