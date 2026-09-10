from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data

def test_services_health_endpoint():
    response = client.get("/api/health/services")
    assert response.status_code == 200
    data = response.json()
    assert "supabase" in data
    assert "twilio" in data
    assert "google_places" in data

def test_send_otp_demo_mode():
    response = client.post("/api/auth/send-otp", json={"phone": "+919876543210"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["is_demo"] is True
    assert "1234" in data["message"]

def test_verify_otp_demo_code():
    response = client.post("/api/auth/verify-otp", json={"phone": "+919876543210", "code": "1234"})
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is True
    assert data["success"] is True

def test_verify_otp_invalid_code():
    response = client.post("/api/auth/verify-otp", json={"phone": "+919876543210", "code": "9999"})
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is False

def test_nearby_hospitals_valid():
    response = client.get("/api/hospitals/nearby?latitude=17.3850&longitude=78.4867")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "hospitals" in data
    assert len(data["hospitals"]) > 0

def test_nearby_hospitals_invalid_coords():
    response = client.get("/api/hospitals/nearby?latitude=999.0&longitude=78.4867")
    assert response.status_code == 422 # Validation error

def test_case_id_validation():
    # Valid Case ID
    valid_payload = {
        "caseId": "MED-2026-849201",
        "patient": {
            "name": "Test Patient",
            "age": 40,
            "gender": "Male",
            "phone": "+919876543210",
            "bloodGroup": "A+",
            "preferredLanguage": "English"
        },
        "clinicalHistory": {
            "chiefComplaint": "Fever and cough",
            "duration": "2 days",
            "severity": "Moderate"
        }
    }
    response = client.post("/api/cases", json=valid_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["caseId"] == "MED-2026-849201"

def test_get_case_details():
    response = client.get("/api/cases/MED-2026-849201")
    assert response.status_code == 200
    data = response.json()
    assert data["case"]["caseId"] == "MED-2026-849201"
