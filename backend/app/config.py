import os
from dotenv import load_dotenv

# Load backend/.env if exists
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(env_path)

class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "medikiosk_demo_secret_key_2026")
    RATE_LIMIT_OTP_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_OTP_PER_MINUTE", 5))

    # Backend Secrets (NEVER EXPOSE TO BROWSER)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Twilio Verify Service Credentials (NEVER EXPOSE TO BROWSER)
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_VERIFY_SERVICE_SID: str = os.getenv("TWILIO_VERIFY_SERVICE_SID", "")

    # SMSGlobal API Credentials (NEVER EXPOSE TO BROWSER)
    SMSGLOBAL_API_KEY: str = os.getenv("SMSGLOBAL_API_KEY", "")
    SMSGLOBAL_API_SECRET: str = os.getenv("SMSGLOBAL_API_SECRET", "")

    # Textbelt API Key (NEVER EXPOSE TO BROWSER)
    TEXTBELT_API_KEY: str = os.getenv("TEXTBELT_API_KEY", "")

    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

settings = Settings()
