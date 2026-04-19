import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    sendFile,
    getInbox,
    getSent,
    downloadFromInbox,
    rejectFromInbox,
} from "../controllers/inbox.controller.js";

const router = express.Router();

// All inbox routes require authentication
router.use(authMiddleware);

// POST   /api/inbox/send              → send file to a user
router.post("/send", sendFile);

// GET    /api/inbox                   → view my inbox
router.get("/", getInbox);

// GET    /api/inbox/sent              → view sent files
router.get("/sent", getSent);

// GET    /api/inbox/:inboxId/download → download file from inbox
router.get("/:inboxId/download", downloadFromInbox);

// DELETE /api/inbox/:inboxId          → reject / remove from inbox
router.delete("/:inboxId", rejectFromInbox);

export default router;
