"""
Gemini AI Integration for natural language processing.
Handles extraction, summarization, and recommendation generation.
"""

import json
from typing import Dict, Optional, Tuple
import google.generativeai as genai
from app.config import settings

class GeminiClient:
    """Client for Gemini AI API."""
    
    def __init__(self):
        """Initialize Gemini client."""
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel("gemini-2.5-flash")
    
    def extract_carbon_data(self, user_text: str) -> Dict:
        """
        Extract structured carbon data from natural language text.
        Uses Gemini to parse user input, then validates the output.
        """
        
        prompt = f"""You are an expert carbon footprint data extraction assistant.
        
User provided this lifestyle information:
"{user_text}"

Extract and return ONLY valid JSON (no markdown, no explanation) with these fields:
{{
    "daily_car_km": 0.0,
    "car_fuel_type": "petrol|diesel|electric",
    "monthly_flights": 0.0,
    "flight_type": "domestic|international",
    "public_transport_km": 0.0,
    "public_transport_type": "bus|metro|train",
    "monthly_electricity_kwh": 0.0,
    "ac_hours_daily": 0.0,
    "lpg_kg_monthly": 0.0,
    "household_size": 1,
    "region": "india|us|eu|uk|canada|australia",
    "confidence": "high|medium|low",
    "needs_followup": true|false,
    "followup_question": "string or null"
}}

Rules:
- Use 0 for unknown values
- Only set to 'high' confidence if most fields are clearly stated
- If key values missing, set needs_followup=true
- Return ONLY JSON, nothing else"""
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Remove markdown code blocks if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            
            data = json.loads(text)
            return data
        except Exception as e:
            print(f"Extraction error: {e}")
            return {
                "daily_car_km": 0,
                "car_fuel_type": "petrol",
                "monthly_flights": 0,
                "flight_type": "domestic",
                "public_transport_km": 0,
                "public_transport_type": "bus",
                "monthly_electricity_kwh": 0,
                "ac_hours_daily": 0,
                "lpg_kg_monthly": 0,
                "household_size": 1,
                "region": "india",
                "confidence": "low",
                "needs_followup": True,
                "followup_question": "Could you provide more details about your daily activities?",
            }
    
    def generate_summary(self, carbon_data: Dict, carbon_result: Dict) -> str:
        """
        Generate a human-friendly summary of carbon footprint.
        """
        
        prompt = f"""Summarize this carbon footprint in 2-3 sentences, in a friendly, non-preachy tone:
        
Annual emissions: {carbon_result['annual_tonnes']} tonnes CO2e
Monthly emissions: {carbon_result['monthly_kg']} kg CO2e

Main lifestyle factors:
- Car: {carbon_data.get('daily_car_km', 0)} km/day
- Flights: {carbon_data.get('monthly_flights', 0)} per month
- Electricity: {carbon_data.get('monthly_electricity_kwh', 0)} kWh/month
- AC: {carbon_data.get('ac_hours_daily', 0)} hours/day

Make it relatable and encouraging. Do NOT include recommendations yet."""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return f"Your carbon footprint is about {carbon_result['annual_tonnes']} tonnes CO2e annually. Let's find ways to reduce it together!"
    
    def generate_action_plan(self, carbon_data: Dict, carbon_result: Dict, user_type: str = "general") -> Dict:
        """
        Generate personalized action plan based on user data and type.
        """
        
        major_sources = ", ".join([f"{src}: {amount:.1f} kg/month" for src, amount, _ in carbon_result['major_contributors']])
        
        prompt = f"""Create a personalized action plan for a {user_type} to reduce their carbon footprint.

Current situation:
- Annual footprint: {carbon_result['annual_tonnes']} tonnes
- Monthly footprint: {carbon_result['monthly_kg']} kg
- Main sources: {major_sources}

Lifestyle:
- Car usage: {carbon_data.get('daily_car_km', 0)} km/day
- Flights: {carbon_data.get('monthly_flights', 0)}/month
- Electricity: {carbon_data.get('monthly_electricity_kwh', 0)} kWh/month
- Household: {carbon_data.get('household_size', 1)} people

Return ONLY valid JSON with NO markdown:
{{
    "highest_impact_actions": [
        {{"action": "string", "co2_reduction_kg": 0.0, "effort": "easy|medium|hard", "cost": 0}},
        ...
    ],
    "easiest_actions": [...],
    "start_today_action": {{"action": "string", "co2_reduction_kg": 0.0}},
    "next_30_days_action": {{"action": "string", "co2_reduction_kg": 0.0}},
    "motivation_message": "string"
}}

Be specific, realistic, and tailored to their {user_type} lifestyle. Return ONLY JSON."""
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            
            return json.loads(text)
        except Exception as e:
            print(f"Action plan generation error: {e}")
            return {
                "highest_impact_actions": [
                    {"action": "Switch to public transport 3 days a week", "co2_reduction_kg": 50, "effort": "medium", "cost": 0},
                    {"action": "Reduce AC usage by 2 hours daily", "co2_reduction_kg": 20, "effort": "easy", "cost": 0},
                    {"action": "Replace incandescent bulbs with LEDs", "co2_reduction_kg": 10, "effort": "easy", "cost": 500},
                ],
                "easiest_actions": [
                    {"action": "Turn off AC in unused rooms", "co2_reduction_kg": 5},
                    {"action": "Use stairs instead of elevator", "co2_reduction_kg": 2},
                    {"action": "Unplug devices when not in use", "co2_reduction_kg": 3},
                ],
                "start_today_action": {"action": "Track your morning commute - could you take public transport instead?", "co2_reduction_kg": 5},
                "next_30_days_action": {"action": "Install a smart thermostat or manual adjustment routine", "co2_reduction_kg": 15},
                "motivation_message": "Every small change adds up. You've got this!",
            }
    
    def generate_followup_questions(self, carbon_data: Dict) -> str:
        """
        Generate follow-up questions to clarify user inputs.
        """
        
        missing = []
        if carbon_data.get("daily_car_km", 0) == 0:
            missing.append("car usage")
        if carbon_data.get("monthly_electricity_kwh", 0) == 0:
            missing.append("electricity consumption")
        if carbon_data.get("monthly_flights", 0) == 0 and carbon_data.get("confidence") != "high":
            missing.append("flight frequency")
        
        if not missing:
            return None
        
        prompt = f"""Ask ONE friendly, specific follow-up question to clarify: {', '.join(missing)}
        
Keep it conversational, not like a form. For example:
- Instead of "Provide electricity usage": "How much do you think your monthly electricity bill is?"
- Instead of "Flight frequency": "Do you travel by plane often for work or leisure?"

Generate one natural question:"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return "Could you tell me more about your electricity usage?"
    
    def generate_scenario_analysis(self, baseline: Dict, scenario: Dict) -> str:
        """
        Generate natural language analysis of a what-if scenario.
        """
        
        prompt = f"""Compare these two carbon footprint scenarios in 2-3 sentences:

