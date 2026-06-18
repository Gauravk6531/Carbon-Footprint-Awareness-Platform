"""
Carbon Footprint Calculation Engine
Deterministic emission factor calculations based on standard methodologies.
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass

__all__ = ['CarbonCalculator', 'CarbonResult', 'EMISSION_FACTORS']

# ── Named constants ──────────────────────────────────────────────────────────
AVERAGE_DOMESTIC_FLIGHT_KM: int = 1000
"""Average distance for a domestic flight in kilometres."""

AVERAGE_INTERNATIONAL_FLIGHT_KM: int = 8000
"""Average distance for an international flight in kilometres."""

AC_POWER_KW: float = 1.0
"""Assumed power draw of an air-conditioning unit in kilowatts."""

DAYS_PER_MONTH: int = 30
"""Standard number of days used to convert daily values to monthly."""

CARBON_COST_PER_KG_INR: float = 15
"""Estimated cost of carbon in INR per kg CO2 avoided."""


# Global emission factors (kg CO2e per unit)
# Based on IPCC AR6 and EPA guidelines
EMISSION_FACTORS = {
    # Transportation (kg CO2e per km)
    "car_petrol": 0.192,  # Average car
    "car_diesel": 0.171,  # Diesel car (slightly more efficient)
    "car_electric": 0.050,  # EV with grid mix
    "bike_electric": 0.010,  # E-bike
    "public_transport_bus": 0.089,
    "public_transport_metro": 0.041,
    "public_transport_train": 0.029,
    
    # Flights (kg CO2e per km per person)
    "flight_domestic": 0.255,  # Domestic flight
    "flight_international": 0.195,  # International flight
    
    # Electricity (kg CO2e per kWh)
    "electricity_grid_mix": 0.415,  # Global average
    "electricity_india": 0.659,  # India's grid mix (coal-heavy)
    "electricity_us": 0.378,  # US average
    "electricity_eu": 0.278,  # EU average
    "electricity_renewable": 0.050,
    
    # Heating/Cooling (kg CO2e per kWh)
    "ac_usage": 0.415,  # Assumes grid electricity
    "heating_gas": 2.04,  # kg CO2e per kg of LPG
    "heating_electric": 0.415,
    
    # Household fuels (kg CO2e per unit)
    "lpg_cooking": 2.04,  # kg CO2e per kg LPG
    
    # Food (kg CO2e per kg)
    "beef": 99.5,
    "chicken": 6.9,
    "fish": 3.0,
    "rice": 2.7,
    "vegetables": 2.0,
    
    # Waste (kg CO2e per kg)
    "waste_landfill": 0.5,
    "waste_recycled": 0.1,
}

@dataclass
class CarbonResult:
    """Result of a carbon footprint calculation.

    Attributes:
        monthly_kg: Total monthly emissions in kg CO2e.
        annual_kg: Total annual emissions in kg CO2e.
        annual_tonnes: Total annual emissions in metric tonnes CO2e.
        sources: Breakdown of emissions by category (kg CO2e).
        major_contributors: Top contributors as ``[(category, kg, percentage), ...]``.
        confidence: Confidence level of the estimate (e.g. "High", "Medium").
        assumptions_used: Human-readable list of assumptions applied.
        formula_summary: Short textual description of the formula.
    """

    monthly_kg: float
    annual_kg: float
    annual_tonnes: float
    sources: Dict[str, float]
    major_contributors: List[Tuple[str, float, float]]
    confidence: str
    assumptions_used: List[str]
    formula_summary: str

class CarbonCalculator:
    """Deterministic carbon footprint calculator.

    Uses published emission factors (IPCC AR6, EPA) to compute a
    household-level carbon footprint from user-supplied activity data.

    Attributes:
        region: Lowercase region string used for electricity grid-mix selection.
        electricity_factor: Region-specific electricity emission factor
            (kg CO2e / kWh).

    Example:
        >>> calc = CarbonCalculator(region="india")
        >>> result = calc.calculate_full_footprint(daily_car_km=18)
        >>> result.monthly_kg  # doctest: +SKIP
        103.68
    """
    
    def __init__(self, region: str = "india"):
        """Initialize calculator with region-specific defaults."""
        self.region = region.lower()
        self.electricity_factor = self._get_electricity_factor(self.region)
    
    def _get_electricity_factor(self, region: str) -> float:
        """Get region-specific electricity emission factor."""
        factors = {
            "india": EMISSION_FACTORS["electricity_india"],
            "us": EMISSION_FACTORS["electricity_us"],
            "eu": EMISSION_FACTORS["electricity_eu"],
            "uk": 0.233,
            "canada": 0.154,
            "australia": 0.792,
        }
        return factors.get(region, EMISSION_FACTORS["electricity_grid_mix"])
    
    def calculate_transportation(
        self,
        daily_car_km: float = 0,
        car_fuel_type: str = "petrol",
        monthly_flights: float = 0,
        flight_type: str = "domestic",
        public_transport_km: float = 0,
        public_transport_type: str = "bus",
    ) -> Tuple[float, Dict]:
        """
        Calculate transportation emissions (monthly, kg CO2e).
        
        Args:
            daily_car_km: Average daily car travel in km
            car_fuel_type: "petrol", "diesel", or "electric"
            monthly_flights: Number of flights per month
            flight_type: "domestic" or "international"
            public_transport_km: Monthly public transport km
            public_transport_type: "bus", "metro", or "train"
        """
        total = 0.0
        sources = {}
        
        # Car emissions
        if daily_car_km > 0:
            factor = EMISSION_FACTORS.get(f"car_{car_fuel_type}", EMISSION_FACTORS["car_petrol"])
            car_monthly = daily_car_km * DAYS_PER_MONTH * factor
            total += car_monthly
            sources["car"] = car_monthly
        
        # Flights
        if monthly_flights > 0:
            factor = EMISSION_FACTORS.get(f"flight_{flight_type}", EMISSION_FACTORS["flight_domestic"])
            # Assume average domestic / international distances
            distance = AVERAGE_DOMESTIC_FLIGHT_KM if flight_type == "domestic" else AVERAGE_INTERNATIONAL_FLIGHT_KM
            flight_monthly = monthly_flights * distance * factor
            total += flight_monthly
            sources["flights"] = flight_monthly
        
        # Public transport
        if public_transport_km > 0:
            factor = EMISSION_FACTORS.get(f"public_transport_{public_transport_type}", EMISSION_FACTORS["public_transport_bus"])
            pt_monthly = public_transport_km * factor
            total += pt_monthly
            sources["public_transport"] = pt_monthly
        
        return total, sources
    
    def calculate_energy(
        self,
        monthly_electricity_kwh: float = 0,
        ac_hours_daily: float = 0,
        lpg_kg_monthly: float = 0,
    ) -> Tuple[float, Dict]:
        """
        Calculate energy emissions (monthly, kg CO2e).
        
        Args:
            monthly_electricity_kwh: Monthly electricity consumption in kWh
            ac_hours_daily: Daily AC usage in hours
            lpg_kg_monthly: Monthly LPG consumption in kg
        """
        total = 0.0
        sources = {}
        
        # Electricity
        if monthly_electricity_kwh > 0:
            elec_monthly = monthly_electricity_kwh * self.electricity_factor
            total += elec_monthly
            sources["electricity"] = elec_monthly
        
        # AC usage
        if ac_hours_daily > 0:
            ac_monthly = ac_hours_daily * DAYS_PER_MONTH * AC_POWER_KW * self.electricity_factor
            total += ac_monthly
            sources["ac"] = ac_monthly
        
        # LPG/Cooking
        if lpg_kg_monthly > 0:
            lpg_monthly = lpg_kg_monthly * EMISSION_FACTORS["lpg_cooking"]
            total += lpg_monthly
            sources["lpg"] = lpg_monthly
        
        return total, sources
    
    def calculate_full_footprint(
        self,
        # Transportation
        daily_car_km: float = 0,
        car_fuel_type: str = "petrol",
        monthly_flights: float = 0,
        flight_type: str = "domestic",
        public_transport_km: float = 0,
        public_transport_type: str = "bus",
        # Energy
        monthly_electricity_kwh: float = 0,
        ac_hours_daily: float = 0,
        lpg_kg_monthly: float = 0,
        # Household
        household_size: int = 1,
        # Note: Diet, waste not included in core for now
    ) -> CarbonResult:
        """Calculate the complete carbon footprint for one person.

        Combines transportation and energy emissions, then divides by
        household size to produce a per-capita estimate.

        Args:
            daily_car_km: Average daily car travel in km (must be >= 0).
            car_fuel_type: Fuel type — ``"petrol"``, ``"diesel"``, or
                ``"electric"``.
            monthly_flights: Number of one-way flights per month (>= 0).
            flight_type: ``"domestic"`` or ``"international"``.
            public_transport_km: Monthly public-transport distance in km
                (>= 0).
            public_transport_type: ``"bus"``, ``"metro"``, or ``"train"``.
            monthly_electricity_kwh: Monthly electricity consumption in
                kWh (>= 0).
            ac_hours_daily: Daily air-conditioning usage in hours
                (0–24 inclusive).
            lpg_kg_monthly: Monthly LPG consumption in kg (>= 0).
            household_size: Number of people in the household (>= 1).

        Returns:
            A :class:`CarbonResult` dataclass with monthly/annual totals,
            source breakdown, top contributors, and metadata.

        Raises:
            ValueError: If any numeric input is negative, if
                ``ac_hours_daily`` exceeds 24, or if ``household_size``
                is less than 1.
        """
        # ── Input validation ─────────────────────────────────────────
        if daily_car_km < 0:
            raise ValueError(f"daily_car_km must be >= 0, got {daily_car_km}")
        if monthly_flights < 0:
            raise ValueError(f"monthly_flights must be >= 0, got {monthly_flights}")
        if public_transport_km < 0:
            raise ValueError(f"public_transport_km must be >= 0, got {public_transport_km}")
        if monthly_electricity_kwh < 0:
            raise ValueError(f"monthly_electricity_kwh must be >= 0, got {monthly_electricity_kwh}")
        if ac_hours_daily < 0 or ac_hours_daily > 24:
            raise ValueError(f"ac_hours_daily must be in [0, 24], got {ac_hours_daily}")
        if lpg_kg_monthly < 0:
            raise ValueError(f"lpg_kg_monthly must be >= 0, got {lpg_kg_monthly}")
        if household_size < 1:
            raise ValueError(f"household_size must be >= 1, got {household_size}")
        
        # Transportation
        transport_kg, transport_sources = self.calculate_transportation(
            daily_car_km=daily_car_km,
            car_fuel_type=car_fuel_type,
            monthly_flights=monthly_flights,
            flight_type=flight_type,
            public_transport_km=public_transport_km,
            public_transport_type=public_transport_type,
        )
        
        # Energy
        energy_kg, energy_sources = self.calculate_energy(
            monthly_electricity_kwh=monthly_electricity_kwh,
            ac_hours_daily=ac_hours_daily,
            lpg_kg_monthly=lpg_kg_monthly,
        )
        
        # Per-capita allocation for household size
        household_adjustment = 1.0 if household_size == 1 else (1.0 / household_size)
        
        # Total per month
        monthly_total = (transport_kg + energy_kg) * household_adjustment
        
        # Combine sources
        all_sources = {**transport_sources, **energy_sources}
        
        # Scale by household
        for key in all_sources:
            all_sources[key] *= household_adjustment
        
        # Get major contributors
        major_contributors = sorted(
            [(k, v, (v / monthly_total * 100) if monthly_total > 0 else 0) for k, v in all_sources.items()],
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        # Annual calculations
        annual_kg = monthly_total * 12
        annual_tonnes = annual_kg / 1000
        
        # Build assumptions
        assumptions = []
        if daily_car_km > 0:
            assumptions.append(f"Car: {daily_car_km} km/day ({car_fuel_type})")
        if monthly_flights > 0:
            assumptions.append(f"Flights: {monthly_flights}/month ({flight_type})")
        if monthly_electricity_kwh > 0:
            assumptions.append(f"Electricity: {monthly_electricity_kwh} kWh/month ({self.region})")
        if ac_hours_daily > 0:
            assumptions.append(f"AC: {ac_hours_daily} hours/day")
        if lpg_kg_monthly > 0:
            assumptions.append(f"LPG: {lpg_kg_monthly} kg/month")
        assumptions.append(f"Household size: {household_size} person(s)")
        
        # Build formula summary
        formula_summary = "Emissions = Σ(Activity × Emission Factor) / Household Size"
        
        # Confidence message
        confidence = "High"
        if household_size > 1 and monthly_electricity_kwh == 0:
            confidence = "Medium - electricity usage not specified"
        
        return CarbonResult(
            monthly_kg=round(monthly_total, 2),
            annual_kg=round(annual_kg, 2),
            annual_tonnes=round(annual_tonnes, 2),
            sources=all_sources,
            major_contributors=major_contributors,
            confidence=confidence,
            assumptions_used=assumptions,
            formula_summary=formula_summary,
        )
    
    def simulate_scenario(
        self,
        baseline: CarbonResult,
        changes: Dict,
    ) -> Dict:
        """
        Simulate 'what-if' scenarios.
        
        Args:
            baseline: Original CarbonResult
            changes: Dict of parameter changes
        
        Returns:
            Dict with new_emissions, saved_kg, percentage_reduction, money_saved
        """
        # Simulate new scenario (would need parameters, simplified here)
        # This would be called with updated parameters
        new_monthly = max(0, baseline.monthly_kg * (1 - 0.15))  # Example: 15% reduction
        saved_kg = baseline.monthly_kg - new_monthly
        percentage = (saved_kg / baseline.monthly_kg * 100) if baseline.monthly_kg > 0 else 0
        
        # Estimate money saved (₹ per kg CO2 avoided ~ cost of carbon)
        money_saved = saved_kg * CARBON_COST_PER_KG_INR * 12
        
        return {
            "new_monthly_kg": round(new_monthly, 2),
            "new_annual_tonnes": round(new_monthly * 12 / 1000, 2),
            "saved_kg_monthly": round(saved_kg, 2),
            "saved_tonnes_annually": round(saved_kg * 12 / 1000, 2),
            "percentage_reduction": round(percentage, 1),
            "annual_money_saved": round(money_saved, 2),
        }
