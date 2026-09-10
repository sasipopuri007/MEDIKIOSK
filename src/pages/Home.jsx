import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, 
  FileHeart, 
  UploadCloud, 
  UserRoundCheck, 
  ArrowRight, 
  ShieldAlert, 
  Activity, 
  Globe2, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>{t('heroTitle')}</span>
          </div>

          <h1 className="hero-title">
            <span className="title-primary">{t('appTitle')}</span>
            <span className="title-subtitle">{t('appTagline')}</span>
          </h1>

          <p className="hero-description">
            {t('heroDesc')}
          </p>

          <div className="hero-actions">
            <button 
              className="btn btn-primary btn-large hero-cta"
              onClick={() => navigate('/register')}
            >
              <span>{t('startIntake')}</span>
              <ArrowRight size={22} />
            </button>

            <button 
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/doctor-dashboard')}
            >
              <UserRoundCheck size={22} />
              <span>{t('openDoctorDashboard')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4-Step Intake Workflow */}
      <section className="workflow-section">
        <div className="section-header text-center">
          <h2 className="section-title">Seamless Patient Clinical Intake</h2>
          <p className="section-subtitle">
            Designed for high accessibility, multi-lingual voice recording, and real-time doctor connection.
          </p>
        </div>

        <div className="workflow-grid">
          {/* Step 1 */}
          <div className="workflow-card active-card" onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>
            <div className="workflow-step-num">Step 1</div>
            <div className="workflow-icon-wrapper">
              <UserCheck size={32} />
            </div>
            <h3 className="workflow-card-title">{t('patientRegistration')}</h3>
            <p className="workflow-card-desc">
              Personal details, phone verification (OTP), blood group, and language selection.
            </p>
            <span className="workflow-status-badge active">Start Now →</span>
          </div>

          {/* Step 2 */}
          <div className="workflow-card" onClick={() => navigate('/clinical-history')} style={{ cursor: 'pointer' }}>
            <div className="workflow-step-num">Step 2</div>
            <div className="workflow-icon-wrapper">
              <FileHeart size={32} />
            </div>
            <h3 className="workflow-card-title">{t('clinicalHistory')}</h3>
            <p className="workflow-card-desc">
              Voice-enabled symptom recording in 11 Indian languages & document upload.
            </p>
            <span className="workflow-status-badge active">Voice & Reports</span>
          </div>

          {/* Step 3 */}
          <div className="workflow-card" onClick={() => navigate('/hospitals')} style={{ cursor: 'pointer' }}>
            <div className="workflow-step-num">Step 3</div>
            <div className="workflow-icon-wrapper">
              <MapPin size={32} />
            </div>
            <h3 className="workflow-card-title">{t('hospitals')}</h3>
            <p className="workflow-card-desc">
              Find nearby Govt/Private hospitals using Geolocation, Google Places & Haversine distance.
            </p>
            <span className="workflow-status-badge active">Nearby Finder</span>
          </div>

          {/* Step 4 */}
          <div className="workflow-card" onClick={() => navigate('/doctor-dashboard')} style={{ cursor: 'pointer' }}>
            <div className="workflow-step-num">Step 4</div>
            <div className="workflow-icon-wrapper">
              <UserRoundCheck size={32} />
            </div>
            <h3 className="workflow-card-title">{t('doctorDashboard')}</h3>
            <p className="workflow-card-desc">
              Single Case ID unifies patient details, reports, appointments & doctor workstation review.
            </p>
            <span className="workflow-status-badge active">Doctor View</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon"><Globe2 size={24} /></div>
            <h4>11 Indian Languages</h4>
            <p>Full application translation & language-aware TTS/STT across English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi & Odia.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Activity size={24} /></div>
            <h4>Single Case ID Continuity</h4>
            <p>Generates a unified Case ID linking Patient → Clinical History → Reports → Hospital → Doctor → Final Report.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Sparkles size={24} /></div>
            <h4>Smart Doctor Workstation</h4>
            <p>Real-time patient triage, emergency red flags, case details modal, and consultation approval.</p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="disclaimer-section">
        <div className="disclaimer-banner">
          <div className="disclaimer-icon-wrapper">
            <ShieldAlert size={28} />
          </div>
          <div className="disclaimer-content">
            <h4 className="disclaimer-heading">Important Clinical Prototype Notice</h4>
            <p className="disclaimer-text">
              MediKiosk is a clinical decision-support and intake demonstration platform. If you are experiencing a medical emergency, please call local emergency services or visit the nearest hospital emergency room immediately.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
