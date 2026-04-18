import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import {
    getDashboardStats,
    getAllUsers,
    getAllFiles,
    getUserDetails,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Auth + Admin check on all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats           → dashboard stats
router.get("/stats", getDashboardStats);

// GET /api/admin/users?page=1    → all users (paginated)
router.get("/users", getAllUsers);

// GET /api/admin/files?page=1    → all files (paginated)
router.get("/files", getAllFiles);

// GET /api/admin/users/:userId   → single user + their files
router.get("/users/:userId", getUserDetails);

export default router;
