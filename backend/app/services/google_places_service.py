import urllib.request
import json
import math
import logging
from typing import List, Dict, Any
from app.config import settings
from app.models.hospital import HospitalModel, HospitalSearchResponse

logger = logging.getLogger(__name__)

# Server-side Demo Hospital Dataset including Hyderabad, Guntur, Delhi & National Coverage
DEMO_HOSPITALS_DATA = [
  {
    "id": "hosp-guntur-101",
    "name": "Government General Hospital (GGH) Guntur",
    "category": "Government General",
    "type": "Government",
    "address": "Sambasiva Pet, Near Railway Station, Guntur, Andhra Pradesh 522001",
    "phone": "+91 863 223 0001",
    "lat": 16.3008,
    "lng": 80.4375,
    "rating": 4.6,
    "open_hours": "24/7 Emergency & OPD",
    "specialties": ["General Medicine", "Cardiology", "Trauma Care", "Orthopedics"],
    "is_demo": True
  },
  {
    "id": "hosp-guntur-102",
    "name": "Ramesh Hospitals - Super Specialty Guntur",
    "category": "Multispeciality",
    "type": "Private",
    "address": "Collector Office Road, Nagaralu, Guntur, Andhra Pradesh 522004",
    "phone": "+91 863 237 7777",
    "lat": 16.3067,
    "lng": 80.4365,
    "rating": 4.8,
    "open_hours": "24 Hours Emergency & Critical Care",
    "specialties": ["Cardiology", "Neurology", "Gastroenterology", "Pulmonology"],
    "is_demo": True
  },
  {
    "id": "hosp-guntur-103",
    "name": "Manipal Super Specialty Hospital Guntur",
    "category": "Multispeciality",
    "type": "Private",
    "address": "Near Prakasam Barrage, Tadepalle, Guntur District, AP 522501",
    "phone": "+91 863 222 5555",
    "lat": 16.4862,
    "lng": 80.6025,
    "rating": 4.7,
    "open_hours": "24/7 Emergency & Outpatient Care",
    "specialties": ["Oncology", "Orthopedics", "Pediatrics", "Nephrology"],
    "is_demo": True
  },
  {
    "id": "hosp-guntur-104",
    "name": "Community Health Centre (CHC) Guntur Urban",
    "category": "CHC",
    "type": "Government",
    "address": "Kothapet Main Road, Guntur, Andhra Pradesh 522001",
    "phone": "+91 863 224 1122",
    "lat": 16.3120,
    "lng": 80.4410,
    "rating": 4.2,
    "open_hours": "8:00 AM - 5:00 PM",
    "specialties": ["Primary Care", "Maternal Care", "Vaccination"],
    "is_demo": True
  },
  {
    "id": "hosp-101",
    "name": "Government General Hospital & Medical College",
    "category": "Government General",
    "type": "Government",
    "address": "Station Road, Near Central Bus Stand, Hyderabad, Telangana",
    "phone": "+91 40 2460 0121",
    "lat": 17.3850,
    "lng": 78.4867,
    "rating": 4.5,
    "open_hours": "24/7 Emergency & OPD (8 AM - 2 PM)",
    "specialties": ["General Medicine", "Cardiology", "Orthopedics", "Emergency Care"],
    "is_demo": True
  },
  {
    "id": "hosp-102",
    "name": "District Government Civil Hospital",
    "category": "District Government",
    "type": "Government",
    "address": "Civil Hospital Road, Secunderabad, Telangana",
    "phone": "+91 40 2780 4321",
    "lat": 17.4399,
    "lng": 78.4983,
    "rating": 4.3,
    "open_hours": "24 Hours Emergency",
    "specialties": ["General Surgery", "Pulmonology", "Gynecology", "ENT"],
    "is_demo": True
  },
  {
    "id": "hosp-103",
    "name": "Community Health Centre (CHC) - Urban Clinic",
    "category": "CHC",
    "type": "Government",
    "address": "Main Road, Banjara Hills Colony, Hyderabad, Telangana",
    "phone": "+91 40 2335 9988",
    "lat": 17.4156,
    "lng": 78.4347,
    "rating": 4.2,
    "open_hours": "8:00 AM - 6:00 PM",
    "specialties": ["Primary Care", "Immunization", "Maternal Health"],
    "is_demo": True
  },
  {
    "id": "hosp-104",
    "name": "Primary Health Centre (PHC) - Community Care",
    "category": "PHC",
    "type": "Government",
    "address": "High School Road, Gachibowli, Hyderabad, Telangana",
    "phone": "+91 40 2300 1122",
    "lat": 17.4401,
    "lng": 78.3489,
    "rating": 4.0,
    "open_hours": "9:00 AM - 4:00 PM",
    "specialties": ["Basic Health", "Vaccination", "First Aid"],
    "is_demo": True
  },
  {
    "id": "hosp-105",
    "name": "Apollo Multispeciality Super Specialty Hospital",
    "category": "Multispeciality",
    "type": "Private",
    "address": "Road No 92, Jubilee Hills, Hyderabad, Telangana",
    "phone": "+91 40 2360 7777",
    "lat": 17.4319,
    "lng": 78.4071,
    "rating": 4.8,
    "open_hours": "24/7 Critical Care & Emergency",
    "specialties": ["Cardiology", "Neurology", "Oncology", "Orthopedics"],
    "is_demo": True
  }
]

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

