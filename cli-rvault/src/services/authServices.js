import { api } from "../../utils/api.js";

export async function health() {
    try {
        console.log("➡️ Calling /health API...");

        const response = await api.get("/health");
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data?.message || "Health check failed");
        }

        console.log("⬅️ Response received");

        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || err.message || "Health check failed");
    }
}

export async function register(userData) {
    try {
        const response = await api.post("api/auth/register", userData);
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data?.message || "Registration failed");
        }

        return response.data;
    } catch (err) {
        const message =
            err.response?.data?.message || err.message || "Registration failed";

        throw new Error(message);
    }
}

export async function verifyOTP(userId, otp) {
    try {
        const response = await api.post("/api/auth/verify-otp", { userId, otp });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data?.message || "Invalid OTP");
        }
        return response.data;
    } catch (err) {
        const message =
            err.response?.data?.message || err.message || "OTP verification failed";

        throw new Error(message);
    }
}

export async function resendOTP(userId) {
    const response = await api.post("api/auth/resend-otp", { userId });
    if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data?.message || "Failed to resend OTP");
    }
    return response.data;
}
