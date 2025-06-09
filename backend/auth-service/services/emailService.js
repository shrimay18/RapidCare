// services/emailService.js
const { createTransport } = require('nodemailer');
// const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    try {
      this.transporter = createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify transporter configuration
      this.verifyTransporter();
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  // Verify email transporter
  async verifyTransporter() {
    try {
      await this.transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (error) {
      console.error('Email transporter verification failed:', error);
    }
  }

  // Send OTP email
  async sendOTPEmail(email, otp, userName, purpose = 'verification') {
    try {
      const subject = this.getOTPSubject(purpose);
      const html = this.generateOTPEmailTemplate(userName, otp, purpose);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`OTP email sent successfully to ${email}`);
      return {
        success: true,
        messageId: result.messageId,
        message: 'OTP email sent successfully'
      };
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return {
        success: false,
        message: 'Failed to send OTP email',
        error: error.message
      };
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, userName, userRole) {
    try {
      const subject = `Welcome to RapidCare - Your ${userRole.toLowerCase()} account is ready!`;
      const html = this.generateWelcomeEmailTemplate(userName, userRole);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`Welcome email sent successfully to ${email}`);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Welcome email sent successfully'
      };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return {
        success: false,
        message: 'Failed to send welcome email',
        error: error.message
      };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, userName, resetToken) {
    try {
      const subject = 'RapidCare - Password Reset Request';
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const html = this.generatePasswordResetEmailTemplate(userName, resetUrl);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`Password reset email sent successfully to ${email}`);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return {
        success: false,
        message: 'Failed to send password reset email',
        error: error.message
      };
    }
  }

  // Send security alert email
  async sendSecurityAlertEmail(email, userName, alertType, details) {
    try {
      const subject = `RapidCare - Security Alert: ${alertType}`;
      const html = this.generateSecurityAlertEmailTemplate(userName, alertType, details);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`Security alert email sent successfully to ${email}`);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Security alert email sent successfully'
      };
    } catch (error) {
      console.error('Failed to send security alert email:', error);
      return {
        success: false,
        message: 'Failed to send security alert email',
        error: error.message
      };
    }
  }

  // Get OTP subject based on purpose
  getOTPSubject(purpose) {
    const subjects = {
      verification: 'RapidCare - Email Verification Code',
      login: 'RapidCare - Login Verification Code',
      'password-reset': 'RapidCare - Password Reset Code',
      'phone-verification': 'RapidCare - Phone Verification Code'
    };
    return subjects[purpose] || 'RapidCare - Verification Code';
  }

  // Generate OTP email template
  generateOTPEmailTemplate(userName, otp, purpose) {
    const purposeText = {
      verification: 'verify your email address',
      login: 'complete your login',
      'password-reset': 'reset your password',
      'phone-verification': 'verify your phone number'
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RapidCare - Verification Code</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container { 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #059669;
            }
            .logo { 
                font-size: 28px; 
                font-weight: bold; 
                color: #059669; 
                margin-bottom: 10px;
            }
            .otp-box { 
                background: #f8f9fa; 
                border: 2px solid #059669;
                border-radius: 8px; 
                padding: 20px; 
                text-align: center; 
                margin: 20px 0;
            }
            .otp-code { 
                font-size: 32px; 
                font-weight: bold; 
                color: #059669; 
                letter-spacing: 5px;
                margin: 10px 0;
            }
            .warning { 
                background: #fff3cd; 
                border: 1px solid #ffeaa7; 
                border-radius: 5px; 
                padding: 15px; 
                margin: 20px 0;
                color: #856404;
            }
            .footer { 
                text-align: center; 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background-color: #059669;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏥 RapidCare</div>
                <p>Your Healthcare Platform</p>
            </div>
            
            <h2>Hello ${userName}!</h2>
            <p>We received a request to ${purposeText[purpose] || 'verify your account'}. Please use the verification code below:</p>
            
            <div class="otp-box">
                <p><strong>Your Verification Code:</strong></p>
                <div class="otp-code">${otp}</div>
                <p><small>This code will expire in 10 minutes</small></p>
            </div>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • This code is valid for 10 minutes only<br>
                • Never share this code with anyone<br>
                • If you didn't request this, please ignore this email
            </div>
            
            <p>If you're having trouble, contact our support team at support@rapidcare.com</p>
            
            <div class="footer">
                <p>This is an automated message from RapidCare.<br>
                Please do not reply to this email.</p>
                <p>&copy; 2024 RapidCare. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate welcome email template
  generateWelcomeEmailTemplate(userName, userRole) {
    const roleSpecificContent = {
      DOCTOR: {
        title: 'Welcome to RapidCare - Doctor Portal',
        content: `
          <p>Your doctor account has been successfully created! You can now:</p>
          <ul>
            <li>✅ Manage your appointments and schedule</li>
            <li>✅ View and respond to appointment requests</li>
            <li>✅ Update your consultation fees and profile</li>
            <li>✅ Access patient medical records</li>
            <li>✅ Set up reminders and notifications</li>
          </ul>
          <p>Please complete your profile setup to start receiving appointment requests from patients.</p>
        `,
        ctaText: 'Complete Your Profile',
        ctaUrl: `${process.env.FRONTEND_URL}/doctor-profile-setup`
      },
      PATIENT: {
        title: 'Welcome to RapidCare - Patient Portal',
        content: `
          <p>Your patient account has been successfully created! You can now:</p>
          <ul>
            <li>✅ Search and book appointments with doctors</li>
            <li>✅ View your medical history and records</li>
            <li>✅ Manage your health profile</li>
            <li>✅ Receive appointment reminders</li>
            <li>✅ Access telemedicine consultations</li>
          </ul>
          <p>Start your healthcare journey by booking your first appointment!</p>
        `,
        ctaText: 'Book Appointment',
        ctaUrl: `${process.env.FRONTEND_URL}/patient-dashboard`
      }
    };

    const roleContent = roleSpecificContent[userRole] || roleSpecificContent.PATIENT;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${roleContent.title}</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container { 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                border-radius: 8px;
                color: white;
            }
            .logo { 
                font-size: 28px; 
                font-weight: bold; 
                margin-bottom: 10px;
            }
            .btn {
                display: inline-block;
                padding: 15px 30px;
                background-color: #059669;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: bold;
            }
            .features {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer { 
                text-align: center; 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            ul { 
                padding-left: 0; 
                list-style: none; 
            }
            li { 
                margin: 10px 0; 
                padding-left: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏥 RapidCare</div>
                <h2>${roleContent.title}</h2>
            </div>
            
            <h2>Welcome aboard, ${userName}! 🎉</h2>
            <p>We're excited to have you join the RapidCare community. Your account has been successfully verified and is ready to use.</p>
            
            <div class="features">
                ${roleContent.content}
            </div>
            
            <div style="text-align: center;">
                <a href="${roleContent.ctaUrl}" class="btn">${roleContent.ctaText}</a>
            </div>
            
            <p><strong>Need Help?</strong><br>
            Our support team is here to help you get started. Contact us at support@rapidcare.com or visit our help center.</p>
            
            <div class="footer">
                <p>Thank you for choosing RapidCare for your healthcare needs.</p>
                <p>&copy; 2024 RapidCare. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate password reset email template
  generatePasswordResetEmailTemplate(userName, resetUrl) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RapidCare - Password Reset</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container { 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #dc2626;
            }
            .logo { 
                font-size: 28px; 
                font-weight: bold; 
                color: #059669; 
                margin-bottom: 10px;
            }
            .btn {
                display: inline-block;
                padding: 15px 30px;
                background-color: #dc2626;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: bold;
            }
            .warning { 
                background: #fee2e2; 
                border: 1px solid #fca5a5; 
                border-radius: 5px; 
                padding: 15px; 
                margin: 20px 0;
                color: #dc2626;
            }
            .footer { 
                text-align: center; 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏥 RapidCare</div>
                <h2>🔐 Password Reset Request</h2>
            </div>
            
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your password for your RapidCare account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="btn">Reset Your Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                ${resetUrl}
            </p>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • This link will expire in 30 minutes<br>
                • If you didn't request this reset, please ignore this email<br>
                • Your password will remain unchanged unless you click the link above
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
            
            <div class="footer">
                <p>This is an automated message from RapidCare.<br>
                If you need help, contact us at support@rapidcare.com</p>
                <p>&copy; 2024 RapidCare. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate security alert email template
  generateSecurityAlertEmailTemplate(userName, alertType, details) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RapidCare - Security Alert</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container { 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px;
                padding: 20px;
                background: #fef2f2;
                border: 2px solid #fca5a5;
                border-radius: 8px;
            }
            .logo { 
                font-size: 28px; 
                font-weight: bold; 
                color: #059669; 
                margin-bottom: 10px;
            }
            .alert-details {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #dc2626;
            }
            .footer { 
                text-align: center; 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏥 RapidCare</div>
                <h2>🚨 Security Alert: ${alertType}</h2>
            </div>
            
            <h2>Hello ${userName},</h2>
            <p>We detected unusual activity on your RapidCare account and wanted to notify you immediately.</p>
            
            <div class="alert-details">
                <h3>Alert Details:</h3>
                <p><strong>Alert Type:</strong> ${alertType}</p>
                <p><strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
                ${details.location ? `<p><strong>Location:</strong> ${details.location}</p>` : ''}
                ${details.ipAddress ? `<p><strong>IP Address:</strong> ${details.ipAddress}</p>` : ''}
                ${details.device ? `<p><strong>Device:</strong> ${details.device}</p>` : ''}
            </div>
            
            <p><strong>What should you do?</strong></p>
            <ul>
                <li>If this was you, no action is needed</li>
                <li>If this wasn't you, please change your password immediately</li>
                <li>Review your account activity and recent logins</li>
                <li>Contact our support team if you notice any suspicious activity</li>
            </ul>
            
            <p>For your security, we recommend:</p>
            <ul>
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication</li>
                <li>Regularly review your account activity</li>
                <li>Log out from unused devices</li>
            </ul>
            
            <div class="footer">
                <p>If you have any concerns, contact our security team immediately at security@rapidcare.com</p>
                <p>&copy; 2024 RapidCare. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }
}

module.exports = new EmailService();