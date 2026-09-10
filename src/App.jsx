import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PatientRegistration from './pages/PatientRegistration';
import ClinicalHistory from './pages/ClinicalHistory';
import HospitalDiscovery from './pages/HospitalDiscovery';
import FinalReport from './pages/FinalReport';
import DoctorDashboard from './pages/DoctorDashboard';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="app-layout">
          {/* Universal Header Navbar with 11 Languages */}
          <Navbar />

          {/* Main Content Area */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<PatientRegistration />} />
              <Route path="/clinical-history" element={<ClinicalHistory />} />
              <Route path="/hospitals" element={<HospitalDiscovery />} />
              <Route path="/final-report" element={<FinalReport />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="app-footer">
            <div className="footer-container">
              <p className="footer-copyright">
                &copy; {new Date().getFullYear()} MediKiosk – Multilingual Digital Clinical Intake & Hospital Platform.
              </p>
              <p className="footer-note">
                Single Case ID Architecture | 11 Indian Languages | Geolocation Hospital Discovery | Doctor Workstation.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </LanguageProvider>
  );
}
