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
  Droplet
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentCase, updateCurrentCase } from '../services/caseStore';
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
      // Save Patient Details & update Single Case ID object directly
      const updated = updateCurrentCase({
        patient: {
          name: formData.name.trim(),
          age: formData.age,
          gender: formData.gender,
          phone: formData.phone.trim(),
          bloodGroup: formData.bloodGroup,
          preferredLanguage: currentLanguageObj.name,
          otpVerified: true,
          isOtpDemo: false
        }
      });

      setCurrentCase(updated);
      setIsSubmitting(false);

      // Proceed directly to Step 2: Clinical History
      navigate('/clinical-history');
    } catch (err) {
      setSubmitError('Unable to save registration details. Please try again.');
      setIsSubmitting(false);
    }
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
          Please enter basic demographic details to create a new clinical intake session.
        </p>
      </div>

      {submitError && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="registration-form-card" noValidate>
        <div className="form-grid-2">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label required">
              <User size={18} className="label-icon" />
              <span>{t('fullName')}</span>
            </label>
            <div className="input-wrapper">
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                required
              />
            </div>
            {errors.name && <span className="field-error-text">{errors.name}</span>}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label required">
              <Phone size={18} className="label-icon" />
              <span>{t('phone')}</span>
            </label>
            <div className="input-wrapper">
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                required
              />
            </div>
            {errors.phone && <span className="field-error-text">{errors.phone}</span>}
          </div>

          {/* Age */}
          <div className="form-group">
            <label htmlFor="age" className="form-label required">
              <Calendar size={18} className="label-icon" />
              <span>{t('age')}</span>
            </label>
            <div className="input-wrapper">
              <input
                id="age"
                name="age"
                type="number"
                min="1"
                max="125"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 45"
                className={`form-input ${errors.age ? 'input-error' : ''}`}
                required
              />
            </div>
            {errors.age && <span className="field-error-text">{errors.age}</span>}
          </div>

          {/* Gender */}
          <div className="form-group">
            <label htmlFor="gender" className="form-label required">
              <User size={18} className="label-icon" />
              <span>{t('gender')}</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`form-select ${errors.gender ? 'input-error' : ''}`}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">{t('male')}</option>
              <option value="Female">{t('female')}</option>
              <option value="Other">{t('other')}</option>
              <option value="Prefer not to say">{t('preferNotToSay')}</option>
            </select>
            {errors.gender && <span className="field-error-text">{errors.gender}</span>}
          </div>

          {/* Blood Group */}
          <div className="form-group">
            <label htmlFor="bloodGroup" className="form-label">
              <Droplet size={18} className="label-icon" />
              <span>{t('bloodGroup')}</span>
            </label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="form-select"
            >
              <option value="unknown">{t('unknown')}</option>
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

          {/* Preferred Language */}
          <div className="form-group">
            <label htmlFor="language" className="form-label">
              <Globe size={18} className="label-icon" />
              <span>{t('preferredLanguage')}</span>
            </label>
            <div className="input-wrapper">
              <select
                id="language"
                value={formData.preferredLanguageCode}
                onChange={handleLanguageChange}
                className="form-select"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button - Direct Proceed without OTP */}
        <div className="form-actions" style={{ marginTop: '2rem' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-large btn-submit"
          >
            {isSubmitting ? (
              <LoadingSpinner message="Saving Intake Session..." size="small" />
            ) : (
              <>
                <CheckCircle2 size={20} />
                <span>Proceed to Clinical History</span>
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
