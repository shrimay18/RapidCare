import { Heart, Calendar, Video, FileText, Users, Stethoscope, Clock, Shield } from 'lucide-react';
import { useRouter } from 'next/router';
import styles from '@/styles/Hero.module.css';

export default function Hero() {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleSignin = () => {
    router.push('/signin');
  };

  const handleStartFreeTrial = () => {
    router.push('/signup');
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navContent}>
            {/* Logo */}
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <Heart className={styles.heartIcon} />
              </div>
              <span className={styles.logoText}>RapidCare</span>
            </div>
            
            {/* Auth Buttons */}
            <div className={styles.authButtons}>
              <button className={styles.signInBtn} onClick={handleSignin}>
                Sign In
              </button>
              <button className={styles.signUpBtn} onClick={handleSignup}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Healthcare Made
            <span className={styles.heroTitleAccent}>Simple & Fast</span>
          </h1>
          <p className={styles.heroDescription}>
            Experience seamless healthcare management with RapidCare. From patient records to virtual consultations, 
            we bring modern healthcare solutions to your fingertips.
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.primaryBtn} onClick={handleStartFreeTrial}>
              Get Started Today
            </button>
            <button className={styles.secondaryBtn}>
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Users className={styles.icon} />
            </div>
            <h3 className={styles.featureTitle}>Patient Management</h3>
            <p className={styles.featureDescription}>
              Complete Electronic Health Records system with patient profiles, medical history, and prescription tracking.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Calendar className={styles.icon} />
            </div>
            <h3 className={styles.featureTitle}>Smart Scheduling</h3>
            <p className={styles.featureDescription}>
              Effortless appointment booking with real-time availability, automated reminders, and easy rescheduling.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Video className={styles.icon} />
            </div>
            <h3 className={styles.featureTitle}>Virtual Consultations</h3>
            <p className={styles.featureDescription}>
              Secure video calling with real-time chat, medical notes exchange, and e-prescription sharing.
            </p>
          </div>

          {/* Feature 4 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FileText className={styles.icon} />
            </div>
            <h3 className={styles.featureTitle}>Diagnostics Hub</h3>
            <p className={styles.featureDescription}>
              Upload and manage lab results with diagnostic history tracking and doctor annotations.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10,000+</div>
              <div className={styles.statLabel}>Patients Served</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Healthcare Providers</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>99.9%</div>
              <div className={styles.statLabel}>Uptime Reliability</div>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className={styles.benefitsSection}>
          <h2 className={styles.benefitsTitle}>Why Choose RapidCare?</h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>
                <Clock className={styles.benefitIconSvg} />
              </div>
              <h3 className={styles.benefitTitle}>Save Time</h3>
              <p className={styles.benefitDescription}>
                Streamlined workflows reduce administrative burden and improve efficiency.
              </p>
            </div>
            
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>
                <Shield className={styles.benefitIconSvg} />
              </div>
              <h3 className={styles.benefitTitle}>Secure & Compliant</h3>
              <p className={styles.benefitDescription}>
                HIPAA-compliant platform with enterprise-grade security and data protection.
              </p>
            </div>
            
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>
                <Stethoscope className={styles.benefitIconSvg} />
              </div>
              <h3 className={styles.benefitTitle}>Better Care</h3>
              <p className={styles.benefitDescription}>
                Comprehensive patient data leads to more informed decisions and better outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to Transform Your Healthcare Practice?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of healthcare providers who trust RapidCare for their daily operations.
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaPrimaryBtn} onClick={handleStartFreeTrial}>
              Start Free Trial
            </button>
            <button className={styles.ctaSecondaryBtn}>
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
