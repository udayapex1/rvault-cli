import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    copyClip,
    pasteClip,
    listClips,
    togglePin,
    clearClips,
    deleteClip,
} from "../controllers/clip.controller.js";

const router = express.Router();

// All clip routes require authentication
router.use(authMiddleware);

// POST   /api/clip/copy        → save a clip
router.post("/copy", copyClip);

// GET    /api/clip/paste       → get latest clip
router.get("/paste", pasteClip);

// GET    /api/clip             → list all clips
router.get("/", listClips);

// PATCH  /api/clip/:id/pin     → pin/unpin toggle
router.patch("/:id/pin", togglePin);

// DELETE /api/clip/clear       → clear all clips
router.delete("/clear", clearClips);

// DELETE /api/clip/:id         → delete one clip
router.delete("/:id", deleteClip);

export default router;
