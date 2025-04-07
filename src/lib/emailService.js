import nodemailer from 'nodemailer';

// Email configuration
let transporter;

/**
 * Initialize the email transporter
 * This function creates a transporter based on environment variables
 * For production, it uses the configured SMTP settings
 * For development, it creates a test account with Ethereal
 */
async function initializeTransporter() {
  if (transporter) return transporter;

  // Check if we're in a production environment with configured email settings
  if (process.env.EMAIL_HOST && 
      process.env.EMAIL_PORT && 
      process.env.EMAIL_USER && 
      process.env.EMAIL_PASS) {
    
    // Create a production transporter with the provided credentials
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    console.log('Email service initialized with production settings');
    return transporter;
  }
  
  // For development/testing, create a test account with Ethereal
  try {
    // Create a test account at Ethereal
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter using the test account
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Email test account created:', testAccount.user);
    return transporter;
  } catch (error) {
    console.error('Failed to create email test account:', error);
    
    // Fallback to a mock transporter that logs emails instead of sending them
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('Email would be sent with the following options:');
        console.log(mailOptions);
        return {
          messageId: 'mock-message-id',
          previewURL: null,
        };
      },
    };
    
    return transporter;
  }
}

/**
 * Send a password reset email
 * @param {string} email - The recipient's email address
 * @param {string} resetLink - The password reset link
 * @returns {Promise<object>} - The result of the email sending operation
 */
export async function sendPasswordResetEmail(email, resetLink) {
  try {
    const transport = await initializeTransporter();
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ABlog Support" <support@ablog.com>',
      to: email,
      subject: 'Reset Your ABlog Password',
      text: `
        Hello,
        
        You recently requested to reset your password for your ABlog account. Click the link below to reset it:
        
        ${resetLink}
        
        This link will expire in 24 hours.
        
        If you did not request a password reset, please ignore this email or contact support if you have questions.
        
        Thanks,
        The ABlog Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: #6d28d9; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Reset Your Password</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Hello,</p>
            <p>You recently requested to reset your password for your ABlog account. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p style="margin-bottom: 5px;">If the button doesn't work, you can also click on the link below or copy it to your browser:</p>
            <p style="margin-top: 0; word-break: break-all; color: #6d28d9;">
              <a href="${resetLink}" style="color: #6d28d9;">${resetLink}</a>
            </p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
            <p style="margin-top: 30px; margin-bottom: 5px;">Thanks,</p>
            <p style="margin-top: 0;"><strong>The ABlog Team</strong></p>
          </div>
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>&copy; 2025 ABlog. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    
    // Send the email
    const info = await transport.sendMail(mailOptions);
    
    console.log('Password reset email sent:', info.messageId);
    
    // For Ethereal test accounts, return the preview URL
    if (info.messageId && nodemailer.getTestMessageUrl && info.messageId.includes('ethereal')) {
      const previewURL = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL:', previewURL);
      return {
        success: true,
        messageId: info.messageId,
        previewURL: previewURL,
      };
    }
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send a welcome email to a new user
 * @param {string} email - The recipient's email address
 * @param {string} name - The recipient's name
 * @returns {Promise<object>} - The result of the email sending operation
 */
export async function sendWelcomeEmail(email, name) {
  try {
    const transport = await initializeTransporter();
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ABlog Team" <welcome@ablog.com>',
      to: email,
      subject: 'Welcome to ABlog!',
      text: `
        Hello ${name},
        
        Welcome to ABlog! We're excited to have you join our community of bloggers and readers.
        
        Get started by exploring the latest posts or creating your own blog post to share your thoughts with the world.
        
        If you have any questions or need assistance, feel free to reach out to our support team.
        
        Happy blogging!
        
        The ABlog Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: #6d28d9; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to ABlog!</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Hello ${name},</p>
            <p>Welcome to ABlog! We're excited to have you join our community of bloggers and readers.</p>
            <p>Get started by exploring the latest posts or creating your own blog post to share your thoughts with the world.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.SITE_URL || 'http://localhost:4322'}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Start Exploring</a>
            </div>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p style="margin-top: 30px; margin-bottom: 5px;">Happy blogging!</p>
            <p style="margin-top: 0;"><strong>The ABlog Team</strong></p>
          </div>
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>&copy; 2025 ABlog. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    
    // Send the email
    const info = await transport.sendMail(mailOptions);
    
    console.log('Welcome email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
