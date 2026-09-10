from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PatientInfo(BaseModel):
    name: str = Field(..., min_length=2)
    age: int = Field(..., gt=0, lt=130)
    gender: str
    phone: str
    bloodGroup: str = "unknown"
    preferredLanguage: str = "English"

class ClinicalHistoryInfo(BaseModel):
    chiefComplaint: str = Field(..., min_length=2)
    duration: str
    severity: str = "Moderate"
    previousDiseases: Optional[str] = ""
    medications: Optional[str] = ""
    allergies: Optional[str] = ""
    voiceTranscript: Optional[str] = ""

class CaseModel(BaseModel):
    caseId: str = Field(..., description="Unique Case ID format e.g. MED-2026-849201")
    patient: PatientInfo
    clinicalHistory: ClinicalHistoryInfo
    medicalReports: List[Dict[str, Any]] = []
    hospital: Optional[Dict[str, Any]] = None
    doctor: Optional[Dict[str, Any]] = None
    appointment: Optional[Dict[str, Any]] = None
    createdAt: Optional[str] = None
