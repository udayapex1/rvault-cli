import { api } from "../../utils/api.js";

export async function health() {
  try {
    console.log("➡️ Calling /health API...");

    const response = await api.get("/health");

    console.log("⬅️ Response received");

    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Health check failed");
  }
}

export async function register(userData) {
  try {
    const response = await api.post("/auth/register", userData);

    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "Registration failed";

    throw new Error(message);
  }
}

export default async function verifyOTP(userId, otp) {
  try {
    const response = await api.post("/api/auth/verify-otp", { userId, otp });
    return response.data;
  } catch (error) {
    const message =
      err.response?.data?.message || err.message || "OTP verification failed";

    throw new Error(message);
  }
}
