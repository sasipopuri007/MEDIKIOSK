-- ====================================================
-- MediKiosk – AI-Powered Clinical Intake System
-- Comprehensive Database Schema for Supabase PostgreSQL
-- ====================================================

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0),
    gender TEXT NOT NULL,
    phone TEXT NOT NULL,
    blood_group TEXT DEFAULT 'unknown',
    preferred_language TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Unified Cases Table (Single Case ID Flow)
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_age INTEGER,
    patient_gender TEXT,
    patient_phone TEXT,
    blood_group TEXT DEFAULT 'unknown',
    preferred_language TEXT,
    chief_complaint TEXT,
    duration TEXT,
    severity TEXT DEFAULT 'Moderate',
    previous_diseases TEXT,
    medications TEXT,
    allergies TEXT,
    hospital_name TEXT,
    hospital_type TEXT,
    doctor_name TEXT,
    doctor_specialty TEXT,
    appointment_date TEXT,
    appointment_time TEXT,
    consultation_type TEXT DEFAULT 'in_person',
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Medical Reports Table
CREATE TABLE IF NOT EXISTS public.medical_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES public.cases(case_id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_url TEXT,
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Allow public insert and select on patients" 
ON public.patients FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert, select, and update on cases" 
ON public.cases FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access on medical_reports" 
ON public.medical_reports FOR ALL USING (true) WITH CHECK (true);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_cases_case_id ON public.cases(case_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
