import crypto from "crypto";
import bcrypt from "bcryptjs";

// Generate 6 digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Hash OTP before saving
export const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

// Verify OTP
export const verifyOTP = async (otp, hashedOTP) => {
  return await bcrypt.compare(otp, hashedOTP);
};