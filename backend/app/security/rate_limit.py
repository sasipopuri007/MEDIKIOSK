from fastapi import HTTPException, status
from datetime import datetime, timedelta
from typing import Dict, List
from app.config import settings

# Memory cache for request timestamps by IP/Phone
rate_limit_cache: Dict[str, List[datetime]] = {}

def check_rate_limit(key: str, max_requests: int = settings.RATE_LIMIT_OTP_PER_MINUTE, window_seconds: int = 60):
    """
    In-memory rate limiter for sensitive endpoints.
    Raises HTTP 429 if request count exceeds limit.
    """
    now = datetime.utcnow()
    window_start = now - timedelta(seconds=window_seconds)

    if key not in rate_limit_cache:
        rate_limit_cache[key] = []

    # Clean old requests outside window
    rate_limit_cache[key] = [t for t in rate_limit_cache[key] if t > window_start]

    if len(rate_limit_cache[key]) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds} seconds allowed."
        )

    rate_limit_cache[key].append(now)
