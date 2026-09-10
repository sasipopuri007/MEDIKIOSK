import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Globe, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Droplet,
  Lock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentCase, updateCurrentCase } from '../services/caseStore';
import { sendOtp } from '../services/apiService';
import OtpModal from '../components/OtpModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PatientRegistration() {
  const navigate = useNavigate();
  const { language, setLanguage, t, LANGUAGES, currentLanguageObj } = useLanguage();

  // Load existing current case context if available
  const [currentCase, setCurrentCase] = useState(() => getCurrentCase());

  // Form State
  const [formData, setFormData] = useState({
    name: currentCase?.patient?.name || '',
    age: currentCase?.patient?.age || '',
    gender: currentCase?.patient?.gender || '',
    phone: currentCase?.patient?.phone || '',
    bloodGroup: currentCase?.patient?.bloodGroup || 'unknown',
    preferredLanguageCode: language
  });

  // UI & Validation State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // OTP Modal State
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isOtpDemoMode, setIsOtpDemoMode] = useState(true);

  useEffect(() => {
    // Keep language in sync with context
    setFormData(prev => ({ ...prev, preferredLanguageCode: language }));
  }, [language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (submitError) setSubmitError(null);
  };

  const handleLanguageChange = (e) => {
    const selectedCode = e.target.value;
    setLanguage(selectedCode);
    setFormData(prev => ({ ...prev, preferredLanguageCode: selectedCode }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Please enter patient full name.';
    }

    const ageNum = Number(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum <= 0 || ageNum > 125) {
      newErrors.age = 'Please enter a valid age.';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select gender.';
    }

    const phoneRegex = /^[\d\s()+-]{7,15}$/;
    if (!formData.phone || !formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Trigger OTP sending API / Demo check
      const otpRes = await sendOtp(formData.phone.trim());
      if (!otpRes.success) {
        setSubmitError(otpRes.message || 'Unable to send OTP.');
        setIsSubmitting(false);
        return;
      }
      setIsOtpDemoMode(otpRes.isDemo);
      setIsSubmitting(false);
      setIsOtpOpen(true); // Open OTP verification modal
    } catch (err) {
      setSubmitError('Unable to send OTP. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleOtpVerified = (wasDemoMode) => {
    setIsOtpOpen(false);

    // Save Patient Details & update Single Case ID object
    const updated = updateCurrentCase({
      patient: {
        name: formData.name.trim(),
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone.trim(),
        bloodGroup: formData.bloodGroup,
        preferredLanguage: currentLanguageObj.name,
        otpVerified: true,
        isOtpDemo: wasDemoMode
      }
    });

    setCurrentCase(updated);

    // Proceed to Step 2: Clinical History
    navigate('/clinical-history');
  };

  return (
    <div className="registration-container">
      {/* Header & Case ID Bar */}
      <div className="registration-header-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="step-indicator-badge">
            <span>Step 1 of 4: {t('patientRegistration')}</span>
          </div>
          <div style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', padding: '0.35rem 0.85rem', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              Case ID: <strong>{currentCase.caseId}</strong>
            </span>
          </div>
        </div>

        <h1 className="registration-title" style={{ marginTop: '0.75rem' }}>{t('patientRegistration')}</h1>
        <p className="registration-subtitle">
          Enter patient personal details, select language, and complete mobile verification.
        </p>

        {/* Stepper */}
        <div className="stepper-timeline">
          <div className="stepper-item active" aria-current="step">
            <div className="stepper-circle">1</div>
            <span className="stepper-label">1. Registration</span>
          </div>
          <div className="stepper-item disabled">
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
        {submitError && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={20} />
            <span>{submitError}</span>
          </div>
        )}

        <div className="form-grid">
          {/* 1. Full Name */}
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="field-name" className="form-label">
              {t('fullName')} <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                id="field-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                className="form-input"
                required
              />
            </div>
            {errors.name && <div className="error-message"><span>{errors.name}</span></div>}
          </div>

          {/* 2. Age */}
          <div className={`form-group ${errors.age ? 'has-error' : ''}`}>
            <label htmlFor="field-age" className="form-label">
              {t('age')} <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <Calendar className="input-icon" size={20} />
              <input
                id="field-age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 45"
                min="1"
                max="125"
                className="form-input"
                required
              />
            </div>
            {errors.age && <div className="error-message"><span>{errors.age}</span></div>}
          </div>

          {/* 3. Gender */}
          <div className={`form-group ${errors.gender ? 'has-error' : ''}`}>
            <label htmlFor="field-gender" className="form-label">
              {t('gender')} <span className="required-star">*</span>
            </label>
            <select
              id="field-gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">{t('male')}</option>
              <option value="Female">{t('female')}</option>
              <option value="Other">{t('other')}</option>
              <option value="Prefer not to say">{t('preferNotToSay')}</option>
            </select>
            {errors.gender && <div className="error-message"><span>{errors.gender}</span></div>}
          </div>

          {/* 4. Phone Number */}
          <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
            <label htmlFor="field-phone" className="form-label">
              {t('phone')} <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={20} />
              <input
                id="field-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="form-input"
                required
              />
            </div>
            {errors.phone && <div className="error-message"><span>{errors.phone}</span></div>}
          </div>

          {/* 5. Blood Group (Support Unknown & Prefer not to say) */}
          <div className="form-group">
            <label htmlFor="field-bloodGroup" className="form-label">
              {t('bloodGroup')}
            </label>
            <div className="input-wrapper">
              <Droplet className="input-icon" size={20} />
              <select
                id="field-bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="form-select"
              >
                <option value="unknown">{t('unknown')}</option>
                <option value="prefer_not_to_say">{t('preferNotToSay')}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* 6. Preferred Language Selection (11 Indian Languages) */}
          <div className="form-group">
            <label htmlFor="field-language" className="form-label">
              {t('preferredLanguage')} (11 Indian Languages)
            </label>
            <div className="input-wrapper">
              <Globe className="input-icon" size={20} />
              <select
                id="field-language"
                value={formData.preferredLanguageCode}
                onChange={handleLanguageChange}
                className="form-select"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions" style={{ marginTop: '2rem' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-large btn-submit"
          >
            {isSubmitting ? (
              <LoadingSpinner message="Sending Verification..." size="small" />
            ) : (
              <>
                <Lock size={20} />
                <span>Verify OTP & Continue</span>
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* OTP Verification Modal */}
      <OtpModal
        phone={formData.phone}
        isOpen={isOtpOpen}
        isDemo={isOtpDemoMode}
        onClose={() => setIsOtpOpen(false)}
        onVerified={handleOtpVerified}
      />
    </div>
  );
}
