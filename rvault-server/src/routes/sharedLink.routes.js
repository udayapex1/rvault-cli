import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    createSharedLink,
    accessSharedLink,
    downloadViaToken,
    listSharedLinks,
    deleteSharedLink,
    getLinkStats,
} from "../controllers/sharedLink.controller.js";

const router = express.Router();

// ── Public Route (no auth needed) ───────────
// GET  /api/share/access/:token → download via shared link
router.get("/access/:token", accessSharedLink);

// GET  /api/share/download/:token → actual file download (increments count)
router.get("/download/:token", downloadViaToken);

// ── Protected Routes (auth required) ────────
router.use(authMiddleware);

// POST   /api/share           → create a shared link
router.post("/", createSharedLink);

// GET    /api/share            → list my shared links
router.get("/", listSharedLinks);

// DELETE /api/share/:linkId    → revoke a shared link
router.delete("/:linkId", deleteSharedLink);

// GET    /api/share/stats/:linkId → download stats for a link
router.get("/stats/:linkId", getLinkStats);

export default router;
