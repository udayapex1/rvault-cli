import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendOTPMail = async (email, name, otp) => {
  const digits = otp.toString().split("");

  // Minimalist, high-contrast OTP Digit design
  const digitBox = (d) => `
    <td align="center" style="padding: 0 6px;">
      <div style="width: 48px; height: 56px; line-height: 56px; background: #f1f5f9; border-radius: 12px; font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700; color: #0f172a; border: 1px solid #e2e8f0;">
        ${d}
      </div>
    </td>
  `;

  try {
    await transporter.sendMail({
      from: `"rvault" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${otp} is your rvault verification code`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          
          <tr>
            <td align="center" style="padding: 40px 40px 30px 40px;">
              <table border="0" cellspacing="0" cellpadding="0" style="background: #0f172a; border-radius: 12px; width: 80px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
                <tr>
                  <td style="padding: 10px 12px;">
                    <div style="display: flex; gap: 4px; margin-bottom: 8px;">
                      <span style="width: 6px; height: 6px; background: #ff5f57; border-radius: 50%; display: inline-block;"></span>
                      <span style="width: 6px; height: 6px; background: #febc2e; border-radius: 50%; display: inline-block;"></span>
                      <span style="width: 6px; height: 6px; background: #28c840; border-radius: 50%; display: inline-block;"></span>
                    </div>
                    <div style="font-family: monospace; font-size: 12px; color: #38bdf8; font-weight: bold;">
                      ❯ <span style="color: #fff;">rv</span><span style="display: inline-block; width: 6px; height: 12px; background: #38bdf8; margin-left: 2px; vertical-align: middle;"></span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">Verify your identity</h1>
              <p style="margin: 12px 0 32px 0; font-size: 15px; color: #64748b; line-height: 1.5;">Enter the following code to secure your <strong>rvault</strong> session. It will expire in 10 minutes.</p>

              <table border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  ${digits.map(digitBox).join("")}
                </tr>
              </table>

              <p style="margin: 32px 0 0 0; font-size: 13px; color: #94a3b8;">
                Security ID: <span style="font-family: monospace; color: #0f172a; font-weight: 600;">RV-${Math.random().toString(36).substring(7).toUpperCase()}</span>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px; background: #f8fafc; border-top: 1px solid #f1f5f9;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: top; padding-right: 12px; font-size: 18px;">🛡️</td>
                  <td>
                    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #0f172a;">Identity Protection</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                      This request originated from a new login attempt for <b>${email}</b>. If this wasn't you, ignore this email or contact support.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; margin-top: 30px;">
          <tr>
            <td align="center">
              <div style="margin-bottom: 20px;">
                <a href="https://github.com/udayapex1" style="text-decoration: none; margin: 0 10px;">
                  <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" width="20" height="20" style="filter: invert(1); opacity: 0.6;">
                </a>
                <a href="https://linkedin.com/in/uday-pareta-b114aa284" style="text-decoration: none; margin: 0 10px;">
                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="20" height="20" style="filter: invert(1); opacity: 0.6;">
                </a>
              </div>
              <p style="margin: 0; font-size: 12px; color: #475569; letter-spacing: 0.05em; text-transform: uppercase;">
                &copy; 2026 rvault Protocol &bull; Built for Privacy
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Mail error:", error);
    return { success: false, error };
  }
};

export default transporter;