Baseline: {baseline['annual_tonnes']} tonnes/year
Scenario: {scenario['annual_tonnes']} tonnes/year
Reduction: {scenario.get('percentage_reduction', 0)}%

Make it encouraging and actionable, focusing on the positive impact."""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return f"This change would reduce your footprint by {scenario.get('percentage_reduction', 0)}% - that's significant!"

    def generate_structured_response(self, carbon_data: Dict, carbon_result: Dict) -> Dict:
        """
        Generate a fully structured JSON response package combining deterministic calculation results
        and AI-driven insights (recommendations, what-if scenarios, weekly challenge, and assumptions).
        """
        # Formulate fallback data package first in case Gemini API call fails
        annual_val = carbon_result.get('annual_tonnes', 0.0)
        fallback_score = max(10, min(98, int(100 - (annual_val * 4.5))))
        
        categories = []
        for cat, val in carbon_result.get('sources', {}).items():
            if val > 0:
                categories.append({
                    "name": cat.capitalize(),
                    "value": round(val * 12 / 1000, 2),
                    "unit": "tons"
                })
        
        contributors = []
        for cat, val, pct in carbon_result.get('major_contributors', []):
            contributors.append({
                "source": cat.capitalize(),
                "percentage": round(pct, 1),
                "annual_tonnes": round(val * 12 / 1000, 2)
            })

        fallback_data = {
            "summary": {
                "score": fallback_score,
                "total_annual_tonnes": annual_val,
                "categories": categories if categories else [{"name": "Overall", "value": annual_val, "unit": "tons"}]
            },
            "contributors": contributors if contributors else [{"source": "Overall Energy", "percentage": 100.0, "annual_tonnes": annual_val}],
            "recommendations": {
                "high_impact": [
                    {"action": "Reduce personal car travel or switch to public transit", "savings": "0.4 tons CO₂/year"},
                    {"action": "Optimize air conditioning usage and set thermostat to 25°C", "savings": "0.2 tons CO₂/year"}
                ],
                "easy_wins": [
                    {"action": "Replace conventional bulbs with energy-efficient LEDs"},
                    {"action": "Enable power-saving mode on home appliances"}
                ]
            },
            "what_if": {
                "scenario": "If you reduce AC usage by 2 hours daily",
                "current_footprint": f"{annual_val} tons/year",
                "new_footprint": f"{round(annual_val * 0.9, 2)} tons/year",
                "reduction_percentage": 10.0,
                "estimated_savings_rupees": int(annual_val * 1200)
            },
            "challenge": {
                "title": "Weekly Green Commitment",
                "tasks": [
                    "Take public transport or carpool at least twice this week",
                    "Turn off AC 1 hour earlier each day"
                ],
                "potential_saved_kg": 15
            },
            "confidence": {
                "score": 85 if carbon_result.get('confidence', '').lower().startswith('high') else 65,
                "assumptions": [
                    f"Standard fuel emission factors for {carbon_data.get('car_fuel_type', 'petrol')} vehicles",
                    f"Grid mix electricity emissions for {carbon_data.get('region', 'india')} region",
                    "Average short-haul and long-haul domestic flight travel distances"
                ]
            }
        }

        # Request Gemini to generate a tailored JSON package based on these parameters
        prompt = f"""You are an expert carbon footprint advisor. Based on the following deterministic calculation results, generate a personalized structured response package.

