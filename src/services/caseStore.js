import { supabase } from './supabase';

const CURRENT_CASE_KEY = 'medikiosk_current_case_id';
const LOCAL_CASES_KEY = 'medikiosk_local_cases_v2';

/**
 * Generate a unique standardized Case ID (e.g. MED-2026-849201)
 */
export function generateCaseId() {
  const year = new Date().getFullYear();
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `MED-${year}-${randNum}`;
}

/**
 * Get or initialize the active patient Case object
 */
export function getCurrentCase() {
  try {
    const caseId = sessionStorage.getItem(CURRENT_CASE_KEY);
    const localCases = JSON.parse(localStorage.getItem(LOCAL_CASES_KEY) || '{}');

    if (caseId && localCases[caseId]) {
      return localCases[caseId];
    }

    // Initialize new case if none active
    const newCaseId = generateCaseId();
    const newCase = {
      caseId: newCaseId,
      createdAt: new Date().toISOString(),
      patient: {
        id: null,
        name: '',
        age: '',
        gender: '',
        phone: '',
        bloodGroup: 'unknown', // Default per requirements
        preferredLanguage: 'English',
        otpVerified: false,
        isOtpDemo: true
      },
      clinicalHistory: {
        chiefComplaint: '',
        duration: '',
        severity: 'Moderate',
        previousDiseases: '',
        medications: '',
        allergies: '',
        voiceTranscript: ''
      },
      medicalReports: [],
      hospital: null,
      doctor: null,
      appointment: {
        date: new Date().toISOString().split('T')[0],
        time: '10:30 AM',
        type: 'in_person',
        status: 'Pending'
      },
      careRecommendation: {
        recommendedSpecialty: 'General Medicine',
        severityLevel: 'Moderate',
        summary: 'Clinical intake in progress'
      }
    };

    sessionStorage.setItem(CURRENT_CASE_KEY, newCaseId);
    localCases[newCaseId] = newCase;
    localStorage.setItem(LOCAL_CASES_KEY, JSON.stringify(localCases));

    return newCase;
  } catch (err) {
    console.error('Error reading current case:', err);
    return null;
  }
}

/**
 * Update active Case data partially and persist locally + Supabase
 */
export function updateCurrentCase(partialCaseData) {
  try {
    const current = getCurrentCase();
    const caseId = current.caseId;

    const updatedCase = {
      ...current,
      ...partialCaseData,
      patient: { ...current.patient, ...(partialCaseData.patient || {}) },
      clinicalHistory: { ...current.clinicalHistory, ...(partialCaseData.clinicalHistory || {}) },
      medicalReports: partialCaseData.medicalReports || current.medicalReports,
      hospital: partialCaseData.hospital || current.hospital,
      doctor: partialCaseData.doctor || current.doctor,
      appointment: { ...current.appointment, ...(partialCaseData.appointment || {}) },
      careRecommendation: { ...current.careRecommendation, ...(partialCaseData.careRecommendation || {}) }
    };

    // Save locally
    sessionStorage.setItem(CURRENT_CASE_KEY, caseId);
    const localCases = JSON.parse(localStorage.getItem(LOCAL_CASES_KEY) || '{}');
    localCases[caseId] = updatedCase;
    localStorage.setItem(LOCAL_CASES_KEY, JSON.stringify(localCases));

    // Async push to Supabase (Fire and forget fallback)
    syncCaseToSupabase(updatedCase);

    return updatedCase;
  } catch (err) {
    console.error('Error updating current case:', err);
    return null;
  }
}

/**
 * Sync Case record to Supabase database
 */
export async function syncCaseToSupabase(caseRecord) {
  if (!supabase) return;

  try {
    const { error } = await supabase.from('cases').upsert([
      {
        case_id: caseRecord.caseId,
        patient_name: caseRecord.patient.name,
        patient_age: Number(caseRecord.patient.age) || 0,
        patient_gender: caseRecord.patient.gender,
        patient_phone: caseRecord.patient.phone,
        blood_group: caseRecord.patient.bloodGroup,
        preferred_language: caseRecord.patient.preferredLanguage,
        chief_complaint: caseRecord.clinicalHistory.chiefComplaint,
        duration: caseRecord.clinicalHistory.duration,
        severity: caseRecord.clinicalHistory.severity,
        previous_diseases: caseRecord.clinicalHistory.previousDiseases,
        medications: caseRecord.clinicalHistory.medications,
        allergies: caseRecord.clinicalHistory.allergies,
        hospital_name: caseRecord.hospital?.name || null,
        hospital_type: caseRecord.hospital?.type || null,
        doctor_name: caseRecord.doctor?.name || null,
        doctor_specialty: caseRecord.doctor?.specialty || null,
        appointment_date: caseRecord.appointment.date,
        appointment_time: caseRecord.appointment.time,
        consultation_type: caseRecord.appointment.type,
        status: caseRecord.appointment.status,
        updated_at: new Date().toISOString()
      }
    ], { onConflict: 'case_id' });

    if (error) {
      console.warn('Supabase case sync notice (Local Fallback Active):', error.message);
    }
  } catch (err) {
    console.warn('Supabase connection notice:', err);
  }
}

/**
 * Retrieve all persisted cases for Doctor Dashboard
 */
export async function getAllPersistedCases() {
  const localCases = JSON.parse(localStorage.getItem(LOCAL_CASES_KEY) || '{}');
  let caseList = Object.values(localCases);

  // If Supabase available, fetch latest DB cases and merge
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cases').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        data.forEach(dbCase => {
          if (!localCases[dbCase.case_id]) {
            caseList.push(mapDbCaseToCaseRecord(dbCase));
          }
        });
      }
    } catch (err) {
      console.warn('Supabase fetch cases notice:', err);
    }
  }

  // Sort by latest created
  caseList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return caseList;
}

/**
 * Update case status in Doctor Dashboard ('Pending' | 'Reviewed' | 'Completed')
 */
export function updateCaseStatus(caseId, newStatus) {
  const localCases = JSON.parse(localStorage.getItem(LOCAL_CASES_KEY) || '{}');
  if (localCases[caseId]) {
    localCases[caseId].appointment.status = newStatus;
    localStorage.setItem(LOCAL_CASES_KEY, JSON.stringify(localCases));
    syncCaseToSupabase(localCases[caseId]);
  }
  return localCases[caseId];
}

function mapDbCaseToCaseRecord(dbRow) {
  return {
    caseId: dbRow.case_id,
    createdAt: dbRow.created_at || new Date().toISOString(),
    patient: {
      name: dbRow.patient_name,
      age: dbRow.patient_age,
      gender: dbRow.patient_gender,
      phone: dbRow.patient_phone,
      bloodGroup: dbRow.blood_group,
      preferredLanguage: dbRow.preferred_language,
      otpVerified: true
    },
    clinicalHistory: {
      chiefComplaint: dbRow.chief_complaint,
      duration: dbRow.duration,
      severity: dbRow.severity,
      previousDiseases: dbRow.previous_diseases,
      medications: dbRow.medications,
      allergies: dbRow.allergies
    },
    medicalReports: [],
    hospital: { name: dbRow.hospital_name, type: dbRow.hospital_type },
    doctor: { name: dbRow.doctor_name, specialty: dbRow.doctor_specialty },
    appointment: {
      date: dbRow.appointment_date,
      time: dbRow.appointment_time,
      type: dbRow.consultation_type,
      status: dbRow.status
    },
    careRecommendation: {
      recommendedSpecialty: dbRow.doctor_specialty || 'General Medicine',
      severityLevel: dbRow.severity,
      summary: dbRow.chief_complaint
    }
  };
}
