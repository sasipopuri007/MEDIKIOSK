import logging
from datetime import datetime
from typing import Optional, Dict, Any

# Configure security audit logger
logger = logging.getLogger("medikiosk_security_audit")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('[AUDIT] %(asctime)s - %(levelname)s - %(message)s'))
if not logger.handlers:
    logger.addHandler(handler)

class AuditLogger:
    @staticmethod
    def log_event(event_type: str, client_ip: str, user_id: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        """
        Record security audit event.
        STRICT RULE: Never log passwords, raw OTPs, Twilio Auth Tokens, or Supabase Service Role keys.
        """
        safe_details = {}
        if details:
            for k, v in details.items():
                if any(secret_key in k.lower() for secret_key in ['otp', 'password', 'token', 'secret', 'key', 'auth']):
                    safe_details[k] = "[REDACTED_SECRET]"
                else:
                    safe_details[k] = v

        audit_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "client_ip": client_ip,
            "user_id": user_id or "anonymous",
            "details": safe_details
        }
        
        logger.info(f"SECURITY_EVENT: {event_type} | IP: {client_ip} | Details: {safe_details}")
        return audit_entry
