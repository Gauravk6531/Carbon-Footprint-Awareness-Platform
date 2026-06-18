"""
Tests for carbon calculation engine.
Covers all emission categories, boundary conditions, and numeric correctness.
"""

import pytest
from app.carbon_engine import CarbonCalculator, CarbonResult, EMISSION_FACTORS


class TestCarbonCalculator:
    """Test suite for carbon calculations."""

    def setup_method(self):
        self.calc = CarbonCalculator(region="india")

    # ── Transportation ────────────────────────────────────────────────────

    def test_car_petrol_exact_value(self):
        """18 km/day * 30 * 0.192 = 103.68 kg CO2e/month."""
        _, sources = self.calc.calculate_transportation(daily_car_km=18, car_fuel_type="petrol")
        assert abs(sources["car"] - 103.68) < 0.01

    def test_car_diesel_lower_than_petrol(self):
        _, petrol = self.calc.calculate_transportation(daily_car_km=18, car_fuel_type="petrol")
        _, diesel = self.calc.calculate_transportation(daily_car_km=18, car_fuel_type="diesel")
        assert diesel["car"] < petrol["car"]

    def test_car_electric_lowest_emissions(self):
        _, petrol = self.calc.calculate_transportation(daily_car_km=18, car_fuel_type="petrol")
        _, electric = self.calc.calculate_transportation(daily_car_km=18, car_fuel_type="electric")
        assert electric["car"] < petrol["car"]

    def test_car_unknown_fuel_falls_back_to_petrol(self):
        _, hydrogen = self.calc.calculate_transportation(daily_car_km=10, car_fuel_type="hydrogen")
        _, petrol = self.calc.calculate_transportation(daily_car_km=10, car_fuel_type="petrol")
        assert abs(hydrogen["car"] - petrol["car"]) < 0.01

    def test_domestic_flight_exact_value(self):
        """1 flight * 1000 km * 0.255 = 255 kg CO2e."""
        _, sources = self.calc.calculate_transportation(monthly_flights=1, flight_type="domestic")
        assert abs(sources["flights"] - 255.0) < 0.01

    def test_international_flight_higher_than_domestic(self):
        _, dom = self.calc.calculate_transportation(monthly_flights=1, flight_type="domestic")
        _, intl = self.calc.calculate_transportation(monthly_flights=1, flight_type="international")
        assert intl["flights"] > dom["flights"]

    def test_public_transport_metro_lower_than_bus(self):
        _, bus = self.calc.calculate_transportation(public_transport_km=100, public_transport_type="bus")
        _, metro = self.calc.calculate_transportation(public_transport_km=100, public_transport_type="metro")
        assert metro["public_transport"] < bus["public_transport"]

    def test_public_transport_train_lowest(self):
        _, bus = self.calc.calculate_transportation(public_transport_km=100, public_transport_type="bus")
        _, train = self.calc.calculate_transportation(public_transport_km=100, public_transport_type="train")
        assert train["public_transport"] < bus["public_transport"]

    def test_no_transport_returns_zero(self):
        total, sources = self.calc.calculate_transportation()
        assert total == 0.0
        assert sources == {}

    # ── Energy ────────────────────────────────────────────────────────────

    def test_electricity_india_exact(self):
        """200 kWh * 0.659 = 131.8 kg CO2e."""
        _, sources = self.calc.calculate_energy(monthly_electricity_kwh=200)
        assert abs(sources["electricity"] - 131.8) < 0.01

    def test_lpg_exact_value(self):
        """5 kg * 2.04 = 10.2 kg CO2e."""
        _, sources = self.calc.calculate_energy(lpg_kg_monthly=5)
        assert abs(sources["lpg"] - 10.2) < 0.01

    def test_ac_boundary_24_hours(self):
        """24h * 30 * 1 kW * 0.659 = 473.04 kg CO2e."""
        _, sources = self.calc.calculate_energy(ac_hours_daily=24)
        expected = 24 * 30 * 1.0 * EMISSION_FACTORS["electricity_india"]
        assert abs(sources["ac"] - expected) < 0.01

    def test_no_energy_returns_zero(self):
        total, sources = self.calc.calculate_energy()
        assert total == 0.0
        assert sources == {}

    # ── Full footprint ────────────────────────────────────────────────────

    def test_full_footprint_returns_correct_types(self):
        result = self.calc.calculate_full_footprint(
            daily_car_km=18, monthly_electricity_kwh=200,
            ac_hours_daily=8, lpg_kg_monthly=5,
        )
        assert isinstance(result, CarbonResult)
        assert isinstance(result.monthly_kg, float)
        assert isinstance(result.annual_kg, float)
        assert isinstance(result.annual_tonnes, float)
        assert isinstance(result.sources, dict)
        assert isinstance(result.major_contributors, list)

    def test_annual_kg_equals_monthly_times_12(self):
        result = self.calc.calculate_full_footprint(daily_car_km=10, monthly_electricity_kwh=100)
        assert abs(result.annual_kg - result.monthly_kg * 12) < 0.01

    def test_annual_tonnes_consistent_with_annual_kg(self):
        result = self.calc.calculate_full_footprint(daily_car_km=10)
        assert abs(result.annual_tonnes - result.annual_kg / 1000) < 0.005

    def test_zero_inputs_returns_zero(self):
        result = self.calc.calculate_full_footprint()
        assert result.monthly_kg == 0.0
        assert result.annual_tonnes == 0.0

    def test_household_size_4_lower_than_size_1(self):
        r1 = self.calc.calculate_full_footprint(daily_car_km=10, monthly_electricity_kwh=100, household_size=1)
        r4 = self.calc.calculate_full_footprint(daily_car_km=10, monthly_electricity_kwh=100, household_size=4)
        assert r4.monthly_kg < r1.monthly_kg
        assert abs(r4.monthly_kg * 4 - r1.monthly_kg) < 0.05

    def test_major_contributors_max_three(self):
        result = self.calc.calculate_full_footprint(
            daily_car_km=10, monthly_flights=1,
            monthly_electricity_kwh=200, ac_hours_daily=4, lpg_kg_monthly=5,
        )
        assert len(result.major_contributors) <= 3

    def test_major_contributors_sorted_descending(self):
        result = self.calc.calculate_full_footprint(
            daily_car_km=10, monthly_electricity_kwh=200, ac_hours_daily=4,
        )
        amounts = [v for _, v, _ in result.major_contributors]
        assert amounts == sorted(amounts, reverse=True)

    def test_confidence_high_for_full_data(self):
        result = self.calc.calculate_full_footprint(daily_car_km=10, monthly_electricity_kwh=100, household_size=1)
        assert result.confidence == "High"

    def test_confidence_medium_for_multi_household_no_electricity(self):
        result = self.calc.calculate_full_footprint(daily_car_km=10, household_size=4)
        assert "Medium" in result.confidence

    def test_assumptions_list_populated(self):
        result = self.calc.calculate_full_footprint(daily_car_km=10)
        assert len(result.assumptions_used) > 0

    def test_formula_summary_present(self):
        result = self.calc.calculate_full_footprint(daily_car_km=10)
        assert isinstance(result.formula_summary, str)
        assert len(result.formula_summary) > 0

    # ── Region-specific electricity ───────────────────────────────────────

    def test_india_grid_higher_than_us(self):
        india = CarbonCalculator(region="india")
        us = CarbonCalculator(region="us")
        assert india.calculate_full_footprint(monthly_electricity_kwh=100).monthly_kg > \
               us.calculate_full_footprint(monthly_electricity_kwh=100).monthly_kg

    def test_australia_grid_higher_than_eu(self):
        au = CarbonCalculator(region="australia")
        eu = CarbonCalculator(region="eu")
        assert au.calculate_full_footprint(monthly_electricity_kwh=100).monthly_kg > \
               eu.calculate_full_footprint(monthly_electricity_kwh=100).monthly_kg

    def test_canada_lower_than_india(self):
        india = CarbonCalculator(region="india")
        canada = CarbonCalculator(region="canada")
        assert canada.calculate_full_footprint(monthly_electricity_kwh=100).monthly_kg < \
               india.calculate_full_footprint(monthly_electricity_kwh=100).monthly_kg

    def test_unknown_region_uses_grid_mix_fallback(self):
        unknown = CarbonCalculator(region="mars")
        result = unknown.calculate_full_footprint(monthly_electricity_kwh=100)
        assert result.monthly_kg > 0

    # ── Scenario simulation ───────────────────────────────────────────────

    def test_simulate_scenario_returns_required_keys(self):
        baseline = self.calc.calculate_full_footprint(daily_car_km=18, monthly_electricity_kwh=200)
        result = self.calc.simulate_scenario(baseline, {})
        for key in ["new_monthly_kg", "new_annual_tonnes", "saved_kg_monthly",
                    "saved_tonnes_annually", "percentage_reduction", "annual_money_saved"]:
            assert key in result

    def test_simulate_scenario_values_non_negative(self):
        baseline = self.calc.calculate_full_footprint(daily_car_km=18, monthly_electricity_kwh=200)
        result = self.calc.simulate_scenario(baseline, {})
        assert result["new_monthly_kg"] >= 0
        assert result["percentage_reduction"] >= 0
        assert result["annual_money_saved"] >= 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
