import User from "../models/User.model.js";
import File from "../models/File.model.js";

// ─────────────────────────────────────────
// Dashboard Stats
// ─────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalFiles, storageAgg] = await Promise.all([
            User.countDocuments(),
            File.countDocuments({ isDeleted: false }),
            User.aggregate([
                {
                    $group: {
                        _id: null,
                        totalStorageUsed: { $sum: "$storageUsed" },
                        totalStorageLimit: { $sum: "$storageLimit" },
                    },
                },
            ]),
        ]);

        const storage = storageAgg[0] || { totalStorageUsed: 0, totalStorageLimit: 0 };

        res.status(200).json({
            message: "Admin dashboard stats",
            stats: {
                totalUsers,
                totalFiles,
                totalStorageUsed: storage.totalStorageUsed,
                totalStorageUsedMB: (storage.totalStorageUsed / (1024 * 1024)).toFixed(2),
                totalStorageUsedGB: (storage.totalStorageUsed / (1024 * 1024 * 1024)).toFixed(2),
                totalStorageLimit: storage.totalStorageLimit,
                totalStorageLimitGB: (storage.totalStorageLimit / (1024 * 1024 * 1024)).toFixed(2),
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// All Users
// ─────────────────────────────────────────
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find()
                .select("name email username role isVerified storageUsed storageLimit createdAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(),
        ]);

        res.status(200).json({
            message: "All users",
            page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
            users,
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// All Files
// ─────────────────────────────────────────
export const getAllFiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [files, total] = await Promise.all([
            File.find({ isDeleted: false })
                .populate("userId", "name email username")
                .select("originalName mimeType size storageKey createdAt userId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            File.countDocuments({ isDeleted: false }),
        ]);

        res.status(200).json({
            message: "All files",
            page,
            totalPages: Math.ceil(total / limit),
            totalFiles: total,
            files,
        });
    } catch (error) {
        console.error("Get all files error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// User Details (by userId)
// ─────────────────────────────────────────
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select(
            "-password -otp -otpExpiresAt -totpSecret"
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const files = await File.find({ userId, isDeleted: false })
            .select("originalName mimeType size createdAt")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "User details",
            user,
            files,
            fileCount: files.length,
        });
    } catch (error) {
        console.error("User details error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
