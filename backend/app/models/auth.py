from pydantic import BaseModel, Field, field_validator
import re

class SendOtpRequest(BaseModel):
    phone: str = Field(..., description="Patient mobile phone number in standard format")

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean_phone = re.sub(r'[\s\(\)\-\+]', '', v)
        if not clean_phone.isdigit() or len(clean_phone) < 7 or len(clean_phone) > 15:
            raise ValueError("Invalid mobile phone number format.")
        return v.strip()

class VerifyOtpRequest(BaseModel):
    phone: str = Field(..., description="Patient mobile phone number")
    code: str = Field(..., min_length=4, max_length=6, description="OTP code")

class OtpResponse(BaseModel):
    success: bool
    is_demo: bool = True
    verified: bool = False
    message: str
