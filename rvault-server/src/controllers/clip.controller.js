import Clip from "../models/Clip.model.js";

// ─────────────────────────────────────────
// Copy — Save a clip
// POST /api/clip/copy
// ─────────────────────────────────────────
export const copyClip = async (req, res) => {
    try {
        const { content, label = null, type = "text" } = req.body || {};
        const userId = req.user._id;

        if (!content) {
            return res.status(400).json({ message: "Content is required." });
        }

        const validTypes = ["text", "code", "url", "secret"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: `Invalid type. Use: ${validTypes.join(", ")}` });
        }

        const clip = await Clip.create({
            userId,
            content,
            label: label ? label.slice(0, 100) : null,
            type,
        });

        res.status(201).json({
            message: "Clip saved!",
            clip: {
                id: clip._id,
                content: clip.content,
                label: clip.label,
                type: clip.type,
                expiresAt: clip.expiresAt,
            },
        });
    } catch (error) {
        console.error("Copy clip error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Paste — Get latest clip
// GET /api/clip/paste
// ─────────────────────────────────────────
export const pasteClip = async (req, res) => {
    try {
        const userId = req.user._id;

        const clip = await Clip.findOne({ userId })
            .sort({ createdAt: -1 });

        if (!clip) {
            return res.status(404).json({ message: "Clipboard is empty." });
        }

        if (!clip.isValid()) {
            return res.status(410).json({ message: "Latest clip has expired." });
        }

        // Track paste
        clip.pasteCount += 1;
        clip.lastPastedAt = new Date();
        await clip.save();

        res.status(200).json({
            message: "Pasted!",
            clip: {
                id: clip._id,
                content: clip.content,
                label: clip.label,
                type: clip.type,
                pasteCount: clip.pasteCount,
            },
        });
    } catch (error) {
        console.error("Paste clip error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// List — All clips
// GET /api/clip
// ─────────────────────────────────────────
export const listClips = async (req, res) => {
    try {
        const userId = req.user._id;

        const clips = await Clip.find({ userId })
            .sort({ isPinned: -1, createdAt: -1 });

        const now = new Date();
        const formatted = clips
            .filter(c => c.isPinned || c.expiresAt > now)
            .map(c => ({
                id: c._id,
                content: c.type === "secret" ? "••••••" : c.content,
                label: c.label,
                type: c.type,
                isPinned: c.isPinned,
                pasteCount: c.pasteCount,
                expiresAt: c.expiresAt,
                createdAt: c.createdAt,
            }));

        res.status(200).json({
            count: formatted.length,
            clips: formatted,
        });
    } catch (error) {
        console.error("List clips error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Pin / Unpin — Toggle pin
// PATCH /api/clip/:id/pin
// ─────────────────────────────────────────
export const togglePin = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const clip = await Clip.findOne({ _id: id, userId });
        if (!clip) {
            return res.status(404).json({ message: "Clip not found." });
        }

        clip.isPinned = !clip.isPinned;
        await clip.save();

        res.status(200).json({
            message: clip.isPinned ? "Clip pinned 📌" : "Clip unpinned",
            isPinned: clip.isPinned,
        });
    } catch (error) {
        console.error("Toggle pin error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Clear All — Delete all clips
// DELETE /api/clip/clear
// ─────────────────────────────────────────
export const clearClips = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await Clip.deleteMany({ userId });

        res.status(200).json({
            message: "Clipboard cleared!",
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Clear clips error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Delete One — Delete a single clip
// DELETE /api/clip/:id
// ─────────────────────────────────────────
export const deleteClip = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const clip = await Clip.findOneAndDelete({ _id: id, userId });
        if (!clip) {
            return res.status(404).json({ message: "Clip not found." });
        }

        res.status(200).json({
            message: "Clip deleted!",
            clipId: clip._id,
        });
    } catch (error) {
        console.error("Delete clip error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
