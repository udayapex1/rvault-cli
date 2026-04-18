import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // stored without @ → "uday" (CLI mein @uday dikhega)
    },

    password: {
      type: String,
      required: true,
      // bcrypt hashed
    },

    // Auth
    isVerified: {
      type: Boolean,
      default: false,
    },

    totpSecret: {
      type: String,
      default: null,
      // speakeasy generated, AES encrypted
    },

    // OTP (temporary - registration ke time)
    otp: {
      type: String,
      default: null,
      // hashed
    },

    otpExpiresAt: {
      type: Date,
      default: null,
      // 10 min expiry
    },

    // Storage
    storageUsed: {
      type: Number,
      default: 0,
      // in bytes
    },

    storageLimit: {
      type: Number,
      default: 5 * 1024 * 1024 * 1024,
      // 5GB default
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto
  }
);

const User = mongoose.model("User", userSchema);
export default User;