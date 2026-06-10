"""
Tests for carbon calculation engine.
"""

import pytest
from app.carbon_engine import CarbonCalculator, CarbonResult

class TestCarbonCalculator:
    """Test suite for carbon calculations."""
    
    def setup_method(self):
        """Initialize calculator before each test."""
        self.calc = CarbonCalculator(region="india")
    
    def test_car_emissions_calculation(self):
        """Test car emission calculation."""
        transport_kg, sources = self.calc.calculate_transportation(
            daily_car_km=18,
            car_fuel_type="petrol",
        )
        
        # 18 km/day * 30 days * 0.192 kg CO2e/km = 103.68 kg CO2e/month
        assert transport_kg > 0
        assert "car" in sources
        assert sources["car"] > 100  # Should be around 103.68
    
    def test_flight_emissions_calculation(self):
        """Test flight emission calculation."""
        transport_kg, sources = self.calc.calculate_transportation(
            monthly_flights=1,
            flight_type="domestic",
        )
        
        # 1 flight * 1000 km * 0.255 = 255 kg CO2e
        assert transport_kg > 0
        assert "flights" in sources
        assert sources["flights"] > 200
    
    def test_electricity_emissions_calculation(self):
        """Test electricity emission calculation."""
        energy_kg, sources = self.calc.calculate_energy(
            monthly_electricity_kwh=200,
        )
        
        # 200 kWh * 0.659 kg CO2e/kWh = 131.8 kg CO2e (India)
        assert energy_kg > 0
        assert "electricity" in sources
        assert sources["electricity"] > 100
    
    def test_household_size_adjustment(self):
        """Test that household size correctly reduces per-capita emissions."""
        result_1 = self.calc.calculate_full_footprint(
            daily_car_km=10,
            monthly_electricity_kwh=100,
            household_size=1,
        )
        
        result_4 = self.calc.calculate_full_footprint(
            daily_car_km=10,
            monthly_electricity_kwh=100,
            household_size=4,
        )
        
        # 4-person household should have 1/4 per-capita emissions
        assert result_4.monthly_kg < result_1.monthly_kg
        assert abs(result_4.monthly_kg * 4 - result_1.monthly_kg) < 0.1
    
    def test_full_footprint_calculation(self):
        """Test full carbon footprint calculation."""
        result = self.calc.calculate_full_footprint(
            daily_car_km=18,
            car_fuel_type="petrol",
            monthly_flights=0.5,
            monthly_electricity_kwh=200,
            ac_hours_daily=8,
            lpg_kg_monthly=5,
            household_size=4,
        )
        
        assert isinstance(result, CarbonResult)
        assert result.monthly_kg > 0
        assert result.annual_kg > 0
        assert result.annual_tonnes > 0
        assert len(result.major_contributors) > 0
        assert result.confidence in ["High", "Medium", "Low"]
    
    def test_scenario_simulation(self):
        """Test what-if scenario simulation."""
        baseline = self.calc.calculate_full_footprint(
            daily_car_km=18,
            monthly_electricity_kwh=200,
            household_size=1,
        )
        
        scenario = self.calc.simulate_scenario(baseline, {})
        
        assert scenario["new_monthly_kg"] > 0
        assert scenario["percentage_reduction"] >= 0
        assert scenario["annual_money_saved"] >= 0
    
    def test_electric_car_lower_emissions(self):
        """Test that electric cars have lower emissions than petrol."""
        _, petrol_sources = self.calc.calculate_transportation(
            daily_car_km=18,
            car_fuel_type="petrol",
        )
        
        _, electric_sources = self.calc.calculate_transportation(
            daily_car_km=18,
            car_fuel_type="electric",
        )
        
        assert electric_sources["car"] < petrol_sources["car"]
    
    def test_zero_inputs(self):
        """Test calculation with zero inputs."""
        result = self.calc.calculate_full_footprint()
        
        assert result.monthly_kg == 0
        assert result.annual_tonnes == 0
    
    def test_region_specific_electricity(self):
        """Test different region electricity factors."""
        calc_india = CarbonCalculator(region="india")
        calc_us = CarbonCalculator(region="us")
        
        result_india = calc_india.calculate_full_footprint(
            monthly_electricity_kwh=100,
        )
        
        result_us = calc_us.calculate_full_footprint(
            monthly_electricity_kwh=100,
        )
        
        # India has coal-heavy grid, so higher emissions
        assert result_india.monthly_kg > result_us.monthly_kg

# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
