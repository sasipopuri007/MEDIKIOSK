import React, { useState, useEffect } from 'react';
import { 
  UserRoundCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Video, 
  Phone, 
  Building2, 
  Eye, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAllPersistedCases, updateCaseStatus } from '../services/caseStore';

export default function DoctorDashboard() {
  const { t } = useLanguage();

  // State
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('QUEUE'); // 'QUEUE' | 'APPOINTMENTS'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Case Modal View
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    const data = await getAllPersistedCases();
    setCases(data);
    setLoading(false);
  };

  const handleStatusUpdate = (caseId, newStatus) => {
    updateCaseStatus(caseId, newStatus);
    loadCases(); // reload list
    if (selectedCase && selectedCase.caseId === caseId) {
      setSelectedCase(prev => ({
        ...prev,
        appointment: { ...prev.appointment, status: newStatus }
      }));
    }
  };

  // Filtered List
  const filteredCases = cases.filter(c => {
    // Status Filter
    if (statusFilter === 'TODAY') {
      const today = new Date().toISOString().split('T')[0];
      if (c.appointment?.date !== today) return false;
    } else if (statusFilter === 'PENDING' && c.appointment?.status !== 'Pending') {
      return false;
    } else if (statusFilter === 'REVIEWED' && c.appointment?.status !== 'Reviewed') {
      return false;
    } else if (statusFilter === 'COMPLETED' && c.appointment?.status !== 'Completed') {
      return false;
    } else if (statusFilter === 'ONLINE' && c.appointment?.type !== 'online') {
      return false;
    } else if (statusFilter === 'IN_PERSON' && c.appointment?.type !== 'in_person') {
      return false;
    }

    // Search Query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.patient?.name?.toLowerCase().includes(q);
      const matchCaseId = c.caseId?.toLowerCase().includes(q);
      const matchSymptom = c.clinicalHistory?.chiefComplaint?.toLowerCase().includes(q);
      return matchName || matchCaseId || matchSymptom;
    }

    return true;
  });

  return (
    <div className="registration-container">
      {/* Header: Demo Doctor Profile Header */}
      <div className="registration-header-card" style={{ background: 'linear-gradient(135deg, rgba(30,41,66,0.9), rgba(15,23,42,0.9))', border: '1px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
              👨‍⚕️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-green">DEMO DOCTOR ACCOUNT</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Login Required</span>
              </div>
              <h2 style={{ margin: '0.2rem 0 0', color: '#fff', fontSize: '1.4rem' }}>Dr. Ananya Sharma, MD</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                Senior Consultant Physician & Cardiology Specialist | Government General Hospital
              </p>
            </div>
          </div>

          <button type="button" className="btn btn-secondary" onClick={loadCases} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <RefreshCw size={16} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Control */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`nav-btn ${activeTab === 'QUEUE' ? 'active' : ''}`}
              onClick={() => setActiveTab('QUEUE')}
            >
              📋 All Intake Cases ({cases.length})
            </button>
            <button 
              className={`nav-btn ${activeTab === 'APPOINTMENTS' ? 'active' : ''}`}
              onClick={() => setActiveTab('APPOINTMENTS')}
            >
              📅 Today's Appointments
            </button>
          </div>

          {/* Search Box */}
          <div className="input-wrapper" style={{ width: '280px' }}>
            <Search className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Search Name or Case ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.5rem', fontSize: '0.9rem' }}
            />
          </div>
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className={`btn-quick-tag ${statusFilter === 'ALL' ? 'active' : ''}`} onClick={() => setStatusFilter('ALL')}>
            All ({cases.length})
          </button>
          <button className={`btn-quick-tag ${statusFilter === 'TODAY' ? 'active' : ''}`} onClick={() => setStatusFilter('TODAY')}>
            Today's Patients
          </button>
          <button className={`btn-quick-tag ${statusFilter === 'PENDING' ? 'active' : ''}`} onClick={() => setStatusFilter('PENDING')}>
            Pending Review
          </button>
          <button className={`btn-quick-tag ${statusFilter === 'REVIEWED' ? 'active' : ''}`} onClick={() => setStatusFilter('REVIEWED')}>
            Reviewed
          </button>
          <button className={`btn-quick-tag ${statusFilter === 'COMPLETED' ? 'active' : ''}`} onClick={() => setStatusFilter('COMPLETED')}>
            Completed
          </button>
          <button className={`btn-quick-tag ${statusFilter === 'ONLINE' ? 'active' : ''}`} onClick={() => setStatusFilter('ONLINE')}>
            Online Video
          </button>
          <button className={`btn-quick-tag ${statusFilter === 'IN_PERSON' ? 'active' : ''}`} onClick={() => setStatusFilter('IN_PERSON')}>
            In-Person OPD
          </button>
        </div>
      </div>

      {/* Patient List Table View */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
          {activeTab === 'QUEUE' ? 'Live OPD Patient Intake Queue' : "Today's Doctor Appointments"}
        </h2>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p>Loading patient records...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No matching patient cases found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Patient Name</th>
                  <th>Age / Sex</th>
                  <th>Primary Symptoms</th>
                  <th>Severity</th>
                  <th>Appointment</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => (
                  <tr key={c.caseId} style={{ background: c.clinicalHistory?.severity === 'Severe' ? 'rgba(244,63,94,0.08)' : 'transparent' }}>
                    <td><code className="id-badge">{c.caseId}</code></td>
                    <td><strong>{c.patient?.name || 'Anonymous'}</strong></td>
                    <td>{c.patient?.age || '45'} / {c.patient?.gender || 'M'}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.clinicalHistory?.chiefComplaint || 'N/A'}
                    </td>
                    <td>
                      <span className={`badge ${c.clinicalHistory?.severity === 'Severe' ? 'badge-red' : 'badge-green'}`}>
                        {c.clinicalHistory?.severity || 'Moderate'}
                      </span>
                    </td>
                    <td><small>{c.appointment?.date} ({c.appointment?.time})</small></td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                        {c.appointment?.type === 'online' ? '📹 Online' : '🏥 OPD'}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                        {c.appointment?.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => setSelectedCase(c)}
                      >
                        <Eye size={14} />
                        <span>View Case</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Case Details Modal */}
      {selectedCase && (
        <div className="otp-modal-backdrop" role="dialog" style={{ zIndex: 1100 }}>
          <div className="otp-modal-card" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--accent-cyan)' }}>
                  Case File: {selectedCase.patient?.name} ({selectedCase.caseId})
                </h3>
                <small style={{ color: 'var(--text-muted)' }}>
                  Preferred Language: {selectedCase.patient?.preferredLanguage || 'English'}
                </small>
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }} onClick={() => setSelectedCase(null)}>
                ✕ Close
              </button>
            </div>

            {/* Case Details Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--accent-cyan)' }}>🧑 Patient Profile:</strong>
                <p style={{ margin: '0.3rem 0' }}>Age: {selectedCase.patient?.age} Yrs | Gender: {selectedCase.patient?.gender}</p>
                <p style={{ margin: '0.3rem 0' }}>Phone: {selectedCase.patient?.phone}</p>
                <p style={{ margin: '0.3rem 0' }}>Blood Group: <strong>{selectedCase.patient?.bloodGroup}</strong></p>
                <p style={{ margin: '0.3rem 0' }}>OTP Verification: <span style={{ color: 'var(--accent-emerald)' }}>✅ Verified</span></p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--accent-cyan)' }}>🏥 Selected Hospital & Doctor:</strong>
                <p style={{ margin: '0.3rem 0' }}>Hospital: {selectedCase.hospital?.name || 'Government General Hospital'}</p>
                <p style={{ margin: '0.3rem 0' }}>Doctor: {selectedCase.doctor?.name || 'Dr. Ananya Sharma'}</p>
                <p style={{ margin: '0.3rem 0' }}>Appointment: {selectedCase.appointment?.date} ({selectedCase.appointment?.time})</p>
                <p style={{ margin: '0.3rem 0' }}>Status: <span className="badge badge-green">{selectedCase.appointment?.status || 'Pending'}</span></p>
              </div>
            </div>

            {/* Clinical Symptoms & Uploads */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>🩺 Clinical Intake History:</strong>
              <p style={{ margin: '0.4rem 0' }}><strong>Chief Complaint:</strong> {selectedCase.clinicalHistory?.chiefComplaint}</p>
              <p style={{ margin: '0.4rem 0' }}><strong>Duration:</strong> {selectedCase.clinicalHistory?.duration}</p>
              <p style={{ margin: '0.4rem 0' }}><strong>Severity:</strong> {selectedCase.clinicalHistory?.severity}</p>
              <p style={{ margin: '0.4rem 0' }}><strong>Past History:</strong> {selectedCase.clinicalHistory?.previousDiseases || 'None'}</p>
              <p style={{ margin: '0.4rem 0' }}><strong>Current Medicines:</strong> {selectedCase.clinicalHistory?.medications || 'None'}</p>
              <p style={{ margin: '0.4rem 0' }}><strong>Allergies:</strong> {selectedCase.clinicalHistory?.allergies || 'No known allergies'}</p>

              {selectedCase.medicalReports && selectedCase.medicalReports.length > 0 && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <strong>Attached Reports:</strong>
                  <ul>
                    {selectedCase.medicalReports.map((rep, idx) => (
                      <li key={idx}>📄 {rep.name} ({rep.size})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => handleStatusUpdate(selectedCase.caseId, 'Reviewed')}
              >
                Mark as Reviewed
              </button>

              <button 
                className="btn btn-primary"
                onClick={() => handleStatusUpdate(selectedCase.caseId, 'Completed')}
              >
                Complete Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
