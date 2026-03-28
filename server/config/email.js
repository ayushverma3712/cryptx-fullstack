// server/config/email.js
const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

// ── OTP Email ─────────────────────────────────────────────────
async function sendOTPEmail(toEmail, toName, otp) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin:0; padding:0; background:#07090f; font-family:'Segoe UI',sans-serif; }
    .wrap { max-width:540px; margin:40px auto; background:#111520; border:1px solid #1e2847; border-radius:16px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#3b6fd4,#00e5b0); padding:32px; text-align:center; }
    .header h1 { margin:0; font-size:28px; color:#07090f; letter-spacing:-0.5px; }
    .header p  { margin:6px 0 0; color:#0a1a12; font-size:14px; }
    .body { padding:36px 40px; }
    .body p { color:#8899cc; font-size:15px; line-height:1.7; margin:0 0 20px; }
    .otp-box { background:#07090f; border:2px solid #1e2847; border-radius:12px; padding:24px; text-align:center; margin:24px 0; }
    .otp-code { font-size:42px; font-weight:800; letter-spacing:14px; color:#4f8eff; font-family:'Courier New',monospace; }
    .otp-note { font-size:13px; color:#3d4f7a; margin-top:10px; }
    .expire { background:#1a1020; border:1px solid #ff4d6d44; border-radius:8px; padding:12px 16px; color:#ff8099; font-size:13px; margin-top:20px; }
    .footer { padding:20px 40px; border-top:1px solid #1e2847; text-align:center; color:#3d4f7a; font-size:12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>🔐 CryptX</h1>
      <p>Multimedia Encryption System</p>
    </div>
    <div class="body">
      <p>Hi <strong style="color:#e8eeff">${toName}</strong>,</p>
      <p>Use the code below to verify your email address. This keeps your CryptX account secure.</p>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-note">Email Verification Code</div>
      </div>
      <div class="expire">⏱ This code expires in <strong>${process.env.OTP_EXPIRY_MINUTES || 10} minutes</strong>. Do not share it with anyone.</div>
    </div>
    <div class="footer">Team CryptX · CYBER-IV-T073 · Graphic Era University<br>If you didn't request this, ignore this email.</div>
  </div>
</body>
</html>`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `${otp} is your CryptX verification code`,
    html,
  });
}

// ── Password Reset Email ──────────────────────────────────────
async function sendPasswordResetEmail(toEmail, toName, resetToken, clientUrl) {
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin:0; padding:0; background:#07090f; font-family:'Segoe UI',sans-serif; }
    .wrap { max-width:540px; margin:40px auto; background:#111520; border:1px solid #1e2847; border-radius:16px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#3b6fd4,#00e5b0); padding:32px; text-align:center; }
    .header h1 { margin:0; font-size:28px; color:#07090f; }
    .body { padding:36px 40px; }
    .body p { color:#8899cc; font-size:15px; line-height:1.7; margin:0 0 16px; }
    .btn { display:inline-block; background:linear-gradient(135deg,#3b6fd4,#4f8eff); color:white; text-decoration:none; padding:14px 32px; border-radius:10px; font-size:15px; font-weight:700; margin:16px 0; }
    .link-box { background:#07090f; border:1px solid #1e2847; border-radius:8px; padding:12px; margin-top:16px; font-size:11px; color:#3d4f7a; word-break:break-all; }
    .expire { background:#1a1020; border:1px solid #ff4d6d44; border-radius:8px; padding:12px 16px; color:#ff8099; font-size:13px; margin-top:20px; }
    .footer { padding:20px 40px; border-top:1px solid #1e2847; text-align:center; color:#3d4f7a; font-size:12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header"><h1>🔑 Password Reset</h1></div>
    <div class="body">
      <p>Hi <strong style="color:#e8eeff">${toName}</strong>,</p>
      <p>We received a request to reset your CryptX account password. Click the button below to set a new password.</p>
      <div style="text-align:center"><a class="btn" href="${resetUrl}">Reset My Password →</a></div>
      <p style="font-size:13px">If the button doesn't work, copy this link:</p>
      <div class="link-box">${resetUrl}</div>
      <div class="expire">⏱ This link expires in <strong>1 hour</strong>. If you didn't request a reset, ignore this email.</div>
    </div>
    <div class="footer">Team CryptX · CYBER-IV-T073 · Graphic Era University</div>
  </div>
</body>
</html>`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Reset your CryptX password",
    html,
  });
}

// ── Welcome Email ─────────────────────────────────────────────
async function sendWelcomeEmail(toEmail, toName) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin:0; padding:0; background:#07090f; font-family:'Segoe UI',sans-serif; }
    .wrap { max-width:540px; margin:40px auto; background:#111520; border:1px solid #1e2847; border-radius:16px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#3b6fd4,#00e5b0); padding:36px; text-align:center; }
    .header h1 { margin:0; font-size:28px; color:#07090f; }
    .header p  { margin:8px 0 0; color:#0a1a12; font-size:15px; }
    .body { padding:36px 40px; }
    .body p { color:#8899cc; font-size:15px; line-height:1.7; margin:0 0 16px; }
    .features { display:flex; flex-direction:column; gap:12px; margin:20px 0; }
    .feat { display:flex; align-items:center; gap:12px; background:#07090f; border-radius:8px; padding:14px; }
    .feat-icon { font-size:22px; }
    .feat-text { color:#e8eeff; font-size:14px; }
    .footer { padding:20px 40px; border-top:1px solid #1e2847; text-align:center; color:#3d4f7a; font-size:12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>🎉 Welcome to CryptX!</h1>
      <p>Your account is ready</p>
    </div>
    <div class="body">
      <p>Hi <strong style="color:#e8eeff">${toName}</strong>,</p>
      <p>Your CryptX account has been verified and is ready to use. Here's what you can do:</p>
      <div class="features">
        <div class="feat"><span class="feat-icon">🖼️</span><span class="feat-text"><strong>Encrypt Images</strong> — JPG, PNG, GIF, WebP and more</span></div>
        <div class="feat"><span class="feat-icon">🎵</span><span class="feat-text"><strong>Encrypt Audio</strong> — MP3, WAV, OGG, FLAC and more</span></div>
        <div class="feat"><span class="feat-icon">🎬</span><span class="feat-text"><strong>Encrypt Video</strong> — MP4, AVI, MOV, MKV and more</span></div>
        <div class="feat"><span class="feat-icon">📋</span><span class="feat-text"><strong>File History</strong> — Track all your operations</span></div>
      </div>
      <p>All encryption happens locally on your computer — your files never leave your device.</p>
    </div>
    <div class="footer">Team CryptX · CYBER-IV-T073 · Graphic Era University</div>
  </div>
</body>
</html>`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Welcome to CryptX 🔐 — Your account is ready",
    html,
  });
}

module.exports = { sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail };
