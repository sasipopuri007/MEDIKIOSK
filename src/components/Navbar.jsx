import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Stethoscope, 
  UserPlus, 
  FileText, 
  Home, 
  MapPin, 
  UserRoundCheck, 
  Globe, 
  Menu, 
  X, 
  ShieldAlert 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { language, setLanguage, t, LANGUAGES, currentLanguageObj } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setIsLangDropdownOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon-wrapper">
            <Stethoscope className="brand-icon" size={24} aria-hidden="true" />
          </div>
          <div className="brand-text">
            <span className="brand-name">{t('appTitle')}</span>
            <span className="brand-tagline">{t('appTagline')}</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-nav" aria-label="Main Navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home size={18} />
            <span>{t('home')}</span>
          </NavLink>

          <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <UserPlus size={18} />
            <span>{t('patientRegistration')}</span>
          </NavLink>

          <NavLink to="/clinical-history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={18} />
            <span>{t('clinicalHistory')}</span>
          </NavLink>

          <NavLink to="/hospitals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <MapPin size={18} />
            <span>{t('hospitals')}</span>
          </NavLink>

          <NavLink to="/doctor-dashboard" className={({ isActive }) => `nav-link nav-link-doctor ${isActive ? 'active' : ''}`}>
            <UserRoundCheck size={18} />
            <span>{t('doctorDashboard')}</span>
          </NavLink>
        </nav>

        {/* 11 Indian Languages Selector */}
        <div className="navbar-actions">
          <div className="lang-select-wrapper">
            <button 
              type="button" 
              className="lang-selector-btn"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              title="Select Language"
            >
              <Globe size={18} />
              <span className="lang-name-text">{currentLanguageObj.native}</span>
            </button>

            {isLangDropdownOpen && (
              <div className="lang-menu-dropdown">
                <div className="lang-menu-header">Select Language (11 Languages)</div>
                <div className="lang-menu-options">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className={`lang-option-btn ${language === l.code ? 'active' : ''}`}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                    >
                      <span className="native-text">{l.native}</span>
                      <span className="english-text">({l.name})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="mobile-nav-drawer" aria-label="Mobile Navigation">
          <NavLink to="/" end className="mobile-nav-link" onClick={closeMenu}>
            <Home size={20} />
            <span>{t('home')}</span>
          </NavLink>
          <NavLink to="/register" className="mobile-nav-link" onClick={closeMenu}>
            <UserPlus size={20} />
            <span>{t('patientRegistration')}</span>
          </NavLink>
          <NavLink to="/clinical-history" className="mobile-nav-link" onClick={closeMenu}>
            <FileText size={20} />
            <span>{t('clinicalHistory')}</span>
          </NavLink>
          <NavLink to="/hospitals" className="mobile-nav-link" onClick={closeMenu}>
            <MapPin size={20} />
            <span>{t('hospitals')}</span>
          </NavLink>
          <NavLink to="/doctor-dashboard" className="mobile-nav-link" onClick={closeMenu}>
            <UserRoundCheck size={20} />
            <span>{t('doctorDashboard')}</span>
          </NavLink>
        </nav>
      )}
    </header>
  );
}
