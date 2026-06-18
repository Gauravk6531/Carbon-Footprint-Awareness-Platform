"""
Rule-based extraction of carbon footprint inputs from natural language.
Used when the Gemini API is unavailable or returns low-confidence results.
"""

import re
from typing import Dict, Optional


def _first_float(patterns: list[str], text: str) -> Optional[float]:
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    return None


def extract_from_text(user_text: str) -> Dict:
    """Extract lifestyle fields from free-form text using regex heuristics."""
    text = user_text.strip()
    lowered = text.lower()

    daily_car_km = _first_float([
        r"(?:drive|driving|travel(?:led|ed)?)\s+(?:about\s+)?(\d+(?:\.\d+)?)\s*(?:km|kilomet(?:er|re)s?)\s*(?:daily|a day|per day|each day|every day)?",
        r"(\d+(?:\.\d+)?)\s*(?:km|kilomet(?:er|re)s?)\s*(?:daily|a day|per day|each day|every day)",
        r"(?:car|vehicle)\s+(?:usage\s+of\s+)?(\d+(?:\.\d+)?)\s*(?:km|kilomet(?:er|re)s?)",
    ], text) or 0.0

    monthly_electricity_kwh = _first_float([
        r"(?:electricity|power)\s*(?:bill|usage|consumption)?\s*(?:is|of|about|around)?\s*(\d+(?:\.\d+)?)\s*(?:kwh|kw/h|units?)",
        r"(\d+(?:\.\d+)?)\s*(?:kwh|kw/h|units?)\s*(?:of\s+)?(?:electricity|power)",
    ], text) or 0.0

    ac_hours_daily = _first_float([
        r"(?:ac|air\s*condition(?:er|ing)|a/c)\s*(?:for\s+)?(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\s*(?:daily|a day|per day|each day)?",
        r"(?:use|run|using)\s+(?:the\s+)?(?:ac|air\s*condition(?:er|ing)|a/c)\s*(?:for\s+)?(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)",
    ], text) or 0.0

    public_transport_km = _first_float([
        r"(?:metro|bus|train|public\s+transport)\s*(?:for\s+)?(\d+(?:\.\d+)?)\s*(?:km|kilomet(?:er|re)s?)",
        r"(\d+(?:\.\d+)?)\s*(?:km|kilomet(?:er|re)s?)\s*(?:by\s+)?(?:metro|bus|train|public\s+transport)",
    ], text) or 0.0

    monthly_flights = 0.0
    flight_match = re.search(
        r"(?:fly|flight|flights|flying)\s*(?:about\s+)?(\d+(?:\.\d+)?)\s*(?:times?|flights?|trips?)?"
        r"|(\d+(?:\.\d+)?)\s*(?:times?|flights?|trips?)\s*(?:a|per)\s*(?:year|month)",
        lowered,
    )
    if flight_match:
        monthly_flights = float(flight_match.group(1) or flight_match.group(2))
        if "year" in lowered and "month" not in lowered:
            monthly_flights = round(monthly_flights / 12, 2)
    elif re.search(r"\bno flights?\b|\bnever fly\b|\bdon'?t fly\b", lowered):
        monthly_flights = 0.0

    lpg_kg_monthly = _first_float([
        r"(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)\s*(?:of\s+)?(?:lpg|gas|cylinder)",
        r"(?:lpg|gas|cylinder)\s*(?:usage\s+of\s+)?(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)",
    ], text) or 0.0

    household_size = int(_first_float([
        r"household\s+size\s+(\d+)",
        r"household\s+of\s+(\d+)",
        r"(\d+)\s*(?:people|persons?|members?)\s*(?:in\s+)?(?:household|family|home)?",
    ], text) or 1)

    car_fuel_type = "petrol"
    if re.search(r"\belectric\b|\bev\b|\btesla\b", lowered):
        car_fuel_type = "electric"
    elif re.search(r"\bdiesel\b", lowered):
        car_fuel_type = "diesel"

    public_transport_type = "bus"
    if re.search(r"\bmetro\b|\bsubway\b", lowered):
        public_transport_type = "metro"
    elif re.search(r"\btrain\b|\brail\b", lowered):
        public_transport_type = "train"

    flight_type = "international" if re.search(r"\binternational\b|\babroad\b|\boverseas\b", lowered) else "domestic"

    region = "india"
    for name in ("india", "us", "usa", "eu", "europe", "uk", "canada", "australia"):
        if re.search(rf"\b{re.escape(name)}\b", lowered):
            region = "us" if name in ("us", "usa") else ("eu" if name == "europe" else name)
            break

    populated = sum(
        1 for value in (
            daily_car_km, monthly_electricity_kwh, ac_hours_daily,
            public_transport_km, monthly_flights, lpg_kg_monthly,
        ) if value > 0
    )
    if household_size > 1:
        populated += 1
    if re.search(r"\b(?:india|us|usa|eu|europe|uk|canada|australia)\b", lowered):
        populated += 1

    if populated >= 3:
        confidence = "high"
        needs_followup = False
        followup_question = None
    elif populated >= 1:
        confidence = "medium"
        needs_followup = True
        followup_question = _missing_fields_question(
            daily_car_km, monthly_electricity_kwh, ac_hours_daily, monthly_flights
        )
    else:
        confidence = "low"
        needs_followup = True
        followup_question = _conversational_followup(lowered)

    return {
        "daily_car_km": daily_car_km,
        "car_fuel_type": car_fuel_type,
        "monthly_flights": monthly_flights,
        "flight_type": flight_type,
        "public_transport_km": public_transport_km,
        "public_transport_type": public_transport_type,
        "monthly_electricity_kwh": monthly_electricity_kwh,
        "ac_hours_daily": ac_hours_daily,
        "lpg_kg_monthly": lpg_kg_monthly,
        "household_size": household_size,
        "region": region,
        "confidence": confidence,
        "needs_followup": needs_followup,
        "followup_question": followup_question,
        "extraction_source": "local",
    }


