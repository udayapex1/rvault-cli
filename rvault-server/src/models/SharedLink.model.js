import mongoose from "mongoose";

const sharedLinkSchema = new mongoose.Schema(
  {
    // Reference
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // who created this link
    },

    // Link
    token: {
      type: String,
      required: true,
      unique: true,
      // random unique token → rvault.dev/s/abc123xyz
    },

    // Expiry
    expiresAt: {
      type: Date,
      required: true,
      // 1hr / 24hr / 7days — user choice
    },

    isExpired: {
      type: Boolean,
      default: false,
    },

    // Stats
    downloadCount: {
      type: Number,
      default: 0,
      // kitni baar download hua
    },

    maxDownloads: {
      type: Number,
      default: null,
      // null = unlimited
      // set limit rakh sakte hain e.g. 5 downloads only
    },
  },
  {
    timestamps: true,
  }
);

// Auto expire check
sharedLinkSchema.methods.isValid = function () {
  if (this.isExpired) return false;
  if (new Date() > this.expiresAt) return false;
  if (this.maxDownloads && this.downloadCount >= this.maxDownloads) return false;
  return true;
};

const SharedLink = mongoose.model("SharedLink", sharedLinkSchema);
export default SharedLink;