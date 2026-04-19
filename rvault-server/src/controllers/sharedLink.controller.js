import crypto from "crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import b2Client from "../config/b2.js";
import SharedLink from "../models/SharedLink.model.js";
import File from "../models/File.model.js";

const BUCKET = process.env.B2_BUCKET_NAME;

// Expiry presets (in milliseconds)
const EXPIRY_OPTIONS = {
    "1h": 1 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
};

// ─────────────────────────────────────────
// Create Shared Link
// ─────────────────────────────────────────
export const createSharedLink = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fileId, expiry = "24h", maxDownloads = null } = req.body || {};

        if (!fileId) {
            return res.status(400).json({ message: "fileId is required" });
        }

        // Verify file belongs to user & exists
        const file = await File.findOne({ _id: fileId, userId, isDeleted: false });
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // Validate expiry option
        if (!EXPIRY_OPTIONS[expiry]) {
            return res.status(400).json({
                message: "Invalid expiry. Use: 1h, 24h, or 7d",
            });
        }

        // Generate unique token
        const token = crypto.randomBytes(16).toString("hex");

        const expiresAt = new Date(Date.now() + EXPIRY_OPTIONS[expiry]);

        const sharedLink = await SharedLink.create({
            fileId,
            userId,
            token,
            expiresAt,
            maxDownloads,
        });

        res.status(201).json({
            message: "Shared link created",
            link: {
                id: sharedLink._id,
                token: sharedLink.token,
                url: `${process.env.CLIENT_URL || "https://rvault.dev"}/s/${sharedLink.token}`,
                expiresAt: sharedLink.expiresAt,
                maxDownloads: sharedLink.maxDownloads,
            },
        });
    } catch (error) {
        console.error("Create shared link error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Access Shared Link (public — no auth)
// Browser → HTML page | API → JSON
// ─────────────────────────────────────────
export const accessSharedLink = async (req, res) => {
    try {
        const { token } = req.params;

        const sharedLink = await SharedLink.findOne({ token }).populate(
            "fileId",
            "originalName mimeType size storageKey"
        );

        // Check if request is from a browser
        const isBrowser = req.headers.accept && req.headers.accept.includes("text/html");

        if (!sharedLink) {
            if (isBrowser) return res.status(404).send(renderErrorPage("Link Not Found", "This shared link does not exist or has been removed."));
            return res.status(404).json({ message: "Link not found" });
        }

        if (!sharedLink.isValid()) {
            if (isBrowser) return res.status(410).send(renderErrorPage("Link Expired", "This shared link has expired or reached its download limit."));
            return res.status(410).json({ message: "Link has expired or reached download limit" });
        }

        // Browser → serve download page (don't count as download yet)
        if (isBrowser) {
            const file = sharedLink.fileId;
            return res.status(200).send(renderDownloadPage({
                fileName: file.originalName,
                fileSize: formatBytes(file.size),
                mimeType: file.mimeType,
                downloadUrl: `/api/share/download/${token}`,
                downloadsUsed: sharedLink.downloadCount,
                maxDownloads: sharedLink.maxDownloads,
                expiresAt: sharedLink.expiresAt,
            }));
        }

        // API → return JSON with presigned URL
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: sharedLink.fileId.storageKey,
        });

        const presignedUrl = await getSignedUrl(b2Client, command, { expiresIn: 3600 });

        sharedLink.downloadCount += 1;
        if (sharedLink.maxDownloads && sharedLink.downloadCount >= sharedLink.maxDownloads) {
            sharedLink.isExpired = true;
        }
        await sharedLink.save();

        res.status(200).json({
            message: "Download link generated",
            file: {
                name: sharedLink.fileId.originalName,
                mimeType: sharedLink.fileId.mimeType,
                size: sharedLink.fileId.size,
            },
            downloadUrl: presignedUrl,
            expiresIn: "1 hour",
            downloadsUsed: sharedLink.downloadCount,
            downloadsRemaining: sharedLink.maxDownloads
                ? sharedLink.maxDownloads - sharedLink.downloadCount
                : "unlimited",
        });
    } catch (error) {
        console.error("Access shared link error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Download via Token (actual file download)
// Increments count only here
// ─────────────────────────────────────────
export const downloadViaToken = async (req, res) => {
    try {
        const { token } = req.params;

        const sharedLink = await SharedLink.findOne({ token }).populate(
            "fileId",
            "originalName mimeType size storageKey"
        );

        if (!sharedLink) {
            return res.status(404).send(renderErrorPage("Link Not Found", "This shared link does not exist."));
        }

        if (!sharedLink.isValid()) {
            return res.status(410).send(renderErrorPage("Link Expired", "This shared link has expired or reached its download limit."));
        }

        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: sharedLink.fileId.storageKey,
        });

        const presignedUrl = await getSignedUrl(b2Client, command, { expiresIn: 3600 });

        // Count the actual download
        sharedLink.downloadCount += 1;
        if (sharedLink.maxDownloads && sharedLink.downloadCount >= sharedLink.maxDownloads) {
            sharedLink.isExpired = true;
        }
        await sharedLink.save();

        // Redirect browser to presigned URL → triggers file download
        res.redirect(presignedUrl);
    } catch (error) {
        console.error("Download via token error:", error);
        res.status(500).send(renderErrorPage("Server Error", "Something went wrong. Please try again later."));
    }
};

// ─────────────────────────────────────────
// Helper: Format bytes → human readable
// ─────────────────────────────────────────
function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

// ─────────────────────────────────────────
// Helper: Get file icon based on mime type
// ─────────────────────────────────────────
function getFileIcon(mimeType) {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎬";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return "📦";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📽️";
    return "📁";
}

// ─────────────────────────────────────────
// Render: Download Page (HTML)
// ─────────────────────────────────────────
function renderDownloadPage({ fileName, fileSize, mimeType, downloadUrl, downloadsUsed, maxDownloads, expiresAt }) {
    const icon = getFileIcon(mimeType);
    const timeLeft = Math.max(0, Math.round((new Date(expiresAt) - new Date()) / 60000));
    const timeDisplay = timeLeft > 1440
        ? `${Math.round(timeLeft / 1440)}d left`
        : timeLeft > 60
            ? `${Math.round(timeLeft / 60)}h left`
            : `${timeLeft}m left`;
    const downloadsInfo = maxDownloads
        ? `${downloadsUsed} / ${maxDownloads} downloads used`
        : `${downloadsUsed} downloads`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName} — rVault Shared File</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #0a0a0f;
            color: #e4e4e7;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        body::before {
            content: '';
            position: fixed;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 70% 60%, rgba(168, 85, 247, 0.06) 0%, transparent 50%);
            animation: drift 20s ease-in-out infinite alternate;
            z-index: 0;
        }
        @keyframes drift {
            0% { transform: translate(0, 0) rotate(0deg); }
            100% { transform: translate(-3%, 2%) rotate(3deg); }
        }
        .card {
            position: relative;
            z-index: 1;
            background: rgba(24, 24, 32, 0.85);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 20px;
            padding: 48px 40px;
            max-width: 420px;
            width: 90vw;
            text-align: center;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(255, 255, 255, 0.03) inset;
        }
        .brand {
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: rgba(168, 139, 250, 0.7);
            margin-bottom: 32px;
        }
        .file-icon {
            font-size: 48px;
            margin-bottom: 16px;
            filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3));
        }
        .file-name {
            font-size: 18px;
            font-weight: 600;
            color: #f4f4f5;
            margin-bottom: 6px;
            word-break: break-all;
            line-height: 1.4;
        }
        .file-meta {
            font-size: 13px;
            color: #71717a;
            margin-bottom: 28px;
        }
        .file-meta span { margin: 0 6px; }
        .download-btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: 14px 36px;
            font-size: 15px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 24px rgba(99, 102, 241, 0.3);
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(99, 102, 241, 0.5);
        }
        .download-btn:active { transform: translateY(0); }
        .download-btn svg { width: 18px; height: 18px; }
        .stats {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin-top: 28px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }
        .stat-value {
            font-size: 14px;
            font-weight: 600;
            color: #a78bfa;
        }
        .stat-label {
            font-size: 11px;
            color: #52525b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .footer {
            margin-top: 24px;
            font-size: 11px;
            color: #3f3f46;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="brand">rVault</div>
        <div class="file-icon">${icon}</div>
        <div class="file-name">${fileName}</div>
        <div class="file-meta">${fileSize}<span>·</span>${mimeType.split("/")[1].toUpperCase()}</div>

        <a href="${downloadUrl}" class="download-btn">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"/>
            </svg>
            Download File
        </a>

        <div class="stats">
            <div class="stat">
                <span class="stat-value">${downloadsInfo}</span>
                <span class="stat-label">Downloads</span>
            </div>
            <div class="stat">
                <span class="stat-value">${timeDisplay}</span>
                <span class="stat-label">Expires</span>
            </div>
        </div>

        <div class="footer">Shared securely via rVault</div>
    </div>
</body>
</html>`;
}

// ─────────────────────────────────────────
// Render: Error Page (HTML)
// ─────────────────────────────────────────
function renderErrorPage(title, message) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — rVault</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #0a0a0f;
            color: #e4e4e7;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .card {
            background: rgba(24, 24, 32, 0.85);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 20px;
            padding: 48px 40px;
            max-width: 420px;
            width: 90vw;
            text-align: center;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
        }
        .brand {
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: rgba(168, 139, 250, 0.7);
            margin-bottom: 28px;
        }
        .icon { font-size: 48px; margin-bottom: 16px; }
        h1 { font-size: 20px; font-weight: 600; margin-bottom: 10px; color: #f87171; }
        p { font-size: 14px; color: #71717a; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="card">
        <div class="brand">rVault</div>
        <div class="icon">🚫</div>
        <h1>${title}</h1>
        <p>${message}</p>
    </div>
</body>
</html>`;
}

