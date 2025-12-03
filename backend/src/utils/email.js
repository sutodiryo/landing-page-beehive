const nodemailer = require('nodemailer');
let transporter = null;

const initializeEmailTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured. Email sending disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  return transporter;
};

const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  if (!transporter) {
    console.log('Email transport not initialized. Token:', resetToken);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click this link to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>Or use this token: <code>${resetToken}</code></p>
      `
    });
    console.log('Password reset email sent to', email);
    return true;
  } catch (err) {
    console.error('Error sending email:', err.message);
    return false;
  }
};

module.exports = { initializeEmailTransport, sendPasswordResetEmail };
