from fastapi import HTTPException, status
import re

def validate_case_id(case_id: str) -> str:
    """
    Validate standardized Case ID format (e.g. MED-2026-849201 or UUID)
    """
    if not case_id or not isinstance(case_id, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Case ID format."
        )

    # Standardized pattern match MED-YEAR-NUMBERS
    pattern = r'^MED-\d{4}-\d{6}$'
    is_valid_format = re.match(pattern, case_id.strip()) or len(case_id) >= 8

    if not is_valid_format:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Case ID format invalid. Must match MED-YYYY-XXXXXX"
        )

    return case_id.strip()

def check_role_access(required_role: str, user_role: str = "PATIENT"):
    """
    RBAC check for authorized access
    """
    roles = ["PATIENT", "DOCTOR", "ADMIN"]
    if user_role not in roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Invalid role.")
    
    if required_role == "DOCTOR" and user_role not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Doctor workstation authorization required.")
