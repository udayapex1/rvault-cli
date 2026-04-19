import Inbox from "../models/Inbox.model.js";
import File from "../models/File.model.js";
import User from "../models/User.model.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import b2Client, { B2_BUCKET } from "../config/b2.js";

// ─────────────────────────────────────────
// SEND FILE TO USER
// POST /api/inbox/send
// ─────────────────────────────────────────
export const sendFile = async (req, res) => {
    try {
        const { toUsername, fileId, message = null } = req.body || {};
        const fromUser = req.user;

        // Can't send to yourself
        if (toUsername.toLowerCase() === fromUser.username) {
            return res.status(400).json({ message: "You can't send a file to yourself." });
        }

        // Check receiver exists
        const toUser = await User.findOne({ username: toUsername.toLowerCase() });
        if (!toUser) {
            return res.status(404).json({ message: `User @${toUsername} not found on rvault.` });
        }

        // Check file exists and belongs to sender
        const file = await File.findOne({ _id: fileId, userId: fromUser._id, isDeleted: false });
        if (!file) {
            return res.status(404).json({ message: "File not found or access denied." });
        }

        // Check if already sent same file to same user (pending)
        const alreadySent = await Inbox.findOne({
            fromUserId: fromUser._id,
            toUserId: toUser._id,
            fileId: file._id,
            status: "pending",
        });
        if (alreadySent) {
            return res.status(400).json({ message: `File already sent to @${toUsername}.` });
        }

        // Create inbox entry
        const inbox = await Inbox.create({
            fromUserId: fromUser._id,
            fromUsername: fromUser.username,
            toUserId: toUser._id,
            fileId: file._id,
            fileName: file.originalName,
            fileSize: file.size,
            message: message ? message.slice(0, 200) : null,
        });

        res.status(201).json({
            message: `File sent to @${toUsername} successfully!`,
            inbox: {
                id: inbox._id,
                to: toUsername,
                file: file.originalName,
                message: inbox.message,
                expiresAt: inbox.expiresAt,
            },
        });

    } catch (error) {
        console.error("Send file error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// VIEW INBOX
// GET /api/inbox
// ─────────────────────────────────────────
export const getInbox = async (req, res) => {
    try {
        const inbox = await Inbox.find({
            toUserId: req.user._id,
            isExpired: false,
            status: { $ne: "rejected" },
        }).sort({ createdAt: -1 });

        // Filter out naturally expired ones
        const now = new Date();
        const active = inbox.filter(i => i.expiresAt > now);

        const formatted = active.map(i => ({
            id: i._id,
            from: `@${i.fromUsername}`,
            fileName: i.fileName,
            fileSize: formatSize(i.fileSize),
            message: i.message,
            status: i.status,
            receivedAt: i.createdAt,
            expiresAt: i.expiresAt,
        }));

        res.status(200).json({
            count: formatted.length,
            inbox: formatted,
        });

    } catch (error) {
        console.error("Get inbox error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// DOWNLOAD FROM INBOX
// GET /api/inbox/:inboxId/download
// ─────────────────────────────────────────
export const downloadFromInbox = async (req, res) => {
    try {
        const inbox = await Inbox.findOne({
            _id: req.params.inboxId,
            toUserId: req.user._id,
        });

        if (!inbox) {
            return res.status(404).json({ message: "Inbox item not found." });
        }

        if (!inbox.isValid()) {
            return res.status(410).json({ message: "This file has expired." });
        }

        if (inbox.status === "rejected") {
            return res.status(400).json({ message: "You rejected this file." });
        }

        // Get file
        const file = await File.findById(inbox.fileId);
        if (!file || file.isDeleted) {
            return res.status(404).json({ message: "File no longer exists." });
        }

        // Generate signed B2 URL
        const command = new GetObjectCommand({
            Bucket: B2_BUCKET,
            Key: file.storageKey,
            ResponseContentDisposition: `attachment; filename="${file.originalName}"`,
        });

        const signedUrl = await getSignedUrl(b2Client, command, { expiresIn: 300 });

        // Mark as downloaded
        inbox.status = "downloaded";
        inbox.downloadedAt = new Date();
        await inbox.save();

        res.status(200).json({
            message: "Download ready!",
            fileName: file.originalName,
            downloadUrl: signedUrl,
        });

    } catch (error) {
        console.error("Download inbox error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// REJECT / CLEAR FROM INBOX
// DELETE /api/inbox/:inboxId
// ─────────────────────────────────────────
export const rejectFromInbox = async (req, res) => {
    try {
        const inbox = await Inbox.findOne({
            _id: req.params.inboxId,
            toUserId: req.user._id,
        });

        if (!inbox) {
            return res.status(404).json({ message: "Inbox item not found." });
        }

        inbox.status = "rejected";
        await inbox.save();

        res.status(200).json({ message: "File removed from inbox." });

    } catch (error) {
        console.error("Reject inbox error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// VIEW SENT FILES
// GET /api/inbox/sent
// ─────────────────────────────────────────
export const getSent = async (req, res) => {
    try {
        const sent = await Inbox.find({
            fromUserId: req.user._id,
        }).sort({ createdAt: -1 });

        const formatted = sent.map(i => ({
            id: i._id,
            to: `@${i.toUserId}`,
            fileName: i.fileName,
            fileSize: formatSize(i.fileSize),
            message: i.message,
            status: i.status,
            sentAt: i.createdAt,
            expiresAt: i.expiresAt,
        }));

        res.status(200).json({
            count: formatted.length,
            sent: formatted,
        });

    } catch (error) {
        console.error("Get sent error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────
const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};