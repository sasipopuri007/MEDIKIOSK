import asyncio
import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.routes.health import health_check, services_health_check
from app.routes.auth import send_otp, verify_otp
from app.routes.hospitals import nearby_hospitals
from app.routes.cases import create_case, get_case, list_cases
from app.models.auth import SendOtpRequest, VerifyOtpRequest
from app.models.case import CaseModel

class MockRequest:
    class Client:
        host = "127.0.0.1"
    client = Client()

async def run_all_tests():
    print("=== RUNNING FASTAPI BACKEND TEST SUITE ===")
    mock_req = MockRequest()

    # 1. Health Check Test
    h_res = await health_check()
    assert h_res["status"] == "ok"
    print("[OK] Health Check Passed:", h_res)

    # 2. Services Health Check
    s_res = await services_health_check()
    assert "supabase" in s_res
    print("[OK] Services Health Check Passed:", s_res)

    # 3. Send OTP Test
    otp_send_req = SendOtpRequest(phone="+919876543210")
    otp_res = await send_otp(otp_send_req, mock_req)
    assert otp_res.message is not None
    print("[OK] Send OTP Test Passed:", otp_res.message)

    # 4. Verify OTP Test (Code 1234 Must Be Rejected)
    otp_verify_req = VerifyOtpRequest(phone="+919876543210", code="1234")
    ver_res = await verify_otp(otp_verify_req, mock_req)
    assert ver_res.verified is False
    print("[OK] Verify OTP Code 1234 Rejection Passed:", ver_res.message)

    # 5. Invalid Phone Number Rejection Test
    invalid_phone_req = SendOtpRequest(phone="+910000000000")
    inv_phone_res = await send_otp(invalid_phone_req, mock_req)
    assert inv_phone_res.success is False
    print("[OK] Invalid Phone Number Rejection Passed:", inv_phone_res.message)

    # 5. Invalid OTP Test
    invalid_req = VerifyOtpRequest(phone="+919876543210", code="9999")
    inv_res = await verify_otp(invalid_req, mock_req)
    assert inv_res.verified is False
    print("[OK] Invalid OTP Code Rejection Passed.")

    # 6. Nearby Hospital Search Test
    hosp_res = await nearby_hospitals(mock_req, latitude=17.3850, longitude=78.4867, radius=15000)
    assert hosp_res.success is True
    assert len(hosp_res.hospitals) > 0
    print(f"[OK] Hospital Search Passed: Found {hosp_res.count} hospitals near Hyderabad (Source: {hosp_res.source})")

    # 7. Single Case ID Creation Test
    case_payload = CaseModel(
        caseId="MED-2026-999111",
        patient={
            "name": "Backend Test Patient",
            "age": 35,
            "gender": "Female",
            "phone": "+919876543210",
            "bloodGroup": "O+",
            "preferredLanguage": "Telugu"
        },
        clinicalHistory={
            "chiefComplaint": "Chest pain and fever",
            "duration": "3 days",
            "severity": "Moderate"
        }
    )
    c_res = await create_case(case_payload, mock_req)
    assert c_res["caseId"] == "MED-2026-999111"
    print("[OK] Single Case ID Creation Passed:", c_res["caseId"])

    # 8. Case Details Fetch Test
    get_res = await get_case("MED-2026-999111", mock_req)
    assert get_res["case"]["caseId"] == "MED-2026-999111"
    print("[OK] Single Case ID Retrieval Passed.")

    # 9. List All Cases Test
    list_res = await list_cases(mock_req)
    assert list_res["count"] > 0
    print(f"[OK] Doctor Workstation Case List Passed: Total cases {list_res['count']}")

    print("\nSUCCESS: ALL 9 BACKEND TESTS PASSED SUCCESSFULLY WITH 100% SUCCESS RATE!")

if __name__ == "__main__":
    asyncio.run(run_all_tests())
