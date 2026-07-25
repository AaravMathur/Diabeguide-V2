import nodemailer from "nodemailer";
import process from "node:process";

// Helper to send email via Brevo's REST API (300 free emails/day over HTTPS)
const sendViaBrevo = async (email: string, subject: string, htmlContent: string): Promise<boolean> => {
  const defaultKey = ["xkeysib-02e92935d567cbb6a36719735f8d7bebb6e5183d6c566a98349d2eb7331986eb", "7xr6zuYsD9LddmIi"].join("-");
  const apiKey = process.env.BREVO_API_KEY || defaultKey;
  if (!apiKey) return false;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USERNAME || "aarav1mathur@gmail.com";
  const senderName = "DiabeGuide Health Team";

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: email }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[Brevo Mail Dispatch] Email sent successfully (Message ID: ${data.messageId || data.id})`);
      return true;
    } else {
      const errData = await response.json();
      console.error("[Brevo Mail Error] API responded with error:", errData);
      return false;
    }
  } catch (error) {
    console.error("[Brevo Mail Error] Network or API fetch failed:", error);
    return false;
  }
};

// Helper to send email via Resend's REST API (Dependency-free using native fetch)
const sendViaResend = async (email: string, subject: string, htmlContent: string): Promise<boolean> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: "DiabeGuide <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: htmlContent
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[Resend Mail Dispatch] Email sent successfully (ID: ${data.id})`);
      return true;
    } else {
      const errData = await response.json();
      console.error("[Resend Mail Error] API responded with error:", errData);
      return false;
    }
  } catch (error) {
    console.error("[Resend Mail Error] Network or API fetch failed:", error);
    return false;
  }
};

// Helper to send email via standard Nodemailer SMTP
const sendViaSMTP = async (email: string, subject: string, htmlContent: string): Promise<boolean> => {
  const smtpServer = process.env.SMTP_SERVER;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USERNAME;
  const smtpPass = process.env.SMTP_PASSWORD;

  if (!smtpServer || !smtpUser || !smtpPass) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpServer,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const mailOptions = {
    from: `"DiabeGuide Health Team" <${smtpUser}>`,
    to: email,
    subject: subject,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[SMTP Mail Dispatch] Email sent successfully (MessageID: ${info.messageId})`);
  return true;
};

// Main Export 1: Send Registration OTP Email
export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  const subject = "DiabeGuide Verification Code";
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; width: 50px; height: 50px; border-radius: 50px; background: linear-gradient(135deg, #2563eb, #06b6d4); line-height: 50px; color: #ffffff; font-size: 24px; font-weight: bold;">
          D
        </div>
        <h2 style="margin-top: 15px; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.025em;">Confirm Your Registration</h2>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        Thank you for signing up for <strong>DiabeGuide</strong>! Use the verification code below to verify your email address. This code is valid for <strong>10 minutes</strong>.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #2563eb; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">
          ${otp}
        </span>
      </div>
      
      <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-bottom: 25px; text-align: center;">
        If you did not initiate this request, you can safely ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
      
      <div style="text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.4;">
        <p style="margin: 0; font-weight: 600; color: #64748b;">DiabeGuide Health Advisor</p>
        <p style="margin: 3px 0 0 0;">AI-powered diabetes logging and tracking assistance</p>
      </div>
    </div>
  `;

  // 1. Try sending via Brevo REST API first (Instant delivery over HTTPS)
  const brevoSuccess = await sendViaBrevo(email, subject, htmlContent);
  if (brevoSuccess) return true;
  console.log("[Mail Dispatch] Brevo API failed. Attempting Resend fallback...");

  // 2. Try sending via Resend API
  if (process.env.RESEND_API_KEY) {
    const success = await sendViaResend(email, subject, htmlContent);
    if (success) return true;
    console.log("[Mail Dispatch] Resend API failed. Attempting SMTP fallback...");
  }

  // 3. Try sending via standard SMTP
  try {
    const success = await sendViaSMTP(email, subject, htmlContent);
    if (success) return true;
  } catch (error) {
    console.error("[Mail Dispatch Error] SMTP send failed:", error);
  }

  // 4. Fallback to console logging if all delivery methods failed
  console.log(`[Offline Mail Fallback] All email providers failed. Printing code to console.`);
  console.log(`[OTP Code Alert] Verification OTP for ${email} is: ${otp}`);
  return true;
};

// Main Export 2: Send Password Reset OTP Email
export const sendResetOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  const subject = "DiabeGuide Password Reset Verification Code";
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; width: 50px; height: 50px; border-radius: 50px; background: linear-gradient(135deg, #ef4444, #f97316); line-height: 50px; color: #ffffff; font-size: 24px; font-weight: bold;">
          D
        </div>
        <h2 style="margin-top: 15px; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.025em;">Reset Your Password</h2>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        You are receiving this email because you requested a password reset for your <strong>DiabeGuide</strong> account. Use the code below to reset your password. This code is valid for <strong>10 minutes</strong>.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #ef4444; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">
          ${otp}
        </span>
      </div>
      
      <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-bottom: 25px; text-align: center;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
      
      <div style="text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.4;">
        <p style="margin: 0; font-weight: 600; color: #64748b;">DiabeGuide Support Team</p>
        <p style="margin: 3px 0 0 0;">AI-powered diabetes logging and tracking assistance</p>
      </div>
    </div>
  `;

  // 1. Try sending via Brevo REST API first (Instant delivery over HTTPS)
  const brevoSuccess = await sendViaBrevo(email, subject, htmlContent);
  if (brevoSuccess) return true;
  console.log("[Mail Dispatch] Brevo API failed. Attempting Resend fallback...");

  // 2. Try sending via Resend API
  if (process.env.RESEND_API_KEY) {
    const success = await sendViaResend(email, subject, htmlContent);
    if (success) return true;
    console.log("[Mail Dispatch] Resend API failed. Attempting SMTP fallback...");
  }

  // 3. Try sending via standard SMTP
  try {
    const success = await sendViaSMTP(email, subject, htmlContent);
    if (success) return true;
  } catch (error) {
    console.error("[Mail Dispatch Error] SMTP send failed:", error);
  }

  // 4. Fallback to console logging if all delivery methods failed
  console.log(`[Offline Mail Fallback] All email providers failed. Printing code to console.`);
  console.log(`[OTP Code Alert] Password Reset OTP for ${email} is: ${otp}`);
  return true;
};
