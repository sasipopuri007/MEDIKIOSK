-- ====================================================
-- MediKiosk – AI-Powered Clinical Intake System
-- Module 2: Clinical History Database Schema
-- ====================================================

-- 1. Create Clinical History Table
CREATE TABLE IF NOT EXISTS public.clinical_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    chief_complaint TEXT NOT NULL,
    duration TEXT NOT NULL,
    previous_diseases TEXT,
    medications TEXT,
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.clinical_history ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies for Academic Prototype
-- Policy 1: Allow public/anonymous clinical history record insertion ONLY
CREATE POLICY "Allow public insert on clinical_history"
ON public.clinical_history
FOR INSERT
TO anon
WITH CHECK (true);

-- NOTE: Public SELECT, UPDATE, and DELETE policies are deliberately omitted
-- to protect patient data privacy.

-- 4. Schema Documentation Comments
COMMENT ON TABLE public.clinical_history IS 'Stores clinical history, symptoms, previous conditions, medications, and allergies for patients.';
COMMENT ON COLUMN public.clinical_history.id IS 'Unique primary key UUID for clinical history entry.';
COMMENT ON COLUMN public.clinical_history.patient_id IS 'Foreign key referencing patients table id.';
COMMENT ON COLUMN public.clinical_history.chief_complaint IS 'Patient main health problem / symptom description.';
COMMENT ON COLUMN public.clinical_history.duration IS 'Symptom duration (e.g. 3 days, 2 weeks).';
COMMENT ON COLUMN public.clinical_history.previous_diseases IS 'Previous medical history and existing conditions.';
COMMENT ON COLUMN public.clinical_history.medications IS 'Current medications list.';
COMMENT ON COLUMN public.clinical_history.allergies IS 'Known drug, food, or environmental allergies.';
COMMENT ON COLUMN public.clinical_history.created_at IS 'UTC Timestamp when record was created.';
