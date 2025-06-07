// frontend/src/pages/coming-soon.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Heart, User, LogOut, Clock, Settings } from 'lucide-react';

export default function ComingSoon() {
  const router = useRouter();
  const { role } = router.query;
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/signin');
        }
    } else {
        // If no user data, redirect to signin
        router.push('/signin');
    }
    }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/signin');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const getRoleDisplay = () => {
    switch (role || user.role) {
      case 'doctor':
      case 'DOCTOR':
        return 'Doctor';
      case 'admin':
      case 'ADMIN':
        return 'Admin';
      default:
        return 'User';
    }
  };

  const getRoleIcon = () => {
    switch (role || user.role) {
      case 'doctor':
      case 'DOCTOR':
        return <Settings size={48} className="role-icon" />;
      case 'admin':
      case 'ADMIN':
        return <User size={48} className="role-icon" />;
      default:
        return <Clock size={48} className="role-icon" />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logoSection}>
            <Heart size={24} style={{ color: '#2563eb' }} />
            <h1 style={styles.logo}>RapidCare</h1>
          </div>
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <User size={20} />
              <span>{user.name}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Coming Soon Content */}
      <div style={styles.mainContent}>
        <div style={styles.comingSoonCard}>
          <div style={styles.iconContainer}>
            {getRoleIcon()}
          </div>
          
          <h1 style={styles.title}>
            {getRoleDisplay()} Dashboard
          </h1>
          
          <h2 style={styles.subtitle}>Coming Soon!</h2>
          
          <p style={styles.description}>
            We're working hard to bring you an amazing {getRoleDisplay().toLowerCase()} experience. 
            The {getRoleDisplay().toLowerCase()} dashboard will be available soon with powerful features 
            tailored specifically for your needs.
          </p>

          <div style={styles.featuresList}>
            {role === 'doctor' || user.role === 'DOCTOR' ? (
              <>
                <div style={styles.feature}>📅 Appointment Management</div>
                <div style={styles.feature}>👥 Patient Records</div>
                <div style={styles.feature}>💊 Prescription Tools</div>
                <div style={styles.feature}>📊 Analytics Dashboard</div>
              </>
            ) : (
              <>
                <div style={styles.feature}>👨‍⚕️ Doctor Management</div>
                <div style={styles.feature}>📊 System Analytics</div>
                <div style={styles.feature}>⚙️ Platform Settings</div>
                <div style={styles.feature}>📈 Reports & Insights</div>
              </>
            )}
          </div>

          <div style={styles.buttonGroup}>
            <button onClick={handleBackToHome} style={styles.primaryBtn}>
              Back to Home
            </button>
            <button onClick={handleLogout} style={styles.secondaryBtn}>
              Sign Out
            </button>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Thank you for your patience! We'll notify you as soon as it's ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif'
  },
  navbar: {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #e0e0e0'
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2563eb',
    margin: 0
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#374151',
    fontWeight: '500'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#dc2626',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s'
  },
  mainContent: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '60px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 64px)'
  },
  comingSoonCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    padding: '48px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '600px'
  },
  iconContainer: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
    margin: 0
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: '16px',
    margin: 0
  },
  description: {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '32px',
    margin: 0
  },
  featuresList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '32px'
  },
  feature: {
    padding: '12px 16px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    color: '#1e40af',
    fontWeight: '500',
    fontSize: '14px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '24px'
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  secondaryBtn: {
    backgroundColor: 'white',
    color: '#374151',
    padding: '12px 24px',
    borderRadius: '8px',
    border: '2px solid #d1d5db',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  footer: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px'
  },
  footerText: {
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0
  }
};