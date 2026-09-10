from fastapi import APIRouter, Request, HTTPException, status
from app.models.auth import SendOtpRequest, VerifyOtpRequest, OtpResponse
from app.services.sms_service import send_otp_service, verify_otp_service, get_active_sms_provider
from app.security.rate_limit import check_rate_limit
from app.security.audit import AuditLogger

router = APIRouter(prefix="/api/auth", tags=["Mobile Authentication & OTP"])

@router.post("/send-otp", response_model=OtpResponse, summary="Send SMS OTP via Active Provider (SMSGlobal / Textbelt / Twilio / Demo)")
async def send_otp(req: SendOtpRequest, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    # 1. Enforce Rate Limiting per IP & Phone
    check_rate_limit(f"otp_send_{client_ip}")
    check_rate_limit(f"otp_send_{req.phone}")

    # 2. Audit Logging (NEVER log OTP codes or tokens)
    provider = get_active_sms_provider()
    AuditLogger.log_event("OTP_SENT", client_ip, details={"phone": req.phone, "provider": provider})

    # 3. Call Backend SMS Service
    return await send_otp_service(req.phone)

@router.post("/verify-otp", response_model=OtpResponse, summary="Verify SMS OTP Code")
async def verify_otp(req: VerifyOtpRequest, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"

    # 1. Rate Limiting verification attempts
    check_rate_limit(f"otp_verify_{client_ip}", max_requests=10)

    # 2. Perform Verification
    res = await verify_otp_service(req.phone, req.code)

    # 3. Audit Logging
    event = "OTP_VERIFIED" if res.verified else "OTP_VERIFICATION_FAILED"
    AuditLogger.log_event(event, client_ip, details={"phone": req.phone, "verified": res.verified, "is_demo": res.is_demo})

    return res
