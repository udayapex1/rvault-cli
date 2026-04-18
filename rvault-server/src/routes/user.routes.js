import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    getProfile,
    myUploads,
    updateProfile,
    changePassword,
    deleteAccount,
} from "../controllers/user.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET    /api/user/profile         → get profile
router.get("/profile", getProfile);

// GET    /api/user/uploads?page=1  → paginated uploads
router.get("/uploads", myUploads);

// PUT    /api/user/profile         → update name/username
router.put("/profile", updateProfile);

// PUT    /api/user/change-password → change password
router.put("/change-password", changePassword);

// DELETE /api/user/account         → delete account
router.delete("/account", deleteAccount);

export default router;
