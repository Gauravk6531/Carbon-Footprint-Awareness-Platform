"""Recommendation generation based on emission contributors."""

from typing import List, Tuple

RECOMMENDATION_MAP = {
    "car": [
        "Switch to public transport or carpool 2-3 days per week",
        "Consider an electric vehicle or hybrid for your next car",
    ],
    "flights": [
        "Combine multiple trips into fewer flights",
        "Try virtual meetings instead of business travel",
    ],
    "electricity": [
        "Switch to renewable energy plan if available",
        "Install solar panels or use energy-efficient appliances",
    ],
    "ac": [
        "Use AC sparingly and set temperature to 25-26°C",
        "Improve insulation and use fans for air circulation",
    ],
    "lpg": [
        "Use pressure cooker and closed lids while cooking",
        "Consider induction cooking for better efficiency",
    ],
    "public_transport": [
        "Opt for metro or train over bus for lower emissions",
    ],
}


def generate_recommendations(major_contributors: List[Tuple]) -> List[str]:
    """Generate deduplicated recommendations based on major contributors."""
    seen = set()
    recommendations = []
    for source, _, _ in major_contributors:
        for rec in RECOMMENDATION_MAP.get(source, ["Track and reduce your highest emission activity"]):
            if rec not in seen:
                seen.add(rec)
                recommendations.append(rec)
    return recommendations[:3]