// ─────────────────────────────────────────
// List My Shared Links
// ─────────────────────────────────────────
export const listSharedLinks = async (req, res) => {
    try {
        const userId = req.user._id;

        const links = await SharedLink.find({ userId })
            .populate("fileId", "originalName mimeType size")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Shared links fetched",
            count: links.length,
            links: links.map((link) => ({
                id: link._id,
                token: link.token,
                url: `${process.env.CLIENT_URL || "https://rvault.dev"}/s/${link.token}`,
                fileName: link.fileId?.originalName || "Deleted file",
                expiresAt: link.expiresAt,
                isExpired: link.isExpired || new Date() > link.expiresAt,
                downloadCount: link.downloadCount,
                maxDownloads: link.maxDownloads,
                createdAt: link.createdAt,
            })),
        });
    } catch (error) {
        console.error("List shared links error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Delete / Revoke Shared Link
// ─────────────────────────────────────────
export const deleteSharedLink = async (req, res) => {
    try {
        const { linkId } = req.params;
        const userId = req.user._id;

        const link = await SharedLink.findOne({ _id: linkId, userId });
        if (!link) {
            return res.status(404).json({ message: "Shared link not found" });
        }

        // Hard expire the link
        link.isExpired = true;
        await link.save();

        res.status(200).json({
            message: "Shared link revoked",
            linkId: link._id,
        });
    } catch (error) {
        console.error("Delete shared link error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ─────────────────────────────────────────
// Get Shared Link Stats (download tracking)
// ─────────────────────────────────────────
export const getLinkStats = async (req, res) => {
    try {
        const { linkId } = req.params;
        const userId = req.user._id;

        const link = await SharedLink.findOne({ _id: linkId, userId }).populate(
            "fileId",
            "originalName mimeType size"
        );

        if (!link) {
            return res.status(404).json({ message: "Shared link not found" });
        }

        const now = new Date();
        const isActive = !link.isExpired && now < link.expiresAt &&
            (!link.maxDownloads || link.downloadCount < link.maxDownloads);

        res.status(200).json({
            message: "Link stats fetched",
            stats: {
                id: link._id,
                token: link.token,
                url: `${process.env.CLIENT_URL || "https://rvault.dev"}/s/${link.token}`,
                file: {
                    name: link.fileId?.originalName || "Deleted file",
                    mimeType: link.fileId?.mimeType,
                    size: link.fileId?.size,
                },
                status: isActive ? "active" : "expired",
                downloadCount: link.downloadCount,
                maxDownloads: link.maxDownloads || "unlimited",
                downloadsRemaining: link.maxDownloads
                    ? Math.max(0, link.maxDownloads - link.downloadCount)
                    : "unlimited",
                expiresAt: link.expiresAt,
                timeRemaining: isActive
                    ? `${Math.round((link.expiresAt - now) / 60000)} minutes`
                    : "expired",
                createdAt: link.createdAt,
            },
        });
    } catch (error) {
        console.error("Get link stats error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
