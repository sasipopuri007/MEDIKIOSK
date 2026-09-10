import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Phone, 
  Navigation, 
  Building2, 
  Star, 
  CheckCircle2, 
  AlertTriangle,
  AlertCircle, 
  Info,
  ArrowRight,
  UserCheck,
  PhoneCall,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentCase, updateCurrentCase } from '../services/caseStore';
import { searchNearbyHospitals } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HospitalDiscovery() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [currentCase, setCurrentCase] = useState(() => getCurrentCase());

  // Geolocation & Search State
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null, statusMsg: '', errorMsg: '' });
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [radiusKm, setRadiusKm] = useState('10000'); // 10 km default

  // Hospital List State
  const [hospitals, setHospitals] = useState([]);
  const [isRealData, setIsRealData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Call Confirmation Modal State
  const [callHospitalTarget, setCallHospitalTarget] = useState(null);

  useEffect(() => {
    // Initial fetch using default location (e.g. Hyderabad / Guntur)
    loadHospitals(17.3850, 78.4867, searchQuery, categoryFilter, Number(radiusKm));
  }, []);

  const loadHospitals = async (lat, lng, query, category, radius) => {
    setIsLoading(true);
    try {
      const result = await searchNearbyHospitals(lat, lng, query, category, radius || 10000);
      setHospitals(result.data || []);
      setIsRealData(result.isRealData);
    } catch (err) {
      console.error('Error loading hospitals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Browser Geolocation Trigger
  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      setUserLocation({ 
        lat: null, 
        lng: null, 
        statusMsg: '', 
        errorMsg: t('locationPermissionRequired') 
      });
      return;
    }

    setIsLocating(true);
    setUserLocation({ lat: null, lng: null, statusMsg: t('searchingLocation'), errorMsg: '' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ 
          lat, 
          lng, 
          statusMsg: `Location acquired (${lat.toFixed(4)}, ${lng.toFixed(4)})`, 
          errorMsg: '' 
        });
        setIsLocating(false);
        loadHospitals(lat, lng, searchQuery, categoryFilter, Number(radiusKm));
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setUserLocation({ 
          lat: null, 
          lng: null, 
          statusMsg: '', 
          errorMsg: t('locationPermissionRequired') 
        });
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const resolveCityCoordinates = (q) => {
    const qLower = q.toLowerCase().trim();
    if (qLower.includes('guntur')) return { lat: 16.3067, lng: 80.4365, city: 'Guntur' };
    if (qLower.includes('vijayawada')) return { lat: 16.5062, lng: 80.6480, city: 'Vijayawada' };
    if (qLower.includes('vizag') || qLower.includes('visakhapatnam')) return { lat: 17.6868, lng: 83.2185, city: 'Visakhapatnam' };
    if (qLower.includes('bengaluru') || qLower.includes('bangalore')) return { lat: 12.9716, lng: 77.5946, city: 'Bengaluru' };
    if (qLower.includes('chennai')) return { lat: 13.0827, lng: 80.2707, city: 'Chennai' };
    if (qLower.includes('mumbai')) return { lat: 19.0760, lng: 72.8777, city: 'Mumbai' };
    if (qLower.includes('delhi')) return { lat: 28.6139, lng: 77.2090, city: 'Delhi' };
    if (qLower.includes('hyderabad')) return { lat: 17.3850, lng: 78.4867, city: 'Hyderabad' };
    if (qLower.includes('tirupati')) return { lat: 13.6288, lng: 79.4192, city: 'Tirupati' };
    if (qLower.includes('rajahmundry')) return { lat: 17.0005, lng: 81.8040, city: 'Rajahmundry' };
    if (qLower.includes('kakinada')) return { lat: 16.9891, lng: 82.2475, city: 'Kakinada' };
    if (qLower.includes('nellore')) return { lat: 14.4426, lng: 79.9865, city: 'Nellore' };
    if (qLower.includes('kurnool')) return { lat: 15.8281, lng: 78.0373, city: 'Kurnool' };
    return null;
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const cityCoords = resolveCityCoordinates(searchQuery);
    let searchLat = userLocation.lat || (cityCoords ? cityCoords.lat : 17.3850);
    let searchLng = userLocation.lng || (cityCoords ? cityCoords.lng : 78.4867);

    if (cityCoords) {
      setUserLocation(prev => ({
        ...prev,
        lat: cityCoords.lat,
        lng: cityCoords.lng,
        statusMsg: `Centered on ${cityCoords.city} (${cityCoords.lat}, ${cityCoords.lng})`,
        errorMsg: ''
      }));
    }

    loadHospitals(searchLat, searchLng, searchQuery, categoryFilter, Number(radiusKm));
  };

  const handleInitiateCall = (hosp) => {
    if (!hosp.phone) return;
    setCallHospitalTarget(hosp);
  };

  const handleConfirmCall = () => {
    if (callHospitalTarget && callHospitalTarget.phone) {
      window.location.href = `tel:${callHospitalTarget.phone.replace(/\s+/g, '')}`;
    }
    setCallHospitalTarget(null);
  };

  const handleSelectHospital = (hosp, doc) => {
    updateCurrentCase({
      hospital: {
        name: hosp.name,
        category: hosp.category,
        type: hosp.type,
        address: hosp.address,
        phone: hosp.phone,
        lat: hosp.lat,
        lng: hosp.lng,
        distance: hosp.distance,
        isDemo: hosp.isDemo
      },
      doctor: doc ? {
        name: doc.name,
        specialty: doc.specialty,
        exp: doc.exp
      } : {
        name: `Dr. ${hosp.name.split(' ')[0]} Consulting Physician`,
        specialty: currentCase?.careRecommendation?.recommendedSpecialty || 'General Medicine'
      }
    });

    navigate('/final-report');
  };

  return (
    <div className="registration-container">
      {/* Emergency Disclaimer Header Banner */}
      <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.85rem 1.25rem' }}>
        <AlertTriangle size={22} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {t('emergencyDisclaimer')}
        </span>
      </div>

      {/* Main Card Header */}
      <div className="registration-header-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="step-indicator-badge">
            <span>Step 3 of 4: {t('hospitals')}</span>
          </div>
          <div style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', padding: '0.35rem 0.85rem', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              Case ID: <strong>{currentCase.caseId}</strong>
            </span>
          </div>
        </div>

        <h1 className="registration-title" style={{ marginTop: '0.75rem' }}>{t('findHospitalsNearMe')}</h1>
        <p className="registration-subtitle">
          Discover nearby Government, CHC, PHC, District, and Private Hospitals sorted by distance using Geolocation & Haversine formula.
        </p>

        {/* Location Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleFindNearMe}
            disabled={isLocating}
          >
            <Navigation size={18} />
            <span>{isLocating ? t('searchingLocation') : t('findHospitalsNearMe')}</span>
          </button>

          {/* Real vs Demo Data Badge */}
          <span className={`badge ${isRealData ? 'badge-green' : 'badge-red'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            {isRealData ? t('realGooglePlacesBadge') : t('demoHospitalBadge')}
          </span>
        </div>

        {/* Location Messages */}
        {userLocation.statusMsg && (
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginTop: '0.75rem' }}>
            ℹ️ {userLocation.statusMsg}
          </div>
        )}

        {userLocation.errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '0.75rem', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '0.85rem' }}>{userLocation.errorMsg}</span>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => {
                const searchElem = document.getElementById('city-search-input');
                if (searchElem) searchElem.focus();
              }}
            >
              <Search size={14} />
              <span>{t('searchHospitalsByLocation')}</span>
            </button>
          </div>
        )}

        {!isRealData && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            ℹ️ {t('liveSearchUnavailable')}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="registration-header-card" style={{ padding: '1.25rem', marginTop: '-1rem' }}>
        <form onSubmit={handleSearchSubmit} className="form-grid-3" style={{ alignItems: 'center', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>{t('searchHospitalsByLocation')}</label>
            <div className="input-wrapper">
              <Search className="input-icon" size={18} />
              <input
                id="city-search-input"
                type="text"
                placeholder={t('searchByCityPin')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>{t('allCategories')}</label>
            <select 
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                loadHospitals(userLocation.lat || 17.3850, userLocation.lng || 78.4867, searchQuery, e.target.value, Number(radiusKm));
              }}
              className="form-select"
            >
              <option value="ALL">All Hospital Categories</option>
              <option value="Government">Government / General Hospitals</option>
              <option value="District">District Government Hospitals</option>
              <option value="CHC">Community Health Centre (CHC)</option>
              <option value="PHC">Primary Health Centre (PHC)</option>
              <option value="Private">Private / Multispeciality</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>{t('radiusKm')}</label>
            <select 
              value={radiusKm}
              onChange={(e) => {
                setRadiusKm(e.target.value);
                loadHospitals(userLocation.lat || 17.3850, userLocation.lng || 78.4867, searchQuery, categoryFilter, Number(e.target.value));
              }}
              className="form-select"
            >
              <option value="5000">5 km Search Radius</option>
              <option value="10000">10 km Search Radius</option>
              <option value="15000">15 km Search Radius</option>
              <option value="25000">25 km Search Radius</option>
            </select>
          </div>
        </form>
      </div>

      {/* Hospital List Cards */}
      {isLoading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <LoadingSpinner message="Finding nearby hospitals..." />
        </div>
      ) : hospitals.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Building2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>{t('noHospitalsFound')}</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {hospitals.map((hosp) => (
            <div key={hosp.id} className="glass-card" style={{ margin: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-green">{hosp.category || hosp.type}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    📏 {hosp.distance} {t('distanceKm')}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', color: '#fff' }}>🏥 {hosp.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  📍 {hosp.address}
                </p>

                <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: hosp.phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  📞 {hosp.phone || t('phoneNumberUnavailable')}
                </p>
              </div>

              {/* Action Buttons: Directions, Direct Call, Select */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={hosp.googleMapsUri || `https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Navigation size={16} />
                    <span>{t('viewOnMap')}</span>
                  </a>

                  <button
                    type="button"
                    disabled={!hosp.phone}
                    onClick={() => handleInitiateCall(hosp)}
                    className={`btn ${hosp.phone ? 'btn-secondary' : 'btn-secondary disabled'}`}
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', textAlign: 'center', opacity: hosp.phone ? 1 : 0.45, cursor: hosp.phone ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Phone size={16} />
                    <span>{hosp.phone ? t('callHospital') : t('phoneNumberUnavailable')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.65rem' }}
                  onClick={() => handleSelectHospital(hosp, hosp.doctors ? hosp.doctors[0] : null)}
                >
                  <span>{t('selectHospital')}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call Confirmation Dialog Modal */}
      {callHospitalTarget && (
        <div className="otp-modal-backdrop" role="dialog" aria-modal="true">
          <div className="otp-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
                <PhoneCall size={24} />
                <h3 style={{ margin: 0 }}>{t('callHospital')}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setCallHospitalTarget(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: '1rem 0' }}>
              {t('callConfirmationPrompt', { name: callHospitalTarget.name, phone: callHospitalTarget.phone })}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setCallHospitalTarget(null)} 
                style={{ flex: 1 }}
              >
                {t('cancel')}
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleConfirmCall} 
                style={{ flex: 1 }}
              >
                <Phone size={16} />
                <span>{t('confirmCall')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