Calculation Results:
- Total Annual Emissions: {annual_val} tons/year
- Monthly Emissions Breakdown: {carbon_result.get('sources', {})}
- Biggest Contributors (Category, kg, %): {carbon_result.get('major_contributors', [])}
- User Region: {carbon_data.get('region', 'india')}

User Lifestyle Details:
- Car: {carbon_data.get('daily_car_km', 0)} km/day ({carbon_data.get('car_fuel_type', 'petrol')})
- Flights: {carbon_data.get('monthly_flights', 0)}/month ({carbon_data.get('flight_type', 'domestic')})
- Electricity: {carbon_data.get('monthly_electricity_kwh', 0)} kWh/month
- AC usage: {carbon_data.get('ac_hours_daily', 0)} hours/day
- LPG usage: {carbon_data.get('lpg_kg_monthly', 0)} kg/month
- Household Size: {carbon_data.get('household_size', 1)} people

Please generate a JSON object matching exactly the format below. Ensure that:
1. 'score' is a number from 0 to 100, where 100 means zero/very low emissions and 0 means extremely high emissions. Calculate it reasonably (e.g. average Indian household is 75-85, high US traveler is 15-30).
2. All category values in the summary are converted to annual tons (divide monthly kg by 1000 and multiply by 12, or use the annual breakdown). Use short, clean category names like 'Transport', 'Home Energy', 'Flights', 'Cooking'.
3. The recommendations must include 2 'high_impact' items (each with a realistic estimated CO2 savings in tons/year) and 2 'easy_wins' items.
4. The what_if scenario must simulate a specific lifestyle change (e.g., reduce AC, reduce car travel, use public transit), showing the current footprint, new footprint, percentage reduction, and annual savings in Indian Rupees (₹) (e.g. calculate energy or fuel cost savings, typical: 1 kg CO2 reduction ~ ₹15-20 saved).
5. The challenge contains a relevant weekly challenge with 2 action items and the potential CO2 saved in kg.
6. The confidence score is a number (e.g., 85), and assumptions list the specific assumptions made during estimation.

Return ONLY valid JSON (no markdown, no backticks, no other text):
{{
  "summary": {{
    "score": 75,
    "total_annual_tonnes": {annual_val},
    "categories": [
      {{"name": "Transport", "value": 0.0, "unit": "tons"}},
      ...
    ]
  }},
  "contributors": [
    {{"source": "string", "percentage": 0.0, "annual_tonnes": 0.0}}
  ],
  "recommendations": {{
    "high_impact": [
      {{"action": "string", "savings": "string"}}
    ],
    "easy_wins": [
      {{"action": "string"}}
    ]
  }},
  "what_if": {{
    "scenario": "string",
    "current_footprint": "string",
    "new_footprint": "string",
    "reduction_percentage": 0.0,
    "estimated_savings_rupees": 0
  }},
  "challenge": {{
    "title": "string",
    "tasks": ["string", "string"],
    "potential_saved_kg": 0
  }},
  "confidence": {{
    "score": 85,
    "assumptions": ["string", "string", "string"]
  }}
}}
"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean markdown codeblocks
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            
            data = json.loads(text)
            
            # Ground calculation parameters to guarantee correctness of calculated data
            data["summary"]["total_annual_tonnes"] = annual_val
            return data
        except Exception as e:
            print(f"Structured response generation error: {e}")
            return fallback_data

