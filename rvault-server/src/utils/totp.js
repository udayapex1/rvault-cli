import speakeasy from "speakeasy";

// Generate TOTP secret
export const generateTOTPSecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `rvault (${email})`,
    issuer: "rvault",
  });
  return secret;
};

// Verify TOTP token from authenticator app
export const verifyTOTPToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 1, // 30 sec window tolerance
  });
};