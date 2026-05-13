import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email, otp) {
  await transporter.sendMail({
    from: `"ICM System Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🔐 Your ICM System Password Reset OTP',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        </style>
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 40px 16px; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04); overflow: hidden; border: 1px solid #e2e8f0;">

          <!-- Top decorative line -->
          <tr>
            <td style="height: 6px; width: 100%; background: linear-gradient(90deg, #4f46e5, #8b5cf6, #ec4899);"></td>
          </tr>
          
          <tr>
            <td style="padding: 48px 40px;">
              <!-- Logo area -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="background: linear-gradient(135deg, #eef2ff, #f3e8ff); width: 64px; height: 64px; border-radius: 18px; display: inline-block; text-align: center; line-height: 64px; font-size: 32px; border: 1px solid #e0e7ff; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.08);">
                  🎓
                </div>
              </div>

              <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px; text-align: center; letter-spacing: -0.02em;">
                Reset Your Password
              </h1>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 32px; text-align: center; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
                ICM System Learning Platform
              </p>

              <div style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                <p style="margin-top: 0;">Hello,</p>
                <p>We received a request to securely reset your password. Please use the verification code below to gain back access to your account.</p>
              </div>

              <!-- OTP Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 28px 20px; text-align: center; margin-bottom: 32px;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 12px;">
                  Your Verification Code
                </p>
                <div style="font-size: 38px; font-weight: 800; color: #3b82f6; letter-spacing: 4px; white-space: nowrap; font-family: monospace;">
                  ${otp}
                </div>
              </div>

              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 32px;">
                <p style="margin: 0; color: #b45309; font-size: 14px; font-weight: 500; line-height: 1.5;">
                  <strong style="font-weight: 700;">Note:</strong> This code is sensitive and expires in exactly <strong>10 minutes</strong>. Do not share it.
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                Didn't request this change? You can safely ignore this email. Your dashboard security is fully intact.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0; font-weight: 500;">
                © ${new Date().getFullYear()} ICM System Intelligent Platform. Powered by AI.
              </p>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `,
  });
}

export async function sendVerificationEmail(email, otp) {
  await transporter.sendMail({
    from: `"ICM System Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🎓 Verify Your ICM System Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        </style>
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 40px 16px; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04); overflow: hidden; border: 1px solid #e2e8f0;">

          <!-- Top decorative line -->
          <tr>
            <td style="height: 6px; width: 100%; background: linear-gradient(90deg, #10b981, #3b82f6, #6366f1);"></td>
          </tr>
          
          <tr>
            <td style="padding: 48px 40px;">
              <!-- Logo area -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="background: linear-gradient(135deg, #ecfdf5, #eff6ff); width: 64px; height: 64px; border-radius: 18px; display: inline-block; text-align: center; line-height: 64px; font-size: 32px; border: 1px solid #d1fae5; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);">
                   🛡️
                </div>
              </div>

              <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px; text-align: center; letter-spacing: -0.02em;">
                Verify Your Account
              </h1>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 32px; text-align: center; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
                ICM System Learning Platform
              </p>

              <div style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                <p style="margin-top: 0;">Hello,</p>
                <p>Welcome to our educational network. To complete your identity verification and unlock all platform features, please use the OTP code below.</p>
              </div>

              <!-- OTP Box -->
              <div style="background-color: #f0fdf4; border: 2px dashed #bbf7d0; border-radius: 16px; padding: 28px 20px; text-align: center; margin-bottom: 32px;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 12px;">
                  Your Verification Code
                </p>
                <div style="font-size: 38px; font-weight: 800; color: #059669; letter-spacing: 4px; white-space: nowrap; font-family: monospace;">
                  ${otp}
                </div>
              </div>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 32px;">
                <p style="margin: 0; color: #1d4ed8; font-size: 14px; font-weight: 500; line-height: 1.5;">
                  <strong style="font-weight: 700;">Tip:</strong> Verifying your account ensures you can access certificates and advanced modules.
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                Didn't create an account with us? You can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0; font-weight: 500;">
                © ${new Date().getFullYear()} ICM System Intelligent Platform.
              </p>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `,
  });
}

