import { createClient } from '@supabase/supabase-js';

// Environment variables from Vite configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are properly configured (not empty and not default placeholders)
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your_supabase') && 
  !supabaseAnonKey.includes('your_supabase') &&
  !supabaseAnonKey.includes('PASTE_MY_PUBLISHABLE_KEY_HERE');

// Initialize Supabase Client
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Register a new patient in the Supabase 'patients' table.
 * 
 * @param {Object} patientData - { name, age, gender, phone, preferred_language }
 * @returns {Promise<{ data: Object|null, error: Object|null, isSimulated: boolean }>}
 */
export async function registerPatient(patientData) {
  // If Supabase credentials are not configured, perform a local testing fallback
  if (!isConfigured || !supabase) {
    console.warn(
      'MediKiosk: Supabase credentials not configured in .env. Running in local simulation mode for UI testing.'
    );
    
    // Simulate brief network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const simulatedPatient = {
      id: 'sim-' + crypto.randomUUID(),
      name: patientData.name,
      age: Number(patientData.age),
      gender: patientData.gender,
      phone: patientData.phone,
      preferred_language: patientData.preferred_language,
      created_at: new Date().toISOString()
    };

    return {
      data: simulatedPatient,
      error: null,
      isSimulated: true
    };
  }

  // Real Supabase Insertion (Write-only INSERT compatible with anonymous INSERT RLS without public SELECT access)
  try {
    // Generate UUID client-side so we obtain the patient ID without requiring a public SELECT RLS policy
    const patientId = crypto.randomUUID();

    const { error } = await supabase
      .from('patients')
      .insert([
        {
          id: patientId,
          name: patientData.name,
          age: Number(patientData.age),
          gender: patientData.gender,
          phone: patientData.phone,
          preferred_language: patientData.preferred_language
        }
      ]);

    if (error) {
      console.error('Supabase Database Error:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Database error occurred while saving patient data.'
        },
        isSimulated: false
      };
    }

    const createdRecord = {
      id: patientId,
      name: patientData.name,
      age: Number(patientData.age),
      gender: patientData.gender,
      phone: patientData.phone,
      preferred_language: patientData.preferred_language,
      created_at: new Date().toISOString()
    };

    return {
      data: createdRecord,
      error: null,
      isSimulated: false
    };
  } catch (err) {
    console.error('Network / Supabase Exception:', err);
    return {
      data: null,
      error: {
        message: 'Unable to connect to healthcare database. Please check your network connection and try again.'
      },
      isSimulated: false
    };
  }
}

/**
 * Save clinical history record in the Supabase 'clinical_history' table.
 * 
 * @param {Object} historyData - { patientId, chiefComplaint, duration, previousDiseases, medications, allergies }
 * @returns {Promise<{ data: Object|null, error: Object|null, isSimulated: boolean }>}
 */
export async function saveClinicalHistory(historyData) {
  // If Supabase credentials are not configured, perform local simulation fallback
  if (!isConfigured || !supabase) {
    console.warn(
      'MediKiosk: Supabase credentials not configured in .env. Running clinical history in local simulation mode.'
    );

    await new Promise((resolve) => setTimeout(resolve, 800));

    const simulatedHistory = {
      id: 'history-' + crypto.randomUUID(),
      patient_id: historyData.patientId,
      chief_complaint: historyData.chiefComplaint,
      duration: historyData.duration,
      previous_diseases: historyData.previousDiseases || '',
      medications: historyData.medications || '',
      allergies: historyData.allergies || '',
      created_at: new Date().toISOString()
    };

    return {
      data: simulatedHistory,
      error: null,
      isSimulated: true
    };
  }

  // Real Supabase Write-only Insertion (NO .select() chained to preserve RLS privacy without public SELECT)
  try {
    const historyId = crypto.randomUUID();

    const { error } = await supabase
      .from('clinical_history')
      .insert([
        {
          id: historyId,
          patient_id: historyData.patientId,
          chief_complaint: historyData.chiefComplaint,
          duration: historyData.duration,
          previous_diseases: historyData.previousDiseases || null,
          medications: historyData.medications || null,
          allergies: historyData.allergies || null
        }
      ]);

    if (error) {
      console.error('Supabase Clinical History Insertion Error:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Database error occurred while saving clinical history.'
        },
        isSimulated: false
      };
    }

    const createdRecord = {
      id: historyId,
      patient_id: historyData.patientId,
      chief_complaint: historyData.chiefComplaint,
      duration: historyData.duration,
      previous_diseases: historyData.previousDiseases,
      medications: historyData.medications,
      allergies: historyData.allergies,
      created_at: new Date().toISOString()
    };

    return {
      data: createdRecord,
      error: null,
      isSimulated: false
    };
  } catch (err) {
    console.error('Network / Supabase Exception in saveClinicalHistory:', err);
    return {
      data: null,
      error: {
        message: 'Unable to connect to healthcare database. Please check your network connection and try again.'
      },
      isSimulated: false
    };
  }
}
