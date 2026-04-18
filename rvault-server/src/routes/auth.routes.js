import express from "express";
import {
  register,
  verifyOTPAndSetupTOTP,
  login,
  resendOTP,
} from "../controllers/auth.controller.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/verify-otp
router.post("/verify-otp", verifyOTPAndSetupTOTP);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/resend-otp
router.post("/resend-otp", resendOTP);

export default router;