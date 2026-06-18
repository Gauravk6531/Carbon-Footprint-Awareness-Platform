"""What-if scenario simulation endpoints."""

from fastapi import APIRouter, HTTPException

from app.carbon_engine import CarbonCalculator
from app.models import ScenarioRequest, WhatIfResult

router = APIRouter(prefix="/api", tags=["What-If"])


@router.post("/what-if", response_model=WhatIfResult)
async def what_if_scenario(request: ScenarioRequest):
    """Simulate lifestyle change scenarios against a baseline footprint."""
    try:
        baseline_calc = CarbonCalculator(region=request.baseline_data.region)
        baseline_result = baseline_calc.calculate_full_footprint(
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

        scenario_data = request.baseline_data.model_dump()
        scenario_data.update(request.scenario_changes)

        scenario_region = scenario_data.get("region", request.baseline_data.region)
        scenario_calc = CarbonCalculator(region=scenario_region)
        scenario_result = scenario_calc.calculate_full_footprint(
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
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Scenario simulation failed. Please check your inputs.")
