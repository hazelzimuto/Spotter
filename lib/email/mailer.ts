import nodemailer from 'nodemailer'

/**
 * SPOTTER EMAIL SERVICE (NODEMAILER)
 *
 * Configured via environment variables:
 * - SMTP_HOST
 * - SMTP_PORT (default 587)
 * - SMTP_SECURE (true for 465, false for other ports)
 * - SMTP_USER
 * - SMTP_PASS
 * - SMTP_FROM (default: Spotter <no-reply@spottergym.com>)
 */

export interface SendMailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export interface WelcomeEmailParams {
  to: string
  fullName: string
  memberNumber: string
}

/**
 * Creates or retrieves the Nodemailer transporter instance.
 * Returns null if SMTP_HOST is not configured in environment variables.
 */
export function getMailTransporter() {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  if (!host || !user) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })
}

/**
 * Sends an email using Nodemailer.
 * In development, if SMTP is not configured, logs the email to console cleanly instead of throwing.
 */
export async function sendEmail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getMailTransporter()
  const from = process.env.SMTP_FROM || 'Spotter <no-reply@spottergym.com>'
  const normalizedTo = Array.isArray(options.to)
    ? options.to.map((addr) => String(addr).trim().toLowerCase())
    : typeof options.to === 'string'
      ? options.to.trim().toLowerCase()
      : options.to

  if (!transporter) {
    console.info(`[Email Service - Dev Mode] (SMTP not configured in .env):
  To: ${Array.isArray(normalizedTo) ? normalizedTo.join(', ') : normalizedTo}
  Subject: ${options.subject}
  Content: ${options.text || '(HTML email)'}`)
    return { success: true, messageId: 'mock-dev-id' }
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: normalizedTo,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error)
    console.error('Failed to send email via Nodemailer:', errMessage)
    return { success: false, error: errMessage }
  }
}

/**
 * Generates and sends a branded Spotter Welcome Email to new members upon sign-up.
 */
export async function sendWelcomeEmail({ to, fullName, memberNumber }: WelcomeEmailParams) {
  const subject = `Welcome to Spotter, ${fullName.split(' ')[0]}!`
  const firstName = fullName.split(' ')[0]

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Welcome to Spotter</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #FCFCFF;
      color: #1B1B1F;
      margin: 0;
      padding: 24px 16px;
    }
    .wrapper {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #C9C5D0;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #352C82 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      color: #FFFFFF;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .content {
      padding: 32px 24px;
      line-height: 1.6;
      color: #1B1B1F;
    }
    .content p {
      margin: 0 0 16px 0;
      font-size: 15px;
    }
    .member-badge {
      background-color: #DEDBFC;
      border: 1px solid #C9C5D0;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      text-align: center;
    }
    .member-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #47454F;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .member-num {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #0D0A3D;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .footer {
      padding: 20px 24px;
      font-size: 12px;
      color: #787680;
      text-align: center;
      border-top: 1px solid #C9C5D0;
      background-color: #FCFCFF;
    }
    .footer p {
      margin: 0;
      line-height: 1.5;
    }

    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1B1B1F !important;
        color: #E5E2E6 !important;
      }
      .wrapper {
        background-color: #303034 !important;
        border-color: #47454F !important;
      }
      .header {
        background: linear-gradient(135deg, #352C82 0%, #211A64 100%) !important;
      }
      .header h1 {
        color: #DEDBFC !important;
      }
      .content {
        color: #E5E2E6 !important;
      }
      .member-badge {
        background-color: #352C82 !important;
        border-color: #47454F !important;
      }
      .member-label {
        color: #DEDBFC !important;
      }
      .member-num {
        color: #DEDBFC !important;
      }
      .footer {
        background-color: #303034 !important;
        border-color: #47454F !important;
        color: #928F9A !important;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Spotter Gym</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${firstName}</strong>,</p>
      <p>Welcome to Spotter! Your member account has been created. Use your 6-digit Member Number whenever you sign in or check in at the gym desk.</p>
      
      <div class="member-badge">
        <div class="member-label">Your Member Number</div>
        <div class="member-num">${memberNumber}</div>
      </div>

      <p>With Spotter, you can view your gym records, attendance history, balance, and general gym rules without waiting at the front desk.</p>
    </div>
    <div class="footer">
      <p>Spotter: Your gym, at your fingertips.<br>This is an automated notification, please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`

  const text = `Hello ${firstName},

Welcome to Spotter! Your member account has been created.

Your Member Number: ${memberNumber}

Use this 6-digit number along with your password to log in to your member portal.

The Spotter Gym Team`

  return sendEmail({
    to,
    subject,
    html,
    text,
  })
}

export interface VerificationEmailParams {
  to: string
  fullName: string
  code: string
}

/**
 * Generates and sends a 6-digit verification code email to verify the member's email address.
 */
export async function sendVerificationEmail({ to, fullName, code }: VerificationEmailParams) {
  const subject = `${code} is your Spotter verification code`
  const firstName = fullName.split(' ')[0]

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Verify your email</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #FCFCFF;
      color: #1B1B1F;
      margin: 0;
      padding: 24px 16px;
    }
    .wrapper {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #C9C5D0;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #352C82 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      color: #FFFFFF;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .content {
      padding: 32px 24px;
      line-height: 1.6;
      color: #1B1B1F;
    }
    .content p {
      margin: 0 0 16px 0;
      font-size: 15px;
    }
    .code-badge {
      background-color: #DEDBFC;
      border: 1px solid #C9C5D0;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      text-align: center;
    }
    .code-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #47454F;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .code-num {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 0.25em;
      color: #0D0A3D;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .note {
      font-size: 13px;
      color: #47454F;
    }
    .footer {
      padding: 20px 24px;
      font-size: 12px;
      color: #787680;
      text-align: center;
      border-top: 1px solid #C9C5D0;
      background-color: #FCFCFF;
    }
    .footer p {
      margin: 0;
      line-height: 1.5;
    }

    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1B1B1F !important;
        color: #E5E2E6 !important;
      }
      .wrapper {
        background-color: #303034 !important;
        border-color: #47454F !important;
      }
      .header {
        background: linear-gradient(135deg, #352C82 0%, #211A64 100%) !important;
      }
      .header h1 {
        color: #DEDBFC !important;
      }
      .content {
        color: #E5E2E6 !important;
      }
      .code-badge {
        background-color: #352C82 !important;
        border-color: #47454F !important;
      }
      .code-label {
        color: #DEDBFC !important;
      }
      .code-num {
        color: #DEDBFC !important;
      }
      .note {
        color: #C9C5D0 !important;
      }
      .footer {
        background-color: #303034 !important;
        border-color: #47454F !important;
        color: #928F9A !important;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Spotter Gym</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${firstName}</strong>,</p>
      <p>Thank you for creating your Spotter account. Please enter the verification code below in your member dashboard to confirm your email address and secure your account.</p>
      
      <div class="code-badge">
        <div class="code-label">Verification Code</div>
        <div class="code-num">${code}</div>
      </div>

      <p class="note">This code is valid for 24 hours. If you did not create a Spotter account, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>Spotter: Your gym, at your fingertips.<br>This is an automated notification, please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`

  const text = `Hello ${firstName},

Thank you for creating your Spotter account.

Your verification code: ${code}

Enter this 6-digit code in your member dashboard to confirm your email address. This code is valid for 24 hours.

The Spotter Gym Team`

  return sendEmail({
    to,
    subject,
    html,
    text,
  })
}
