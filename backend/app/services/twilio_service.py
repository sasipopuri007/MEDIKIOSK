from app.config import settings
from app.models.auth import OtpResponse
import urllib.request
import urllib.parse
import json
import base64
import logging

logger = logging.getLogger(__name__)

async def send_twilio_otp(phone: str) -> OtpResponse:
    """
    Call Twilio Verify API to send SMS OTP securely from Python backend.
    Never exposes Twilio Auth Token or Account SID to client browser.
    """
    sid = settings.TWILIO_ACCOUNT_SID
    token = settings.TWILIO_AUTH_TOKEN
    service_sid = settings.TWILIO_VERIFY_SERVICE_SID

    if not sid or not token or not service_sid or "your_" in sid.lower() or "your_" in service_sid.lower():
        logger.info(f"Twilio unconfigured. DEMO OTP MODE active for {phone}.")
        return OtpResponse(
            success=True,
            is_demo=True,
            verified=False,
            message="DEMO OTP MODE: No real SMS sent. Use verification code 1234 to proceed."
        )

    try:
        url = f"https://verify.twilio.com/v2/Services/{service_sid}/Verifications"
        data = urllib.parse.urlencode({"To": phone, "Channel": "sms"}).encode("utf-8")
        req = urllib.request.Request(url, data=data, method="POST")

        auth_str = f"{sid}:{token}"
        auth_bytes = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
        req.add_header("Authorization", f"Basic {auth_bytes}")
        req.add_header("Content-Type", "application/x-www-form-urlencoded")

        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status in [200, 201]:
                return OtpResponse(
                    success=True,
                    is_demo=False,
                    verified=False,
                    message="REAL OTP MODE: Verification code sent via SMS."
                )
    except Exception as e:
        logger.error(f"Twilio connection exception: {e}")

    return OtpResponse(
        success=True,
        is_demo=True,
        verified=False,
        message="DEMO OTP MODE: Twilio service fallback active. Use code 1234."
    )

async def verify_twilio_otp(phone: str, code: str) -> OtpResponse:
    """
    Verify OTP entered by user via Twilio or Demo Code (1234).
    """
    if code.strip() == "1234":
        return OtpResponse(
            success=True,
            is_demo=True,
            verified=True,
            message="Demo OTP verified successfully!"
        )

    sid = settings.TWILIO_ACCOUNT_SID
    token = settings.TWILIO_AUTH_TOKEN
    service_sid = settings.TWILIO_VERIFY_SERVICE_SID

    if not sid or not token or not service_sid:
        return OtpResponse(
            success=False,
            is_demo=True,
            verified=False,
            message="Invalid OTP code. Please enter 1234 in demo mode."
        )

    try:
        url = f"https://verify.twilio.com/v2/Services/{service_sid}/VerificationCheck"
        data = urllib.parse.urlencode({"To": phone, "Code": code}).encode("utf-8")
        req = urllib.request.Request(url, data=data, method="POST")

        auth_str = f"{sid}:{token}"
        auth_bytes = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
        req.add_header("Authorization", f"Basic {auth_bytes}")
        req.add_header("Content-Type", "application/x-www-form-urlencoded")

        with urllib.request.urlopen(req, timeout=8) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            is_valid = res_data.get("status") == "approved"
            return OtpResponse(
                success=is_valid,
                is_demo=False,
                verified=is_valid,
                message="Mobile number verified successfully!" if is_valid else "Invalid OTP code."
            )
    except Exception as e:
        logger.error(f"Twilio verification exception: {e}")

    return OtpResponse(success=False, is_demo=True, verified=False, message="Verification failed. Try code 1234.")
