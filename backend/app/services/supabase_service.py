import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

# Server-side in-memory case database fallback
MEMORY_CASES: Dict[str, Dict[str, Any]] = {}

def get_supabase_client():
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return None
    if "your_" in settings.SUPABASE_URL.lower():
        return None
    try:
        from supabase import create_client
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        logger.warning(f"Supabase client initialization notice: {e}")
        return None

async def save_case_db(case_data: Dict[str, Any]) -> Dict[str, Any]:
    case_id = case_data.get("caseId")
    if not case_id:
        raise ValueError("Missing Case ID")

    # Always update memory store
    MEMORY_CASES[case_id] = case_data

    client = get_supabase_client()
    if client:
        try:
            client.table("cases").upsert({
                "case_id": case_id,
                "patient_name": case_data.get("patient", {}).get("name", "Anonymous"),
                "patient_age": case_data.get("patient", {}).get("age", 0),
                "patient_gender": case_data.get("patient", {}).get("gender", ""),
                "patient_phone": case_data.get("patient", {}).get("phone", ""),
                "blood_group": case_data.get("patient", {}).get("bloodGroup", "unknown"),
                "preferred_language": case_data.get("patient", {}).get("preferredLanguage", "English"),
                "chief_complaint": case_data.get("clinicalHistory", {}).get("chiefComplaint", ""),
                "duration": case_data.get("clinicalHistory", {}).get("duration", ""),
                "severity": case_data.get("clinicalHistory", {}).get("severity", "Moderate"),
                "hospital_name": case_data.get("hospital", {}).get("name") if case_data.get("hospital") else None,
                "doctor_name": case_data.get("doctor", {}).get("name") if case_data.get("doctor") else None,
                "status": case_data.get("appointment", {}).get("status", "Pending")
            }).execute()
        except Exception as e:
            logger.warning(f"Supabase DB upsert notice (Memory store active): {e}")

    return case_data

async def get_case_db(case_id: str) -> Optional[Dict[str, Any]]:
    if case_id in MEMORY_CASES:
        return MEMORY_CASES[case_id]

    client = get_supabase_client()
    if client:
        try:
            res = client.table("cases").select("*").eq("case_id", case_id).execute()
            if res.data and len(res.data) > 0:
                row = res.data[0]
                return {
                    "caseId": row.get("case_id"),
                    "patient": {
                        "name": row.get("patient_name"),
                        "age": row.get("patient_age"),
                        "gender": row.get("patient_gender"),
                        "phone": row.get("patient_phone"),
                        "bloodGroup": row.get("blood_group", "unknown"),
                        "preferredLanguage": row.get("preferred_language", "English")
                    },
                    "clinicalHistory": {
                        "chiefComplaint": row.get("chief_complaint"),
                        "duration": row.get("duration"),
                        "severity": row.get("severity")
                    },
                    "hospital": {"name": row.get("hospital_name")},
                    "doctor": {"name": row.get("doctor_name")},
                    "appointment": {"status": row.get("status", "Pending")}
                }
        except Exception as e:
            logger.warning(f"Supabase fetch notice: {e}")

    return None

async def list_cases_db() -> List[Dict[str, Any]]:
    return list(MEMORY_CASES.values())
