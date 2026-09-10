from fastapi import APIRouter, Request, HTTPException, status
from typing import List, Dict, Any
from app.models.case import CaseModel
from app.services.supabase_service import save_case_db, get_case_db, list_cases_db
from app.security.auth import validate_case_id
from app.security.audit import AuditLogger

router = APIRouter(prefix="/api/cases", tags=["Case ID Management & Intake"])

@router.post("", summary="Create or Update Patient Case ID Record")
async def create_case(case_data: CaseModel, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    validate_case_id(case_data.caseId)

    saved = await save_case_db(case_data.model_dump())
    AuditLogger.log_event("CASE_CREATED", client_ip, user_id=case_data.caseId, details={"patient": case_data.patient.name})
    return {"success": True, "caseId": case_data.caseId, "data": saved}

@router.get("/{case_id}", summary="Get Case Details by Case ID")
async def get_case(case_id: str, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    valid_id = validate_case_id(case_id)

    case_record = await get_case_db(valid_id)
    if not case_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case ID {valid_id} not found.")

    AuditLogger.log_event("CASE_ACCESSED", client_ip, user_id=valid_id)
    return {"success": True, "case": case_record}

@router.put("/{case_id}", summary="Update Case Data or Status")
async def update_case(case_id: str, case_data: Dict[str, Any], request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    valid_id = validate_case_id(case_id)

    case_data["caseId"] = valid_id
    updated = await save_case_db(case_data)

    AuditLogger.log_event("CASE_UPDATED", client_ip, user_id=valid_id)
    return {"success": True, "caseId": valid_id, "data": updated}

@router.get("", summary="List All Active Cases for Doctor Workstation")
async def list_cases(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    AuditLogger.log_event("DOCTOR_WORKSTATION_ACCESSED", client_ip)
    cases = await list_cases_db()
    return {"success": True, "count": len(cases), "cases": cases}
