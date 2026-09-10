from fastapi import APIRouter, Query, Request, HTTPException, status
from app.models.hospital import HospitalSearchResponse
from app.services.google_places_service import get_nearby_hospitals
from app.security.audit import AuditLogger

router = APIRouter(prefix="/api/hospitals", tags=["Nearby Hospital Discovery"])

@router.get("/nearby", response_model=HospitalSearchResponse, summary="Find Nearby Hospitals using Google Places or Haversine Demo Dataset")
async def nearby_hospitals(
    request: Request,
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Patient Latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Patient Longitude"),
    radius: int = 15000,
    query: str = "",
    category: str = "ALL"
):
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    # Safely convert to string if Query default object
    q_str = str(query) if not hasattr(query, 'default') else ""
    c_str = str(category) if not hasattr(category, 'default') else "ALL"

    # Audit Event
    AuditLogger.log_event("HOSPITAL_SEARCH", client_ip, details={"lat": latitude, "lng": longitude, "query": q_str, "category": c_str})

    return await get_nearby_hospitals(latitude, longitude, radius, q_str, c_str)
