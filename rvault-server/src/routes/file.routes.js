import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    uploadFile,
    listFiles,
    downloadFile,
    deleteFile,
    getStorageInfo,
} from "../controllers/file.controller.js";

const router = express.Router();

// Multer — memory storage (buffer → direct to B2)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max per file
    },
});

// All routes require authentication
router.use(authMiddleware);

// POST   /api/files/upload    → upload a file
router.post("/upload", upload.single("file"), uploadFile);

// GET    /api/files           → list user's files
router.get("/", listFiles);

// GET    /api/files/download/:fileId → get presigned download URL
router.get("/download/:fileId", downloadFile);

// DELETE /api/files/:fileId   → soft delete + B2 delete
router.delete("/:fileId", deleteFile);

// GET    /api/files/storage   → storage usage info
router.get("/storage", getStorageInfo);

export default router;
