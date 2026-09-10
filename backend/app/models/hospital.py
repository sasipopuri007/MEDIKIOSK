from pydantic import BaseModel, Field
from typing import List, Optional

class HospitalModel(BaseModel):
    id: str
    name: str
    category: str = "General Hospital"
    type: str = "Government/Private"
    address: str
    phone: Optional[str] = None
    lat: float
    lng: float
    rating: Optional[float] = 4.5
    distance_km: float = 0.0
    open_hours: Optional[str] = "24/7"
    specialties: List[str] = []
    google_maps_uri: Optional[str] = None
    is_demo: bool = True

class HospitalSearchResponse(BaseModel):
    success: bool
    source: str  # "google_places" or "demo_fallback"
    count: int
    hospitals: List[HospitalModel]
