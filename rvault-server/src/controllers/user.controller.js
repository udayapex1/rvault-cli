import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import File from "../models/File.model.js";

// ─────────────────────────────────────────
// Get Profile
// ─────────────────────────────────────────
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            "-password -otp -otpExpiresAt -totpSecret"
        );

        res.status(200).json({
            message: "Profile fetched",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                isVerified: user.isVerified,
                storageUsed: user.storageUsed,
                storageLimit: user.storageLimit,
                storageUsedMB: (user.storageUsed / (1024 * 1024)).toFixed(2),
                storageLimitGB: (user.storageLimit / (1024 * 1024 * 1024)).toFixed(2),
                joinedAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// My Uploads (with pagination)
// ─────────────────────────────────────────
export const myUploads = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [files, totalFiles] = await Promise.all([
            File.find({ userId, isDeleted: false })
                .select("originalName mimeType size createdAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            File.countDocuments({ userId, isDeleted: false }),
        ]);

        res.status(200).json({
            message: "Uploads fetched",
            page,
            totalPages: Math.ceil(totalFiles / limit),
            totalFiles,
            files,
        });
    } catch (error) {
        console.error("My uploads error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Update Profile (name, username)
// ─────────────────────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const { name, username } = req.body;
        const userId = req.user._id;

        // Check if username is taken by someone else
        if (username) {
            const existing = await User.findOne({
                username: username.toLowerCase(),
                _id: { $ne: userId },
            });
            if (existing) {
                return res.status(400).json({ message: "Username already taken" });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (username) updateData.username = username.toLowerCase();

        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        }).select("-password -otp -otpExpiresAt -totpSecret");

        res.status(200).json({
            message: "Profile updated",
            user: {
                name: user.name,
                email: user.email,
                username: user.username,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Change Password
// ─────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both passwords are required" });
        }

        if (newPassword.length < 6) {
            return res
                .status(400)
                .json({ message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(userId);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash and save new password
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Delete Account
// ─────────────────────────────────────────
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user._id;

        if (!password) {
            return res.status(400).json({ message: "Password required to delete account" });
        }

        const user = await User.findById(userId);

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        // Soft delete all files
        await File.updateMany(
            { userId, isDeleted: false },
            { isDeleted: true, deletedAt: new Date() }
        );

        // Delete user
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
