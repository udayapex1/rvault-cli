import mongoose from "mongoose";

const inboxSchema = new mongoose.Schema(
  {
    // Who sent
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fromUsername: {
      type: String,
      required: true,
      // denormalized → query fast rahegi
      // "@uday" dikhega inbox mein
    },

    // Who received
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // File Reference
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      // denormalized → "resume.pdf"
    },

    fileSize: {
      type: Number,
      required: true,
      // denormalized → bytes
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "downloaded", "rejected"],
      default: "pending",
    },

    downloadedAt: {
      type: Date,
      default: null,
    },

    // Expiry
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      // auto 7 days expiry
    },

    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto expire check
inboxSchema.methods.isValid = function () {
  if (this.isExpired) return false;
  if (new Date() > this.expiresAt) return false;
  return true;
};

const Inbox = mongoose.model("Inbox", inboxSchema);
export default Inbox;