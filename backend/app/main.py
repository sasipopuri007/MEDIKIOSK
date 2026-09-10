from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import health, auth, hospitals, cases, appointments, reports

app = FastAPI(
    title="MediKiosk FastAPI Backend",
    description="Secure 3-Tier Clinical Intake & Cyber Security Backend with Rate Limiting, Audit Logging & Zero Frontend Secret Exposure.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Restricted to FRONTEND_URL and local origins
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]

if settings.FRONTEND_URL:
    for url in settings.FRONTEND_URL.split(","):
        cleaned_url = url.strip()
        if cleaned_url and cleaned_url not in allowed_origins:
            allowed_origins.append(cleaned_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(hospitals.router)
app.include_router(cases.router)
app.include_router(appointments.router)
app.include_router(reports.router)

@app.get("/", summary="Root Endpoint")
async def root():
    return {
        "service": "MediKiosk FastAPI Security Backend",
        "health": "/api/health",
        "docs": "/docs"
    }