export async function sendEnable2FAEmail(email, otp) {
  await transporter.sendMail({
    from: `"ICM System Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🔐 Code to Enable Two-Factor Authentication',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        </style>
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 40px 16px; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04); overflow: hidden; border: 1px solid #e2e8f0;">

          <!-- Top decorative line -->
          <tr>
            <td style="height: 6px; width: 100%; background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);"></td>
          </tr>
          
          <tr>
            <td style="padding: 48px 40px;">
              <!-- Logo area -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="background: linear-gradient(135deg, #f5f3ff, #faf5ff); width: 64px; height: 64px; border-radius: 18px; display: inline-block; text-align: center; line-height: 64px; font-size: 32px; border: 1px solid #ddd6fe; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.08);">
                   🛡️
                </div>
              </div>

              <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px; text-align: center; letter-spacing: -0.02em;">
                Enable 2FA Security
              </h1>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 32px; text-align: center; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
                ICM System Learning Platform
              </p>

              <div style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                <p style="margin-top: 0;">Hello,</p>
                <p>You have requested to enable Two-Factor Authentication (2FA) for your account. Please use the activation code below to confirm this security upgrade.</p>
              </div>

              <!-- OTP Box -->
              <div style="background-color: #fdf2f8; border: 2px dashed #fbcfe8; border-radius: 16px; padding: 28px 20px; text-align: center; margin-bottom: 32px;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 12px;">
                  Your Activation Code
                </p>
                <div style="font-size: 38px; font-weight: 800; color: #db2777; letter-spacing: 4px; white-space: nowrap; font-family: monospace;">
                  ${otp}
                </div>
              </div>

              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 32px;">
                <p style="margin: 0; color: #0369a1; font-size: 14px; font-weight: 500; line-height: 1.5;">
                  <strong style="font-weight: 700;">Important:</strong> Enabling 2FA adds a powerful layer of protection against unauthorized access to your academic data.
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                Didn't request this? Please ignore this message and ensure your password remains private.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0; font-weight: 500;">
                © ${new Date().getFullYear()} ICM System Intelligent Platform.
              </p>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `,
  });
}

export async function send2FAEmail(email, otp) {
  await transporter.sendMail({
    from: `"ICM System Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🔐 Your Login Verification OTP',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        </style>
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 40px 16px; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04); overflow: hidden; border: 1px solid #e2e8f0;">

          <!-- Top decorative line -->
          <tr>
            <td style="height: 6px; width: 100%; background: linear-gradient(90deg, #6366f1, #4f46e5, #4338ca);"></td>
          </tr>
          
          <tr>
            <td style="padding: 48px 40px;">
              <!-- Logo area -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="background: linear-gradient(135deg, #eef2ff, #e0e7ff); width: 64px; height: 64px; border-radius: 18px; display: inline-block; text-align: center; line-height: 64px; font-size: 32px; border: 1px solid #c7d2fe; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.08);">
                   🔐
                </div>
              </div>

              <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px; text-align: center; letter-spacing: -0.02em;">
                Login Verification
              </h1>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 32px; text-align: center; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
                ICM System Learning Platform
              </p>

              <div style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                <p style="margin-top: 0;">Hello,</p>
                <p>We've detected a sign-in attempt on your platform account. Please use the secure code below to complete your login process.</p>
              </div>

              <!-- OTP Box -->
              <div style="background-color: #f5f3ff; border: 2px dashed #ddd6fe; border-radius: 16px; padding: 28px 20px; text-align: center; margin-bottom: 32px;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 12px;">
                  Your Secure Key
                </p>
                <div style="font-size: 38px; font-weight: 800; color: #4f46e5; letter-spacing: 4px; white-space: nowrap; font-family: monospace;">
                  ${otp}
                </div>
              </div>

              <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 32px;">
                <p style="margin: 0; color: #be123c; font-size: 14px; font-weight: 500; line-height: 1.5;">
                  <strong style="font-weight: 700;">Security Check:</strong> This code was generated for your current sign-in. Never share this code with anyone.
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                Not you? We recommend changing your password immediately.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0; font-weight: 500;">
                © ${new Date().getFullYear()} ICM System Intelligent Platform.
              </p>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `,
  });
}

