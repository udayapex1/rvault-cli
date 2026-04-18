import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    // Owner
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // File Info
    originalName: {
      type: String,
      required: true,
      trim: true,
      // "resume.pdf"
    },

    storageKey: {
      type: String,
      required: true,
      // B2 path → "uploads/userId/resume.pdf"
    },

    fileUrl: {
      type: String,
      required: true,
      // B2 public/private URL
    },

    mimeType: {
      type: String,
      required: true,
      // "application/pdf", "image/png" etc
    },

    size: {
      type: Number,
      required: true,
      // in bytes
    },

    // Status
    isDeleted: {
      type: Boolean,
      default: false,
      // soft delete → B2 se bhi delete hoga
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", fileSchema);
export default File;