async def get_nearby_hospitals(lat: float, lng: float, radius: int = 15000, query: str = "", category: str = "ALL") -> HospitalSearchResponse:
    cat_str = str(category) if category else "ALL"
    q_str = str(query) if query else ""

    api_key = settings.GOOGLE_MAPS_API_KEY

    # REAL Google Places API Call when key is provided
    if api_key and api_key.strip() and "your_" not in api_key.lower():
        try:
            # 1. Try Google Places New searchNearby API
            url = "https://places.googleapis.com/v1/places:searchNearby"
            body = json.dumps({
                "includedTypes": ["hospital", "medical_center", "doctor"],
                "maxResultCount": 20,
                "locationRestriction": {
                    "circle": {
                        "center": {"latitude": lat, "longitude": lng},
                        "radius": float(radius)
                    }
                }
            }).encode("utf-8")

            req = urllib.request.Request(url, data=body, method="POST")
            req.add_header("Content-Type", "application/json")
            req.add_header("X-Goog-Api-Key", api_key.strip())
            req.add_header("X-Goog-FieldMask", "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.nationalPhoneNumber,places.googleMapsUri,places.primaryType")

            with urllib.request.urlopen(req, timeout=8) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    places = data.get("places", [])
                    if places:
                        hospitals = []
                        for idx, p in enumerate(places):
                            plat = p.get("location", {}).get("latitude", lat)
                            plng = p.get("location", {}).get("longitude", lng)
                            dist = haversine_km(lat, lng, plat, plng)
                            name = p.get("displayName", {}).get("text", "Hospital")
                            address = p.get("formattedAddress", "Local Area")
                            maps_uri = p.get("googleMapsUri", f"https://www.google.com/maps/dir/?api=1&destination={plat},{plng}")
                            phone = p.get("nationalPhoneNumber") or None

                            if q_str and q_str.lower().strip() not in name.lower() and q_str.lower().strip() not in address.lower():
                                continue

                            hospitals.append(
                                HospitalModel(
                                    id=p.get("id", f"gplace-{idx}"),
                                    name=name,
                                    category=p.get("primaryType", "General Hospital").replace("_", " ").title(),
                                    type="Medical Facility",
                                    address=address,
                                    phone=phone,
                                    lat=plat,
                                    lng=plng,
                                    rating=p.get("rating", 4.5),
                                    distance_km=dist,
                                    open_hours="24/7",
                                    specialties=["Emergency Care", "Outpatient"],
                                    google_maps_uri=maps_uri,
                                    is_demo=False
                                )
                            )
                        if hospitals:
                            hospitals.sort(key=lambda h: h.distance_km)
                            return HospitalSearchResponse(
                                success=True,
                                source="google_places",
                                count=len(hospitals),
                                hospitals=hospitals
                            )
        except Exception as e:
            logger.warning(f"Google Places New API notice: {e}. Trying Legacy Nearby Search...")
            try:
                # 2. Try Google Places Legacy Nearby Search API
                legacy_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius={radius}&type=hospital&key={api_key.strip()}"
                req_leg = urllib.request.Request(legacy_url, method="GET")
                with urllib.request.urlopen(req_leg, timeout=8) as leg_res:
                    if leg_res.status == 200:
                        leg_data = json.loads(leg_res.read().decode("utf-8"))
                        results = leg_data.get("results", [])
                        if results:
                            hospitals = []
                            for idx, p in enumerate(results):
                                geom = p.get("geometry", {}).get("location", {})
                                plat = geom.get("lat", lat)
                                plng = geom.get("lng", lng)
                                dist = haversine_km(lat, lng, plat, plng)
                                name = p.get("name", "Hospital")
                                address = p.get("vicinity", "Local Area")
                                maps_uri = f"https://www.google.com/maps/dir/?api=1&destination={plat},{plng}"
                                phone = p.get("formatted_phone_number") or None

                                if q_str and q_str.lower().strip() not in name.lower() and q_str.lower().strip() not in address.lower():
                                    continue

                                hospitals.append(
                                    HospitalModel(
                                        id=p.get("place_id", f"leg-gplace-{idx}"),
                                        name=name,
                                        category="General Hospital",
                                        type="Hospital",
                                        address=address,
                                        phone=phone,
                                        lat=plat,
                                        lng=plng,
                                        rating=p.get("rating", 4.5),
                                        distance_km=dist,
                                        open_hours="24/7",
                                        specialties=["Emergency Care"],
                                        google_maps_uri=maps_uri,
                                        is_demo=False
                                    )
                                )
                            if hospitals:
                                hospitals.sort(key=lambda h: h.distance_km)
                                return HospitalSearchResponse(
                                    success=True,
                                    source="google_places",
                                    count=len(hospitals),
                                    hospitals=hospitals
                                )
            except Exception as leg_e:
                logger.warning(f"Google Places Legacy API fetch error: {leg_e}. Falling back to demo dataset.")

    # Fallback to Demo Dataset with Haversine sorting
    demo_list = []
    for h in DEMO_HOSPITALS_DATA:
        dist = haversine_km(lat, lng, h["lat"], h["lng"])
        h_copy = dict(h)
        h_copy["distance_km"] = dist

        # Filtering by Category
        if cat_str and cat_str.upper() != "ALL":
            if cat_str.lower() not in h_copy["category"].lower() and cat_str.lower() not in h_copy["type"].lower():
                continue
        # Filtering by Query text
        if q_str and q_str.strip():
            q = q_str.lower().strip()
            if q not in h_copy["name"].lower() and q not in h_copy["address"].lower():
                continue

        demo_list.append(HospitalModel(**h_copy))

    demo_list.sort(key=lambda h: h.distance_km)
    return HospitalSearchResponse(
        success=True,
        source="demo_fallback",
        count=len(demo_list),
        hospitals=demo_list
    )
