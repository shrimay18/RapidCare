import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  LogOut, 
  Plus, 
  Check, 
  X, 
  Users, 
  ClipboardList, 
  Settings,
  Bell,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Award,
  Stethoscope
} from 'lucide-react';
import { useRouter } from 'next/router';
import '../styles/DoctorDashboard.module.css';

const DoctorDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('appointments');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      router.push('/signin');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'DOCTOR') {
        router.push('/coming-soon?role=' + parsedUser.role.toLowerCase());
        return;
      }

      setUser(parsedUser);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/signin');
    }
  }, [router]);

  // Today's appointments data
  const [todayAppointments, setTodayAppointments] = useState([
    {
      id: 1,
      patientName: 'Sarah Johnson',
      patientPhone: '+1 (555) 123-4567',
      patientEmail: 'sarah@example.com',
      time: '09:00 AM',
      date: '2024-06-08',
      type: 'Regular Checkup',
      status: 'confirmed',
      notes: 'Follow-up for blood pressure monitoring'
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      patientPhone: '+1 (555) 234-5678',
      patientEmail: 'michael@example.com',
      time: '10:30 AM',
      date: '2024-06-08',
      type: 'Consultation',
      status: 'confirmed',
      notes: 'New patient - chest pain symptoms'
    },
    {
      id: 3,
      patientName: 'Emily Davis',
      patientPhone: '+1 (555) 345-6789',
      patientEmail: 'emily@example.com',
      time: '02:00 PM',
      date: '2024-06-08',
      type: 'Follow-up',
      status: 'pending',
      notes: 'Review test results'
    }
  ]);

  // Future appointments data
  const [futureAppointments, setFutureAppointments] = useState([
    {
      id: 4,
      patientName: 'David Wilson',
      patientPhone: '+1 (555) 456-7890',
      patientEmail: 'david@example.com',
      time: '11:00 AM',
      date: '2024-06-10',
      type: 'Consultation',
      status: 'confirmed',
      notes: 'Follow-up appointment for diabetes management'
    },
    {
      id: 5,
      patientName: 'Jennifer Martinez',
      patientPhone: '+1 (555) 567-8901',
      patientEmail: 'jennifer@example.com',
      time: '03:30 PM',
      date: '2024-06-12',
      type: 'Regular Checkup',
      status: 'confirmed',
      notes: 'Annual physical examination'
    }
  ]);

  // Appointment requests data
  const [appointmentRequests, setAppointmentRequests] = useState([
    {
      id: 1,
      patientName: 'John Smith',
      patientEmail: 'john@example.com',
      patientPhone: '+1 (555) 456-7890',
      requestedDate: '2024-06-08',
      requestedTime: '11:00 AM',
      reason: 'Persistent headaches for the past week',
      urgency: 'medium',
      submittedAt: '2024-06-07 14:30'
    },
    {
      id: 2,
      patientName: 'Lisa Wilson',
      patientEmail: 'lisa@example.com',
      patientPhone: '+1 (555) 567-8901',
      requestedDate: '2024-06-09',
      requestedTime: '03:00 PM',
      reason: 'Annual health checkup',
      urgency: 'low',
      submittedAt: '2024-06-07 16:45'
    },
    {
      id: 3,
      patientName: 'Robert Brown',
      patientEmail: 'robert@example.com',
      patientPhone: '+1 (555) 678-9012',
      requestedDate: '2024-06-08',
      requestedTime: '09:30 AM',
      reason: 'Severe chest pain and shortness of breath',
      urgency: 'high',
      submittedAt: '2024-06-07 18:20'
    }
  ]);

  // Reminders data
  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: 'Review patient reports',
      time: '08:00 AM',
      date: '2024-06-08',
      type: 'patient'
    },
    {
      id: 2,
      title: 'Medical conference call',
      time: '05:00 PM',
      date: '2024-06-08',
      type: 'meeting'
    }
  ]);

  // Doctor profile data
  const [doctorProfile, setDoctorProfile] = useState({
    specialization: 'Cardiologist',
    experience: '12 years',
    consultationFee: '$150',
    qualifications: 'MD, FRCP',
    hospital: 'City General Hospital',
    location: 'Downtown Medical Center',
    phone: '+1 (555) 123-4567',
    email: '',
    availability: 'Mon-Fri: 9AM-5PM',
    languages: 'English, Spanish'
  });

  // Form states
  const [newReminder, setNewReminder] = useState({
    title: '',
    date: '',
    time: '',
    type: 'patient'
  });

  const [profileEdit, setProfileEdit] = useState({...doctorProfile});

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to sort appointments by date and time
  const sortAppointmentsByDateTime = (appointments) => {
    return appointments.sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`);
      const dateTimeB = new Date(`${b.date} ${b.time}`);
      return dateTimeA - dateTimeB;
    });
  };

  // Group future appointments by date
  const groupAppointmentsByDate = (appointments) => {
    const grouped = {};
    appointments.forEach(appointment => {
      if (!grouped[appointment.date]) {
        grouped[appointment.date] = [];
      }
      grouped[appointment.date].push(appointment);
    });
    
    // Sort appointments within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date] = grouped[date].sort((a, b) => {
        const timeA = new Date(`1970-01-01 ${a.time}`);
        const timeB = new Date(`1970-01-01 ${b.time}`);
        return timeA - timeB;
      });
    });

    return grouped;
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Sort today's appointments by time
  const sortedTodayAppointments = sortAppointmentsByDateTime([...todayAppointments]);
  
  // Group and sort future appointments
  const groupedFutureAppointments = groupAppointmentsByDate(futureAppointments);
  const sortedFutureDates = Object.keys(groupedFutureAppointments).sort();

  // Event handlers
  const handleAcceptRequest = (requestId) => {
    const request = appointmentRequests.find(req => req.id === requestId);
    if (request) {
      // Create new appointment from accepted request
      const newAppointment = {
        id: Date.now(),
        patientName: request.patientName,
        patientPhone: request.patientPhone,
        patientEmail: request.patientEmail,
        time: request.requestedTime,
        date: request.requestedDate,
        type: 'Consultation',
        status: 'confirmed',
        notes: request.reason
      };

      // Check if appointment is for today or future
      const today = new Date().toISOString().split('T')[0];
      
      if (request.requestedDate === today) {
        setTodayAppointments(prev => [...prev, newAppointment]);
      } else {
        setFutureAppointments(prev => [...prev, newAppointment]);
      }

      // Remove from requests
      setAppointmentRequests(prev => prev.filter(req => req.id !== requestId));
      
      alert(`Appointment accepted for ${request.patientName} on ${request.requestedDate} at ${request.requestedTime}`);
    }
  };

  const handleRejectRequest = (requestId) => {
    setAppointmentRequests(prev => prev.filter(req => req.id !== requestId));
    alert('Appointment request rejected.');
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
        type: 'patient'
      });
      setShowAddReminder(false);
    }
  };

  const handleProfileUpdate = () => {
    setDoctorProfile({...profileEdit});
    setShowProfileEdit(false);
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/signin');
  };

  // Update email when user data is loaded
  useEffect(() => {
    if (user) {
      setDoctorProfile(prev => ({
        ...prev,
        email: user.email || ''
      }));
      setProfileEdit(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="doctor-dashboard-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="doctor-dashboard-container">
      {/* Navigation Bar */}
      <nav className="doctor-navbar">
        <div className="doctor-nav-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stethoscope size={24} style={{ color: '#059669' }} />
            <h1 className="doctor-logo">RapidCare</h1>
          </div>
          <div className="doctor-user-section">
            <div className="doctor-user-info">
              <User size={20} />
              <span>Dr. {user.name}</span>
            </div>
            <button onClick={handleLogout} className="doctor-logout-btn">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="doctor-main-content">
        {/* Welcome Section */}
        <div className="doctor-welcome-card">
          <h2 className="doctor-welcome-title">Welcome back, Dr. {user.name}!</h2>
          <p className="doctor-welcome-text">Manage your appointments and patients efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={32} />
            </div>
            <div className="stat-number">{sortedTodayAppointments.length}</div>
            <div className="stat-label">Today's Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={32} />
            </div>
            <div className="stat-number">{appointmentRequests.length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={32} />
            </div>
            <div className="stat-number">{futureAppointments.length}</div>
            <div className="stat-label">Future Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign size={32} />
            </div>
            <div className="stat-number">{doctorProfile.consultationFee}</div>
            <div className="stat-label">Consultation Fee</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="doctor-tab-container">
          <div className="doctor-tab-nav">
            {[
              { id: 'appointments', label: 'Today\'s Appointments', icon: Calendar },
              { id: 'future', label: 'Future Appointments', icon: Clock },
              { id: 'requests', label: 'Appointment Requests', icon: ClipboardList },
              { id: 'reminders', label: 'My Reminders', icon: Bell },
              { id: 'profile', label: 'Profile Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`doctor-tab-button ${activeTab === id ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="doctor-tab-content">
            {/* Today's Appointments Tab */}
            {activeTab === 'appointments' && (
              <div>
                <div className="doctor-section-header">
                  <h3 className="doctor-section-title">Today's Appointments</h3>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {sortedTodayAppointments.length === 0 ? (
                  <div className="empty-state">
                    <Calendar className="empty-state-icon" size={48} />
                    <h3 className="empty-state-title">No appointments today</h3>
                    <p className="empty-state-text">You have a free day! Enjoy your time off.</p>
                  </div>
                ) : (
                  <div>
                    {sortedTodayAppointments.map((appointment) => (
                      <div key={appointment.id} className="appointment-card">
                        <div className="appointment-header">
                          <div className="patient-info">
                            <h4 className="patient-name">{appointment.patientName}</h4>
                            <p className="appointment-time">
                              <Clock size={16} style={{ display: 'inline', marginRight: '4px' }} />
                              {appointment.time} • {appointment.type}
                            </p>
                          </div>
                          <span className={`appointment-status status-${appointment.status}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="appointment-details">
                          <p><strong>Contact:</strong> {appointment.patientPhone}</p>
                          <p><strong>Email:</strong> {appointment.patientEmail}</p>
                          <p><strong>Notes:</strong> {appointment.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Future Appointments Tab */}
            {activeTab === 'future' && (
              <div>
                <div className="doctor-section-header">
                  <h3 className="doctor-section-title">Future Appointments</h3>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    {futureAppointments.length} scheduled appointments
                  </span>
                </div>

                {futureAppointments.length === 0 ? (
                  <div className="empty-state">
                    <Clock className="empty-state-icon" size={48} />
                    <h3 className="empty-state-title">No future appointments</h3>
                    <p className="empty-state-text">New appointments will appear here when scheduled.</p>
                  </div>
                ) : (
                  <div>
                    {sortedFutureDates.map((date) => (
                      <div key={date} style={{ marginBottom: '32px' }}>
                        <div style={{ 
                          backgroundColor: '#f9fafb', 
                          padding: '12px 20px', 
                          borderRadius: '8px',
                          marginBottom: '16px',
                          borderLeft: '4px solid #059669'
                        }}>
                          <h4 style={{ 
                            margin: 0, 
                            color: '#059669', 
                            fontWeight: '600',
                            fontSize: '16px'
                          }}>
                            {formatDate(date)}
                          </h4>
                          <p style={{ 
                            margin: 0, 
                            color: '#6b7280', 
                            fontSize: '14px',
                            marginTop: '4px'
                          }}>
                            {groupedFutureAppointments[date].length} appointment{groupedFutureAppointments[date].length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        {groupedFutureAppointments[date].map((appointment) => (
                          <div key={appointment.id} className="appointment-card" style={{ marginLeft: '20px' }}>
                            <div className="appointment-header">
                              <div className="patient-info">
                                <h4 className="patient-name">{appointment.patientName}</h4>
                                <p className="appointment-time">
                                  <Clock size={16} style={{ display: 'inline', marginRight: '4px' }} />
                                  {appointment.time} • {appointment.type}
                                </p>
                              </div>
                              <span className={`appointment-status status-${appointment.status}`}>
                                {appointment.status}
                              </span>
                            </div>
                            <div className="appointment-details">
                              <p><strong>Contact:</strong> {appointment.patientPhone}</p>
                              <p><strong>Email:</strong> {appointment.patientEmail}</p>
                              <p><strong>Notes:</strong> {appointment.notes}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Appointment Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <div className="doctor-section-header">
                  <h3 className="doctor-section-title">Appointment Requests</h3>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    {appointmentRequests.length} pending requests
                  </span>
                </div>

                {appointmentRequests.length === 0 ? (
                  <div className="empty-state">
                    <ClipboardList className="empty-state-icon" size={48} />
                    <h3 className="empty-state-title">No pending requests</h3>
                    <p className="empty-state-text">All appointment requests have been processed.</p>
                  </div>
                ) : (
                  <div>
                    {appointmentRequests.map((request) => (
                      <div key={request.id} className="request-card">
                        <div className="request-header">
                          <div className="request-patient-info">
                            <h4 className="request-patient-name">{request.patientName}</h4>
                            <p className="request-time">
                              <Calendar size={16} style={{ display: 'inline', marginRight: '4px' }} />
                              {formatDate(request.requestedDate)} at {request.requestedTime}
                            </p>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              marginTop: '4px'
                            }}>
                              <span 
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: getUrgencyColor(request.urgency)
                                }}
                              ></span>
                              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {request.urgency.toUpperCase()} PRIORITY
                              </span>
                            </div>
                          </div>
                          <div className="request-actions">
                            <button 
                              onClick={() => handleAcceptRequest(request.id)}
                              className="accept-button"
                            >
                              <Check size={16} style={{ marginRight: '4px' }} />
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(request.id)}
                              className="reject-button"
                            >
                              <X size={16} style={{ marginRight: '4px' }} />
                              Reject
                            </button>
                          </div>
                        </div>
                        <div className="request-details">
                          <p><strong>Reason:</strong> {request.reason}</p>
                        </div>
                        <div className="request-meta">
                          <span>
                            <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {request.patientPhone}
                          </span>
                          <span>
                            <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {request.patientEmail}
                          </span>
                          <span>
                            <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Submitted: {request.submittedAt}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
              <div>
                <div className="doctor-section-header">
                  <h3 className="doctor-section-title">My Reminders</h3>
                  <button 
                    onClick={() => setShowAddReminder(true)} 
                    className="doctor-add-button"
                  >
                    <Plus size={20} />
                    <span>Add Reminder</span>
                  </button>
                </div>

                {reminders.length === 0 ? (
                  <div className="empty-state">
                    <Bell className="empty-state-icon" size={48} />
                    <h3 className="empty-state-title">No reminders set</h3>
                    <p className="empty-state-text">Add reminders to stay organized throughout your day.</p>
                  </div>
                ) : (
                  <div>
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
                )}
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="doctor-section-header">
                  <h3 className="doctor-section-title">Profile Settings</h3>
                  <button 
                    onClick={() => setShowProfileEdit(true)} 
                    className="edit-profile-button"
                  >
                    <Settings size={20} />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="profile-grid">
                  <div className="profile-section">
                    <h4 className="profile-section-title">Professional Information</h4>
                    <div className="profile-item">
                      <span className="profile-label">Specialization:</span>
                      <span className="profile-value">{doctorProfile.specialization}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Experience:</span>
                      <span className="profile-value">{doctorProfile.experience}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Qualifications:</span>
                      <span className="profile-value">{doctorProfile.qualifications}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Consultation Fee:</span>
                      <span className="profile-value">{doctorProfile.consultationFee}</span>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h4 className="profile-section-title">Contact & Location</h4>
                    <div className="profile-item">
                      <span className="profile-label">Hospital:</span>
                      <span className="profile-value">{doctorProfile.hospital}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Location:</span>
                      <span className="profile-value">{doctorProfile.location}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Phone:</span>
                      <span className="profile-value">{doctorProfile.phone}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Email:</span>
                      <span className="profile-value">{doctorProfile.email}</span>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h4 className="profile-section-title">Availability & Languages</h4>
                    <div className="profile-item">
                      <span className="profile-label">Availability:</span>
                      <span className="profile-value">{doctorProfile.availability}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Languages:</span>
                      <span className="profile-value">{doctorProfile.languages}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddReminder && (
        <div className="doctor-modal">
          <div className="doctor-modal-content">
            <div className="doctor-modal-header">
              <h3 className="doctor-modal-title">Add Reminder</h3>
            </div>
            <div className="doctor-modal-body">
              <div className="doctor-form-group">
                <label className="doctor-label">Title</label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                  className="doctor-input"
                  placeholder="e.g., Review patient reports"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Date</label>
                <input
                  type="date"
                  value={newReminder.date}
                  onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                  className="doctor-input"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Time</label>
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                  className="doctor-input"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Type</label>
                <select
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({...newReminder, type: e.target.value})}
                  className="doctor-select"
                >
                  <option value="patient">Patient Related</option>
                  <option value="personal">Personal</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="doctor-button-group">
                <button onClick={handleAddReminder} className="doctor-primary-button">
                  Add Reminder
                </button>
                <button onClick={() => setShowAddReminder(false)} className="doctor-secondary-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileEdit && (
        <div className="doctor-modal">
          <div className="doctor-modal-content">
            <div className="doctor-modal-header">
              <h3 className="doctor-modal-title">Edit Profile</h3>
            </div>
            <div className="doctor-modal-body">
              <div className="doctor-form-group">
                <label className="doctor-label">Specialization</label>
                <input
                  type="text"
                  value={profileEdit.specialization}
                  onChange={(e) => setProfileEdit({...profileEdit, specialization: e.target.value})}
                  className="doctor-input"
                  placeholder="e.g., Cardiologist"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Experience</label>
                <input
                  type="text"
                  value={profileEdit.experience}
                  onChange={(e) => setProfileEdit({...profileEdit, experience: e.target.value})}
                  className="doctor-input"
                  placeholder="e.g., 12 years"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Consultation Fee</label>
                <input
                  type="text"
                  value={profileEdit.consultationFee}
                  onChange={(e) => setProfileEdit({...profileEdit, consultationFee: e.target.value})}
                  className="doctor-input"
                  placeholder="e.g., $150"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Qualifications</label>
                <input
                  type="text"
                  value={profileEdit.qualifications}
                  onChange={(e) => setProfileEdit({...profileEdit, qualifications: e.target.value})}
                  className="doctor-input"
                  placeholder="e.g., MD, FRCP"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Hospital/Clinic</label>
                <input
                  type="text"
                  value={profileEdit.hospital}
                  onChange={(e) => setProfileEdit({...profileEdit, hospital: e.target.value})}
                  className="doctor-input"
                  placeholder="e.g., City General Hospital"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Location</label>
                <input
                  type="text"
                  value={profileEdit.location}
                  onChange={(e) => setProfileEdit({...profileEdit, location: e.target.value})}
                  className="doctor-input"
                  placeholder="e.g., Downtown Medical Center"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Phone</label>
                <input
                  type="tel"
                  value={profileEdit.phone}
                  onChange={(e) => setProfileEdit({...profileEdit, phone: e.target.value})}
                  className="doctor-input"
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Availability</label>
                <input
                  type="text"
                  value={profileEdit.availability}
                  onChange={(e) => setProfileEdit({...profileEdit, availability: e.target.value})}
                  className="doctor-input"
                  placeholder="e.g., Mon-Fri: 9AM-5PM"
                />
              </div>
              <div className="doctor-form-group">
                <label className="doctor-label">Languages</label>
                <input
                  type="text"
                  value={profileEdit.languages}
                  onChange={(e) => setProfileEdit({...profileEdit, languages: e.target.value})}
                  className="doctor-input"
                  placeholder="e.g., English, Spanish"
                />
              </div>
              <div className="doctor-button-group">
                <button onClick={handleProfileUpdate} className="doctor-primary-button">
                  Save Changes
                </button>
                <button onClick={() => setShowProfileEdit(false)} className="doctor-secondary-button">
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

export default DoctorDashboard;