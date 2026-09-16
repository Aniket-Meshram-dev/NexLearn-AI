interface MailAttachment {
  filename: string;
  content: string; // base64 string
  contentType?: string;
  encoding?: string;
}

interface SendMailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  senderName?: string;
  attachments?: MailAttachment[];
}

/**
 * Sends transactional email exclusively using Brevo (Sendinblue) v3 REST API.
 */
async function sendMailMessage({
  to,
  toName,
  subject,
  html,
  senderName,
  attachments,
}: SendMailOptions) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderDisplayName = senderName || process.env.BREVO_SENDER_NAME || 'NexLearn AI';

  if (!brevoApiKey || !brevoSenderEmail) {
    console.error('[Brevo Mailer] Missing BREVO_API_KEY or BREVO_SENDER_EMAIL environment variable. Email aborted for:', to);
    return null;
  }

  try {
    const payload: Record<string, any> = {
      sender: {
        name: senderDisplayName,
        email: brevoSenderEmail,
      },
      to: [
        toName ? { email: to, name: toName } : { email: to },
      ],
      subject,
      htmlContent: html,
    };

    if (attachments && attachments.length > 0) {
      payload.attachment = attachments.map((att) => ({
        name: att.filename,
        content: att.content.replace(/^data:[^;]+;base64,/, ''),
      }));
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Brevo Mailer Error]:', res.status, errorText);
      throw new Error(`Brevo HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log('[Brevo Mailer] Email dispatched successfully:', data.messageId || 'OK');
    return data;
  } catch (err) {
    console.error('[Brevo Mailer Exception]:', err);
    throw err;
  }
}

// --------------------------------------------------------------------------
// Clean Vector SVG Icons for Email Clients
// --------------------------------------------------------------------------
const ICONS = {
  key: (color = '#4F46E5', size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="m21 2-2 2m-1.5 1.5L14 9m-4-3 1.5 1.5M10 9a5 5 0 1 0-7 7 5 5 0 0 0 7-7Z"/>
      <path d="m15 5 4 4"/>
    </svg>`,
  shieldCheck: (color = '#10B981', size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>`,
  lock: (color = '#4F46E5', size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`,
  alertTriangle: (color = '#E11D48', size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>`,
  mail: (color = '#D97706', size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>`,
  graduationCap: (color = '#4F46E5', size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>`,
  barChart: (color = '#0284C7', size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <line x1="18" x2="18" y1="20" y2="10"/>
      <line x1="12" x2="12" y1="20" y2="4"/>
      <line x1="6" x2="6" y1="20" y2="14"/>
    </svg>`,
  sparkles: (color = '#4F46E5', size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>`,
  checkCircle: (color = '#10B981', size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>`,
  clock: (color = '#94A3B8', size = 13) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`,
  info: (color = '#3B82F6', size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>`,
  trophy: (color = '#F59E0B', size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>`,
  rocket: (color = '#4F46E5', size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>`,
  bell: (color = '#0284C7', size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>`,
};

/**
 * Base SaaS Email Layout Wrapper (Responsive Mobile / Tablet / PC)
 * Produces an ultra-clean, modern, SaaS-grade responsive email matching NexLearn UI
 */
function renderSaaSEmailLayout({
  badgeText,
  badgeBg = '#EEF2FF',
  badgeColor = '#4F46E5',
  badgeBorder = '#E0E7FF',
  iconSvg,
  iconBg = 'linear-gradient(135deg, #EEF2FF 0%, #EDE9FE 100%)',
  iconBorder = '#E0E7FF',
  title,
  subtitle,
  bodyHtml,
  ctaText,
  ctaUrl,
  footerExtra,
}: {
  badgeText?: string;
  badgeBg?: string;
  badgeColor?: string;
  badgeBorder?: string;
  iconSvg: string;
  iconBg?: string;
  iconBorder?: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerExtra?: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #F8FAFC !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      -webkit-font-smoothing: antialiased !important;
      -webkit-text-size-adjust: 100% !important;
    }
    table {
      border-collapse: collapse !important;
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }
    h1, h2, h3, .brand-title {
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }
    img {
      border: 0 !important;
      outline: none !important;
      text-decoration: none !important;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
        border: none !important;
      }
      .email-content {
        padding: 32px 20px !important;
      }
      .email-footer {
        padding: 24px 20px !important;
      }
      .otp-code {
        font-size: 30px !important;
        letter-spacing: 4px !important;
      }
      .kpi-col {
        display: block !important;
        width: 100% !important;
        margin-bottom: 12px !important;
        padding: 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 40px 12px; background-color: #F1F5F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 0 auto;">
    
    <!-- Outer Card Container -->
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08);">
          
          <!-- Top Cyber Radiant Accent Bar -->
          <tr>
            <td style="height: 6px; width: 100%; background: linear-gradient(90deg, #4F46E5 0%, #8B5CF6 35%, #EC4899 70%, #06B6D4 100%);"></td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td class="email-content" style="padding: 44px 40px 36px;">
              
              <!-- NexLearn Brand Header -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Geometric Book Logo Mark -->
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <div style="width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); text-align: center; line-height: 34px; font-size: 16px; color: #FFFFFF; font-weight: 800; box-shadow: 0 6px 14px rgba(79, 70, 229, 0.3);">
                            N
                          </div>
                        </td>
                        <!-- NexLearn Typography -->
                        <td style="vertical-align: middle;">
                          <span class="brand-title" style="font-size: 21px; font-weight: 800; color: #0F172A; letter-spacing: -0.03em;">NexLearn</span>
                        </td>
                        <!-- AI Pill Badge -->
                        <td style="vertical-align: middle; padding-left: 8px;">
                          <span style="background: linear-gradient(135deg, #4F46E5, #8B5CF6); color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.06em; vertical-align: middle; display: inline-block;">AI</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Hero Category Badge (Optional) -->
              ${badgeText ? `
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 14px; border-radius: 9999px;">
                  ${badgeText}
                </span>
              </div>
              ` : ''}

              <!-- Icon Avatar Circle (Clean SVG Container) -->
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 64px; height: 64px; border-radius: 20px; background: ${iconBg}; border: 1px solid ${iconBorder}; display: inline-flex; align-items: center; justify-content: center; text-align: center; line-height: 64px; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.14);">
                  ${iconSvg}
                </div>
              </div>

              <!-- Main Heading -->
              <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 8px; text-align: center; letter-spacing: -0.025em; line-height: 1.3;">
                ${title}
              </h1>

              <!-- Subtitle -->
              <p style="color: #64748B; font-size: 14px; margin: 0 0 28px; text-align: center; font-weight: 500; line-height: 1.55;">
                ${subtitle}
              </p>

              <!-- Dynamic Body HTML -->
              <div style="color: #334155; font-size: 15px; line-height: 1.65;">
                ${bodyHtml}
              </div>

              <!-- Primary CTA Button (Optional) -->
              ${ctaText && ctaUrl ? `
              <div style="text-align: center; margin: 32px 0 20px;">
                <a href="${ctaUrl}" style="background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); color: #FFFFFF; padding: 14px 34px; border-radius: 12px; font-size: 15px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 8px 22px -4px rgba(79, 70, 229, 0.4); letter-spacing: 0.01em;">
                  ${ctaText} &rarr;
                </a>
              </div>
              ` : ''}

            </td>
          </tr>

          <!-- SaaS Footer -->
          <tr>
            <td class="email-footer" style="background-color: #F8FAFC; padding: 30px 40px; text-align: center; border-top: 1px solid #E2E8F0;">
              
              <!-- Navigation Links -->
              <div style="margin-bottom: 14px;">
                <a href="${baseUrl}/dashboard" style="color: #64748B; font-size: 12px; font-weight: 600; text-decoration: none; margin: 0 10px;">Dashboard</a>
                <span style="color: #CBD5E1;">&bull;</span>
                <a href="${baseUrl}/settings" style="color: #64748B; font-size: 12px; font-weight: 600; text-decoration: none; margin: 0 10px;">Security</a>
                <span style="color: #CBD5E1;">&bull;</span>
                <a href="${baseUrl}/discover" style="color: #64748B; font-size: 12px; font-weight: 600; text-decoration: none; margin: 0 10px;">Courses</a>
              </div>

              ${footerExtra ? `
              <p style="color: #94A3B8; font-size: 12px; margin: 0 0 10px; line-height: 1.5;">
                ${footerExtra}
              </p>
              ` : ''}

              <p style="color: #94A3B8; font-size: 11px; margin: 0 0 4px; line-height: 1.5;">
                Encrypted &bull; Autonomous AI Course Synthesizer &bull; Zero-Trust Architecture
              </p>

              <p style="color: #CBD5E1; font-size: 11px; margin: 0;">
                &copy; ${currentYear} NexLearn AI Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Reusable Responsive OTP Display Box
 */
function renderOtpBox(
  otp: string,
  label = 'One-Time Verification Code',
  accentColor = '#4F46E5',
  bgTint = '#F8FAFC',
  borderTint = '#E2E8F0'
) {
  return `
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td align="center" style="background-color: ${bgTint}; border: 2px dashed ${borderTint}; border-radius: 18px; padding: 24px 16px;">
          <div style="color: #64748B; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 10px;">
            ${label}
          </div>
          <div class="otp-code" style="font-size: 36px; font-weight: 800; color: ${accentColor}; letter-spacing: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Fira Code', monospace; line-height: 1.1; margin: 0;">
            ${otp}
          </div>
          <div style="margin-top: 12px; font-size: 12px; color: #94A3B8; font-weight: 500;">
            ${ICONS.clock('#94A3B8', 13)} <span style="vertical-align: middle; margin-left: 4px;">Expires in 10 minutes &bull; Single-use authorization</span>
          </div>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Reusable Alert Callout Box with Inline SVGs
 */
function renderAlertBox(
  title: string,
  message: string,
  type: 'warning' | 'info' | 'danger' | 'success' = 'info'
) {
  const styles = {
    info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', icon: ICONS.info('#3B82F6', 16) },
    warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#B45309', icon: ICONS.alertTriangle('#F59E0B', 16) },
    danger: { bg: '#FFF1F2', border: '#F43F5E', text: '#9F1239', icon: ICONS.alertTriangle('#F43F5E', 16) },
    success: { bg: '#ECFDF5', border: '#10B981', text: '#065F46', icon: ICONS.checkCircle('#10B981', 16) },
  }[type];

  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${styles.bg}; border-left: 4px solid ${styles.border}; border-radius: 6px 14px 14px 6px; margin: 20px 0;">
      <tr>
        <td style="padding: 14px 18px;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: top; padding-right: 10px;">
                ${styles.icon}
              </td>
              <td style="color: ${styles.text}; font-size: 13px; font-weight: 500; line-height: 1.55;">
                <strong style="font-weight: 700;">${title}:</strong> ${message}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

// --------------------------------------------------------------------------
// 1. Password Reset OTP Email
// --------------------------------------------------------------------------
export async function sendOTPEmail(email: string, otp: string) {
  const html = renderSaaSEmailLayout({
    badgeText: 'Account Security',
    badgeBg: '#EEF2FF',
    badgeColor: '#4F46E5',
    iconSvg: ICONS.key('#4F46E5', 28),
    title: 'Reset Your Password',
    subtitle: 'Secure authorization requested for your NexLearn account',
    bodyHtml: `
      <p style="margin-top: 0;">Hello,</p>
      <p>We received a request to securely reset the password for your NexLearn account. Enter the verification key below to choose a new password.</p>
      
      ${renderOtpBox(otp, 'Your Password Reset Key', '#4F46E5', '#F5F3FF', '#DDD6FE')}

      ${renderAlertBox('Security Notice', 'This code expires in exactly 10 minutes. If you did not request a password reset, your account is completely safe and no action is required.', 'warning')}

      <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid #E2E8F0; padding-top: 20px;">
        For your protection, never forward or share this code with anyone. NexLearn support will never ask for your verification code.
      </p>
    `,
    footerExtra: 'You are receiving this security notification because a password change was requested.',
  });

  return await sendMailMessage({
    to: email,
    subject: '[NexLearn Security] Reset Your Password',
    html,
  });
}

// --------------------------------------------------------------------------
// 2. Account Registration Verification OTP
// --------------------------------------------------------------------------
export async function sendVerificationEmail(email: string, otp: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const html = renderSaaSEmailLayout({
    badgeText: 'Welcome to NexLearn',
    badgeBg: '#ECFDF5',
    badgeColor: '#059669',
    badgeBorder: '#A7F3D0',
    iconSvg: ICONS.shieldCheck('#059669', 28),
    iconBg: 'linear-gradient(135deg, #ECFDF5 0%, #EFF6FF 100%)',
    iconBorder: '#A7F3D0',
    title: 'Verify Your Email Address',
    subtitle: 'Activate your autonomous AI course synthesizer',
    bodyHtml: `
      <p style="margin-top: 0;">Hello,</p>
      <p>Welcome to <strong>NexLearn AI</strong>! You're one step away from synthesizing personalized courses, engaging with your real-time AI mentor, and earning verified credentials.</p>
      
      ${renderOtpBox(otp, 'Your Account Activation Code', '#059669', '#F0FDF4', '#BBF7D0')}

      ${renderAlertBox('Instant Access', 'Verifying your email unlocks your full course workspace, mind map visualizers, and cloud progress sync across all your devices.', 'success')}

      <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid #E2E8F0; padding-top: 20px;">
        Didn't create an account with NexLearn? You can safely disregard this email.
      </p>
    `,
    ctaText: 'Open Verification Portal',
    ctaUrl: `${baseUrl}/verify-account?email=${encodeURIComponent(email)}`,
  });

  return await sendMailMessage({
    to: email,
    subject: '[NexLearn Verification] Activate Your Account',
    html,
  });
}

// --------------------------------------------------------------------------
// 3. Enable 2FA Security Code
// --------------------------------------------------------------------------
export async function sendEnable2FAEmail(email: string, otp: string) {
  const html = renderSaaSEmailLayout({
    badgeText: 'Security Upgrade',
    badgeBg: '#F5F3FF',
    badgeColor: '#7C3AED',
    badgeBorder: '#DDD6FE',
    iconSvg: ICONS.shieldCheck('#7C3AED', 28),
    iconBg: 'linear-gradient(135deg, #F5F3FF 0%, #FAF5FF 100%)',
    iconBorder: '#DDD6FE',
    title: 'Enable Two-Factor Authentication',
    subtitle: 'Authorize two-step verification for your workspace',
    bodyHtml: `
      <p style="margin-top: 0;">Hello,</p>
      <p>You have requested to activate Two-Factor Authentication (2FA) on your NexLearn account. Enter the verification code below to confirm and activate this upgrade.</p>
      
      ${renderOtpBox(otp, '2FA Activation Code', '#7C3AED', '#FAF5FF', '#E9D5FF')}

      ${renderAlertBox('Enterprise Grade Protection', 'With 2FA enabled, each sign-in requires both your password and a unique security code delivered to your verified email.', 'info')}

      <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid #E2E8F0; padding-top: 20px;">
        If you did not initiate this security change, please change your password immediately in your account settings.
      </p>
    `,
  });

  return await sendMailMessage({
    to: email,
    subject: '[NexLearn 2FA] Code to Enable Two-Factor Authentication',
    html,
  });
}

// --------------------------------------------------------------------------
// 4. Login 2FA Verification OTP
// --------------------------------------------------------------------------
export async function send2FAEmail(email: string, otp: string) {
  const html = renderSaaSEmailLayout({
    badgeText: 'Two-Factor Challenge',
    badgeBg: '#EEF2FF',
    badgeColor: '#4F46E5',
    iconSvg: ICONS.lock('#4F46E5', 28),
    title: 'Login Verification Code',
    subtitle: 'Sign-in attempt detected on your account',
    bodyHtml: `
      <p style="margin-top: 0;">Hello,</p>
      <p>A sign-in attempt was detected for your NexLearn account. Please use the secure authorization key below to complete your login.</p>
      
      ${renderOtpBox(otp, 'Your Login Security Key', '#4F46E5', '#EEF2FF', '#C7D2FE')}

      ${renderAlertBox('Security Check', 'Never share this code with anyone. NexLearn engineers and staff will never ask for your 2FA code.', 'danger')}

      <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid #E2E8F0; padding-top: 20px;">
        If this was not you, we recommend locking down your credentials immediately and resetting your master password.
      </p>
    `,
  });

  return await sendMailMessage({
    to: email,
    subject: '[NexLearn 2FA] Login Verification Code',
    html,
  });
}

// --------------------------------------------------------------------------
// 5. Disable 2FA Security Code
// --------------------------------------------------------------------------
export async function sendDisable2FAEmail(email: string, otp: string) {
  const html = renderSaaSEmailLayout({
    badgeText: 'Critical Security Alert',
    badgeBg: '#FFF1F2',
    badgeColor: '#E11D48',
    badgeBorder: '#FECDD3',
    iconSvg: ICONS.alertTriangle('#E11D48', 26),
    iconBg: 'linear-gradient(135deg, #FFF1F2 0%, #FFF7ED 100%)',
    iconBorder: '#FECDD3',
    title: 'Disable Two-Factor Authentication',
    subtitle: 'Confirmation required to reduce account security',
    bodyHtml: `
      <p style="margin-top: 0;">Hello,</p>
      <p>A request was submitted to turn off Two-Factor Authentication (2FA) for your NexLearn account. Because this lowers your security shield, your confirmation is required.</p>
      
      ${renderOtpBox(otp, 'Deactivation Authorization Code', '#E11D48', '#FFF1F2', '#FECDD3')}

      ${renderAlertBox('Security Warning', 'Disabling 2FA makes your account significantly more vulnerable to unauthorized access and credential compromise.', 'danger')}

      <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid #E2E8F0; padding-top: 20px;">
        If you did not request this, someone may be attempting to access your account. Reject this code and update your password immediately.
      </p>
    `,
  });

  return await sendMailMessage({
    to: email,
    subject: '[NexLearn Alert] Code to Disable Two-Factor Authentication',
    html,
  });
}

// --------------------------------------------------------------------------
// 6. Email Change Authorization Code
// --------------------------------------------------------------------------
export async function sendEmailChangeAuthEmail(toEmail: string, otp: string, newEmail: string) {
  const html = renderSaaSEmailLayout({
    badgeText: 'Account Transfer',
    badgeBg: '#FEF3C7',
    badgeColor: '#D97706',
    badgeBorder: '#FDE68A',
    iconSvg: ICONS.mail('#D97706', 28),
    iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
    iconBorder: '#FDE68A',
    title: 'Authorize Email Change',
    subtitle: 'Confirm transition to your new email address',
    bodyHtml: `
      <p style="margin-top: 0;">Hello,</p>
      <p>We received a formal request to update your primary NexLearn account email from <strong>${toEmail}</strong> to <strong style="color: #0F172A;">${newEmail}</strong>.</p>
      
      ${renderOtpBox(otp, 'Email Transfer Authorization Key', '#D97706', '#FEFCE8', '#FEF08A')}

      ${renderAlertBox('Account Migration', 'Once approved, all future course notifications, certificates, and security alerts will be directed exclusively to your new email.', 'warning')}

      <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid #E2E8F0; padding-top: 20px;">
        If you did not initiate this transfer, change your password immediately to secure your learning catalog.
      </p>
    `,
  });

  return await sendMailMessage({
    to: toEmail,
    subject: '[NexLearn Security] Authorize Account Email Change',
    html,
  });
}

// --------------------------------------------------------------------------
// 7. General Notification Email
// --------------------------------------------------------------------------
export async function sendNotificationEmail(email: string, title: string, message: string, userName = 'Student') {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const cleanTitle = title.replace(/[\u{1F300}-\u{1F6FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2300}-\u{23FF}\u{1F1E6}-\u{1F1FF}]/ug, '').trim();

  const html = renderSaaSEmailLayout({
    badgeText: 'Workspace Activity',
    badgeBg: '#F0F9FF',
    badgeColor: '#0284C7',
    badgeBorder: '#BAE6FD',
    iconSvg: ICONS.bell('#0284C7', 28),
    title: cleanTitle || 'New Learning Notification',
    subtitle: 'Important update regarding your active courses and milestones',
    bodyHtml: `
      <p style="margin-top: 0;">Hello <strong>${userName}</strong>,</p>
      
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #4F46E5; padding: 20px 24px; border-radius: 8px 16px 16px 8px; margin: 24px 0;">
        <p style="color: #1E293B; font-size: 15px; line-height: 1.65; margin: 0;">
          ${message}
        </p>
      </div>

      <p style="color: #64748B; font-size: 14px; line-height: 1.6;">
        Jump back into your dashboard to continue your learning streak, test new modules, or review active flashcards.
      </p>
    `,
    ctaText: 'Open Workspace Dashboard',
    ctaUrl: `${baseUrl}/dashboard`,
  });

  return await sendMailMessage({
    to: email,
    toName: userName,
    subject: `[NexLearn Notification] ${cleanTitle || 'New Learning Activity'}`,
    html,
  });
}

// --------------------------------------------------------------------------
// 8. Certificate of Achievement Email
// --------------------------------------------------------------------------
export async function sendCertificateEmail(
  email: string,
  userName: string,
  courseTitle: string,
  certId: string,
  certUrl: string,
  pdfBase64: string | null = null
) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const finalCertUrl = certUrl || `${baseUrl}/certificate/${certId}`;

  const attachments: MailAttachment[] = [];
  if (pdfBase64) {
    attachments.push({
      filename: `Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`,
      content: pdfBase64,
      encoding: 'base64',
      contentType: 'application/pdf',
    });
  }

  const html = renderSaaSEmailLayout({
    badgeText: 'Verified Credential',
    badgeBg: '#ECFDF5',
    badgeColor: '#059669',
    badgeBorder: '#A7F3D0',
    iconSvg: ICONS.graduationCap('#059669', 30),
    iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #ECFDF5 100%)',
    iconBorder: '#FDE68A',
    title: 'Congratulations, Graduate!',
    subtitle: 'Official Academic Certificate of Mastery Awarded',
    bodyHtml: `
      <p style="margin-top: 0;">Hello <strong>${userName}</strong>,</p>
      <p>Sensational achievement! You have officially conquered all curriculum modules, passed every adaptive quiz assessment, and mastered the material for:</p>
      
      <!-- Diploma Showcase Card -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%); border-radius: 20px; text-align: center; margin: 28px 0; color: #FFFFFF; box-shadow: 0 16px 32px rgba(15, 23, 42, 0.2); border: 1px solid rgba(255, 255, 255, 0.1);">
        <tr>
          <td style="padding: 28px 20px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #A5B4FC; margin-bottom: 8px;">
              Certificate of Completion
            </div>
            <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin: 0 0 16px; letter-spacing: -0.02em;">
              ${courseTitle}
            </h2>
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; padding: 6px 16px;">
              <span style="font-size: 11px; color: #E2E8F0; text-transform: uppercase; letter-spacing: 0.08em;">ID: </span>
              <span style="font-family: monospace; font-weight: 700; color: #38BDF8; font-size: 13px;">${certId}</span>
            </div>
            <div style="margin-top: 16px; font-size: 12px; color: #10B981; font-weight: 600;">
              ${ICONS.checkCircle('#10B981', 14)} <span style="vertical-align: middle; margin-left: 4px;">Cryptographically Signed &bull; Publicly Verifiable</span>
            </div>
          </td>
        </tr>
      </table>

      ${renderAlertBox('Official Attachment Included', 'A high-resolution, print-ready PDF certificate is attached to this email. You can also view, share on LinkedIn, or download it online anytime.', 'success')}

      <p style="color: #64748B; font-size: 14px; line-height: 1.6;">
        Add this credential to your resume and professional portfolio to showcase your expertise in <strong>${courseTitle}</strong>.
      </p>
    `,
    ctaText: 'View & Verify Certificate Online',
    ctaUrl: finalCertUrl,
    footerExtra: 'This certificate remains permanently valid and verifiable in the NexLearn Global Registry.',
  });

  return await sendMailMessage({
    to: email,
    toName: userName,
    senderName: 'NexLearn Certificates',
    subject: `[NexLearn Credential] Congratulations! Your Certificate for ${courseTitle}`,
    attachments,
    html,
  });
}

// --------------------------------------------------------------------------
// 9. Learning Analytics & Progress Scorecard
// --------------------------------------------------------------------------
export async function sendAnalyticsReportEmail(
  email: string,
  userName: string,
  stats: { avgScore: number | string; completedModules: number | string; points: number | string; [key: string]: any },
  pdfBase64: string | null = null
) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const attachments: MailAttachment[] = [];
  if (pdfBase64) {
    attachments.push({
      filename: `NexLearn_Performance_Report_${new Date().getFullYear()}.pdf`,
      content: pdfBase64,
      encoding: 'base64',
      contentType: 'application/pdf',
    });
  }

  const avgNum = typeof stats.avgScore === 'number' ? stats.avgScore : parseFloat(String(stats.avgScore)) || 0;

  const html = renderSaaSEmailLayout({
    badgeText: 'Performance Scorecard',
    badgeBg: '#F0F9FF',
    badgeColor: '#0284C7',
    badgeBorder: '#BAE6FD',
    iconSvg: ICONS.barChart('#0284C7', 28),
    title: 'Your Learning Intelligence Report',
    subtitle: 'Comprehensive analysis of your study habits and mastery rate',
    bodyHtml: `
      <p style="margin-top: 0;">Hello <strong>${userName}</strong>,</p>
      <p>Here is your personalized performance breakdown. NexLearn's cognitive engine tracks retention, module completions, and quiz accuracy in real time.</p>
      
      <!-- Responsive 3-Metric KPI Grid -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
        <tr>
          <!-- KPI 1: Avg Score -->
          <td class="kpi-col" width="33.33%" style="padding: 6px;">
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px 12px; text-align: center;">
              <div style="font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                Quiz Accuracy
              </div>
              <div style="font-size: 26px; font-weight: 800; color: #10B981; letter-spacing: -0.02em;">
                ${stats.avgScore}%
              </div>
              <div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 4px;">
                ${avgNum >= 80 ? 'Mastery Level' : 'On Track'}
              </div>
            </div>
          </td>

          <!-- KPI 2: Modules Completed -->
          <td class="kpi-col" width="33.33%" style="padding: 6px;">
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px 12px; text-align: center;">
              <div style="font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                Modules Done
              </div>
              <div style="font-size: 26px; font-weight: 800; color: #3B82F6; letter-spacing: -0.02em;">
                ${stats.completedModules}
              </div>
              <div style="font-size: 11px; color: #2563EB; font-weight: 600; margin-top: 4px;">
                Conquered
              </div>
            </div>
          </td>

          <!-- KPI 3: Points -->
          <td class="kpi-col" width="33.33%" style="padding: 6px;">
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px 12px; text-align: center;">
              <div style="font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                Mastery Points
              </div>
              <div style="font-size: 26px; font-weight: 800; color: #8B5CF6; letter-spacing: -0.02em;">
                ${stats.points}
              </div>
              <div style="font-size: 11px; color: #7C3AED; font-weight: 600; margin-top: 4px;">
                XP Earned
              </div>
            </div>
          </td>
        </tr>
      </table>

      ${renderAlertBox(
        'AI Mentor Assessment',
        avgNum > 80
          ? 'You are exhibiting mastery across your technical courses! To accelerate your progress further, explore intermediate and advanced subject branches.'
          : 'Consistent daily reviews yield maximum retention. Spend 15 minutes revisiting spaced-repetition flashcards to push your accuracy above 85%.',
        'info'
      )}
    `,
    ctaText: 'View Detailed Radar Analytics',
    ctaUrl: `${baseUrl}/reports`,
  });

  return await sendMailMessage({
    to: email,
    toName: userName,
    senderName: 'NexLearn Insights',
    subject: `[NexLearn Analytics] Your Learning Intelligence Report`,
    attachments,
    html,
  });
}

// --------------------------------------------------------------------------
// 10. Welcome & Onboarding Journey Email
// --------------------------------------------------------------------------
export async function sendWelcomeEmail(email: string, userName: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const html = renderSaaSEmailLayout({
    badgeText: 'Welcome Aboard',
    badgeBg: '#EEF2FF',
    badgeColor: '#4F46E5',
    iconSvg: ICONS.rocket('#4F46E5', 28),
    title: `Welcome to NexLearn, ${userName}!`,
    subtitle: 'Your AI-accelerated journey to subject mastery begins today',
    bodyHtml: `
      <p style="margin-top: 0;">Hello <strong>${userName}</strong>,</p>
      <p>We are delighted to welcome you to the community. NexLearn is not another static video library — it is an intelligent, autonomous learning ecosystem that synthesizes deep curriculums on any technical subject in seconds.</p>

      <!-- 3 Quickstart Feature Cards with Clean SVGs -->
      <div style="margin: 28px 0;">
        
        <!-- Card 1 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 12px; padding: 16px;">
          <tr>
            <td width="48" style="vertical-align: top; text-align: center; padding-right: 14px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(99, 102, 241, 0.1); display: inline-flex; align-items: center; justify-content: center;">
                ${ICONS.sparkles('#4F46E5', 20)}
              </div>
            </td>
            <td>
              <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">
                Autonomous AI Course Generation
              </div>
              <div style="font-size: 13px; color: #64748B; line-height: 1.5;">
                Enter any topic or framework, and receive structured modules, theory notes, and code snippets in 15 seconds.
              </div>
            </td>
          </tr>
        </table>

        <!-- Card 2 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 12px; padding: 16px;">
          <tr>
            <td width="48" style="vertical-align: top; text-align: center; padding-right: 14px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(14, 165, 233, 0.1); display: inline-flex; align-items: center; justify-content: center;">
                ${ICONS.barChart('#0284C7', 20)}
              </div>
            </td>
            <td>
              <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">
                Spaced Repetition &amp; Mind Maps
              </div>
              <div style="font-size: 13px; color: #64748B; line-height: 1.5;">
                Retain concepts forever with automated memory decay tracking and interactive knowledge graphs.
              </div>
            </td>
          </tr>
        </table>

        <!-- Card 3 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px;">
          <tr>
            <td width="48" style="vertical-align: top; text-align: center; padding-right: 14px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.1); display: inline-flex; align-items: center; justify-content: center;">
                ${ICONS.graduationCap('#059669', 20)}
              </div>
            </td>
            <td>
              <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">
                Verifiable Certificates
              </div>
              <div style="font-size: 13px; color: #64748B; line-height: 1.5;">
                Graduate from courses by completing adaptive quizzes, and earn shareable, PDF-backed credentials.
              </div>
            </td>
          </tr>
        </table>

      </div>

      ${renderAlertBox('Ready to Begin?', 'Type in any topic you wish to master today—Next.js, Python, System Design, or Machine Learning—and generate your first custom syllabus.', 'success')}
    `,
    ctaText: 'Synthesize Your First Course',
    ctaUrl: `${baseUrl}/generate`,
  });

  return await sendMailMessage({
    to: email,
    toName: userName,
    subject: '[NexLearn AI] Welcome to Your Intelligent Workspace',
    html,
  });
}
