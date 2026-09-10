from fastapi import APIRouter, Request, HTTPException, status
from typing import Dict, Any
from app.security.auth import validate_case_id
from app.security.audit import AuditLogger
from app.services.supabase_service import get_case_db, save_case_db

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@router.post("", summary="Schedule Doctor Appointment")
async def create_appointment(data: Dict[str, Any], request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    case_id = data.get("caseId")
    if not case_id:
        raise HTTPException(status_code=400, detail="Missing Case ID")

    valid_id = validate_case_id(case_id)
    case_record = await get_case_db(valid_id) or {"caseId": valid_id}
    
    case_record["appointment"] = data.get("appointment", {
        "date": data.get("date"),
        "time": data.get("time"),
        "type": data.get("type", "in_person"),
        "status": "Pending"
    })
    
    await save_case_db(case_record)
    AuditLogger.log_event("APPOINTMENT_CREATED", client_ip, user_id=valid_id)

    return {"success": True, "caseId": valid_id, "appointment": case_record["appointment"]}

@router.get("/{case_id}", summary="Get Appointment Details by Case ID")
async def get_appointment(case_id: str):
    valid_id = validate_case_id(case_id)
    case_record = await get_case_db(valid_id)
    if not case_record or "appointment" not in case_record:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return {"success": True, "appointment": case_record["appointment"]}
