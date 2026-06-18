"""Tests for recommendation generation."""

from app.recommendations import generate_recommendations


def test_generates_car_recommendations():
    contributors = [("car", 100, 0.5)]
    recs = generate_recommendations(contributors)
    assert len(recs) >= 1
    assert any("transport" in r.lower() or "electric" in r.lower() for r in recs)


def test_deduplicates_recommendations():
    contributors = [("car", 100, 0.5), ("car", 50, 0.25)]
    recs = generate_recommendations(contributors)
    assert len(recs) == len(set(recs))


def test_limits_to_three_recommendations():
    contributors = [
        ("car", 100, 0.3),
        ("flights", 80, 0.25),
        ("electricity", 60, 0.2),
        ("ac", 40, 0.15),
        ("lpg", 20, 0.1),
    ]
    recs = generate_recommendations(contributors)
    assert len(recs) <= 3


def test_unknown_source_gets_generic_recommendation():
    contributors = [("unknown_source", 100, 1.0)]
    recs = generate_recommendations(contributors)
    assert len(recs) == 1
    assert "Track" in recs[0]
