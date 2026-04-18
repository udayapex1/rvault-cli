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

  const digitBox = (d) => `
    <td align="center" style="padding:0 4px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="width:42px;height:48px;border:1.5px solid #e0e0e0;border-radius:8px;font-family:monospace;font-size:22px;font-weight:700;color:#111;">
            ${d}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:4px;">
            <div style="width:20px;height:2px;background:#111;border-radius:2px;margin:0 auto;"></div>
          </td>
        </tr>
      </table>
    </td>
  `;

  try {
    await transporter.sendMail({
      from: `"rvault" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${otp} is your rvault verification code`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#08010f;font-family:sans-serif;">

  <!-- Stars background via scattered dots (email-safe) -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:48px 16px 0;">

        <!-- White Card -->
        <table width="400" cellpadding="0" cellspacing="0" 
          style="background:#ffffff;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:36px 32px 28px;">

              <!-- Logo -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="width:52px;height:52px;background:#111;border-radius:14px;font-family:monospace;font-size:18px;font-weight:700;color:#fff;">
                          rv
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <p style="margin:0;font-size:18px;font-weight:600;color:#111;line-height:1.4;">
                      Your signup verification<br/>Code
                    </p>
                  </td>
                </tr>
              </table>

              <!-- OTP Digits -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        ${digits.map(digitBox).join("")}
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <p style="margin:0;font-size:12px;color:#aaa;">Don't share this code with anyone!</p>
                  </td>
                </tr>
              </table>

              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" 
                style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;margin-bottom:20px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#92400e;">
                      ⚠️ Was this request not made by you?
                    </p>
                    <p style="margin:0;font-size:11px;color:#92400e;line-height:1.6;">
                      This code was generated for <strong>${email}</strong>. 
                      If you did not initiate this request, you can safely 
                      <strong>ignore this email.</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Do not reply -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <p style="margin:0;font-size:11px;color:#aaa;">
                      This is an automated message. <strong style="color:#555;">Please do not reply.</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- IP Badge -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" 
                      style="background:#111;border-radius:20px;">
                      <tr>
                        <td style="padding:6px 16px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:6px;height:6px;background:#00ff88;border-radius:50%;"></td>
                              <td style="padding-left:8px;font-family:monospace;font-size:11px;color:#fff;">
                                rvault security verified
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Social + Footer -->
        <table width="400" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:24px 0 8px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="https://github.com/udayapex1" 
                      style="display:inline-block;width:36px;height:36px;background:#24292e;border-radius:50%;text-align:center;line-height:36px;color:#fff;font-size:14px;text-decoration:none;">
                      G
                    </a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="https://linkedin.com/in/uday-pareta-b114aa284" 
                      style="display:inline-block;width:36px;height:36px;background:#0077b5;border-radius:50%;text-align:center;line-height:36px;color:#fff;font-size:14px;text-decoration:none;">
                      in
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <p style="margin:0;font-size:11px;color:#555;">All rights reserved to rvault © 2026.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0;font-size:11px;color:#555;">Email: noreply@rvault.dev</p>
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