import urllib.request
import urllib.parse
import urllib.error
import json
import base64
import time
import logging
import re
from app.config import settings
from app.models.auth import OtpResponse

logger = logging.getLogger(__name__)

# In-memory OTP storage for non-Twilio custom SMS providers if needed
OTP_STORE = {}

def normalize_phone(phone: str) -> str:
    """
    Normalize Indian phone numbers into standard E.164 format (+91XXXXXXXXXX).
    """
    cleaned = phone.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if len(cleaned) == 10 and cleaned.isdigit():
        return f"+91{cleaned}"
    if len(cleaned) == 12 and cleaned.startswith("91") and cleaned.isdigit():
        return f"+{cleaned}"
    if cleaned.startswith("+91") and len(cleaned) == 13 and cleaned[3:].isdigit():
        return cleaned
    if cleaned.startswith("+") and len(cleaned) >= 10 and cleaned[1:].isdigit():
        return cleaned
    return cleaned

def is_valid_indian_phone(phone: str) -> bool:
    """
    Validate normalized E.164 Indian phone number (+91 followed by 10 digits starting 6-9).
    """
    pattern = r"^\+91[6-9]\d{9}$"
    return bool(re.match(pattern, phone))

def mask_phone(phone: str) -> str:
    """
    Safely mask phone number for audit logging (+91 98*** **210).
    """
    if len(phone) >= 10:
        return f"{phone[:4]}****{phone[-3:]}"
    return "****"

def get_active_sms_provider() -> str:
    """
    Determine the active SMS provider based on backend environment configuration.
    Primary: Twilio Verify.
    """
    tw_sid = settings.TWILIO_ACCOUNT_SID
    tw_token = settings.TWILIO_AUTH_TOKEN
    tw_service = settings.TWILIO_VERIFY_SERVICE_SID
    if tw_sid and tw_token and tw_service and "your_" not in tw_sid.lower() and "your_" not in tw_service.lower():
        return "Twilio Verify"
    return "Twilio Verify Unconfigured"

async def send_otp_service(raw_phone: str) -> OtpResponse:
    """
    Send real SMS OTP using Twilio Verify API v2 for the user-specific phone number.
    Never exposes credentials or returns the OTP to the client.
    """
    phone = normalize_phone(raw_phone)
    masked = mask_phone(phone)

    if not is_valid_indian_phone(phone):
        return OtpResponse(
            success=False,
            is_demo=False,
            verified=False,
            message="Please enter a valid 10-digit Indian phone number."
        )

    provider = get_active_sms_provider()
    logger.info(f"Sending OTP via Twilio Verify to phone: {masked}")

    if provider == "Twilio Verify":
        try:
            url = f"https://verify.twilio.com/v2/Services/{settings.TWILIO_VERIFY_SERVICE_SID}/Verifications"
            data = urllib.parse.urlencode({"To": phone, "Channel": "sms"}).encode("utf-8")
            req = urllib.request.Request(url, data=data, method="POST")

            auth_str = f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}"
            auth_bytes = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
            req.add_header("Authorization", f"Basic {auth_bytes}")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")

            with urllib.request.urlopen(req, timeout=8) as response:
                if response.status in [200, 201]:
                    return OtpResponse(
                        success=True,
                        is_demo=False,
                        verified=False,
                        message="OTP sent successfully to your phone."
                    )
        except urllib.error.HTTPError as http_err:
            err_body = http_err.read().decode("utf-8", errors="ignore")
            logger.warning(f"Twilio HTTP Error {http_err.code}: {err_body}")
            if http_err.code == 403 or "21608" in err_body or "unverified" in err_body.lower():
                msg = "Real SMS OTP is temporarily unavailable for this phone number because the current Twilio account is in Trial mode. Please use a verified test number."
            else:
                msg = f"Twilio API request failed (HTTP {http_err.code}). Please try again."
            return OtpResponse(
                success=False,
                is_demo=False,
                verified=False,
                message=msg
            )
        except Exception as e:
            logger.error(f"Twilio Verify API error: {e}")
            return OtpResponse(
                success=False,
                is_demo=False,
                verified=False,
                message="Unable to send OTP at this time due to network error. Please try again."
            )

    return OtpResponse(
        success=False,
        is_demo=False,
        verified=False,
        message="Twilio Verify credentials are not configured in backend environment."
    )

async def verify_otp_service(raw_phone: str, code: str) -> OtpResponse:
    """
    Verify user-entered OTP code via Twilio Verify API v2.
    Does NOT accept 1234 or any hardcoded demo code.
    """
    phone = normalize_phone(raw_phone)
    clean_code = code.strip()
    provider = get_active_sms_provider()

    if not is_valid_indian_phone(phone):
        return OtpResponse(
            success=False,
            is_demo=False,
            verified=False,
            message="Invalid phone number format."
        )

    if not clean_code or len(clean_code) < 4:
        return OtpResponse(
            success=False,
            is_demo=False,
            verified=False,
            message="Please enter the complete verification code received on your phone."
        )

    if provider == "Twilio Verify":
        try:
            url = f"https://verify.twilio.com/v2/Services/{settings.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck"
            data = urllib.parse.urlencode({"To": phone, "Code": clean_code}).encode("utf-8")
            req = urllib.request.Request(url, data=data, method="POST")

            auth_str = f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}"
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
                    message="Mobile number verified successfully!" if is_valid else "Invalid OTP code. Please check the SMS code sent to your phone."
                )
        except urllib.error.HTTPError as http_err:
            err_body = http_err.read().decode("utf-8", errors="ignore")
            logger.warning(f"Twilio VerificationCheck HTTP Error {http_err.code}: {err_body}")
            return OtpResponse(
                success=False,
                is_demo=False,
                verified=False,
                message="Invalid OTP code or verification expired."
            )
        except Exception as e:
            logger.error(f"Twilio verification error: {e}")
            return OtpResponse(
                success=False,
                is_demo=False,
                verified=False,
                message="Verification service error."
            )

    return OtpResponse(
        success=False,
        is_demo=False,
        verified=False,
        message="Verification service is unconfigured."
    )
