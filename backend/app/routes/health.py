from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/api", tags=["Health Checks"])

@router.get("/health", summary="Backend Health Check")
async def health_check():
    """
    Returns system status of MediKiosk FastAPI Backend.
    """
    return {
        "status": "ok",
        "service": "MediKiosk FastAPI Backend",
        "version": "1.0.0"
    }

from app.services.sms_service import get_active_sms_provider

@router.get("/health/services", summary="External Services Status Check")
async def services_health_check():
    """
    Returns configuration status of external services WITHOUT exposing keys or secrets.
    """
    sms_prov = get_active_sms_provider()
    return {
        "supabase": "configured" if settings.SUPABASE_URL and "your_" not in settings.SUPABASE_URL.lower() else "unconfigured_demo",
        "sms_provider": sms_prov,
        "twilio": "configured" if settings.TWILIO_VERIFY_SERVICE_SID and "your_" not in settings.TWILIO_VERIFY_SERVICE_SID.lower() else "unconfigured_demo",
        "google_places": "configured" if settings.GOOGLE_MAPS_API_KEY and "your_" not in settings.GOOGLE_MAPS_API_KEY.lower() else "unconfigured_demo"
    }