def _missing_fields_question(car_km, electricity, ac_hours, flights) -> str:
    missing = []
    if car_km == 0:
        missing.append("how you commute (car km/day or public transport)")
    if electricity == 0:
        missing.append("your monthly electricity usage")
    if ac_hours == 0:
        missing.append("how many hours you run AC daily")
    if flights == 0:
        missing.append("how often you fly")
    if not missing:
        return "Could you share a bit more about your household size or cooking fuel?"
    return f"Could you tell me about {', '.join(missing[:2])}?"


def _conversational_followup(lowered: str) -> str:
    if re.search(r"\b(hi|hello|hey|good morning|good evening)\b", lowered):
        return (
            "Welcome! To estimate your carbon footprint, tell me about your commute, "
            "electricity bill, AC usage, and flights."
        )
    return "Could you share details like daily driving distance, electricity usage, or flight frequency?"


def local_chat_response(user_text: str, extracted_data: Optional[Dict] = None) -> str:
    """Template-based assistant reply when Gemini is unavailable."""
    text = user_text.strip()
    lowered = text.lower()
    extracted_data = extracted_data or extract_from_text(text)

    if re.search(r"\b(hi|hello|hey|good morning|good evening|namaste)\b", lowered):
        return (
            "Hello! I'm EcoMind AI, your carbon footprint coach. "
            "Tell me about your daily commute, home energy use, and travel habits - "
            'for example: "I drive 15 km daily and use AC for 6 hours."'
        )

    if re.search(r"\b(thank|thanks|bye|goodbye)\b", lowered):
        return "You're welcome! Feel free to share more lifestyle details whenever you'd like a footprint estimate."

    if re.search(r"\bwhat is carbon footprint\b|\bwhat'?s carbon footprint\b", lowered):
        return (
            "Your carbon footprint is the total greenhouse gases your lifestyle produces, "
            "measured in CO2 equivalent. Share your commute, energy use, and travel habits "
            "and I'll estimate yours."
        )

    if extracted_data.get("confidence") in ("high", "medium") and extracted_data.get("needs_followup"):
        followup = extracted_data.get("followup_question") or "Could you add a few more lifestyle details?"
        return f"Got it! {followup}"

    if extracted_data.get("confidence") == "low":
        return (
            "I'd love to help calculate your footprint. "
            "Try sharing specifics like: daily driving distance in km, monthly electricity in kWh, "
            "AC hours per day, and how often you fly."
        )

    return (
        "Thanks for sharing! Based on what you've told me, I can estimate your footprint. "
        "Add any missing details about transport, electricity, or flights for a more accurate result."
    )
