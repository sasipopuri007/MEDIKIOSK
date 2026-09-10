# MediKiosk FastAPI Backend

Secure 3-Tier Python REST API backend for MediKiosk Clinical Intake System.

## Architecture & Security Features

1. **Zero Secret Exposure**: Twilio Auth Tokens, Supabase Service Role Keys, and Google Places API keys are kept strictly backend-side in `backend/.env`.
2. **Security Audit Logging**: All sensitive actions (`OTP_SENT`, `CASE_CREATED`, `HOSPITAL_SEARCH`, `UNAUTHORIZED_ACCESS`) are recorded without logging raw passwords, OTP codes, or secret keys.
3. **Rate Limiting**: HTTP 429 rate limiting on `/api/auth/send-otp` and `/api/auth/verify-otp`.
4. **Input Validation**: Pydantic models for request bodies and Case ID formats.

## Setup & Running Backend

```bash
cd backend

# Create Virtual Environment
python -m venv venv

# Activate Virtual Environment (Windows)
venv\Scripts\activate

# Install Requirements
pip install -r requirements.txt

# Start Server
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /api/health` — Health Check
- `GET /api/health/services` — Service Configuration Status
- `POST /api/auth/send-otp` — Send OTP via Twilio / Demo Fallback
- `POST /api/auth/verify-otp` — Verify OTP (Supports Demo Code 1234)
- `GET /api/hospitals/nearby` — Google Places Nearby Search / Haversine Demo Fallback
- `POST /api/cases` — Save Case Data
- `GET /api/cases/{case_id}` — Get Case Data by ID
- `GET /docs` — Swagger OpenAPI Documentation

## Pytest Suite

```bash
pytest
```
