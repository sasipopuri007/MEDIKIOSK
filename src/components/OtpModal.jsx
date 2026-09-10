import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Info, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { verifyOtp } from '../services/apiService';

export default function OtpModal({ phone, isOpen, onClose, onVerified }) {
  const { t } = useLanguage();
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the complete verification code sent to your phone.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtp(phone, otpCode.trim());
      if (res.success) {
        onVerified(false);
      } else {
        setError(res.message || 'Invalid OTP code. Please check the SMS code sent to your phone.');
      }
    } catch (err) {
      setError('Verification connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskedPhone = phone && phone.length >= 10 
    ? `${phone.slice(0, 3)} ${phone.slice(3, 5)}*** ***${phone.slice(-2)}`
    : phone;

  return (
    <div className="otp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="otp-modal-card">
        <div className="otp-header">
          <div className="otp-icon-wrapper">
            <Lock size={28} className="otp-icon" />
          </div>
          <h3>{t('otpVerification')}</h3>
          <p>OTP sent to your phone: <strong>{maskedPhone}</strong></p>
        </div>

        <div className="otp-notice-banner real-notice" style={{ marginBottom: '1rem' }}>
          <Info size={18} />
          <span>Verification code sent via SMS to your phone.</span>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <input
              type="text"
              maxLength="10"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter OTP Code"
              className="otp-input-field"
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              {t('back')}
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 2 }}>
              {isSubmitting ? t('loading') : t('verifyOtp')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
