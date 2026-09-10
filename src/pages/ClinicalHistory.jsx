import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Mic, 
  MicOff, 
  Clock, 
  Activity, 
  Pill, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud,
  ArrowRight,
  Info,
  Check,
  Globe,
  File
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentCase, updateCurrentCase } from '../services/caseStore';
import { createSpeechRecognizer } from '../utils/voice';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ClinicalHistory() {
  const navigate = useNavigate();
  const { language, t, currentLanguageObj } = useLanguage();

  const [currentCase, setCurrentCase] = useState(() => getCurrentCase());

  // Form State
  const [formData, setFormData] = useState({
    chiefComplaint: currentCase?.clinicalHistory?.chiefComplaint || '',
    duration: currentCase?.clinicalHistory?.duration || '',
    severity: currentCase?.clinicalHistory?.severity || 'Moderate',
    previousDiseases: currentCase?.clinicalHistory?.previousDiseases || '',
    medications: currentCase?.clinicalHistory?.medications || '',
    allergies: currentCase?.clinicalHistory?.allergies || ''
  });

  // Uploaded Files State
  const [reports, setReports] = useState(currentCase?.medicalReports || []);

  // Speech STT State
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState(null);
  const recognizerRef = useRef(null);

  // Form Validation
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch(e) {}
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleNoKnownAllergies = () => {
    setFormData((prev) => ({ ...prev, allergies: t('noKnownAllergies') }));
  };

  // Toggle Language-Aware Speech Recognition
  const toggleVoiceRecording = () => {
    if (isListening && recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch(e) {}
      setIsListening(false);
      return;
    }

    setSpeechNotice(null);

    const recognizer = createSpeechRecognizer(
      language,
      (transcript) => {
        setFormData(prev => ({
          ...prev,
          chiefComplaint: prev.chiefComplaint ? `${prev.chiefComplaint} ${transcript}` : transcript
        }));
        if (errors.chiefComplaint) {
          setErrors(prev => ({ ...prev, chiefComplaint: null }));
        }
      },
      (errorMsg) => {
        setIsListening(false);
        setSpeechNotice(`Voice STT Notice: ${errorMsg}`);
      },
      () => setIsListening(false)
    );

    if (recognizer) {
      try {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
        setSpeechNotice(`Listening in ${currentLanguageObj.native} (${currentLanguageObj.bcp47})... Speak clearly.`);
      } catch (err) {
        setIsListening(false);
        setSpeechNotice('Microphone access unavailable. Please type your answer.');
      }
    }
  };

  // Document Upload File Handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newReports = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type || 'Document',
      date: new Date().toLocaleDateString()
    }));

    const updatedList = [...reports, ...newReports];
    setReports(updatedList);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.chiefComplaint || !formData.chiefComplaint.trim()) {
      newErrors.chiefComplaint = 'Please describe main symptoms / chief complaint.';
    }
    if (!formData.duration || !formData.duration.trim()) {
      newErrors.duration = 'Please specify symptom duration.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Save Clinical History & Reports to Case ID
    updateCurrentCase({
      clinicalHistory: {
        chiefComplaint: formData.chiefComplaint.trim(),
        duration: formData.duration.trim(),
        severity: formData.severity,
        previousDiseases: formData.previousDiseases.trim(),
        medications: formData.medications.trim(),
        allergies: formData.allergies.trim()
      },
      medicalReports: reports,
      careRecommendation: {
        recommendedSpecialty: getRecommendedSpecialty(formData.chiefComplaint),
        severityLevel: formData.severity,
        summary: formData.chiefComplaint.trim()
      }
    });

    setIsSubmitting(false);

    // Navigate to Step 3: Nearby Hospital Selection
    navigate('/hospitals');
  };

  function getRecommendedSpecialty(symptomsText) {
    const text = symptomsText.toLowerCase();
    if (text.includes('chest') || text.includes('heart') || text.includes('palpitation')) return 'Cardiology';
    if (text.includes('breath') || text.includes('cough') || text.includes('asthma') || text.includes('lung')) return 'Pulmonology';
    if (text.includes('bone') || text.includes('fracture') || text.includes('joint') || text.includes('knee')) return 'Orthopedics';
    if (text.includes('skin') || text.includes('rash') || text.includes('itch')) return 'Dermatology';
    if (text.includes('stomach') || text.includes('acid') || text.includes('vomit') || text.includes('diarrhea')) return 'Gastroenterology';
    if (text.includes('child') || text.includes('baby') || text.includes('infant')) return 'Pediatrics';
    return 'General Medicine';
  }

  return (
    <div className="registration-container">
      {/* Header */}
      <div className="registration-header-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="step-indicator-badge">
            <span>Step 2 of 4: {t('clinicalHistory')}</span>
          </div>
          <div style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', padding: '0.35rem 0.85rem', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              Case ID: <strong>{currentCase?.caseId || 'MED-2026-000000'}</strong> | Patient: <strong>{currentCase?.patient?.name || 'Registered Patient'}</strong>
            </span>
          </div>
        </div>

        <h1 className="registration-title" style={{ marginTop: '0.75rem' }}>{t('clinicalHistory')}</h1>
        <p className="registration-subtitle">
          Record patient symptoms using text or voice in <strong>{currentLanguageObj.native}</strong>, add medical history, and upload documents.
        </p>

        {/* Stepper */}
        <div className="stepper-timeline">
          <Link to="/register" className="stepper-item completed-link">
            <div className="stepper-circle completed-circle"><Check size={18} /></div>
            <span className="stepper-label">1. Registration</span>
          </Link>
          <div className="stepper-item active" aria-current="step">
            <div className="stepper-circle">2</div>
            <span className="stepper-label">2. History</span>
          </div>
          <div className="stepper-item disabled">
            <div className="stepper-circle">3</div>
            <span className="stepper-label">3. Hospitals</span>
          </div>
          <div className="stepper-item disabled">
            <div className="stepper-circle">4</div>
            <span className="stepper-label">4. Report</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="registration-form" noValidate>
        {speechNotice && (
          <div className="voice-notice-banner info" style={{ marginBottom: '1.5rem' }}>
            <Info size={20} />
            <span>{speechNotice}</span>
          </div>
        )}

        <div className="form-grid single-col-grid">
          {/* Chief Complaint + Voice STT */}
          <div className={`form-group ${errors.chiefComplaint ? 'has-error' : ''}`}>
            <div className="label-with-action">
              <label htmlFor="field-chief" className="form-label">
                {t('chiefComplaint')} <span className="required-star">*</span>
              </label>
              <button
                type="button"
                className={`btn-voice ${isListening ? 'listening' : ''}`}
                onClick={toggleVoiceRecording}
              >
                <Mic size={18} />
                <span>{isListening ? t('listening') : `${t('voiceInput')} (${currentLanguageObj.native})`}</span>
              </button>
            </div>

            <textarea
              id="field-chief"
              name="chiefComplaint"
              rows="3"
              value={formData.chiefComplaint}
              onChange={handleChange}
              placeholder="e.g. Severe chest tightness and shortness of breath..."
              className="form-textarea"
              required
            />
            {errors.chiefComplaint && <div className="error-message"><span>{errors.chiefComplaint}</span></div>}
          </div>

          {/* Duration & Severity */}
          <div className="form-grid-2">
            <div className={`form-group ${errors.duration ? 'has-error' : ''}`}>
              <label htmlFor="field-duration" className="form-label">
                {t('duration')} <span className="required-star">*</span>
              </label>
              <div className="input-wrapper">
                <Clock className="input-icon" size={20} />
                <input
                  id="field-duration"
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. For 2 days / 3 weeks"
                  className="form-input"
                  required
                />
              </div>
              {errors.duration && <div className="error-message"><span>{errors.duration}</span></div>}
            </div>

            <div className="form-group">
              <label htmlFor="field-severity" className="form-label">
                {t('severity')}
              </label>
              <select
                id="field-severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Mild">{t('mild')}</option>
                <option value="Moderate">{t('moderate')}</option>
                <option value="Severe">{t('severe')}</option>
              </select>
            </div>
          </div>

          {/* Medical History & Current Medicines */}
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="field-prev" className="form-label">{t('previousConditions')}</label>
              <textarea
                id="field-prev"
                name="previousDiseases"
                rows="2"
                value={formData.previousDiseases}
                onChange={handleChange}
                placeholder="e.g. Type 2 Diabetes, Hypertension..."
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="field-meds" className="form-label">{t('currentMedicines')}</label>
              <textarea
                id="field-meds"
                name="medications"
                rows="2"
                value={formData.medications}
                onChange={handleChange}
                placeholder="e.g. Metformin 500mg, Amlodipine 5mg..."
                className="form-textarea"
              />
            </div>
          </div>

          {/* Allergies */}
          <div className="form-group">
            <div className="label-with-action">
              <label htmlFor="field-allergies" className="form-label">{t('allergies')}</label>
              <button type="button" className="btn-quick-tag" onClick={handleNoKnownAllergies}>
                + {t('noKnownAllergies')}
              </button>
            </div>
            <input
              id="field-allergies"
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g. Penicillin, dust, peanuts..."
              className="form-input"
            />
          </div>

          {/* Document Upload Attachment Section */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">{t('uploadReport')}</label>
            <div className="upload-dropzone-box" style={{ border: '2px dashed var(--border-color)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <UploadCloud size={36} style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }} />
              <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{t('dropzoneText')}</p>
              <input type="file" multiple onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'inline-block' }} />
            </div>

            {/* List Attached Reports */}
            {reports.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>Attached Documents ({reports.length}):</strong>
                <ul style={{ marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
                  {reports.map((rep, idx) => (
                    <li key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <File size={16} />
                      <span>{rep.name}</span>
                      <small style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{rep.size}</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="form-actions" style={{ marginTop: '2rem' }}>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-large btn-submit">
            {isSubmitting ? <LoadingSpinner message="Saving Case..." size="small" /> : (
              <>
                <span>{t('findHospitalsNearMe')}</span>
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
