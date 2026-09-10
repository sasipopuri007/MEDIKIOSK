from fastapi import APIRouter, Request, HTTPException, status
from typing import Dict, Any
from app.security.auth import validate_case_id
from app.security.audit import AuditLogger

router = APIRouter(prefix="/api/reports", tags=["Medical Reports"])

@router.post("", summary="Upload & Record Medical Document Metadata")
async def upload_report(data: Dict[str, Any], request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    case_id = data.get("caseId")
    if not case_id:
        raise HTTPException(status_code=400, detail="Missing Case ID")

    valid_id = validate_case_id(case_id)
    file_name = data.get("name", "Document")

    AuditLogger.log_event("MEDICAL_REPORT_UPLOADED", client_ip, user_id=valid_id, details={"file_name": file_name})

    return {
        "success": True,
        "caseId": valid_id,
        "report": {
            "name": file_name,
            "size": data.get("size", "100 KB"),
            "status": "Processed"
        }
    }