export async function sendDisable2FAEmail(email, otp) {
  await transporter.sendMail({
    from: `"ICM System Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '⚠️ Important: Code to Disable Two-Factor Authentication',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        </style>
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 40px 16px; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04); overflow: hidden; border: 1px solid #e2e8f0;">

          <!-- Top decorative line -->
          <tr>
            <td style="height: 6px; width: 100%; background: linear-gradient(90deg, #f43f5e, #f97316, #fbbf24);"></td>
          </tr>
          
          <tr>
            <td style="padding: 48px 40px;">
              <!-- Logo area -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="background: linear-gradient(135deg, #fff1f2, #fff7ed); width: 64px; height: 64px; border-radius: 18px; display: inline-block; text-align: center; line-height: 64px; font-size: 32px; border: 1px solid #fecaca; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.08);">
                   🔓
                </div>
              </div>

              <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px; text-align: center; letter-spacing: -0.02em;">
                Disable 2FA Security
              </h1>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 32px; text-align: center; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
                ICM System Learning Platform
              </p>

              <div style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                <p style="margin-top: 0;">Hello,</p>
                <p>A request was made to disable Two-Factor Authentication (2FA) on your account. Because this reduces your security level, we require your confirmation to proceed.</p>
              </div>

              <!-- OTP Box -->
              <div style="background-color: #fff1f2; border: 2px dashed #fecade; border-radius: 16px; padding: 28px 20px; text-align: center; margin-bottom: 32px;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 12px;">
                  Authorisation Code
                </p>
                <div style="font-size: 38px; font-weight: 800; color: #e11d48; letter-spacing: 4px; white-space: nowrap; font-family: monospace;">
                  ${otp}
                </div>
              </div>

              <div style="background-color: #fef2f2; border-left: 4px solid #f87171; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 32px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 500; line-height: 1.5;">
                  <strong style="font-weight: 700;">Security Warning:</strong> By disabling 2FA, your account becomes more vulnerable to unauthorized access. We strongly recommend keeping it active.
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                Not made by you? Please change your password and keep 2FA enabled to protect your academic records.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0; font-weight: 500;">
                © ${new Date().getFullYear()} ICM System Intelligent Platform.
              </p>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `,
  });
}

