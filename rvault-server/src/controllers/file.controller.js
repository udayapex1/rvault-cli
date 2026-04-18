import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import b2Client from "../config/b2.js";
import File from "../models/File.model.js";
import User from "../models/User.model.js";

const BUCKET = process.env.B2_BUCKET_NAME;

// ─────────────────────────────────────────
// Upload File
// ─────────────────────────────────────────
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file provided" });
        }

        const userId = req.user._id;
        const file = req.file;

        // Check storage limit
        const user = await User.findById(userId);
        if (user.storageUsed + file.size > user.storageLimit) {
            return res.status(400).json({
                message: "Storage limit exceeded",
                storageUsed: user.storageUsed,
                storageLimit: user.storageLimit,
            });
        }

        // Upload to B2
        const storageKey = `uploads/${userId}/${Date.now()}-${file.originalname}`;

        const uploadParams = {
            Bucket: BUCKET,
            Key: storageKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await b2Client.send(new PutObjectCommand(uploadParams));

        // Build file URL
        const fileUrl = `${process.env.B2_ENDPOINT}/${BUCKET}/${storageKey}`;

        // Save to DB
        const savedFile = await File.create({
            userId,
            originalName: file.originalname,
            storageKey,
            fileUrl,
            mimeType: file.mimetype,
            size: file.size,
        });

        // Update user storage
        user.storageUsed += file.size;
        await user.save();

        res.status(201).json({
            message: "File uploaded successfully",
            file: {
                id: savedFile._id,
                name: savedFile.originalName,
                size: savedFile.size,
                mimeType: savedFile.mimeType,
                uploadedAt: savedFile.createdAt,
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// List User Files
// ─────────────────────────────────────────
export const listFiles = async (req, res) => {
    try {
        const userId = req.user._id;

        const files = await File.find({ userId, isDeleted: false })
            .select("originalName mimeType size createdAt")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Files fetched",
            count: files.length,
            files,
        });
    } catch (error) {
        console.error("List files error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Download File (presigned URL)
// ─────────────────────────────────────────
export const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user._id;

        const file = await File.findOne({ _id: fileId, userId, isDeleted: false });
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // Generate presigned URL (valid 1 hour)
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: file.storageKey,
        });

        const presignedUrl = await getSignedUrl(b2Client, command, { expiresIn: 3600 });

        res.status(200).json({
            message: "Download link generated",
            fileName: file.originalName,
            downloadUrl: presignedUrl,
            expiresIn: "1 hour",
        });
    } catch (error) {
        console.error("Download error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Delete File (soft delete + B2 delete)
// ─────────────────────────────────────────
export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user._id;

        const file = await File.findOne({ _id: fileId, userId, isDeleted: false });
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // Delete from B2
        await b2Client.send(
            new DeleteObjectCommand({
                Bucket: BUCKET,
                Key: file.storageKey,
            })
        );

        // Soft delete in DB
        file.isDeleted = true;
        file.deletedAt = new Date();
        await file.save();

        // Free up storage
        const user = await User.findById(userId);
        user.storageUsed = Math.max(0, user.storageUsed - file.size);
        await user.save();

        res.status(200).json({
            message: "File deleted",
            fileId: file._id,
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Get Storage Info
// ─────────────────────────────────────────
export const getStorageInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("storageUsed storageLimit");

        res.status(200).json({
            storageUsed: user.storageUsed,
            storageLimit: user.storageLimit,
            storageUsedMB: (user.storageUsed / (1024 * 1024)).toFixed(2),
            storageLimitGB: (user.storageLimit / (1024 * 1024 * 1024)).toFixed(2),
            percentUsed: ((user.storageUsed / user.storageLimit) * 100).toFixed(2),
        });
    } catch (error) {
        console.error("Storage info error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
