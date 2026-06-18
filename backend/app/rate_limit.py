"""Simple in-memory rate limiter for API abuse prevention."""

import time
from collections import defaultdict
from typing import DefaultDict, Tuple

from fastapi import HTTPException, Request


class RateLimiter:
    """Fixed-window rate limiter keyed by client IP."""

    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: DefaultDict[str, Tuple[int, float]] = defaultdict(lambda: (0, 0.0))

    def check(self, key: str) -> None:
        """Raise HTTP 429 if the key exceeds the configured rate."""
        count, window_start = self._hits[key]
        now = time.monotonic()
        if now - window_start >= self.window_seconds:
            self._hits[key] = (1, now)
            return
        if count >= self.max_requests:
            raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
        self._hits[key] = (count + 1, window_start)


chat_rate_limiter = RateLimiter(max_requests=30, window_seconds=60)


def client_ip(request: Request) -> str:
    """Resolve client IP from proxy-aware headers."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"