export async function sendEmailChangeAuthEmail(toEmail, otp, newEmail) {
  await transporter.sendMail({
    from: `"ICM System Platform" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '⚠️ Authorize Your ICM Account Email Change',
    html: `
      <!DOCTYPE html><html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family:'Inter',-apple-system,sans-serif;background:#f1f5f9;margin:0;padding:40px 16px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;box-shadow:0 12px 32px rgba(15,23,42,0.06);overflow:hidden;border:1px solid #e2e8f0;">
          <tr><td style="height:6px;background:linear-gradient(90deg,#f59e0b,#eab308,#ca8a04);"></td></tr>
          <tr><td style="padding:48px 40px;">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="background:#fefce8;width:64px;height:64px;border-radius:18px;display:inline-block;text-align:center;line-height:64px;font-size:28px;border:1px solid #fde68a;">✉️</div>
            </div>
            <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;text-align:center;">Email Change Request</h1>
            <p style="color:#64748b;font-size:13px;margin:0 0 28px;text-align:center;text-transform:uppercase;letter-spacing:0.06em;">ICM System Learning Platform</p>
            <p style="color:#334155;font-size:15px;line-height:1.6;margin-bottom:8px;">Hello,</p>
            <p style="color:#334155;font-size:15px;line-height:1.6;margin-bottom:28px;">We received a request to change your account email to <strong style="color:#0f172a;">${newEmail}</strong>. Use the code below to authorize this change. It expires in <strong>10 minutes</strong>.</p>
            <div style="background:#fefce8;border:2px dashed #fef08a;border-radius:16px;padding:28px 20px;text-align:center;margin-bottom:28px;">
              <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;">Authorization Code</p>
              <div style="font-size:38px;font-weight:800;color:#ca8a04;letter-spacing:6px;font-family:monospace;">${otp}</div>
            </div>
            <div style="background:#fef2f2;border-left:4px solid #f87171;padding:14px 16px;border-radius:4px 8px 8px 4px;margin-bottom:24px;">
              <p style="margin:0;color:#991b1b;font-size:13px;font-weight:500;line-height:1.5;"><strong>Security Warning:</strong> If you did not request this, someone may have unauthorized access to your account. Please change your password immediately.</p>
            </div>
            <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;border-top:1px solid #e2e8f0;padding-top:20px;">Once verified, your account email will be changed from ${toEmail} to ${newEmail}.</p>
          </td></tr>
          <tr><td style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#64748b;font-size:12px;margin:0;">© ${new Date().getFullYear()} ICM System Intelligence Platform.</p>
          </td></tr>
        </table>
      </body></html>
    `,
  });
}

export async function sendNotificationEmail(email, title, message, userName = 'Student') {
  // Extract emoji if present to use as icon
  const emojiMatch = title.match(/[\u{1F300}-\u{1F6FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2300}-\u{23FF}\u{1F1E6}-\u{1F1FF}]/u);
  const icon = emojiMatch ? emojiMatch[0] : '🔔';
  const cleanTitle = title.replace(/[\u{1F300}-\u{1F6FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2300}-\u{23FF}\u{1F1E6}-\u{1F1FF}]/ug, '').trim();

  await transporter.sendMail({
    from: `"ICM System Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: title,
    html: `
      <!DOCTYPE html><html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family:'Inter',-apple-system,sans-serif;background:#f1f5f9;margin:0;padding:40px 16px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;box-shadow:0 12px 32px rgba(15,23,42,0.06);overflow:hidden;border:1px solid #e2e8f0;">
          <tr><td style="height:6px;background:linear-gradient(90deg,#0ea5e9,#3b82f6,#6366f1);"></td></tr>
          <tr><td style="padding:48px 40px;">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="background:#f0f9ff;width:64px;height:64px;border-radius:18px;display:inline-block;text-align:center;line-height:64px;font-size:28px;border:1px solid #bae6fd;">${icon}</div>
            </div>
            <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;text-align:center;">${cleanTitle}</h1>
            <p style="color: #64748b; font-size: 13px; margin: 0 0 28px; text-align: center; text-transform: uppercase; letter-spacing: 0.06em;">ICM System Notification</p>
            <p style="color:#334155;font-size:15px;line-height:1.6;margin-bottom:8px;">Hello ${userName},</p>
            <div style="background:#f8fafc;border-left:4px solid #3b82f6;padding:16px 20px;border-radius:4px 8px 8px 4px;margin-bottom:28px;margin-top:20px;">
              <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:0;">${message}</p>
            </div>
          </td></tr>
          <tr><td style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#64748b;font-size:12px;margin:0;margin-bottom:8px;">You're receiving this because of your notification settings.</p>
            <p style="color:#94a3b8;font-size:11px;margin:0;">© ${new Date().getFullYear()} ICM System Intelligence Platform.</p>
          </td></tr>
        </table>
      </body></html>
    `,
  });
}
export async function sendCertificateEmail(email, userName, courseTitle, certId, certUrl, pdfBase64 = null) {
  const attachments = [];
  if (pdfBase64) {
    console.log(`[Mailer] Attaching certificate PDF: ${pdfBase64.length} chars`);
    attachments.push({
      filename: `Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`,
      content: pdfBase64,
      encoding: 'base64',
      contentType: 'application/pdf'
    });
  }

  await transporter.sendMail({
    from: `"ICM System Certificates" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🎓 Congratulations! Your Certificate for ${courseTitle}`,
    attachments,
    html: `
      <!DOCTYPE html><html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family:'Inter',-apple-system,sans-serif;background:#f1f5f9;margin:0;padding:40px 16px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;box-shadow:0 12px 32px rgba(15,23,42,0.06);overflow:hidden;border:1px solid #e2e8f0;">
          <tr><td style="height:6px;background:linear-gradient(90deg,#4f46e5,#8b5cf6,#ec4899);"></td></tr>
          <tr><td style="padding:48px 40px;">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="background:#f5f3ff;width:64px;height:64px;border-radius:18px;display:inline-block;text-align:center;line-height:64px;font-size:28px;border:1px solid #ddd6fe;">🎓</div>
            </div>
            <h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 4px;text-align:center;">Course Completed!</h1>
            <p style="color:#64748b;font-size:13px;margin:0 0 28px;text-align:center;text-transform:uppercase;letter-spacing:0.06em;">Official Certificate of Achievement</p>
            
            <p style="color:#334155;font-size:16px;line-height:1.6;margin-bottom:20px;">Hello <strong>${userName}</strong>,</p>
            <p style="color:#334155;font-size:16px;line-height:1.6;margin-bottom:24px;">Incredible work! You have officially conquered all modules and quizzes for <strong>${courseTitle}</strong>. Your persistence and dedication have earned you this professional certification.</p>
            
            <div style="background:#f8fafc;border-radius:16px;padding:24px;text-align:center;margin-bottom:32px;border:1px solid #e2e8f0;">
              <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;margin:0 0 12px;">Certificate ID</p>
              <div style="font-size:20px;font-weight:800;color:#4f46e5;letter-spacing:1px;font-family:monospace;">${certId}</div>
            </div>
            
            <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin-top:40px;text-align:center;">This certificate remains valid and can be verified through the ICM System platform at any time.</p>
          </td></tr>
          <tr><td style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#64748b;font-size:12px;margin:0;">© ${new Date().getFullYear()} ICM System Education Platform.</p>
          </td></tr>
        </table>
      </body></html>
    `,
  });
}

