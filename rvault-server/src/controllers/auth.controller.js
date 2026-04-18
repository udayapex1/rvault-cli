import bcrypt from "bcryptjs";
import qrcode from "qrcode";
import User from "../models/User.model.js";
import { generateOTP, hashOTP, verifyOTP } from "../utils/otp.js";
import { generateToken } from "../utils/token.js";
import { generateTOTPSecret, verifyTOTPToken } from "../utils/totp.js";
import { sendOTPMail } from "../config/mailer.js";

// ─────────────────────────────────────────
// STEP 1 → Register (send OTP)
// ─────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    // Check existing user
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Save user (unverified)
    const user = await User.create({
      name,
      email,
      username: username.toLowerCase(),
      password: hashedPassword,
      otp: hashedOTP,
      otpExpiresAt,
      isVerified: false,
    });

    // Send OTP email
    await sendOTPMail(email, name, otp);

    res.status(201).json({
      message: "OTP sent to your email",
      userId: user._id,
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// STEP 2 → Verify OTP + Setup TOTP
// ─────────────────────────────────────────
export const verifyOTPAndSetupTOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Already verified?
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // OTP expired?
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP valid?
    const isValid = await verifyOTP(otp, user.otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Generate TOTP secret
    const totpSecret = generateTOTPSecret(user.email);

    // Generate QR code (base64 image → CLI mein terminal QR dikhega)
    const qrCodeUrl = await qrcode.toDataURL(totpSecret.otpauth_url);

    // Update user
    user.isVerified = true;
    user.totpSecret = totpSecret.base32;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({
      message: "Email verified! Scan QR in Google Authenticator",
      qrCode: qrCodeUrl,        // CLI will render this as terminal QR
      manualKey: totpSecret.base32, // fallback manual entry
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// STEP 3 → Login (password + TOTP)
// ─────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, totpToken } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verified?
    if (!user.isVerified) {
      return res.status(400).json({ message: "Email not verified" });
    }

    // Password check
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // TOTP check
    const isTOTPValid = verifyTOTPToken(user.totpSecret, totpToken);
    if (!isTOTPValid) {
      return res.status(400).json({ message: "Invalid authenticator code" });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Logged in successfully!",
      token,
      user: {
        name: user.name,
        email: user.email,
        username: user.username,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// Resend OTP
// ─────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Already verified" });
    }

    // New OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    user.otp = hashedOTP;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPMail(user.email, user.name, otp);

    res.status(200).json({ message: "OTP resent!" });

  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};