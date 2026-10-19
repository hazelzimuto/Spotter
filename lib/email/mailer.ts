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
  <title>Welcome to Spotter</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #f3f4f6; margin: 0; padding: 24px; }
    .card { max-width: 540px; margin: 0 auto; background: #13141b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .member-badge { background: rgba(79, 70, 229, 0.12); border: 1px solid rgba(79, 70, 229, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center; }
    .member-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 6px; }
    .member-num { font-size: 28px; font-weight: 800; letter-spacing: 0.1em; color: #a5b4fc; font-family: monospace; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; }
    .footer { padding: 20px 24px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); }
  </style>
</head>
<body>
  <div class="card">
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
  <title>Verify your email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #f3f4f6; margin: 0; padding: 24px; }
    .card { max-width: 540px; margin: 0 auto; background: #13141b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .code-badge { background: rgba(79, 70, 229, 0.12); border: 1px solid rgba(79, 70, 229, 0.3); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center; }
    .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px; }
    .code-num { font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #a5b4fc; font-family: monospace; }
    .footer { padding: 20px 24px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); }
  </style>
</head>
<body>
  <div class="card">
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

      <p style="font-size: 13px; color: #9ca3af;">This code is valid for 24 hours. If you did not create a Spotter account, you can safely ignore this email.</p>
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
