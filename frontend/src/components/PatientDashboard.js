import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, User, LogOut, Clock, FileText, Star, MapPin, Phone, Mail, Upload, Download, Eye } from 'lucide-react';
import '../styles/PatientDashboard.css';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);
  const [user, setUser] = useState({ name: 'John Doe', email: 'john@example.com' });

  // Dummy data for patient history
  const [patientHistory, setPatientHistory] = useState([
    {
      id: 1,
      date: '2024-05-15',
      doctor: 'Dr. Sarah Wilson',
      specialization: 'Cardiologist',
      diagnosis: 'High Blood Pressure',
      prescription: 'Amlodipine 5mg daily, Low sodium diet',
      notes: 'Regular checkup recommended in 3 months',
      cost: '$150'
    },
    {
      id: 2,
      date: '2024-04-20',
      doctor: 'Dr. Michael Chen',
      specialization: 'General Physician',
      diagnosis: 'Common Cold',
      prescription: 'Rest, plenty of fluids, Paracetamol as needed',
      notes: 'Full recovery expected in 5-7 days',
      cost: '$80'
    }
  ]);

  // Dummy doctors data
  const [doctors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      specialization: 'Cardiologist',
      experience: '12 years',
      price: '$150',
      rating: 4.8,
      location: 'Downtown Medical Center',
      phone: '+1 (555) 123-4567',
      email: 'sarah.wilson@rapidcare.com',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'General Physician',
      experience: '8 years',
      price: '$100',
      rating: 4.6,
      location: 'Westside Clinic',
      phone: '+1 (555) 234-5678',
      email: 'michael.chen@rapidcare.com',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialization: 'Dermatologist',
      experience: '10 years',
      price: '$130',
      rating: 4.9,
      location: 'Skin Care Specialists',
      phone: '+1 (555) 345-6789',
      email: 'emily.rodriguez@rapidcare.com',
      image: 'https://images.unsplash.com/photo-1594824919066-d8cd56cb1e89?w=150&h=150&fit=crop&crop=face'
    }
  ]);

  // Reports data
  const [reports, setReports] = useState([
    {
      id: 1,
      title: 'Blood Test Results',
      date: '2024-05-15',
      doctor: 'Dr. Sarah Wilson',
      type: 'Lab Report',
      fileSize: '2.3 MB',
      description: 'Complete blood count and lipid profile'
    },
    {
      id: 2,
      title: 'Chest X-Ray',
      date: '2024-04-10',
      doctor: 'Dr. Michael Chen',
      type: 'Imaging',
      fileSize: '5.1 MB',
      description: 'Routine chest examination'
    },
    {
      id: 3,
      title: 'ECG Report',
      date: '2024-03-25',
      doctor: 'Dr. Sarah Wilson',
      type: 'Diagnostic',
      fileSize: '1.8 MB',
      description: 'Electrocardiogram test results'
    }
  ]);

  // Reminders data
  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: 'Take Blood Pressure Medication',
      time: '08:00 AM',
      date: '2024-06-08',
      type: 'medication'
    },
    {
      id: 2,
      title: 'Follow-up Appointment with Dr. Wilson',
      time: '02:00 PM',
      date: '2024-06-15',
      type: 'appointment'
    }
  ]);

  // Form states
  const [newRecord, setNewRecord] = useState({
    date: '',
    doctor: '',
    specialization: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    cost: ''
  });

  const [newReminder, setNewReminder] = useState({
    title: '',
    date: '',
    time: '',
    type: 'medication'
  });

  const [newReport, setNewReport] = useState({
    title: '',
    date: '',
    doctor: '',
    type: 'Lab Report',
    description: ''
  });

  // Filter doctors based on search
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRecord = () => {
    if (newRecord.date && newRecord.doctor && newRecord.diagnosis) {
      setPatientHistory([...patientHistory, { 
        id: Date.now(), 
        ...newRecord 
      }]);
      setNewRecord({
        date: '',
        doctor: '',
        specialization: '',
        diagnosis: '',
        prescription: '',
        notes: '',
        cost: ''
      });
      setShowAddRecord(false);
    }
  };

  const handleAddReminder = () => {
    if (newReminder.title && newReminder.date && newReminder.time) {
      setReminders([...reminders, { 
        id: Date.now(), 
        ...newReminder 
      }]);
      setNewReminder({
        title: '',
        date: '',
        time: '',
        type: 'medication'
      });
      setShowAddReminder(false);
    }
  };

  const handleAddReport = () => {
    if (newReport.title && newReport.date && newReport.doctor) {
      setReports([...reports, { 
        id: Date.now(), 
        ...newReport,
        fileSize: 'N/A'
      }]);
      setNewReport({
        title: '',
        date: '',
        doctor: '',
        type: 'Lab Report',
        description: ''
      });
      setShowAddReport(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/signin';
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-content">
          <div>
            <h1 className="logo">RapidCare</h1>
          </div>
          <div className="user-section">
            <div className="user-info">
              <User size={20} />
              <span>{user.name}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="main-content">
        {/* Welcome Section */}
        <div className="welcome-card">
          <h2 className="welcome-title">Welcome back, {user.name}!</h2>
          <p className="welcome-text">Manage your health records and appointments</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-container">
          <div className="tab-nav">
            {[
              { id: 'history', label: 'Medical History', icon: FileText },
              { id: 'doctors', label: 'Find Doctors', icon: Search },
              { id: 'reports', label: 'Reports', icon: Upload },
              { id: 'reminders', label: 'Reminders', icon: Clock }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`tab-button ${activeTab === id ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Medical History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="section-header">
                  <h3 className="section-title">Your Medical History</h3>
                  <button onClick={() => setShowAddRecord(true)} className="add-button">
                    <Plus size={20} />
                    <span>Add Record</span>
                  </button>
                </div>

                <div className="grid grid-cols-1">
                  {patientHistory.map((record) => (
                    <div key={record.id} className="history-card">
                      <div className="grid grid-auto mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">{record.doctor}</h4>
                          <p className="text-gray-600">{record.specialization}</p>
                          <p className="text-gray-600">{record.date}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Diagnosis:</p>
                          <p className="text-gray-700">{record.diagnosis}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Cost:</p>
                          <p className="text-green-600 font-semibold">{record.cost}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Prescription:</p>
                        <p className="text-gray-700 mb-2">{record.prescription}</p>
                        <p className="font-medium text-gray-900">Notes:</p>
                        <p className="text-gray-700">{record.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Find Doctors Tab */}
            {activeTab === 'doctors' && (
              <div>
                <div className="mb-4">
                  <h3 className="section-title mb-4">Find Doctors</h3>
                  <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name or specialization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3">
                  {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="doctor-card">
                      <div className="doctor-header">
                        <img src={doctor.image} alt={doctor.name} className="doctor-image" />
                        <div className="doctor-info">
                          <h4 className="doctor-name">{doctor.name}</h4>
                          <p className="doctor-specialty">{doctor.specialization}</p>
                          <div className="rating">
                            <Star size={16} style={{color: '#fbbf24', fill: '#fbbf24'}} />
                            <span>{doctor.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="doctor-details">
                        <div className="detail-row">
                          <Clock size={16} />
                          <span>{doctor.experience} experience</span>
                        </div>
                        <div className="detail-row">
                          <MapPin size={16} />
                          <span>{doctor.location}</span>
                        </div>
                        <div className="detail-row">
                          <Phone size={16} />
                          <span>{doctor.phone}</span>
                        </div>
                      </div>
                      
                      <div className="doctor-footer">
                        <span className="price">{doctor.price}</span>
                        <button className="book-button">Book Appointment</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <div className="section-header">
                  <h3 className="section-title">Your Medical Reports</h3>
                  <button onClick={() => setShowAddReport(true)} className="add-button">
                    <Plus size={20} />
                    <span>Add Report</span>
                  </button>
                </div>

                <div className="grid grid-cols-2">
                  {reports.map((report) => (
                    <div key={report.id} className="report-card">
                      <div className="report-header">
                        <div>
                          <h4 className="report-title">{report.title}</h4>
                          <p className="report-meta">{report.date} • {report.doctor}</p>
                          <p className="report-meta">{report.type} • {report.fileSize}</p>
                        </div>
                        <div className="report-actions">
                          <button className="action-button" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="action-button" title="Download">
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600">{report.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
              <div>
                <div className="section-header">
                  <h3 className="section-title">Your Reminders</h3>
                  <button onClick={() => setShowAddReminder(true)} className="add-button">
                    <Plus size={20} />
                    <span>Add Reminder</span>
                  </button>
                </div>

                <div className="grid grid-cols-1">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="reminder-card">
                      <div className="reminder-left">
                        <div className={`reminder-dot ${reminder.type}`}></div>
                        <div className="reminder-info">
                          <h4 className="reminder-title">{reminder.title}</h4>
                          <p className="reminder-time">{reminder.date} at {reminder.time}</p>
                        </div>
                      </div>
                      <span className={`badge ${reminder.type}`}>
                        {reminder.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddRecord && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Medical Record</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Date</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="label">Doctor Name</label>
                <input
                  type="text"
                  value={newRecord.doctor}
                  onChange={(e) => setNewRecord({...newRecord, doctor: e.target.value})}
                  className="input"
                  placeholder="e.g., Dr. John Smith"
                />
              </div>
              <div className="form-group">
                <label className="label">Specialization</label>
                <input
                  type="text"
                  value={newRecord.specialization}
                  onChange={(e) => setNewRecord({...newRecord, specialization: e.target.value})}
                  className="input"
                  placeholder="e.g., Cardiologist"
                />
              </div>
              <div className="form-group">
                <label className="label">Diagnosis</label>
                <input
                  type="text"
                  value={newRecord.diagnosis}
                  onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                  className="input"
                  placeholder="e.g., High Blood Pressure"
                />
              </div>
              <div className="form-group">
                <label className="label">Prescription</label>
                <textarea
                  value={newRecord.prescription}
                  onChange={(e) => setNewRecord({...newRecord, prescription: e.target.value})}
                  className="textarea"
                  placeholder="Enter prescription details..."
                />
              </div>
              <div className="form-group">
                <label className="label">Notes</label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                  className="textarea"
                  placeholder="Enter any additional notes..."
                />
              </div>
              <div className="form-group">
                <label className="label">Cost</label>
                <input
                  type="text"
                  value={newRecord.cost}
                  onChange={(e) => setNewRecord({...newRecord, cost: e.target.value})}
                  className="input"
                  placeholder="e.g., $150"
                />
              </div>
              <div className="button-group">
                <button onClick={handleAddRecord} className="primary-button">
                  Add Record
                </button>
                <button onClick={() => setShowAddRecord(false)} className="secondary-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Report Modal */}
      {showAddReport && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Medical Report</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Report Title</label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                  className="input"
                  placeholder="e.g., Blood Test Results"
                />
              </div>
              <div className="form-group">
                <label className="label">Date</label>
                <input
                  type="date"
                  value={newReport.date}
                  onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="label">Doctor Name</label>
                <input
                  type="text"
                  value={newReport.doctor}
                  onChange={(e) => setNewReport({...newReport, doctor: e.target.value})}
                  className="input"
                  placeholder="e.g., Dr. Sarah Wilson"
                />
              </div>
              <div className="form-group">
                <label className="label">Report Type</label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                  className="select"
                >
                  <option value="Lab Report">Lab Report</option>
                  <option value="Imaging">Imaging</option>
                  <option value="Diagnostic">Diagnostic</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                  className="textarea"
                  placeholder="Brief description of the report..."
                />
              </div>
              <div className="form-group">
                <label className="label">Upload File (Optional)</label>
                <input
                  type="file"
                  className="input"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <p className="text-gray-600" style={{fontSize: '12px', marginTop: '4px'}}>
                  Supported formats: PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>
              <div className="button-group">
                <button onClick={handleAddReport} className="primary-button">
                  Add Report
                </button>
                <button onClick={() => setShowAddReport(false)} className="secondary-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminder && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Reminder</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Title</label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                  className="input"
                  placeholder="e.g., Take Blood Pressure Medication"
                />
              </div>
              <div className="form-group">
                <label className="label">Date</label>
                <input
                  type="date"
                  value={newReminder.date}
                  onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="label">Time</label>
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="label">Type</label>
                <select
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({...newReminder, type: e.target.value})}
                  className="select"
                >
                  <option value="medication">Medication</option>
                  <option value="appointment">Appointment</option>
                  <option value="exercise">Exercise</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="button-group">
                <button onClick={handleAddReminder} className="primary-button">
                  Add Reminder
                </button>
                <button onClick={() => setShowAddReminder(false)} className="secondary-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;