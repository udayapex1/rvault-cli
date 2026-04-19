import mongoose from "mongoose";

const clipSchema = new mongoose.Schema(
    {
        // Owner
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Content
        content: {
            type: String,
            required: true,
            // text, snippet, command, URL anything
        },

        label: {
            type: String,
            default: null,
            trim: true,
            // optional → "db url", "api key" etc
        },

        type: {
            type: String,
            enum: ["text", "code", "url", "secret"],
            default: "text",
            // for ls mein icon/color differentiation
        },

        // Auto expiry
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            // 7 days default
        },

        isPinned: {
            type: Boolean,
            default: false,
            // pinned clips don't expire
        },

        // Stats
        pasteCount: {
            type: Number,
            default: 0,
            // kitni baar paste hua
        },

        lastPastedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Valid clip check
clipSchema.methods.isValid = function () {
    if (this.isPinned) return true; // pinned never expire
    if (new Date() > this.expiresAt) return false;
    return true;
};

const Clip = mongoose.model("Clip", clipSchema);
export default Clip;
