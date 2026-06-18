"""Tests for rate limiting middleware."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_rate_limiter_allows_normal_traffic():
    """Health endpoint should not be rate limited."""
    for _ in range(5):
        r = client.get("/health")
        assert r.status_code == 200