export async function sendAnalyticsReportEmail(email, userName, stats, pdfBase64 = null) {
  const attachments = [];
  if (pdfBase64) {
    console.log(`[Mailer] Attaching analytics report PDF: ${pdfBase64.length} chars`);
    attachments.push({
      filename: `ICM_System_Official_Report_${new Date().getFullYear()}.pdf`,
      content: pdfBase64,
      encoding: 'base64',
      contentType: 'application/pdf'
    });
  }

  await transporter.sendMail({
    from: `"ICM System Insights" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `📊 Your Learning Analytics & Progress Report`,
    attachments,
    html: `
      <!DOCTYPE html><html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family:'Inter',-apple-system,sans-serif;background:#f1f5f9;margin:0;padding:40px 16px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:24px;box-shadow:0 12px 32px rgba(15,23,42,0.06);overflow:hidden;border:1px solid #e2e8f0;">
          <tr><td style="height:6px;background:linear-gradient(90deg,#10b981,#3b82f6,#6366f1);"></td></tr>
          <tr><td style="padding:48px 40px;">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="background:#f0f9ff;width:64px;height:64px;border-radius:18px;display:inline-block;text-align:center;line-height:64px;font-size:28px;border:1px solid #bae6fd;">📈</div>
            </div>
            <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;text-align:center;">Learning Analytics Report</h1>
            <p style="color:#64748b;font-size:13px;margin:0 0 32px;text-align:center;text-transform:uppercase;letter-spacing:0.06em;">ICM System Insights</p>
            
            <p style="color:#334155;font-size:15px;line-height:1.6;margin-bottom:24px;">Hello <strong>${userName}</strong>, here is a detailed breakdown of your academic progress and engagement on the platform.</p>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td width="50%" style="padding:10px;">
                  <div style="background:#f8fafc;padding:20px;border-radius:16px;text-align:center;border:1px solid #e2e8f0;">
                    <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Average Score</div>
                    <div style="font-size:24px;font-weight:800;color:#10b981;">${stats.avgScore}%</div>
                  </div>
                </td>
                <td width="50%" style="padding:10px;">
                  <div style="background:#f8fafc;padding:20px;border-radius:16px;text-align:center;border:1px solid #e2e8f0;">
                    <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Modules Done</div>
                    <div style="font-size:24px;font-weight:800;color:#3b82f6;">${stats.completedModules}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td width="100%" colspan="2" style="padding:10px;">
                  <div style="background:#f8fafc;padding:20px;border-radius:16px;text-align:center;border:1px solid #e2e8f0;">
                    <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Total Points Earned</div>
                    <div style="font-size:24px;font-weight:800;color:#4f46e5;">${stats.points}</div>
                  </div>
                </td>
              </tr>
            </table>

            <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:16px 20px;border-radius:4px 8px 8px 4px;margin-bottom:32px;">
              <p style="margin:0;color:#065f46;font-size:14px;font-weight:500;line-height:1.5;"><strong>Expert Analysis:</strong> You are performing <strong>${stats.avgScore > 80 ? 'exceptionally well' : 'stably'}</strong>. To further accelerate your learning, we recommend exploring more advanced subject categories.</p>
            </div>
          </td></tr>
          <tr><td style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#64748b;font-size:11px;margin:0;">This report is automatically generated based on your platform activity. © ${new Date().getFullYear()} ICM System Intelligence.</p>
          </td></tr>
        </table>
      </body></html>
    `,
  });
}

export async function sendWelcomeEmail(email, userName) {
  await transporter.sendMail({
    from: `"ICM System Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🎓 Welcome to your ICM System Learning Journey!',
    html: `
      <!DOCTYPE html><html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family:'Inter',-apple-system,sans-serif;background:#f8fafc;margin:0;padding:40px 16px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:24px;box-shadow:0 20px 48px rgba(15,23,42,0.08);overflow:hidden;border:1px solid #e2e8f0;">
          <tr><td style="height:8px;background:linear-gradient(90deg,#4f46e5,#8b5cf6,#ec4899);"></td></tr>
          <tr><td style="padding:56px 48px;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="background:#eef2ff;width:72px;height:72px;border-radius:22px;display:inline-block;text-align:center;line-height:72px;font-size:36px;border:1px solid #e0e7ff;">🚀</div>
            </div>
            
            <h1 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 8px;text-align:center;letter-spacing:-0.02em;">Welcome to ICM System, ${userName}!</h1>
            <p style="color:#64748b;font-size:15px;margin:0 0 40px;text-align:center;font-weight:500;">Your high-fidelity journey to mastery begins today.</p>
            
            <div style="color:#334155;font-size:16px;line-height:1.7;margin-bottom:40px;">
              <p>We're thrilled to have you here. ICM System is more than just a course platform — it's an intelligent learning environment designed to help you analyze your progress and achieve professional-grade results.</p>
              
              <div style="margin-top:32px;background:#f1f5f9;border-radius:20px;padding:24px;">
                <h3 style="margin:0 0 16px;font-size:14px;color:#4f46e5;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #e2e8f0;padding-bottom:12px;">Where to start?</h3>
                <table width="100%">
                  <tr>
                    <td width="40" valign="top" style="font-size:20px;padding-top:4px;">📚</td>
                    <td style="padding-bottom:16px;"><strong>Course Library</strong><br/><span style="font-size:13px;color:#64748b;">Browse professional courses across diverse categories.</span></td>
                  </tr>
                  <tr>
                    <td width="40" valign="top" style="font-size:20px;padding-top:4px;">🛤️</td>
                    <td style="padding-bottom:16px;"><strong>Dynamic Study Path</strong><br/><span style="font-size:13px;color:#64748b;">Follow a structured roadmap tailored to your goals.</span></td>
                  </tr>
                  <tr>
                    <td width="40" valign="top" style="font-size:20px;padding-top:4px;">🏆</td>
                    <td><strong>Achievement System</strong><br/><span style="font-size:13px;color:#64748b;">Unlock professional badges as you master new skills.</span></td>
                  </tr>
                </table>
              </div>
            </div>
          </td></tr>
          <tr><td style="background:#f8fafc;padding:32px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} ICM System Intelligent Learning. All rights reserved.</p>
          </td></tr>
        </table>
      </body></html>
    `,
  });
}
